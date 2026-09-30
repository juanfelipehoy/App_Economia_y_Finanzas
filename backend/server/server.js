import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

import {
  obtenerBancos,
  obtenerDivisas,
  obtenerFuentes,
  obtenerGenios,
  obtenerInflacion,
  obtenerMercados,
  obtenerTrading,
  CLAVE_DE_SECCION,
} from './live.js';
import { cacheStatus } from './lib/store.js';

const PORT = Number(process.env.PORT) || 3001;

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Las secciones se cachean en el origen con el TTL de su propia fuente; aquí
// solo se declara al navegador durante cuánto puede reutilizar la respuesta.
const CACHE_CLIENTE = {
  divisas: 30 * 60,
  inflacion: 6 * 60 * 60,
  bancos: 6 * 60 * 60,
  mercados: 6 * 60 * 60,
  trading: 2 * 60,
  genios: 60 * 60,
  fuentes: 6 * 60 * 60,
};

/** Añade cabeceras de caché y marca cuando sirvimos un snapshot, no la fuente. */
const responder = (res, seccion, resultado) => {
  res.set('Cache-Control', `public, max-age=${CACHE_CLIENTE[seccion] ?? 300}`);

  const meta = resultado.meta ?? {};
  if (meta.status === 'snapshot') {
    // Aviso explícito: no es un dato recién leído, es el último valor bueno
    // porque la fuente oficial no respondió. La interfaz lo dirá al usuario.
    res.set('X-Fuente-Estado', 'snapshot');
    res.set('X-Fuente-Obtener', meta.fetchedAt ?? '');
  }

  if (resultado.items !== undefined) return res.json(resultado.items);

  // Sin red y sin snapshot no queda nada bueno que servir: preferimos un error
  // explícito a devolver un cuerpo vacío que la interfaz interpretaría como dato.
  if (resultado.value === null || resultado.value === undefined) {
    return res.status(503).json({
      error: 'La fuente oficial no está disponible ahora mismo',
      _fuente: meta,
    });
  }

  return res.json({ ...resultado.value, _fuente: meta });
};

/* ------------------------------------------------------------------
 * Rutas de la API
 * ------------------------------------------------------------------ */
const api = express.Router();

const envolver = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

api.get('/divisas', envolver(async (_req, res) => responder(res, 'divisas', await obtenerDivisas())));

api.get('/divisas/:id', envolver(async (req, res) => {
  const { items } = await obtenerDivisas();
  const divisa = items.find((item) => item.id === req.params.id);
  if (!divisa) return res.status(404).json({ error: 'Divisa no encontrada' });
  res.set('Cache-Control', `public, max-age=${CACHE_CLIENTE.divisas}`);
  return res.json(divisa);
}));

api.get('/inflacion', envolver(async (_req, res) => responder(res, 'inflacion', await obtenerInflacion())));

api.get('/mercados', envolver(async (_req, res) => responder(res, 'mercados', await obtenerMercados())));

api.get('/bancos', envolver(async (_req, res) => responder(res, 'bancos', await obtenerBancos())));

api.get('/trading', envolver(async (_req, res) => {
  const resultado = await obtenerTrading();
  res.set('Cache-Control', `public, max-age=${CACHE_CLIENTE.trading}`);
  return res.json({
    estrategias: resultado.items,
    cripto: resultado.cripto,
    _fuente: resultado.meta,
  });
}));

api.get('/genios', envolver(async (_req, res) => responder(res, 'genios', await obtenerGenios())));

api.get('/genios/:id', envolver(async (req, res) => {
  const { items } = await obtenerGenios();
  const genio = items.find((item) => item.id === req.params.id);
  if (!genio) return res.status(404).json({ error: 'Genio no encontrado' });
  res.set('Cache-Control', `public, max-age=${CACHE_CLIENTE.genios}`);
  return res.json(genio);
}));

api.get('/fuentes', (_req, res) => {
  res.set('Cache-Control', `public, max-age=${CACHE_CLIENTE.fuentes}`);
  res.json(obtenerFuentes());
});

/**
 * Estado de frescura por sección. Lo consume la interfaz para poder avisar
 * "sin conexión" cuando hemos servido el último valor guardado.
 */
api.get('/estado', (_req, res) => {
  const estado = Object.fromEntries(
    Object.entries(CLAVE_DE_SECCION).map(([seccion, clave]) => {
      const info = cacheStatus(clave);
      return [seccion, info ? { status: 'live', fetchedAt: info.fetchedAt } : { status: 'sin-datos' }];
    }),
  );

  res.set('Cache-Control', 'no-store');
  res.json(estado);
});

api.get('/salud', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    fuentes: Object.fromEntries(
      ['bce-tipos', 'bm-inflacion', 'sec-bancos', 'sec-mercados', 'coinbase-mercado'].map((clave) => [
        clave,
        cacheStatus(clave),
      ]),
    ),
  });
});

// Alias en inglés para no romper clientes previos.
api.get('/health', (_req, res) => res.redirect(301, '/api/salud'));

api.get('/stats', envolver(async (_req, res) => {
  const [divisas, mercados, bancos, genios, inflacion, trading] = await Promise.all([
    obtenerDivisas(),
    obtenerMercados(),
    obtenerBancos(),
    obtenerGenios(),
    obtenerInflacion(),
    obtenerTrading(),
  ]);

  const tasas = (inflacion.value?.tasasActuales ?? []).filter((item) => Number.isFinite(item.tasa));
  const promedio = (valores) =>
    valores.length ? valores.reduce((total, valor) => total + valor, 0) / valores.length : null;

  // Solo se contabilizan bancos con estados financieros realmente publicados.
  const activosBancos = bancos.items
    .filter((banco) => Number.isFinite(banco.datos?.activos?.valor))
    .map((banco) => ({
      nombre: banco.nombre,
      ticker: banco.datos.ticker,
      activos: banco.datos.activos.valor,
      periodo: banco.datos.activos.periodo,
      formulario: banco.datos.activos.formulario,
      fuenteUrl: banco.datos.fuenteUrl,
    }))
    .sort((a, b) => b.activos - a.activos);

  // En lugar de la capitalización bursátil inventada, la mayor empresa por
  // ingresos realmente archivados en la SEC.
  const empresas = mercados.items.flatMap((mercado) => mercado.datos?.empresas ?? []);
  const mayorEmpresa = empresas
    .filter((empresa) => Number.isFinite(empresa.ingresos))
    .sort((a, b) => b.ingresos - a.ingresos)[0] ?? null;

  res.set('Cache-Control', 'public, max-age=300');
  return res.json({
    totalDivisas: divisas.items.length,
    totalMercados: mercados.items.length,
    totalBancos: bancos.items.length,
    totalGenios: genios.items.length,
    geniosDestacados: genios.items.filter((genio) => genio.destacado).length,

    inflacionPromedio: promedio(tasas.map((item) => item.tasa)),
    inflacionCubierta: tasas.length,
    inflacionTotal: (inflacion.value?.tasasActuales ?? []).length,

    bancosConDatos: activosBancos.length,
    activosBancos,

    mayorEmpresaPorIngresos: mayorEmpresa
      ? {
          nombre: mayorEmpresa.nombre,
          ticker: mayorEmpresa.ticker,
          ingresos: mayorEmpresa.ingresos,
          periodo: mayorEmpresa.periodo,
          formulario: mayorEmpresa.formulario,
          fuenteUrl: mayorEmpresa.fuenteUrl,
        }
      : null,

    cripto: (trading.cripto ?? []).map((activo) => ({
      simbolo: activo.simbolo,
      ultimo: activo.ultimo,
      variacionPct: activo.variacionPct,
      consultado: activo.consultado,
    })),

    estadoFuentes: {
      divisas: divisas.meta?.status ?? 'desconocido',
      inflacion: inflacion.meta?.status ?? 'desconocido',
      bancos: bancos.meta?.status ?? 'desconocido',
      mercados: mercados.meta?.status ?? 'desconocido',
      trading: trading.meta?.status ?? 'desconocido',
    },
  });
}));

app.use('/api', api);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((error, _req, res, _next) => {
  console.error('[server] Error no controlado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

/* ------------------------------------------------------------------
 * Ciclo de vida
 * ------------------------------------------------------------------ */
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔎 Fuentes en http://localhost:${PORT}/api/fuentes`);
});

const shutdown = (signal) => () => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));

// Keep process alive in development
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    // Keep-alive heartbeat
  }, 60000);
}

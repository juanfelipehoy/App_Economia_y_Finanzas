/**
 * Capa de datos en vivo.
 *
 * Regla de oro del proyecto: si una cifra no viene de una fuente oficial y
 * verificable, no se muestra. Antes esta capa servía números escritos a mano
 * ("JPMorgan: 3.9 billones USD") que no tenían respaldo; ahora cada valor
 * numérico llega del BCE, del Banco Mundial, de la SEC o de Coinbase, y viaja
 * junto con su procedencia: fuente, fecha del dato y enlace para auditarlo.
 *
 * Lo que NO viene de una API (descripciones, filosofía, historia de los genios)
 * es contenido editorial propio y se declara como tal en `contenidoEditorial`.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cached } from './lib/store.js'
import { cargarTipos, FUENTE as FUENTE_BCE } from './sources/bce.js'
import { cargarInflacion, FUENTE as FUENTE_BM } from './sources/bancoMundial.js'
import { cargarEmisores, enlaceFiling, FUENTE as FUENTE_SEC } from './sources/sec.js'
import { cargarMercadoCripto, FUENTE as FUENTE_COINBASE } from './sources/coinbase.js'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')

const leerSeed = (nombre) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DIR, nombre), 'utf8'))
  } catch (error) {
    console.error(`[seed] No se pudo leer ${nombre}: ${error.message}`)
    return null
  }
}

const emisores = leerSeed('emisores.json') ?? { bancos: {}, mercados: {} }

/** Código ISO3 que el Banco Mundial usa para cada país de la sección. */
const PAIS_ISO3 = {
  'Estados Unidos': 'USA',
  'Zona Euro': 'EMU',
  'Reino Unido': 'GBR',
  Japón: 'JPN',
  China: 'CHN',
  India: 'IND',
  Brasil: 'BRA',
  México: 'MEX',
  Canadá: 'CAN',
  Alemania: 'DEU',
  Francia: 'FRA',
}

/** Pares criptoactivos que se muestran en la sección de trading. */
const PARES_CRIPTO = ['BTC-USD', 'ETH-USD', 'SOL-USD']
const NOMBRES_CRIPTO = { 'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana' }

/* ------------------------------------------------------------------ *
 * Divisas: tipos de referencia del BCE expresados por 1 USD
 * ------------------------------------------------------------------ */
export const obtenerDivisas = async () => {
  const semilla = leerSeed('divisas.json') ?? []

  const codigos = semilla.map((item) => item.codigo)
  const { value: datos, ...meta } = await cached('bce-tipos', {
    ttlMs: FUENTE_BCE.ttlMs,
    loader: () => cargarTipos(codigos),
  })

  if (!datos) return { items: [], meta: { ...meta, fuente: FUENTE_BCE, disponible: false } }

  const eurUsd = datos.porEuro?.USD

  const items = semilla.map((moneda) => {
    const codigo = moneda.codigo
    let valor = datos.porUsd?.[codigo]

    // El BCE publica todo contra el euro; para el euro basta invertir el dólar.
    if (codigo === 'EUR') valor = eurUsd ? Number((1 / eurUsd).toFixed(6)) : null

    return {
      ...moneda,
      valorReferencia: Number.isFinite(valor) ? valor : null,
      fechaCotizacion: datos.fecha,
      fuente: FUENTE_BCE.id,
    }
  })

  return { items, meta: { ...meta, fuente: FUENTE_BCE, disponible: true } }
}

/* ------------------------------------------------------------------ *
 * Inflación: IPC anual del Banco Mundial
 * ------------------------------------------------------------------ */
export const obtenerInflacion = async () => {
  const semilla = leerSeed('inflacion.json')
  if (!semilla) return { value: null, meta: { fuente: FUENTE_BM, disponible: false } }

  const paises = (semilla.tasasActuales ?? []).map((item) => ({
    nombre: item.pais,
    iso3: PAIS_ISO3[item.pais] ?? null,
  }))

  const conIso = paises.filter((pais) => pais.iso3)
  const faltantes = paises.filter((pais) => !pais.iso3)

  const { value: datos, ...meta } = await cached('bm-inflacion', {
    ttlMs: FUENTE_BM.ttlMs,
    loader: () => cargarInflacion(conIso),
  })

  if (!datos) return { value: null, meta: { ...meta, fuente: FUENTE_BM, disponible: false } }

  const tasas = (semilla.tasasActuales ?? []).map((item) => {
    const registro = datos.porPais?.[PAIS_ISO3[item.pais]]
    return {
      ...item,
      // Sin dato oficial no hay tasa: se deja null y la interfaz lo explica.
      tasa: registro?.tasa ?? null,
      anio: registro?.anio ?? null,
      fechaDato: registro?.fechaDato ?? null,
      variacionAnual: registro?.variacion ?? null,
      anioAnterior: registro?.anterior?.anio ?? null,
      tasaAnterior: registro?.anterior?.tasa ?? null,
      fuente: registro ? FUENTE_BM.id : null,
      motivo: registro ? null : 'Este país no aparece en la serie del Banco Mundial',
    }
  })

  return {
    value: { ...semilla, tasasActuales: tasas },
    meta: {
      ...meta,
      fuente: FUENTE_BM,
      disponible: tasas.some((tasa) => tasa.tasa !== null),
      revision: datos.revision,
      noCubiertos: faltantes.map((pais) => pais.nombre),
    },
  }
}

/* ------------------------------------------------------------------ *
 * Bancos: estados financieros anuales reales (10-K / 20-F)
 * ------------------------------------------------------------------ */
export const obtenerBancos = async () => {
  const semilla = leerSeed('bancos.json') ?? []

  const pedidos = semilla
    .map((banco) => ({ id: banco.id, ...(emisores.bancos?.[banco.id] ?? {}) }))
    .filter((banco) => banco.ticker)

  const { value: sec, ...meta } = await cached('sec-bancos', {
    ttlMs: FUENTE_SEC.ttlMs,
    loader: () => cargarEmisores(pedidos),
  })

  const porTicker = sec?.porTicker ?? {}

  const items = semilla.map((banco) => {
    const config = emisores.bancos?.[banco.id] ?? {}
    const real = config.ticker ? porTicker[config.ticker] : null

    const activos = real?.metricas?.activos ?? null
    const utilidad = real?.metricas?.utilidad ?? null
    const patrimonio = real?.metricas?.patrimonio ?? null

    return {
      id: banco.id,
      nombre: banco.nombre,
      nombreCompleto: banco.nombreCompleto ?? null,
      pais: banco.pais,
      sede: banco.sede,
      fundado: banco.fundado,
      descripcion: banco.descripcion,
      servicios: banco.servicios ?? [],
      ceo: banco.ceo ?? null,
      factCurioso: banco.factCurioso ?? null,
      // La cifra oficial, en dólares, con su periodo y su formulario.
      datos: real
        ? {
            ticker: real.ticker,
            cik: real.cik,
            nombreLegal: real.nombre,
            activos,
            utilidad,
            patrimonio,
            periodo: activos?.periodo ?? utilidad?.periodo ?? null,
            formulario: activos?.formulario ?? utilidad?.formulario ?? null,
            fuenteUrl: enlaceFiling(real.cik),
            hayCifras: [activos, utilidad, patrimonio].some((m) => Number.isFinite(m?.valor)),
          }
        : null,
      sinDato: real
        ? [activos, utilidad, patrimonio].some((m) => Number.isFinite(m?.valor))
          ? null
          : `La SEC no publica estas metricas en dolares para ${real.ticker}; sus estados financieros se presentan en otra moneda y no los convertimos.`
        : (config.motivo ??
          'Sin estados financieros publicos en una fuente oficial gratuita'),
    }
  })

  return {
    items,
    meta: {
      ...meta,
      fuente: FUENTE_SEC,
      disponible: Object.keys(porTicker).length > 0,
      descartados: sec?.descartados ?? [],
    },
  }
}

/* ------------------------------------------------------------------ *
 * Mercados: datos reales de las empresas que cotizan en cada bolsa
 * ------------------------------------------------------------------ */
export const obtenerMercados = async () => {
  const semilla = leerSeed('mercados.json') ?? []

  const pedidos = Object.entries(emisores.mercados ?? {}).flatMap(([bolsa, lista]) =>
    (lista ?? []).map((empresa) => ({ id: bolsa, ...empresa })),
  )

  const { value: sec, ...meta } = await cached('sec-mercados', {
    ttlMs: FUENTE_SEC.ttlMs,
    loader: () => cargarEmisores(pedidos),
  })

  const porTicker = sec?.porTicker ?? {}

  const items = semilla.map((bolsa) => {
    const config = emisores.mercados?.[bolsa.id] ?? []
    const empresas = config
      .map((empresa) => {
        const real = porTicker[empresa.ticker]
        if (!real) return null
        return {
          ticker: real.ticker,
          nombre: real.nombre,
          cik: real.cik,
          ingresos: real.metricas.ingresos?.valor ?? null,
          utilidad: real.metricas.utilidad?.valor ?? null,
          activos: real.metricas.activos?.valor ?? null,
          periodo: real.metricas.ingresos?.periodo ?? real.metricas.utilidad?.periodo ?? null,
          formulario: real.metricas.ingresos?.formulario ?? real.metricas.utilidad?.formulario ?? null,
          fuenteUrl: enlaceFiling(real.cik),
          hayCifras: [real.metricas.ingresos, real.metricas.utilidad, real.metricas.activos].some(
            (metrica) => Number.isFinite(metrica?.valor),
          ),
        }
      })
      .filter(Boolean)

    // Contamos solo las empresas con cifras realmente utilizables: cargar el
    // ficha de una empresa no significa que su cuenta de resultados esté en USD.
    const conCifras = empresas.filter((empresa) => empresa.hayCifras)
    const sumar = (clave) => {
      const valores = conCifras.map((e) => e[clave]).filter(Number.isFinite)
      return valores.length ? valores.reduce((total, valor) => total + valor, 0) : null
    }

    return {
      id: bolsa.id,
      nombre: bolsa.nombre,
      nombreCompleto: bolsa.nombreCompleto,
      pais: bolsa.pais,
      ciudad: bolsa.ciudad,
      descripcion: bolsa.descripcion,
      fundada: bolsa.fundada,
      horario: bolsa.horario,
      empresasDestacadas: bolsa.empresasDestacadas ?? [],
      datos: conCifras.length
        ? {
            empresas: conCifras,
            cobertura: { conCifras: conCifras.length, listadas: config.length },
            agregado: {
              ingresos: sumar('ingresos'),
              utilidad: sumar('utilidad'),
              activos: sumar('activos'),
            },
            // Cada empresa tiene su propio cierre fiscal: no se suman como si
            // fueran todas del mismo día.
            periodos: [...new Set(conCifras.map((e) => e.periodo).filter(Boolean))],
            nota:
              'Suma de los estados anuales archivados en la SEC de las empresas destacadas con cifras en dólares. No equivale a la capitalización bursátil de la bolsa.',
          }
        : null,
      sinDato: conCifras.length
        ? null
        : 'Ninguna de las empresas destacadas de esta bolsa publica estas métricas en dólares ante la SEC.',
    }
  })

  return {
    items,
    meta: {
      ...meta,
      fuente: FUENTE_SEC,
      disponible: Object.keys(porTicker).length > 0,
      descartados: sec?.descartados ?? [],
    },
  }
}

/* ------------------------------------------------------------------ *
 * Trading: cotización real de criptoactivos
 * ------------------------------------------------------------------ */
export const obtenerTrading = async () => {
  const semilla = leerSeed('trading.json') ?? []

  const { value: cripto, ...meta } = await cached('coinbase-mercado', {
    ttlMs: FUENTE_COINBASE.ttlMs,
    loader: () => cargarMercadoCripto(PARES_CRIPTO, 30),
  })

  const activos = PARES_CRIPTO.map((producto) => {
    const cotizacion = cripto?.porProducto?.[producto]
    const serie = cripto?.series?.[producto] ?? []
    if (!cotizacion) return null

    return {
      simbolo: producto.split('-')[0],
      nombre: NOMBRES_CRIPTO[producto] ?? producto,
      producto,
      ultimo: cotizacion.ultimo,
      ultimoFormateado: cotizacion.ultimoFormateado,
      apertura: cotizacion.apertura,
      maximo: cotizacion.maximo,
      minimo: cotizacion.minimo,
      variacionPct: cotizacion.variacionPct,
      volumetry: cotizacion.volumenBase,
      consultado: cotizacion.consultado,
      serie: serie.slice(-30),
      fuenteUrl: FUENTE_COINBASE.url,
    }
  }).filter(Boolean)

  return {
    items: semilla,
    meta: { ...meta, fuente: FUENTE_COINBASE, disponible: activos.length > 0 },
    cripto: activos,
  }
}

/* ------------------------------------------------------------------ *
 * Genios: contenido editorial con enlace de lectura verificable
 * ------------------------------------------------------------------ */
export const obtenerGenios = async () => {
  const semilla = leerSeed('genios.json') ?? []

  const items = semilla.map((genio) => ({
    ...genio,
    lectura: `https://es.wikipedia.org/wiki/${encodeURIComponent(
      genio.nombre.replace(/\s+/g, '_'),
    )}`,
  }))

  return { items, meta: { disponible: true, editorial: true } }
}

/** Qué clave de caché alimenta cada sección, para poder informar del estado. */
export const CLAVE_DE_SECCION = {
  divisas: 'bce-tipos',
  inflacion: 'bm-inflacion',
  bancos: 'sec-bancos',
  mercados: 'sec-mercados',
  trading: 'coinbase-mercado',
}

/* ------------------------------------------------------------------ *
 * Manifiesto de fuentes para /api/fuentes
 * ------------------------------------------------------------------ */
export const obtenerFuentes = () => ({
  fuentes: [
    {
      ...FUENTE_BCE,
      seccion: 'divisas',
      queAporta: 'Tipo de cambio de referencia diario frente al dólar.',
    },
    {
      ...FUENTE_BM,
      seccion: 'inflacion',
      queAporta: 'Inflación anual (IPC, %) y su variación interanual.',
    },
    {
      ...FUENTE_SEC,
      seccion: 'bancos y mercados',
      queAporta: 'Activos, ingresos, utilidad y patrimonio de los 10-K y 20-F archivados.',
    },
    {
      ...FUENTE_COINBASE,
      seccion: 'trading',
      queAporta: 'Cotización al contado y velas diarias de criptoactivos.',
    },
  ],
  contenidoEditorial: {
    seccion: 'genios',
    explicacion:
      'Los perfiles de inversores son texto propio de carácter divulgativo: no provienen de ninguna API. El enlace de cada ficha apunta a Wikipedia para contrastar los datos biográficos.',
  },
  gratis: true,
  requiereClaves: false,
})
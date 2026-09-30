/**
 * Cotizaciones y serie diaria de criptoactivos.
 *
 * https://api.exchange.coinbase.com  ·  https://www.coinbase.com/exchange
 *
 * Endpoint público y documentado de Coinbase Exchange: no pide clave, no cobra,
 * y la política de uso permite aplicaciones de uso personal/educativo citando la
 * fuente. Es un exchange regulado, no un agregador de terceros.
 *
 * /products/<par>/stats    -> precio al contado y mejor bid/ask del libro de órdenes
 * /products/<par>/candles -> velas OHLCV (granularidad diaria)
 */

import { fetchJson, mapLimit } from '../lib/upstream.js'

export const FUENTE = {
  id: 'coinbase',
  nombre: 'Coinbase Exchange',
  url: 'https://www.coinbase.com/exchange',
  api: 'https://api.exchange.coinbase.com',
  licencia: 'API pública documentada, uso gratuito citando la fuente',
  ttlMs: 2 * 60 * 1000,
}

const DIA = 86_400

const iso = (segundos) => new Date(segundos * 1000).toISOString().slice(0, 10)

const formatearPrecio = (valor) => {
  if (!Number.isFinite(valor)) return null
  if (valor >= 1000) return Number(valor.toFixed(2))
  if (valor >= 1) return Number(valor.toFixed(4))
  return Number(valor.toPrecision(4))
}

/** Precio al contado de un par (por ejemplo BTC-USD). */
export const cargarCotizacion = async (producto) => {
  const stats = await fetchJson(
    `https://api.exchange.coinbase.com/products/${producto}/stats`,
  )

  const apertura = Number(stats.open)
  const ultimo = Number(stats.last)
  const variacion = apertura > 0 && Number.isFinite(ultimo) ? ((ultimo - apertura) / apertura) * 100 : null

  return {
    producto,
    ultimo,
    ultimoFormateado: formatearPrecio(ultimo),
    apertura,
    maximo: Number(stats.high),
    minimo: Number(stats.low),
    volumenBase: Number(stats.volume),
    variacionPct: Number.isFinite(variacion) ? Number(variacion.toFixed(2)) : null,
    consultado: new Date().toISOString(),
  }
}

/** Velas diarias ordenadas de más antigua a más reciente. */
export const cargarSerie = async (producto, dias = 30) => {
  const granularidad = DIA
  const fin = Math.floor(Date.now() / 1000)
  const desde = fin - dias * granularidad

  const velas = await fetchJson(
    `https://api.exchange.coinbase.com/products/${producto}/candles?granularity=${granularidad}&start=${desde}&end=${fin}`,
  )

  return velas
    .map(([tiempo, bajo, alto, apertura, cierre, volumen]) => ({
      fecha: iso(tiempo),
      apertura,
      alto,
      bajo,
      cierre,
      volumen,
    }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
}

/** Cotizaciones + serie de varios productos a la vez. */
export const cargarMercadoCripto = async (productos, dias = 30) => {
  const resultados = await mapLimit(productos, 3, async (producto) => {
    const [cotizacion, serie] = await Promise.all([
      cargarCotizacion(producto),
      cargarSerie(producto, dias),
    ])
    return { producto, cotizacion, serie }
  })

  const porProducto = {}
  const series = {}
  let algunError = null

  resultados.forEach((resultado, i) => {
    const producto = productos[i]
    if (resultado.ok) {
      porProducto[producto] = resultado.value.cotizacion
      series[producto] = resultado.value.serie
    } else if (!algunError) {
      algunError = resultado.error
    }
  })

  return { porProducto, series, error: algunError?.message ?? null }
}
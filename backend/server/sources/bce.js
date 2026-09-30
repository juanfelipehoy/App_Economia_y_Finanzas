/**
 * Tipos de cambio de referencia del Banco Central Europeo.
 *
 * Fuente primaria: BCE (Banco Central Europeo).
 * https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/
 *
 * Se consulta a través de Frankfurter, un servicio abierto (MIT) que publica
 * exactamente los tipos oficiales del BCE y añade histórico. Los datos del BCE
 * son de uso público con atribución; no requieren clave ni registro.
 */

import { fetchJson } from '../lib/upstream.js'

export const FUENTE = {
  id: 'bce',
  nombre: 'Banco Central Europeo (BCE)',
  via: 'Frankfurter',
  url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.es.html',
  api: 'https://frankfurter.app',
  licencia: 'Datos del BCE: uso público con atribución · Frankfurter bajo licencia MIT',
  ttlMs: 30 * 60 * 1000,
}

// El BCE publica los tipos contra el euro; el BCE fija EUR=1, así que para
// expresar "cuántas unidades por 1 USD" dividimos por el tipo del dólar.
export const cargarTipos = async (codigos) => {
  const lista = codigos.filter((codigo) => codigo !== 'EUR').join(',')
  if (!lista) return { fecha: null, porUsd: {}, porEuro: {} }

  const datos = await fetchJson(`https://api.frankfurter.app/latest?base=EUR&symbols=${lista}`)

  const porEuro = {}
  for (const [codigo, valor] of Object.entries(datos.rates ?? {})) porEuro[codigo] = valor

  const eurUsd = porEuro.USD
  const porUsd = {}
  for (const [codigo, valor] of Object.entries(porEuro)) {
    // USD/EUR invertido => 1 USD en esa moneda.
    porUsd[codigo] = codigo === 'USD' ? 1 : Number((eurUsd / valor).toFixed(6))
  }

  return { fecha: datos.date ?? null, porUsd, porEuro }
}

/** Serie diaria de un intervalo, para dibujar la evolución. */
export const cargarSerie = async (desde, hasta, codigos) => {
  const datos = await fetchJson(
    `https://api.frankfurter.app/${desde}..${hasta}?base=EUR&symbols=${codigos.join(',')}`,
  )

  const porDia = {}
  for (const codigo of codigos) porDia[codigo] = {}

  for (const [fecha, valores] of Object.entries(datos.rates ?? {})) {
    for (const codigo of codigos) {
      const valor = valores[codigo]
      if (typeof valor === 'number' && Number.isFinite(valor)) porDia[codigo][fecha] = valor
    }
  }

  return { base: datos.base ?? 'EUR', porDia }
}
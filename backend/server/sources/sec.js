/**
 * Estados financieros oficiales de empresas y bancos norteamericanos:
 * SEC EDGAR, API XBRL "companyfacts".
 *
 * https://www.sec.gov/edgar/sec-api-documentation
 *
 * La SEC (U.S. Securities and Exchange Commission) es un organismo del
 * gobierno de EE.UU.: sus datos son de dominio público, la API es gratuita,
 * no pide clave ni registro y su uso es irrestricto. Cada cifra proviene de
 * un 10-K (anual) o 20-F (emisor extranjero) archivado y firmado por la empresa.
 *
 * Reglas de veracidad que aplicamos sin excepción:
 *   1. Solo unidades USD: los 20-F en yenes no se convierten ni se mezclan.
 *   2. Solo cifras anuales (fp = FY) de 10-K/20-F.
 *   3. Para cada métrica gana el dato MÁS RECIENTE entre todas las etiquetas
 *      candidatas: si no, "Revenues" y "RevenueFromContractWith..." pueden
 *      devolver años distintos y compararíamos peras con manzanas.
 */

import { fetchJson, mapLimit } from '../lib/upstream.js'

export const FUENTE = {
  id: 'sec-edgar',
  nombre: 'SEC EDGAR · Dept. del Tesoro de EE.UU.',
  url: 'https://www.sec.gov/edgar/sec-api-documentation',
  api: 'https://data.sec.gov/api/xbrl',
  licencia: 'Dominio público (gobierno de EE.UU.), uso libre con atribución',
  ttlMs: 12 * 60 * 60 * 1000,
}

const EMISORES = 'https://data.sec.gov/api/xbrl/companyfacts/CIK'

/** Métricas que extraemos, con las etiquetas XBRL aceptadas para cada una. */
const METRICAS = {
  activos: ['Assets'],
  ingresos: [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'Revenues',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
    'SalesRevenueNet',
  ],
  utilidad: ['NetIncomeLoss', 'ProfitLoss'],
  patrimonio: ['StockholdersEquity'],
}

const FORMULARIOS_ANUALES = ['10-K', '20-F']

/**
 * Antigüedad máxima que aceptamos para un dato anual. Los archivos de la SEC
 * nunca se borran, así que un emisor puede seguir "teniendo" un 20-F de 2013:
 * mostrarlo como si fuera el estado actual sería un error. Si el ejercicio más
 * reciente que una empresa ha publicado tiene más de esto, tratamos la métrica
 * como no disponible y lo decimos en la interfaz.
 */
const MAX_EDAD_ANIOS = 3

const esReciente = (periodo) => {
  if (!periodo) return false
  const limite = new Date()
  limite.setFullYear(limite.getFullYear() - MAX_EDAD_ANIOS)
  return Date.parse(periodo) >= limite.getTime()
}

/**
 * Elige la observación anual en USD más reciente entre varias etiquetas.
 * @returns {{valor:number, periodo:string, formulario:string, etiqueta:string}|null}
 */
const mejorObservacion = (facts, etiquetas) => {
  let mejor = null

  for (const etiqueta of etiquetas) {
    const unidades = facts.facts?.['us-gaap']?.[etiqueta]?.units?.USD
    if (!Array.isArray(unidades)) continue

    for (const obs of unidades) {
      if (!FORMULARIOS_ANUALES.includes(obs.form)) continue
      if (obs.fp !== 'FY') continue
      if (!Number.isFinite(obs.val)) continue
      // Descartamos archivados que la SEC conserva pero que ya no describen
      // la situación del emisor.
      if (!esReciente(obs.end)) continue

      const candidato = {
        valor: obs.val,
        periodo: obs.end,
        formulario: obs.form,
        etiqueta,
      }

      if (
        !mejor ||
        candidato.periodo > mejor.periodo ||
        (candidato.periodo === mejor.periodo && candidato.formulario === '10-K')
      ) {
        mejor = candidato
      }
    }
  }

  return mejor
}

/**
 * Descarga y normaliza las métricas de un emisor.
 * @param {{ticker:string, cik:string, titulo:string}} emisor
 */
/** La SEC llega con espacios dobles en algunos nombres ("WELLS        FARGO"). */
const normalizar = (texto) => String(texto ?? '').replace(/\s+/g, ' ').trim().toUpperCase()

const concuerda = (texto, esperado) => normalizar(texto).includes(normalizar(esperado))

const leerEmisor = async (emisor) => {
  const facts = await fetchJson(`${EMISORES}${emisor.cik}.json`, { timeoutMs: 20_000 })

  const metricas = {}
  for (const [clave, etiquetas] of Object.entries(METRICAS)) {
    const obs = mejorObservacion(facts, etiquetas)
    metricas[clave] = obs
      ? {
          valor: obs.valor,
          periodo: obs.periodo,
          formulario: obs.formulario,
          etiqueta: obs.etiqueta,
        }
      : null
  }

  return {
    ticker: emisor.ticker,
    cik: emisor.cik,
    // El nombre del directorio de la SEC manda sobre `entityName` de
    // companyfacts: en algunos CIK ese campo nombra a un co-registrante
    // distinto aunque los estados financieros sean los de la matriz.
    nombre: emisor.titulo ?? facts.entityName ?? null,
    fiscalAnio: facts.fiscalYear ?? null,
    metricas,
  }
}

/**
 * Resuelve los CIK desde el directorio oficial de la SEC y trae los datos.
 *
 * `esperado` protege contra colisiones de ticker: el mismo símbolo puede
 * pertenecer a otra entidad en el directorio. Si el nombre legal que devuelve
 * la SEC no contiene el fragmento esperado, descartamos el dato en vez de
 * atribuirle a un banco las cifras de una compañía distinta.
 *
 * @param {Array<{ticker:string, esperado?:string}>} emisores
 */
export const cargarEmisores = async (emisores) => {
  const validos = emisores.filter((emisor) => typeof emisor.ticker === 'string' && emisor.ticker)
  if (validos.length === 0) return { porTicker: {}, descartados: [] }

  const directorio = await fetchJson('https://www.sec.gov/files/company_tickers.json', {
    timeoutMs: 20_000,
  })

  const porTicker = {}
  for (const fila of Object.values(directorio)) porTicker[fila.ticker.toUpperCase()] = fila

  const indice = new Map()
  const resueltos = []
  const descartados = []

  for (const emisor of validos) {
    const simbolo = emisor.ticker.toUpperCase()
    const fila = porTicker[simbolo]

    if (!fila) {
      descartados.push({ ...emisor, motivo: 'El ticker no existe en el directorio de la SEC' })
      continue
    }

    // El directorio de la SEC es la fuente autoritativa de qué empresa es cada
    // ticker. Si su razón social no es la que esperamos, ese símbolo apunta a
    // otra entidad y mostrar sus cifras sería un error.
    if (emisor.esperado && !concuerda(fila.title, emisor.esperado)) {
      descartados.push({
        ...emisor,
        motivo: `El directorio de la SEC asocia ${simbolo} a "${fila.title}"`,
      })
      continue
    }

    const cik = String(fila.cik_str).padStart(10, '0')
    if (indice.has(cik) && indice.get(cik) !== simbolo) {
      descartados.push({
        ...emisor,
        motivo: `Ticker duplicado: ${cik} ya corresponde a ${indice.get(cik)}`,
      })
      continue
    }
    indice.set(cik, simbolo)
    resueltos.push({ ...emisor, cik, titulo: fila.title })
  }

  // La SEC limita a 10 peticiones por segundo: 6 en paralelo es seguro.
  const resultados = await mapLimit(resueltos, 6, leerEmisor)

  const out = {}
  resueltos.forEach((emisor, i) => {
    const resultado = resultados[i]

    if (!resultado?.ok) {
      descartados.push({ ...emisor, motivo: resultado?.error?.message ?? 'Fallo desconocido' })
      return
    }

    out[emisor.ticker] = resultado.value
  })

  return { porTicker: out, descartados }
}

/** Enlaces al buscador de filings de la SEC, para auditar cada cifra. */
export const enlaceFiling = (cik) =>
  `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-K&dateb=&owner=include&count=10`
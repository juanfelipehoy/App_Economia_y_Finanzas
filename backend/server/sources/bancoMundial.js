/**
 * Inflación oficial: IPC anual en %, indicador FP.CPI.TOTL.ZG del Banco Mundial.
 *
 * https://api.worldbank.org/v2  ·  https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG
 *
 * El Banco Mundial es un organismo multilateral: su API es pública, no exige
 * clave ni registro y los datos se publican bajo CC BY 4.0 (atribución obligatoria).
 * Cada respuesta trae `lastupdated`, que es la fecha real de revisión del Banco Mundial.
 */

import { fetchJson } from '../lib/upstream.js'

export const FUENTE = {
  id: 'banco-mundial',
  nombre: 'Banco Mundial · Open Data',
  url: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG',
  api: 'https://api.worldbank.org/v2',
  licencia: 'CC BY 4.0 (atribución obligatoria)',
  ttlMs: 12 * 60 * 60 * 1000,
}

const INDICADOR = 'FP.CPI.TOTL.ZG'

export const cargarInflacion = async (paises) => {
  const codigos = paises.map((pais) => pais.iso3).filter(Boolean)
  if (codigos.length === 0) return { revision: null, porPais: {} }

  const url =
    `https://api.worldbank.org/v2/country/${codigos.join(';')}` +
    `/indicator/${INDICADOR}?format=json&per_page=200`

  const [cabecera, cuerpo] = await fetchJson(url)

  const filas = Array.isArray(cuerpo) ? cuerpo : []

  // Agrupamos todas las observaciones por país para tener también el histórico:
  // sin él no se puede decir si la inflación subió o bajó respecto al año previo.
  const porPais = {}
  for (const fila of filas) {
    const iso3 = fila?.countryiso3code
    const anio = Number(fila?.date)
    const valor = fila?.value

    if (!iso3 || !Number.isFinite(anio)) continue

    const registro = porPais[iso3] ?? (porPais[iso3] = { historico: [] })
    if (!Number.isFinite(valor)) continue

    registro.historico.push({ anio, tasa: Number(Number(valor).toFixed(2)) })
  }

  for (const registro of Object.values(porPais)) {
    registro.historico.sort((a, b) => a.anio - b.anio)
    const ultimo = registro.historico.at(-1)
    const previo = registro.historico.at(-2)

    if (ultimo) {
      registro.tasa = ultimo.tasa
      registro.anio = ultimo.anio
      registro.fechaDato = `${ultimo.anio}-12-31`
      registro.anterior = previo ?? null
      registro.variacion = previo ? Number((ultimo.tasa - previo.tasa).toFixed(2)) : null
    } else {
      registro.tasa = null
      registro.anio = null
      registro.fechaDato = null
      registro.anterior = null
      registro.variacion = null
    }
  }

  return {
    revision: Array.isArray(cabecera) ? (cabecera[0]?.lastupdated ?? null) : null,
    porPais,
  }
}
/**
 * Cliente HTTP para fuentes externas.
 *
 * Todas las fuentes que usamos son públicas, oficiales y gratuitas:
 *   - Banco Central Europeo (vía Frankfurter, MIT)
 *   - Banco Mundial Open Data (CC BY 4.0)
 *   - SEC EDGAR / XBRL (dominio público, EE.UU.)
 *   - Coinbase Exchange API pública (documentada)
 * Ninguna requiere clave, tarjeta ni registro.
 */

const USER_AGENT =
  process.env.UPSTREAM_USER_AGENT ||
  'FinanzasMundo/1.0 (aplicacion educativa de estudio; uso no comercial)'

const DEFAULT_TIMEOUT_MS = 12_000
const DEFAULT_RETRIES = 1

export class UpstreamError extends Error {
  constructor(message, { url, status, cause } = {}) {
    super(message)
    this.name = 'UpstreamError'
    this.url = url
    this.status = status
    if (cause) this.cause = cause
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const request = async (url, { timeoutMs = DEFAULT_TIMEOUT_MS, headers, accept } = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: accept, ...headers },
    })

    if (!response.ok) {
      throw new UpstreamError(`HTTP ${response.status} en ${url}`, {
        url,
        status: response.status,
      })
    }

    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new UpstreamError(`Timeout de ${timeoutMs} ms en ${url}`, { url, cause: error })
    }
    throw error instanceof UpstreamError
      ? error
      : new UpstreamError(`Fallo de red en ${url}: ${error.message}`, { url, cause: error })
  } finally {
    clearTimeout(timer)
  }
}

const withRetry = async (run, retries) => {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      // Un 4xx no mejora reintentando: el problema es la petición, no la red.
      if (error instanceof UpstreamError && error.status >= 400 && error.status < 500) break
      if (attempt < retries) await sleep(300 * (attempt + 1))
    }
  }
  throw lastError
}

export const fetchJson = async (url, options = {}) =>
  withRetry(
    async () => (await request(url, { accept: 'application/json', ...options })).json(),
    options.retries ?? DEFAULT_RETRIES,
  )

export const fetchText = async (url, options = {}) =>
  withRetry(
    async () => (await request(url, { accept: '*/*', ...options })).text(),
    options.retries ?? DEFAULT_RETRIES,
  )

/** Ejecuta varias peticiones en paralelo con un tope de concurrencia. */
export const mapLimit = async (items, limit, worker) => {
  const results = new Array(items.length)
  let cursor = 0

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      try {
        results[index] = { ok: true, value: await worker(items[index], index) }
      } catch (error) {
        results[index] = { ok: false, error }
      }
    }
  })

  await Promise.all(runners)
  return results
}

export { USER_AGENT, DEFAULT_TIMEOUT_MS }
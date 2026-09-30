/**
 * Caché "stale-while-revalidate" para datos externos.
 *
 * - Memoria: respuesta inmediata mientras no expire el TTL.
 * - Disco: snapshot del último dato bueno, para seguir sirviendo si la fuente
 *   oficial se cae (sin internet, saturada o temporalmente caída).
 * - Nunca inventamos: si no hay ni red ni snapshot, devolvemos `null` y la API
 *   responde 503 para que la interfaz lo diga en vez de mostrar un número falso.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.cache')

const memory = new Map()
const refreshing = new Map()

const ensureDir = () => {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

const snapshotPath = (key) => path.join(DIR, `${key.replace(/[^\w.-]/g, '_')}.json`)

const readSnapshot = (key) => {
  try {
    const raw = fs.readFileSync(snapshotPath(key), 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) return null
    return parsed
  } catch {
    return null
  }
}

const writeSnapshot = (key, value, fetchedAt) => {
  try {
    ensureDir()
    fs.writeFileSync(snapshotPath(key), JSON.stringify({ value, fetchedAt }), 'utf8')
  } catch (error) {
    console.warn(`[cache] No se pudo guardar el snapshot de ${key}: ${error.message}`)
  }
}

const log = (key, error) =>
  console.warn(`[fuente:${key}] ${error.message}`)

/**
 * @returns {Promise<{value: unknown, status: 'live'|'cache'|'snapshot', fetchedAt: string|null, error: string|null}>}
 */
export const cached = async (key, { ttlMs, loader, staleMs = ttlMs * 48 }) => {
  const now = Date.now()
  const hot = memory.get(key)

  if (hot && now - hot.loadedAt < ttlMs) {
    return { value: hot.value, status: 'live', fetchedAt: hot.fetchedAt, error: null }
  }

  const disk = readSnapshot(key)
  if (disk && now - Date.parse(disk.fetchedAt) < staleMs) {
    // Servimos lo guardado al instante y refrescamos por detrás.
    if (!refreshing.has(key)) {
      const task = loader()
        .then((value) => {
          const fetchedAt = new Date().toISOString()
          memory.set(key, { value, loadedAt: Date.now(), fetchedAt })
          writeSnapshot(key, value, fetchedAt)
        })
        .catch((error) => log(key, error))
        .finally(() => refreshing.delete(key))
      refreshing.set(key, task)
    }
    return {
      value: disk.value,
      status: 'cache',
      fetchedAt: disk.fetchedAt,
      error: null,
    }
  }

  try {
    const value = await loader()
    const fetchedAt = new Date().toISOString()
    memory.set(key, { value, loadedAt: now, fetchedAt })
    writeSnapshot(key, value, fetchedAt)
    return { value, status: 'live', fetchedAt, error: null }
  } catch (error) {
    log(key, error)

    if (disk) {
      return {
        value: disk.value,
        status: 'snapshot',
        fetchedAt: disk.fetchedAt,
        error: error.message,
      }
    }

    return { value: null, status: 'snapshot', fetchedAt: null, error: error.message }
  }
}

/** Estado de cada fuente para el endpoint /api/fuentes. */
export const cacheStatus = (key) => {
  const hot = memory.get(key)
  return hot ? { fetchedAt: hot.fetchedAt, ageMs: Date.now() - hot.loadedAt } : null
}
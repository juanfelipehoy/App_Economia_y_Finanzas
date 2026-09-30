import { useCallback, useEffect, useMemo, useState } from 'react'
import { getJson } from '../lib/api'

const RESOURCES = [
  { key: 'divisas', path: '/divisas', fallback: [] },
  { key: 'inflacion', path: '/inflacion', fallback: null },
  { key: 'mercados', path: '/mercados', fallback: [] },
  { key: 'trading', path: '/trading', fallback: { estrategias: [], cripto: [] } },
  { key: 'bancos', path: '/bancos', fallback: [] },
  { key: 'genios', path: '/genios', fallback: [] },
  { key: 'stats', path: '/stats', fallback: null },
  { key: 'fuentes', path: '/fuentes', fallback: { fuentes: [] } },
  { key: 'estado', path: '/estado', fallback: {} },
]

/**
 * Cada cuánto reintentamos en silencio. Coincide con el TTL más corto del
 * backend (Cotizaciones de cripto, 2 min): si el usuario deja la pestaña abierta
 * los precios se mantienen al día sin que tenga que recargar a mano.
 */
const REFRESCO_MS = 2 * 60 * 1000

const INITIAL_DATA = Object.fromEntries(RESOURCES.map(({ key, fallback }) => [key, fallback]))

export function useApiData() {
  const [data, setData] = useState(INITIAL_DATA)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [failed, setFailed] = useState([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    Promise.allSettled(
      RESOURCES.map(({ path }) => getJson(path, { signal: controller.signal })),
    ).then((results) => {
      if (!active) return

      const next = { ...INITIAL_DATA }
      const failedKeys = []

      results.forEach((result, index) => {
        const { key, fallback } = RESOURCES[index]
        if (result.status === 'fulfilled' && result.value != null) {
          next[key] = result.value
        } else {
          next[key] = fallback
          if (result.reason?.name !== 'AbortError') failedKeys.push(key)
        }
      })

      setData(next)
      setFailed(failedKeys)
      setStatus(failedKeys.length === RESOURCES.length ? 'error' : 'ready')
      setError(
        failedKeys.length === RESOURCES.length
          ? new Error('No se pudo conectar con el servidor de datos.')
          : null,
      )
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  // Refresco silencioso: no volvemos a la pantalla de carga, solo actualizamos
  // los datos. Si la fuente falla, conservamos lo que ya teníamos en pantalla.
  useEffect(() => {
    if (status !== 'ready') return undefined

    const refrescar = async () => {
      if (document.hidden) return
      try {
        const resultados = await Promise.allSettled(
          RESOURCES.map(({ path }) => getJson(path)),
        )
        if (document.hidden) return

        setData((actual) => {
          const siguiente = { ...actual }
          resultados.forEach((resultado, index) => {
            if (resultado.status === 'fulfilled' && resultado.value != null) {
              siguiente[RESOURCES[index].key] = resultado.value
            }
          })
          return siguiente
        })
      } catch {
        // Un fallo puntual de refresco no debe molestar al usuario: la última
        // lectura correcta sigue siendo válida y la fuente indica su estado.
      }
    }

    const temporizador = setInterval(refrescar, REFRESCO_MS)
    const alVolver = () => {
      if (!document.hidden) refrescar()
    }
    document.addEventListener('visibilitychange', alVolver)

    return () => {
      clearInterval(temporizador)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [status])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setFailed([])
    setAttempt((value) => value + 1)
  }, [])

  return useMemo(
    () => ({ data, status, error, failed, reload }),
    [data, status, error, failed, reload],
  )
}

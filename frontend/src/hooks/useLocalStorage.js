import { useCallback, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      setStored((current) => {
        const next = typeof value === 'function' ? value(current) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* almacenamiento no disponible: se mantiene solo en memoria */
        }
        return next
      })
    },
    [key],
  )

  return [stored, setValue]
}

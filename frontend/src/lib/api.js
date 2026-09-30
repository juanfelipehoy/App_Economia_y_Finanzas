const RAW_BASE = import.meta.env.VITE_API_URL

export const API_BASE = (RAW_BASE ?? '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function getJson(path, { signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(`La API respondió ${response.status}`, response.status)
  }

  return response.json()
}

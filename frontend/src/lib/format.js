export const formatNumber = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export const formatCompact = (value) => {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const units = [
    { limit: 1e12, suffix: ' B' },
    { limit: 1e9, suffix: ' MM' },
    { limit: 1e6, suffix: ' M' },
    { limit: 1e3, suffix: ' K' },
  ]
  const unit = units.find((item) => abs >= item.limit)
  if (!unit) return formatNumber(value, 1)
  return `${formatNumber(value / unit.limit, 1)}${unit.suffix}`
}

/**
 * Cifras grandes en dólares. Las unidades siguen la convención en español
 * (billón = 10^12), que es la que se usa en los países de la app.
 */
export const formatUsd = (value) => {
  if (!Number.isFinite(value)) return '—'
  return `$${formatCompact(value)} USD`
}

/** Fecha corta de un dato: "31 dic 2025". */
export const formatPeriodo = (isoDate) => {
  if (!isoDate) return null
  const date = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

// El backend puede enviar valores que no son rutas (p.ej. un nombre suelto),
// así que normalizamos a una ruta de /public o cadena vacía.
export const resolvePhoto = (foto) => {
  if (typeof foto !== 'string') return ''
  const value = foto.trim()
  return value.startsWith('/') ? value : ''
}

export const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatToday = () =>
  new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

const RISK_TONES = [
  { match: /muy\s*alto/i, tone: 'danger' },
  { match: /alto/i, tone: 'warn' },
  { match: /medio/i, tone: 'accent' },
  { match: /bajo|variable/i, tone: 'ok' },
]

export const riskTone = (value = '') => RISK_TONES.find((item) => item.match.test(value))?.tone ?? 'brand'

export const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const scrollToSection = (id) => {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

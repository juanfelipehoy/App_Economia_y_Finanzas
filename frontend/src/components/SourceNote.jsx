/**
 * Línea de procedencia de una sección.
 *
 * El objetivo es que ninguna cifra de la app aparezca sin contexto: de dónde
 * sale, en qué fecha se publicó el dato y un enlace para verificarlo. Cuando la
 * fuente oficial no respondió y sirvimos el último valor guardado, lo decimos
 * en lugar de disimularlo.
 */
export function SourceNote({ fuente, extra }) {
  if (!fuente) return null

  const { status, fetchedAt } = fuente
  const obsoleto = status === 'snapshot'

  return (
    <p className="source-note">
      <span className={`source-note__dot source-note__dot--${estado(status)}`} aria-hidden="true" />

      <span className="source-note__body">
        Fuente:{' '}
        <a href={fuente.url} target="_blank" rel="noopener noreferrer">
          {fuente.nombre}
        </a>
        {fuente.licencia ? <> · {fuente.licencia}</> : null}
        {fetchedAt ? <> · consultado {formatearFecha(fetchedAt)}</> : null}
        {extra ? <> · {extra}</> : null}
      </span>

      {obsoleto ? (
        <span className="source-note__badge" title="La fuente oficial no respondió">
          sin conexión
        </span>
      ) : null}
    </p>
  )
}

const estado = (status) => {
  if (status === 'snapshot') return 'warn'
  if (status === 'cache') return 'idle'
  return 'ok'
}

const formatearFecha = (iso) => {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default SourceNote

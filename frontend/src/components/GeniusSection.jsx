import { useCallback, useMemo, useRef, useState } from 'react'
import GeniusCard from './GeniusCard'
import Lightbox from './Lightbox'
import { EmptyState, SectionHead } from './ui'
import { normalize, resolvePhoto } from '../lib/format'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'featured', label: 'Destacados' },
  { value: 'regular', label: 'No destacados' },
]

export default function GeniusSection({ genios }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewerIndex, setViewerIndex] = useState(null)
  const triggerRef = useRef(null)

  const filtered = useMemo(() => {
    const term = normalize(search)

    return genios.filter((genio) => {
      const haystack = normalize(
        [genio.nombre, genio.titulo, genio.biografia, genio.filosofia].filter(Boolean).join(' '),
      )
      const matchesSearch = term === '' || haystack.includes(term)
      const matchesFilter =
        filter === 'all' || (filter === 'featured' ? genio.destacado : !genio.destacado)
      return matchesSearch && matchesFilter
    })
  }, [genios, search, filter])

  // Solo entran al visor los perfiles que realmente tienen foto ampliable.
  const photos = useMemo(
    () => filtered.filter((genio) => resolvePhoto(genio.foto)),
    [filtered],
  )

  const openPhoto = useCallback(
    (genio, trigger) => {
      const position = photos.findIndex((item) => item.id === genio.id)
      if (position < 0) return
      triggerRef.current = trigger ?? null
      setViewerIndex(position)
    },
    [photos],
  )

  const closeViewer = useCallback(() => {
    setViewerIndex(null)
    const trigger = triggerRef.current
    triggerRef.current = null
    if (trigger) requestAnimationFrame(() => trigger.focus())
  }, [])

  return (
    <section className="section" id="genios">
      <div className="section__inner">
        <SectionHead
          eyebrow="Mentes brillantes"
          title="Las figuras más influyentes de las finanzas"
          lead="Conoce a los inversores que revolucionaron el mundo de las finanzas y la economía: su filosofía, sus proyectos más importantes y sus frases más célebre."
        />

        <div className="toolbar" data-reveal>
          <label className="field">
            <span className="sr-only">Buscar inversor</span>
            <span className="field__icon">🔍</span>
            <input
              type="search"
              className="input"
              placeholder="Buscar por nombre, título o filosofía..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className="select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filtrar por categoría"
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <p className="toolbar__count" aria-live="polite">
            {filtered.length} de {genios.length}
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="🕵️"
            title="Sin resultados"
            text="No encontramos inversores que coincidan con tu búsqueda. Prueba con otros términos o cambia el filtro."
          >
            <button
              type="button"
              className="btn btn--ghost btn--ghost-sm"
              onClick={() => {
                setSearch('')
                setFilter('all')
              }}
            >
              Limpiar filtros
            </button>
          </EmptyState>
        ) : (
          <div className="genius-list">
            {filtered.map((genio) => (
              <GeniusCard key={genio.id} genio={genio} onOpenPhoto={openPhoto} />
            ))}
          </div>
        )}
      </div>

      {viewerIndex !== null && photos[viewerIndex] && (
        <Lightbox
          genios={photos}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          onClose={closeViewer}
        />
      )}
    </section>
  )
}

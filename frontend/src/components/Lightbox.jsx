import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatDate, getInitials, resolvePhoto } from '../lib/format'

const EXIT_MS = 260
const FOCUSABLE = 'button:not([tabindex="-1"]), [href], input, select, textarea'

export default function Lightbox({ genios, index, onIndexChange, onClose }) {
  const [state, setState] = useState('closed')
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const timerRef = useRef(null)
  const total = genios.length
  const genio = genios[index]

  const dismiss = useCallback(() => {
    setState('closed')
    timerRef.current = window.setTimeout(() => onClose(), EXIT_MS)
  }, [onClose])

  const move = useCallback(
    (step) => {
      if (total < 2) return
      onIndexChange((index + step + total) % total)
    },
    [index, onIndexChange, total],
  )

  // Entrada: esperamos un frame para que la transición de opacidad se aplique.
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')))
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timerRef.current)
    }
  }, [])

  // Bloqueo del scroll con compensación del ancho de la barra.
  useEffect(() => {
    const { overflow, paddingRight } = document.body.style
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [])

  // Foco inicial en el botón de cerrar.
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss()
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        move(1)
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        move(-1)
        return
      }
      if (event.key !== 'Tab') return

      const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dismiss, move])

  if (!genio) return null

  const photo = resolvePhoto(genio.foto)
  const position = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  return createPortal(
    <div className="lightbox" data-state={state}>
      <button
        type="button"
        className="lightbox__backdrop"
        tabIndex={-1}
        aria-label="Cerrar visor de imagen"
        onClick={dismiss}
      />

      <div className="lightbox__content">
        <div className="lightbox__bar">
          <p className="lightbox__hint">
            <kbd>Esc</kbd> cerrar
            {total > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <kbd>←</kbd>
                <kbd>→</kbd> navegar
              </>
            )}
          </p>
          <button
            ref={closeRef}
            type="button"
            className="lightbox__close"
            onClick={dismiss}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div
          ref={dialogRef}
          className="lightbox__frame"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${genio.nombre}`}
        >
          {total > 1 && (
            <>
              <button
                type="button"
                className="lightbox__nav lightbox__nav--prev"
                onClick={() => move(-1)}
                aria-label="Imagen anterior"
              >
                ←
              </button>
              <button
                type="button"
                className="lightbox__nav lightbox__nav--next"
                onClick={() => move(1)}
                aria-label="Imagen siguiente"
              >
                →
              </button>
            </>
          )}

          <figure className="lightbox__figure" key={genio.id}>
            <span className="lightbox__glow" aria-hidden="true" />

            {photo ? (
              <img className="lightbox__image" src={photo} alt={genio.nombre} decoding="async" />
            ) : (
              <div className="lightbox__image lightbox__image--empty" aria-hidden="true">
                {getInitials(genio.nombre)}
              </div>
            )}

            <figcaption className="lightbox__caption">
              <p className="lightbox__counter">{position}</p>
              <h3 className="lightbox__name">{genio.nombre}</h3>
              <p className="lightbox__title">{genio.titulo}</p>
              <p className="lightbox__meta">
                {genio.lugarNacimiento} · {formatDate(genio.nacimiento)}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>,
    document.body,
  )
}
import { useEffect, useState } from 'react'
import { useScrollSpy } from '../hooks/useScrollSpy'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'divisas', label: 'Divisas' },
  { id: 'inflacion', label: 'Inflación' },
  { id: 'mercado', label: 'Mercados' },
  { id: 'trading', label: 'Trading' },
  { id: 'bancos', label: 'Bancos' },
  { id: 'genios', label: 'Genios' },
  { id: 'comentarios', label: 'Comentarios' },
]

const NAV_IDS = NAV_ITEMS.map((item) => item.id)

export default function Header() {
  const [open, setOpen] = useState(false)
  const activeId = useScrollSpy(NAV_IDS)

  useEffect(() => {
    if (!open) return

    const onResize = () => {
      if (window.innerWidth > 880) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="header">
      <div className="header__inner container">
        <a className="brand" href="#inicio" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            📈
          </span>
          <span className="brand__name">FinanzasMundo</span>
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-principal"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
        </button>

        <nav id="nav-principal" className={`nav${open ? ' is-open' : ''}`} aria-label="Secciones">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav__link${activeId === item.id ? ' is-active' : ''}`}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

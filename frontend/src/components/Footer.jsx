const CURRENT_YEAR = new Date().getFullYear()

const COLUMNS = [
  {
    title: 'Explorar',
    links: [
      { label: 'Divisas', href: '#divisas' },
      { label: 'Inflación', href: '#inflacion' },
      { label: 'Mercados', href: '#mercado' },
      { label: 'Trading', href: '#trading' },
      { label: 'Bancos', href: '#bancos' },
      { label: 'Genios', href: '#genios' },
    ],
  },
  {
    title: 'Dashboard',
    links: [
      { label: 'Estadísticas', href: '#dashboard' },
      { label: 'Inflación por país', href: '#inflacion' },
      { label: 'Activos bancarios', href: '#bancos' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'info@finanzasmundo.com', href: 'mailto:info@finanzasmundo.com' },
      { label: 'Comunidad', href: '#comentarios' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <h2 className="footer__title">FinanzasMundo</h2>
          <p className="footer__text">
            Tu portal educativo sobre economía, mercados y finanzas globales. Datos de referencia
            con fines de aprendizaje.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="footer__heading">{column.title}</h2>
            <ul className="footer__list">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer__bottom">
        <p>© {CURRENT_YEAR} FinanzasMundo. Todos los derechos reservados.</p>
        <p className="footer__author">Proyecto de Juan Felipe Hoy</p>
      </div>
    </footer>
  )
}

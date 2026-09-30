import { scrollToSection } from '../lib/format'

export default function Hero({ stats }) {
  const highlights = stats
    ? [
        { value: stats.totalDivisas, label: 'Monedas' },
        { value: stats.totalMercados, label: 'Bolsas' },
        { value: stats.totalBancos, label: 'Bancos' },
        { value: stats.totalGenios, label: 'Perfiles' },
      ]
    : []

  return (
    <section className="hero" id="inicio">
      <div className="hero__inner">
        <span className="hero__eyebrow" data-reveal>
          <span className="hero__dot" aria-hidden="true" />
          Datos actualizados del mercado global
        </span>

        <h1 className="hero__title" data-reveal>
          Economía y finanzas <span>a nivel global</span>
        </h1>

        <p className="hero__text" data-reveal>
          Divisas, inflación, bolsas, estrategias de trading, bancos centrales y las mentes más
          brillantes de la historia de las finanzas, en un solo lugar.
        </p>

        <div className="hero__actions" data-reveal>
          <button type="button" className="btn btn--primary" onClick={() => scrollToSection('dashboard')}>
            Comenzar a aprender
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => scrollToSection('divisas')}>
            Explorar divisas
          </button>
        </div>

        {highlights.length > 0 && (
          <div className="hero__stats" data-reveal>
            {highlights.map((item) => (
              <div key={item.label} className="hero__stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

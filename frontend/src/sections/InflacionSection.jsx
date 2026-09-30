import { EmptyState, SectionHead } from '../components/ui'
import { SourceNote } from '../components/SourceNote'
import { formatNumber } from '../lib/format'

const TONE = (tasa) => {
  if (tasa >= 4) return 'danger'
  if (tasa >= 2.5) return 'warn'
  if (tasa >= 1) return 'accent'
  return 'ok'
}

const LABEL = (tasa) => {
  if (tasa >= 3) return 'Inflación alta'
  if (tasa >= 2) return 'Inflación moderada'
  return 'Inflación baja'
}

export default function InflacionSection({ inflacion, fuente }) {
  if (!inflacion) {
    return (
      <section className="section" id="inflacion">
        <div className="section__inner">
          <SectionHead eyebrow="Estabilidad de precios" title="Inflación" />
          <EmptyState
            icon="📉"
            title="Datos de inflación no disponibles"
            text="No pudimos obtener esta información desde la API."
          />
        </div>
      </section>
    )
  }

  const tasas = inflacion.tasasActuales ?? []

  return (
    <section className="section" id="inflacion">
      <div className="section__inner">
        <SectionHead
          eyebrow="Estabilidad de precios"
          title="Inflación global"
          lead={inflacion.descripcion}
        />

        <div className="callout" data-reveal>
          <h3 className="callout__title">¿Por qué es importante?</h3>
          <ul className="feature-list">
            {(inflacion.importancia ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="two-col">
          <div className="panel" data-reveal>
            <h3 className="panel__title">Causas principales</h3>
            <ul className="feature-list">
              {(inflacion.causas ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="panel" data-reveal>
            <h3 className="panel__title">Consecuencias</h3>
            <ul className="feature-list">
              {(inflacion.consecuencias ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="block-title">Tasas actuales por país</h3>

        <div className="grid-cards">
          {tasas.map((tasa) => {
            const hayDato = Number.isFinite(tasa.tasa)
            return (
              <article key={tasa.pais} className="card" data-reveal>
                <div className="card__head">
                  <span className={`card__badge card__badge--${hayDato ? 'hot' : 'muted'}`}>
                    {hayDato ? `${formatNumber(tasa.tasa, 1)}%` : 's/d'}
                  </span>
                  <div className="card__titles">
                    <h3 className="card__title">{tasa.pais}</h3>
                    <p className="card__subtitle">{tasa.bancoCentral}</p>
                  </div>
                </div>
                <ul className="chip-row">
                  <li className={`chip chip--${hayDato ? TONE(tasa.tasa) : 'neutral'}`}>
                    {hayDato ? LABEL(tasa.tasa) : 'Sin dato oficial'}
                  </li>
                  {hayDato && Number.isFinite(tasa.variacionAnual) ? (
                    <li className="chip chip--neutral">
                      {tasa.variacionAnual > 0 ? '+' : ''}
                      {formatNumber(tasa.variacionAnual, 2)} pts vs {tasa.anioAnterior}
                    </li>
                  ) : null}
                </ul>
                {hayDato ? (
                  <p className="card__stat-note">
                    Inflación anual de {tasa.anio} · indicador CPI del Banco Mundial
                  </p>
                ) : (
                  <p className="card__notice">
                    {tasa.motivo ??
                      'El Banco Mundial no publica todavía el IPC anual de este país.'}
                  </p>
                )}
              </article>
            )
          })}
        </div>

        <SourceNote
          fuente={fuente}
          extra={`Variación anual del IPC (${tasas
            .filter((t) => t.fechaDato)
            .map((t) => t.anio)
            .join(', ')}).`}
        />
      </div>
    </section>
  )
}

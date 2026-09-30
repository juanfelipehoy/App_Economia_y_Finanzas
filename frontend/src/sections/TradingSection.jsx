import { EmptyState, SectionHead } from '../components/ui'
import { SourceNote } from '../components/SourceNote'
import { riskTone, formatNumber } from '../lib/format'

export default function TradingSection({ trading, cripto, fuente }) {
  return (
    <section className="section" id="trading">
      <div className="section__inner">
        <SectionHead
          eyebrow="Estrategias"
          title="Trading"
          lead="El trading es la compra y venta de activos financieros con el objetivo de obtener ganancias. Cada estilo tiene su propio perfil de riesgo, horizonte temporal y conjunto de habilidades."
        />

        {cripto?.length > 0 && (
          <>
            <h3 className="block-title">Cotización real de criptoactivos</h3>
            <div className="grid-cards">
              {cripto.map((activo) => {
                const sube = Number(activo.variacionPct) >= 0
                return (
                  <article key={activo.simbolo} className="card" data-reveal>
                    <div className="card__head">
                      <span className="card__badge card__badge--accent">
                        {activo.simbolo}
                      </span>
                      <div className="card__titles">
                        <h3 className="card__title">{activo.nombre}</h3>
                        <p className="card__subtitle">{activo.producto} · Coinbase</p>
                      </div>
                    </div>
                    <dl className="card__stats">
                      <div className="card__stat card__stat--highlight">
                        <dt>Precio</dt>
                        <dd>
                          ${formatNumber(activo.ultimo, activo.ultimo < 1000 ? 2 : 2)}
                        </dd>
                      </div>
                      <div className="card__stat">
                        <dt>Variación 24 h</dt>
                        <dd>
                          {Number.isFinite(activo.variacionPct)
                            ? `${sube ? '+' : ''}${formatNumber(activo.variacionPct, 2)}%`
                            : '—'}
                        </dd>
                      </div>
                      <div className="card__stat">
                        <dt>Máx. / mín. 24 h</dt>
                        <dd>
                          {formatNumber(activo.maximo, 0)} / {formatNumber(activo.minimo, 0)}
                        </dd>
                      </div>
                    </dl>
                    <p className="card__stat-note">
                      Precio al contado en el libro de órdenes de Coinbase Exchange.
                    </p>
                  </article>
                )
              })}
            </div>
            <SourceNote
              fuente={fuente}
              extra="Datos de mercado, no recomendación de inversión."
            />
          </>
        )}

        {trading.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No hay estrategias disponibles"
            text="No pudimos obtener los datos de trading desde la API."
          />
        ) : (
          <div className="grid-cards grid-cards--wide">
            {trading.map((tipo) => (
              <article key={tipo.id} className="card" data-reveal>
                <div className="card__head">
                  <span className="card__badge">{tipo.nombre.slice(0, 2).toUpperCase()}</span>
                  <div className="card__titles">
                    <h3 className="card__title">{tipo.nombre}</h3>
                    <p className="card__subtitle">Horizonte: {tipo.duracion}</p>
                  </div>
                </div>

                <p className="card__text">{tipo.descripcion}</p>

                <ul className="chip-row">
                  <li className={`chip chip--${riskTone(tipo.riesgo)}`}>
                    Riesgo {String(tipo.riesgo).toLowerCase()}
                  </li>
                  <li className={`chip chip--${riskTone(tipo.recompensa)}`}>
                    Recompensa {String(tipo.recompensa).toLowerCase()}
                  </li>
                </ul>

                <div className="two-col">
                  <div className="panel">
                    <h4 className="panel__title">Ventajas</h4>
                    <ul className="feature-list">
                      {tipo.ventajas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="panel">
                    <h4 className="panel__title">Desventajas</h4>
                    <ul className="feature-list">
                      {tipo.desventajas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="two-col">
                  <div className="panel">
                    <h4 className="panel__title">Habilidades</h4>
                    <ul className="feature-list">
                      {tipo.habilidadesRequeridas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="panel">
                    <h4 className="panel__title">Herramientas</h4>
                    <ul className="feature-list">
                      {tipo.herramientas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

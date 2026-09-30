import { DataCard, EmptyState, SectionHead } from '../components/ui'
import { SourceNote } from '../components/SourceNote'
import { formatNumber, formatPeriodo } from '../lib/format'

const BASE_CODE = 'USD'

const buildStats = (divisa) => {
  const valor = divisa.valorReferencia
  const isBase = divisa.codigo === BASE_CODE

  const rows = [
    {
      label: 'Valor',
      value: Number.isFinite(valor) ? `${divisa.simbolo}${formatNumber(valor, 4)}` : '—',
      highlight: true,
      nota: divisa.fechaCotizacion ? formatPeriodo(divisa.fechaCotizacion) : null,
    },
  ]

  if (isBase) {
    rows.push({ label: 'Cotización', value: 'Moneda base del tipo de cambio' })
  } else if (Number.isFinite(valor) && valor > 0) {
    rows.push({ label: `1 ${BASE_CODE} =`, value: `${formatNumber(valor, 4)} ${divisa.codigo}` })
    rows.push({ label: `1 ${divisa.codigo} =`, value: `${formatNumber(1 / valor, 4)} ${BASE_CODE}` })
  }

  return rows
}

export default function DivisasSection({ divisas, fuente }) {
  const fecha = divisas.find((divisa) => divisa.fechaCotizacion)?.fechaCotizacion

  return (
    <section className="section section--tinted" id="divisas">
      <div className="section__inner">
        <SectionHead
          eyebrow="Mercado Forex"
          title="Intercambio de divisas"
          lead="El mercado de divisas (Forex) es el mercado financiero más grande del mundo. Aquí tienes los tipos de referencia oficiales del Banco Central Europeo expresados por 1 dólar."
        />

        {divisas.length === 0 ? (
          <EmptyState
            icon="💱"
            title="No hay divisas disponibles"
            text="No pudimos obtener los datos de divisas desde la API."
          />
        ) : (
          <>
            <div className="grid-cards">
              {divisas.map((divisa) => (
                <DataCard
                  key={divisa.id}
                  badge={divisa.codigo}
                  badgeTone="accent"
                  title={divisa.nombre}
                  subtitle={divisa.pais}
                  text={divisa.descripcion}
                  stats={buildStats(divisa)}
                />
              ))}
            </div>

            <SourceNote
              fuente={fuente}
              extra={fecha ? `Tipos del ${formatPeriodo(fecha)}.` : null}
            />
          </>
        )}
      </div>
    </section>
  )
}

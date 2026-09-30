import { DataCard, EmptyState, SectionHead } from '../components/ui'
import { SourceNote } from '../components/SourceNote'
import { formatUsd } from '../lib/format'

export default function BancosSection({ bancos, fuente }) {
  const conDatos = bancos.filter((banco) => banco.datos?.hayCifras).length

  return (
    <section className="section section--tinted" id="bancos">
      <div className="section__inner">
        <SectionHead
          eyebrow="Sistema financiero"
          title="Entidades bancarias"
          lead="Los bancos reciben depósitos y otorgan préstamos, jugando un papel crucial en la economía global. Cada cifra procede del estado anual archivado ante la SEC, no de estimaciones."
        />

        {bancos.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No hay bancos disponibles"
            text="No pudimos obtener los datos de bancos desde la API."
          />
        ) : (
          <>
            <div className="grid-cards grid-cards--wide">
              {bancos.map((banco) => {
                const activos = banco.datos?.activos
                return (
                  <DataCard
                    key={banco.id}
                    badge={banco.nombre.slice(0, 2).toUpperCase()}
                    title={banco.nombre}
                    subtitle={banco.nombreCompleto ?? banco.sede}
                    text={banco.descripcion}
                    tags={banco.servicios}
                    tagTone="accent"
                    tagLimit={4}
                    stats={[
                      {
                        label: 'Activos',
                        value: Number.isFinite(activos?.valor) ? formatUsd(activos.valor) : null,
                        highlight: true,
                        nota: activos?.periodo
                          ? `${activos.formulario} · ${activos.periodo}`
                          : null,
                      },
                      { label: 'Sede', value: banco.sede },
                      { label: 'Fundado', value: banco.fundado },
                      { label: 'CEO', value: banco.ceo },
                    ]}
                    aviso={activoSinCifras(banco) ? banco.sinDato : null}
                    enlace={banco.datos?.fuenteUrl ?? null}
                    enlaceTexto="Ver el 10-K en la SEC"
                  />
                )
              })}
            </div>

            <SourceNote
              fuente={fuente}
              extra={
                conDatos < bancos.length
                  ? `${conDatos} de ${bancos.length} bancos con cifras oficiales en dólares. El resto no publica estados financieros en la SEC o los presenta en otra moneda, y se muestra sin cifra en lugar de estimada.`
                  : null
              }
            />
          </>
        )}
      </div>
    </section>
  )
}

const activoSinCifras = (banco) => !banco.datos?.hayCifras

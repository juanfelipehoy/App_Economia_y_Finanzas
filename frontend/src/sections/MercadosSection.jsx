import { DataCard, EmptyState, SectionHead } from '../components/ui'
import { SourceNote } from '../components/SourceNote'
import { formatUsd, formatPeriodo } from '../lib/format'

export default function MercadosSection({ mercados, fuente }) {
  const conDatos = mercados.filter((mercado) => mercado.datos).length

  return (
    <section className="section section--tinted" id="mercado">
      <div className="section__inner">
        <SectionHead
          eyebrow="Bolsas de valores"
          title="Mercados de valores"
          lead="Las bolsas son los mercados donde se compran y venden acciones. Antes se mostraba aquí una capitalización bursátil estimada a mano; ahora cada cifra es la suma de los estados anuales reales archivados ante la SEC, con su fecha y su fuente."
        />

        {mercados.length === 0 ? (
          <EmptyState
            icon="📈"
            title="No hay mercados disponibles"
            text="No pudimos obtener los datos de mercados desde la API."
          />
        ) : (
          <>
            <div className="grid-cards grid-cards--wide">
              {mercados.map((mercado) => {
                const agregado = mercado.datos?.agregado
                return (
                  <DataCard
                    key={mercado.id}
                    badge={mercado.nombre}
                    title={mercado.nombreCompleto}
                    subtitle={`${mercado.ciudad}, ${mercado.pais}`}
                    text={mercado.descripcion}
                    tags={mercado.empresasDestacadas}
                    tagTone="brand"
                    tagLimit={4}
                    stats={[
                      {
                        label: 'Ingresos de sus empresas',
                        value: Number.isFinite(agregado?.ingresos) ? formatUsd(agregado.ingresos) : null,
                        highlight: true,
                        nota: mercado.datos?.periodos?.length
                          ? `ejercicios ${mercado.datos.periodos.map(formatPeriodo).join(' · ')}`
                          : null,
                      },
                      {
                        label: 'Utilidad neta',
                        value: Number.isFinite(agregado?.utilidad) ? formatUsd(agregado.utilidad) : null,
                        nota: 'Sumando solo empresas con cifra',
                      },
                      { label: 'Fundada', value: mercado.fundada },
                      { label: 'Horario', value: mercado.horario },
                    ]}
                    aviso={
                      mercado.sinDato ??
                      (mercado.datos
                        ? mercado.datos.nota
                        : null)
                    }
                    enlace={mercado.datos?.empresas?.[0]?.fuenteUrl ?? null}
                    enlaceTexto="Ver los estados archivados"
                  />
                )
              })}
            </div>

            <SourceNote
              fuente={fuente}
              extra={
                conDatos < mercados.length
                  ? `${conDatos} de ${mercados.length} bolsas con estados financieros en dólares ante la SEC. Las demás se muestran sin cifras agregadas en lugar de estimarlas.`
                  : null
              }
            />
          </>
        )}
      </div>
    </section>
  )
}

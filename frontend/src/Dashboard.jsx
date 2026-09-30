import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompact, formatNumber } from './lib/format'

const PALETTE = ['#667eea', '#22d3ee', '#764ba2', '#f43f5e', '#34d399', '#fbbf24']

const AXIS = { stroke: '#a5b0c3', fontSize: 12 }

const TOOLTIP = {
  contentStyle: {
    backgroundColor: '#121a2b',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 10,
    fontSize: 13,
    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
  },
  labelStyle: { color: '#f1f5f9', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#a5b0c3' },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
}

const GRID_PROPS = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.07)', vertical: false }

function ChartFrame({ title, hint, height = 300, children }) {
  return (
    <figure className="chart" data-reveal>
      <figcaption>
        <h3 className="chart__title">{title}</h3>
        {hint && <p className="chart__hint">{hint}</p>}
      </figcaption>
      <div className="chart__body" style={{ height }}>
        {children}
      </div>
    </figure>
  )
}

const Kpi = ({ label, value, hint }) => (
  <div className="kpi" data-reveal>
    <p className="kpi__label">{label}</p>
    <p className="kpi__value">{value}</p>
    <p className="kpi__hint">{hint}</p>
  </div>
)

export default function Dashboard({ stats }) {
  if (!stats) return null

  const {
    totalDivisas = 0,
    totalMercados = 0,
    totalBancos = 0,
    totalGenios = 0,
    geniosDestacados = 0,
    inflacionPromedio = 0,
    capitalizacionTotal = 0,
    capitalizacionUnidad = 'billones USD',
    divisasPorPais = [],
    tasasInflacion = [],
    activosBancos = [],
  } = stats

  const categoryData = [
    { name: 'Divisas', value: totalDivisas },
    { name: 'Mercados', value: totalMercados },
    { name: 'Bancos', value: totalBancos },
    { name: 'Genios', value: totalGenios },
  ]

  const banksSorted = [...activosBancos].sort((a, b) => b.activos - a.activos)
  const categories = categoryData.filter((item) => item.value > 0)

  return (
    <section className="dashboard" id="dashboard">
      <div className="dashboard__inner">
        <header className="section__head" data-reveal>
          <span className="section__eyebrow">Panel de control</span>
          <h2 className="section__title">Dashboard de estadísticas</h2>
          <p className="section__lead">
            Visualización de los indicadores agregados de todas las secciones del portal.
          </p>
        </header>

        <div className="kpi-grid">
          <Kpi label="Divisas" value={totalDivisas} hint="Monedas de referencia" />
          <Kpi label="Mercados" value={totalMercados} hint="Bolsas de valores" />
          <Kpi label="Bancos" value={totalBancos} hint="Entidades bancarias" />
          <Kpi label="Perfiles" value={totalGenios} hint={`${geniosDestacados} destacados`} />
          <Kpi
            label="Inflación media"
            value={`${formatNumber(inflacionPromedio, 1)}%`}
            hint="Promedio de las tasas registradas"
          />
          <Kpi
            label="Capitalización"
            value={formatNumber(capitalizacionTotal, 1)}
            hint={`Suma de bolsas (${capitalizacionUnidad})`}
          />
        </div>

        <div className="charts">
          <ChartFrame
            title="Inflación por país"
            hint="Tasa anual en porcentaje"
            height={300}
          >
            {tasasInflacion.length === 0 ? (
              <p className="chart__empty">Sin datos de inflación</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasasInflacion} margin={{ top: 16, right: 8, bottom: 4, left: -18 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="pais" {...AXIS} interval={0} angle={-18} textAnchor="end" height={58} />
                  <YAxis {...AXIS} unit="%" width={52} />
                  <Tooltip {...TOOLTIP} formatter={(value) => [`${value} %`, 'Inflación']} />
                  <Bar dataKey="tasa" name="Inflación" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={54}>
                    <LabelList
                      dataKey="tasa"
                      position="top"
                      formatter={(value) => `${value}%`}
                      style={{ fill: '#a5b0c3', fontSize: 11 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>

          <ChartFrame
            title="Valor de las divisas"
            hint="Unidades por 1 USD · escala logarítmica"
            height={300}
          >
            {divisasPorPais.length === 0 ? (
              <p className="chart__empty">Sin datos de divisas</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={divisasPorPais}
                  layout="vertical"
                  margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
                >
                  <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
                  <XAxis
                    type="number"
                    scale="log"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatCompact}
                    {...AXIS}
                  />
                  <YAxis type="category" dataKey="pais" {...AXIS} width={104} />
                  <Tooltip {...TOOLTIP} formatter={(value) => [formatNumber(value, 4), 'Por 1 USD']} />
                  <Bar dataKey="valor" name="Valor" fill="#22d3ee" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    <LabelList
                      dataKey="valor"
                      position="right"
                      formatter={(value) => formatNumber(value, 2)}
                      style={{ fill: '#a5b0c3', fontSize: 11 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>

          <ChartFrame title="Activos de los bancos" hint="Billones de USD · de mayor a menor" height={340}>
            {banksSorted.length === 0 ? (
              <p className="chart__empty">Sin datos bancarios</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={banksSorted}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
                >
                  <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
                  <XAxis type="number" tickFormatter={formatCompact} {...AXIS} />
                  <YAxis type="category" dataKey="nombre" {...AXIS} width={124} />
                  <Tooltip {...TOOLTIP} formatter={(value) => [`${value} B USD`, 'Activos']} />
                  <Bar dataKey="activos" name="Activos" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {banksSorted.map((entry, index) => (
                      <Cell key={entry.nombre} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>

          <ChartFrame title="Distribución del contenido" hint="Entradas por sección" height={300}>
            {categories.length === 0 ? (
              <p className="chart__empty">Sin datos para distribuir</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="45%"
                    outerRadius="72%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP} formatter={(value, name) => [value, name]} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{ color: '#a5b0c3', fontSize: 12, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>
        </div>
      </div>
    </section>
  )
}

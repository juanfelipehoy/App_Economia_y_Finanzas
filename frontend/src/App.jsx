import { lazy, Suspense, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Footer from './components/Footer'
import Comments from './components/Comments'
import GeniusSection from './components/GeniusSection'
import DivisasSection from './sections/DivisasSection'
import InflacionSection from './sections/InflacionSection'
import MercadosSection from './sections/MercadosSection'
import TradingSection from './sections/TradingSection'
import BancosSection from './sections/BancosSection'
import { useApiData } from './hooks/useApiData'
import { useRevealOnScroll } from './hooks/useRevealOnScroll'

const Dashboard = lazy(() => import('./Dashboard'))

function PageState({ icon, title, text, action }) {
  return (
    <div className="page-state">
      {icon && (
        <span className="page-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h1 className="page-state__title">{title}</h1>
      {text && <p className="page-state__text">{text}</p>}
      {action}
    </div>
  )
}

const DashboardFallback = () => (
  <div className="page-state page-state--inline">
    <div className="spinner" aria-hidden="true" />
    <p className="page-state__text">Preparando los gráficos...</p>
  </div>
)

export default function App() {
  const { data, status, error, failed, reload } = useApiData()

  useRevealOnScroll()

  useEffect(() => {
    document.title = 'FinanzasMundo · Economía y finanzas globales'
  }, [])

  if (status === 'loading') {
    return (
      <div className="page-state">
        <div className="spinner" aria-hidden="true" />
        <h1 className="page-state__title">FinanzasMundo</h1>
        <p className="page-state__text">Cargando datos financieros...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <PageState
        icon="🔌"
        title="No pudimos cargar los datos"
        text={error?.message ?? 'Revisa que el backend esté ejecutándose en el puerto 3001.'}
        action={
          <button type="button" className="btn btn--primary" onClick={reload}>
            Reintentar
          </button>
        }
      />
    )
  }

  const { divisas, inflacion, mercados, trading, bancos, genios, stats, fuentes, estado } = data

  // Une el descriptor de cada fuente con su estado real de frescura.
  const fuenteDe = (seccion) => {
    const descriptor = (fuentes?.fuentes ?? []).find((item) => item.seccion === seccion)
    return descriptor ? { ...descriptor, ...(estado?.[seccion] ?? {}) } : null
  }

  return (
    <div className="app">
      <Header />

      <main>
        <Hero stats={stats} />

        <Suspense fallback={<DashboardFallback />}>
          <Dashboard stats={stats} />
        </Suspense>

        <DivisasSection divisas={divisas} fuente={fuenteDe('divisas')} />
        <InflacionSection inflacion={inflacion} fuente={fuenteDe('inflacion')} />
        <MercadosSection mercados={mercados} fuente={fuenteDe('mercados')} />
        <TradingSection
          trading={trading?.estrategias ?? []}
          cripto={trading?.cripto ?? []}
          fuente={fuenteDe('trading')}
        />
        <BancosSection bancos={bancos} fuente={fuenteDe('bancos')} />
        <GeniusSection genios={genios} />
        <Comments />
      </main>

      {failed.length > 0 && (
        <div className="banner" role="status">
          <span>
            No se pudieron cargar: <strong>{failed.join(', ')}</strong>. Some secciones pueden estar
            vacías.
          </span>
          <button type="button" className="btn btn--ghost btn--ghost-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}

import { lazy, Suspense } from 'react'
import { usePathname } from './router'

// Lazy: both pages pull in three.js; split so each route loads only its own scene.
const CloudsPage = lazy(() => import('./pages/Clouds/CloudsPage'))
const PortfolioPage = lazy(() => import('./pages/Portfolio/PortfolioPage'))

/**
 * Shown while the portfolio chunk loads: the same sky and title as the
 * portfolio hero, inline-styled so it needs nothing from the lazy chunk.
 */
function HomeFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(#a8b6c4 0%, #e8edf2 78%)',
      }}
    >
      <h1
        style={{
          margin: 0,
          color: '#1d1d1f',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
          fontWeight: 600,
          letterSpacing: '-0.005em',
          fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
        }}
      >
        Chloe Houvardas
      </h1>
    </div>
  )
}

export default function App() {
  const pathname = usePathname()
  if (pathname === '/clouds')
    return (
      <Suspense fallback={null}>
        <CloudsPage />
      </Suspense>
    )
  return (
    <Suspense fallback={<HomeFallback />}>
      <PortfolioPage />
    </Suspense>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePortfolioScene } from './usePortfolioScene'
import { SECTIONS, TAGLINE, type SectionId } from './content'
import { makeLensDisplacementMap, supportsBackdropLens } from './liquidLens'
import './portfolio.css'

type View =
  | { phase: 'sky' }
  | { phase: 'flying'; to: SectionId | 'sky' }
  | { phase: 'section'; id: SectionId }

export default function PortfolioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { fly } = usePortfolioScene(canvasRef)

  const [view, setView] = useState<View>({ phase: 'sky' })
  // True refraction is Chromium-only; others keep the plain blur glass.
  const [lensMaps] = useState(() =>
    supportsBackdropLens()
      ? { pill: makeLensDisplacementMap(), sheet: makeLensDisplacementMap(256, 0.12) }
      : null,
  )
  const mountedRef = useRef(true)
  const cardRef = useRef<HTMLElement>(null)
  // Nav button that launched the current trip, so focus can return to it.
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    document.title = 'Chloe Houvardas'
  }, [])

  const flyTo = useCallback(
    (dest: SectionId | 'sky') => {
      setView((current) => {
        if (current.phase === 'flying') return current
        fly().then((completed) => {
          if (!mountedRef.current || !completed) return
          setView(dest === 'sky' ? { phase: 'sky' } : { phase: 'section', id: dest })
        })
        return { phase: 'flying', to: dest }
      })
    },
    [fly],
  )

  // Move focus with the view: into the card on arrival, back to the
  // launching nav button on return to the sky.
  useEffect(() => {
    if (view.phase === 'section') {
      cardRef.current?.focus()
    } else if (view.phase === 'sky' && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [view])

  useEffect(() => {
    if (view.phase !== 'section') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') flyTo('sky')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view.phase, flyTo])

  const section = view.phase === 'section' ? SECTIONS.find((s) => s.id === view.id) : undefined
  const flightTarget =
    view.phase === 'flying' && view.to !== 'sky'
      ? SECTIONS.find((s) => s.id === view.to)
      : undefined

  return (
    <div className="portfolio-page" data-lens={lensMaps ? 'on' : undefined}>
      {lensMaps && (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter
            id="portfolio-lens"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={lensMaps.pill}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="36"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="3" result="blurred" />
            <feColorMatrix in="blurred" type="saturate" values="1.6" />
          </filter>
          <filter
            id="portfolio-lens-sheet"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={lensMaps.sheet}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="12" result="blurred" />
            <feColorMatrix in="blurred" type="saturate" values="1.5" />
          </filter>
        </svg>
      )}
      <canvas ref={canvasRef} className="portfolio-canvas" aria-hidden="true" />
      <main className="portfolio-content">
        <p className="sr-only" aria-live="polite">
          {view.phase === 'flying'
            ? `Flying ${flightTarget ? `to ${flightTarget.label}` : 'back to the open sky'}…`
            : ''}
        </p>

        {view.phase === 'sky' && (
          <div className="portfolio-hero">
            <h1>Chloe Houvardas</h1>
            <p className="portfolio-subtitle">Software Developer</p>
            <p className="portfolio-tagline">{TAGLINE}</p>
            <nav aria-label="Sections" className="portfolio-nav">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="portfolio-pill"
                  onClick={(e) => {
                    triggerRef.current = e.currentTarget
                    flyTo(s.id)
                  }}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {section && (
          <>
            <button type="button" className="portfolio-back" onClick={() => flyTo('sky')}>
              ← Back to sky
            </button>
            <section
              ref={cardRef}
              className={
                section.id === 'about' ? 'portfolio-card portfolio-card--wide' : 'portfolio-card'
              }
              tabIndex={-1}
              aria-labelledby="portfolio-card-title"
            >
              <h2 id="portfolio-card-title">{section.title}</h2>
              <div className="portfolio-card-body">{section.body}</div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

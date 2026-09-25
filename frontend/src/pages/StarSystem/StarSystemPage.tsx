import { useEffect, useRef } from 'react'
import { Link } from '../../Link'
import { useStarSystemScene } from './useStarSystemScene'
import './starSystem.css'

export default function StarSystemPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useStarSystemScene(canvasRef)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Star System — Chloe Houvardas'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="star-system-page">
      <canvas
        ref={canvasRef}
        className="star-system-canvas"
        role="img"
        aria-label="A sinuous river of stars sweeping across black space, with a lone human silhouette standing in its glowing core"
      />
      <Link to="/" className="star-system-home">
        ← Home
      </Link>
    </div>
  )
}

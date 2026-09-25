import { useEffect, useRef } from 'react'
import { Link } from '../../Link'
import { useRainbowTreeScene } from './useRainbowTreeScene'
import './rainbowTree.css'

export default function RainbowTreePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useRainbowTreeScene(canvasRef)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Rainbow Tree — Chloe Houvardas'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="rainbow-tree-page">
      <canvas
        ref={canvasRef}
        className="rainbow-tree-canvas"
        role="img"
        aria-label="Animated night tree canopy with rainbow light trails and twinkling sparkles"
      />
      <Link to="/" className="rainbow-tree-home">
        ← Home
      </Link>
    </div>
  )
}

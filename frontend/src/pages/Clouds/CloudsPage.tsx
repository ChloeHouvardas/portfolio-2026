import { useEffect, useRef } from 'react'
import { Link } from '../../Link'
import { useCloudsScene } from './useCloudsScene'
import './clouds.css'

export default function CloudsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useCloudsScene(canvasRef)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Clouds — Chloe Houvardas'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="clouds-page">
      <canvas
        ref={canvasRef}
        className="clouds-canvas"
        role="img"
        aria-label="Endless soft white clouds drifting past the camera under a blue sky"
      />
      <Link to="/" className="clouds-home">
        ← Home
      </Link>
    </div>
  )
}

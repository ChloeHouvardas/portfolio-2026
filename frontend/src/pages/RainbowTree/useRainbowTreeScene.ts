import { useEffect, type RefObject } from 'react'
import { Scene } from './scene'

export function useRainbowTreeScene(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new Scene(canvas, { reducedMotion: motionQuery.matches })
    scene.resize()
    scene.start()

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => scene.resize(), 200)
    }
    const onVisibility = () => {
      if (document.hidden) scene.stop()
      else scene.start()
    }
    const onMotionChange = () => scene.setReducedMotion(motionQuery.matches)

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    motionQuery.addEventListener('change', onMotionChange)

    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotionChange)
      scene.destroy()
    }
  }, [canvasRef])
}

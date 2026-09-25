import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { Scene } from './scene'

export interface PortfolioScene {
  fly: () => Promise<boolean>
}

export function usePortfolioScene(canvasRef: RefObject<HTMLCanvasElement | null>): PortfolioScene {
  const sceneRef = useRef<Scene | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new Scene(canvas, { reducedMotion: motionQuery.matches })
    sceneRef.current = scene
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
    const onPointerMove = (e: PointerEvent) => scene.setPointer(e.clientX, e.clientY)

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    motionQuery.addEventListener('change', onMotionChange)
    window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotionChange)
      window.removeEventListener('pointermove', onPointerMove)
      sceneRef.current = null
      scene.destroy()
    }
  }, [canvasRef])

  // Resolving true when the scene isn't ready keeps the UI state machine
  // moving instead of stranding the user in the flying phase.
  const fly = useCallback(() => sceneRef.current?.fly() ?? Promise.resolve(true), [])

  return { fly }
}

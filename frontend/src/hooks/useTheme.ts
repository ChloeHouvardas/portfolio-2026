import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
}

function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  const applyTheme = useCallback((next: Theme, persist: boolean) => {
    document.documentElement.setAttribute('data-theme', next)
    if (persist) {
      try {
        localStorage.setItem('theme', next)
      } catch {
        // storage unavailable; theme still applies for this visit
      }
    }
    setTheme(next)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const followSystem = () => {
      let stored: string | null
      try {
        stored = localStorage.getItem('theme')
      } catch {
        stored = null
      }
      if (stored === 'light' || stored === 'dark') {
        return
      }
      applyTheme(query.matches ? 'dark' : 'light', false)
    }

    query.addEventListener('change', followSystem)
    return () => query.removeEventListener('change', followSystem)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
    const documentWithTransition = document as DocumentWithViewTransition
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || typeof documentWithTransition.startViewTransition !== 'function') {
      applyTheme(next, true)
      return
    }

    const transition = documentWithTransition.startViewTransition(() => {
      flushSync(() => applyTheme(next, true))
    })

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              'polygon(-35% 0%, 0% 0%, -20% 100%, -55% 100%)',
              'polygon(-35% 0%, 135% 0%, 115% 100%, -55% 100%)',
            ],
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // transition was skipped; the theme is already applied
      })
  }, [applyTheme])

  return { theme, toggleTheme }
}

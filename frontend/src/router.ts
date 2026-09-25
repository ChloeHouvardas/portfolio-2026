import { useEffect, useState } from 'react'

// Minimal History-API routing for a two-page site. If the production host
// ends up being static hosting without SPA rewrites, switch to hash routing.

export function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname)
  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  return pathname
}

export function navigate(path: string): void {
  history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

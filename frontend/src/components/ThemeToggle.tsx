import { Moon, Sun } from 'lucide-react'

import type { Theme } from '../hooks/useTheme'

type ThemeToggleProps = {
  theme: Theme
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="holo-icon-button relative flex h-10 w-10 items-center justify-center rounded-full transition"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      data-testid="theme-toggle"
    >
      {isDark ? <Moon size={19} strokeWidth={2.5} /> : <Sun size={19} strokeWidth={2.5} />}
    </button>
  )
}

export default ThemeToggle

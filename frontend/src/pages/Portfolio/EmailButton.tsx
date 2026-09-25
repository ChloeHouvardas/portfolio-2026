import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Built at runtime so the real address never appears in the markup.
const REAL_ADDRESS = ['work', '@', 'chloehouvardas', '.', 'com'].join('')
const DISPLAY_ADDRESS = 'work[at]chloehouvardas[dot]com'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for insecure contexts / older Safari.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok: boolean
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export default function EmailButton() {
  const [open, setOpen] = useState(false)
  // Portal host is captured on open (refs can't be read during render):
  // the card's backdrop-filter would trap a fixed modal, and the page root
  // carries the glass tokens + lens filters.
  const [host, setHost] = useState<Element | null>(null)
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const copyRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | undefined>(undefined)

  const close = useCallback(() => {
    setOpen(false)
    setCopied('idle')
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    copyRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Capture phase: keep the page's Escape-to-sky handler from firing.
        e.stopPropagation()
        close()
      } else if (e.key === 'Tab') {
        const first = copyRef.current
        const last = closeRef.current
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, close])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const onCopy = async () => {
    const ok = await copyText(REAL_ADDRESS)
    setCopied(ok ? 'ok' : 'fail')
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied('idle'), 2000)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="portfolio-contact portfolio-contact--primary"
        aria-haspopup="dialog"
        onClick={(e) => {
          setHost(e.currentTarget.closest('.portfolio-page'))
          setOpen(true)
        }}
      >
        Email
      </button>
      {open &&
        host &&
        createPortal(
          <div className="portfolio-modal-scrim" onClick={close}>
            <div
              className="portfolio-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="portfolio-modal-title" className="portfolio-widget-label">
                Email
              </h2>
              <p className="portfolio-modal-address">{DISPLAY_ADDRESS}</p>
              <div className="portfolio-modal-actions">
                <button
                  ref={copyRef}
                  type="button"
                  className="portfolio-contact portfolio-contact--primary"
                  onClick={onCopy}
                >
                  {copied === 'ok' ? 'Copied!' : copied === 'fail' ? 'Copy failed' : 'Copy'}
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  className="portfolio-contact"
                  onClick={close}
                >
                  Close
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {copied === 'ok' ? 'Email address copied to clipboard' : ''}
              </p>
            </div>
          </div>,
          host,
        )}
    </>
  )
}

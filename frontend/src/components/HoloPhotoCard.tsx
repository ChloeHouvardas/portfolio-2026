import { type PointerEvent, useEffect, useRef } from 'react'

import './HoloPhotoCard.css'

type HoloPhotoCardProps = {
  image: string
  title: string
  subtitle?: string
  variant?: 'blue' | 'green' | 'violet'
  rotateImage?: boolean
  imageRotation?: 'clockwise' | 'counterclockwise'
  crop?: 'default' | 'portrait'
  tone?: 'normal' | 'soft'
  loading?: 'eager' | 'lazy'
}

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

function HoloPhotoCard({
  image,
  title,
  subtitle,
  variant = 'blue',
  rotateImage = false,
  imageRotation = 'counterclockwise',
  crop = 'default',
  tone = 'normal',
  loading = 'lazy',
}: HoloPhotoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const cardRect = useRef<DOMRect | null>(null)
  const pendingFrame = useRef<number | null>(null)
  const latestPointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    return () => {
      if (pendingFrame.current !== null) {
        cancelAnimationFrame(pendingFrame.current)
      }
    }
  }, [])

  const applyPointer = () => {
    pendingFrame.current = null
    const card = cardRef.current
    const rect = cardRect.current

    if (!card || !rect || rect.width === 0 || rect.height === 0) {
      return
    }

    const x = ((latestPointer.current.x - rect.left) / rect.width) * 100
    const y = ((latestPointer.current.y - rect.top) / rect.height) * 100
    const px = Math.min(Math.max(x, 0), 100)
    const py = Math.min(Math.max(y, 0), 100)
    const dx = px - 50
    const dy = py - 50
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 70, 1)

    card.style.setProperty('--rotate-x', `${(50 - py) * 0.18}deg`)
    card.style.setProperty('--rotate-y', `${(px - 50) * 0.18}deg`)
    card.style.setProperty('--pointer-px', `${px}`)
    card.style.setProperty('--pointer-py', `${py}`)
    card.style.setProperty('--foil-tx', `${dx / 50}`)
    card.style.setProperty('--foil-ty', `${dy / 50}`)
    card.style.setProperty('--pointer-from-center', `${distance}`)
    card.style.setProperty('--card-opacity', '1')
  }

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotionQuery.matches) {
      return
    }

    latestPointer.current.x = event.clientX
    latestPointer.current.y = event.clientY

    if (cardRect.current === null) {
      cardRect.current = event.currentTarget.getBoundingClientRect()
    }

    if (pendingFrame.current === null) {
      pendingFrame.current = requestAnimationFrame(applyPointer)
    }
  }

  const startPointerInteraction = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    cardRect.current = event.currentTarget.getBoundingClientRect()
    updatePointer(event)
  }

  const endPointerInteraction = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    resetPointer()
  }

  const resetPointer = () => {
    if (pendingFrame.current !== null) {
      cancelAnimationFrame(pendingFrame.current)
      pendingFrame.current = null
    }

    cardRect.current = null

    const card = cardRef.current

    if (!card) {
      return
    }

    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
    card.style.setProperty('--pointer-px', '50')
    card.style.setProperty('--pointer-py', '50')
    card.style.setProperty('--foil-tx', '0')
    card.style.setProperty('--foil-ty', '0')
    card.style.setProperty('--pointer-from-center', '0')
    card.style.setProperty('--card-opacity', '0')
  }

  return (
    <div
      ref={cardRef}
      className="holo-card"
      data-variant={variant}
      data-rotate-image={rotateImage}
      data-image-rotation={imageRotation}
      data-crop={crop}
      data-tone={tone}
      onPointerDown={startPointerInteraction}
      onPointerMove={updatePointer}
      onPointerUp={endPointerInteraction}
      onPointerCancel={endPointerInteraction}
      onPointerLeave={resetPointer}
    >
      <div className="holo-card__rotator">
        <div className="tcg-frame">
          <div className="tcg-frame__name-bar">
            <span className="tcg-frame__name">{title}</span>
            <span className="tcg-frame__star" aria-hidden="true">
              ★
            </span>
          </div>
          <div className="tcg-frame__art">
            <img className="holo-card__image" src={image} alt={title} decoding="async" loading={loading} />
            <div className="holo-card__shine" aria-hidden="true">
              <div className="holo-card__foil" />
              <div className="holo-card__sparkle" />
              <div className="holo-card__shade" />
            </div>
            <div className="holo-card__glare" aria-hidden="true">
              <div className="holo-card__glare-spot" />
            </div>
          </div>
          {subtitle ? <div className="tcg-frame__footer">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default HoloPhotoCard

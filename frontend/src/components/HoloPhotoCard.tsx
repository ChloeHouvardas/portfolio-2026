import { type PointerEvent, useRef } from 'react'

import './HoloPhotoCard.css'

type HoloPhotoCardProps = {
  image: string
  title: string
  variant?: 'blue' | 'green' | 'violet'
}

function HoloPhotoCard({ image, title, variant = 'blue' }: HoloPhotoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current

    if (!card) {
      return
    }

    const rect = card.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const px = Math.min(Math.max(x, 0), 100)
    const py = Math.min(Math.max(y, 0), 100)
    const dx = px - 50
    const dy = py - 50
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 70, 1)

    card.style.setProperty('--pointer-x', `${px}%`)
    card.style.setProperty('--pointer-y', `${py}%`)
    card.style.setProperty('--background-x', `${35 + px * 0.35}%`)
    card.style.setProperty('--background-y', `${25 + py * 0.45}%`)
    card.style.setProperty('--rotate-x', `${(50 - py) * 0.18}deg`)
    card.style.setProperty('--rotate-y', `${(px - 50) * 0.18}deg`)
    card.style.setProperty('--pointer-from-center', `${distance}`)
    card.style.setProperty('--card-opacity', '1')
  }

  const resetPointer = () => {
    const card = cardRef.current

    if (!card) {
      return
    }

    card.style.setProperty('--pointer-x', '50%')
    card.style.setProperty('--pointer-y', '50%')
    card.style.setProperty('--background-x', '50%')
    card.style.setProperty('--background-y', '50%')
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
    card.style.setProperty('--pointer-from-center', '0')
    card.style.setProperty('--card-opacity', '0.62')
  }

  return (
    <div
      ref={cardRef}
      className="holo-card"
      data-variant={variant}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      <div className="holo-card__rotator">
        <img className="holo-card__image" src={image} alt={title} />
        <div className="holo-card__shine" aria-hidden="true" />
        <div className="holo-card__glare" aria-hidden="true" />
      </div>
    </div>
  )
}

export default HoloPhotoCard

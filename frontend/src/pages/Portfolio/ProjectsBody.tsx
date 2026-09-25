import { useState } from 'react'
import rainbowTreeShot from './media/rainbow-tree.png'
import starSystemShot from './media/star-system.png'
import cloudsWideShot from './media/clouds-wide.png'
import cloudsTallShot from './media/clouds-tall.png'

/** A gallery slide: 'live' embeds a route of this site as a running,
 *  non-interactive preview; swap in your own images, or use type 'video'
 *  with an mp4/webm src to embed a clip. */
interface MediaItem {
  type: 'live' | 'image' | 'video'
  src: string
  alt?: string
}

interface Project {
  id: string
  name: string
  blurb: string
  detail: string
  tech: string
  media: MediaItem[]
}

const PROJECTS: Project[] = [
  {
    id: 'rainbow-tree',
    name: 'Rainbow Tree',
    blurb: 'A generative canvas tree blooming in rainbow hues',
    detail:
      'A seeded flow-field tree drawn entirely in Canvas 2D — thousands of branch strokes and glow sprites composited from offscreen buffers, so the living-photo animation stays cheap on a phone.',
    tech: 'Canvas 2D · generative art · adaptive quality',
    media: [
      { type: 'live', src: '/rainbow-tree' },
      { type: 'image', src: rainbowTreeShot, alt: 'A tree with a rainbow canopy on black' },
    ],
  },
  {
    id: 'star-system',
    name: 'Star System',
    blurb: 'Drifting stars over a flowing river of light',
    detail:
      'A procedural river of stars: filamentary streamlines traced through a noise field, twinkling glow sprites, and a lone silhouette standing in the bright bend of the stream.',
    tech: 'Canvas 2D · procedural noise · deterministic seeds',
    media: [
      { type: 'live', src: '/star-system' },
      { type: 'image', src: starSystemShot, alt: 'A glowing river of stars across black space' },
    ],
  },
  {
    id: 'clouds',
    name: 'Clouds',
    blurb: 'An endless three.js flight through soft clouds',
    detail:
      'The engine behind this site. Eight thousand textured planes merged into a single geometry, faded by a custom fog shader, looping forever — the same scene you fly through between these sections.',
    tech: 'three.js · GLSL · WebGL',
    media: [
      { type: 'live', src: '/clouds' },
      { type: 'image', src: cloudsWideShot, alt: 'Flying above a deck of white clouds' },
      { type: 'image', src: cloudsTallShot, alt: 'Cloud flight on a phone-sized screen' },
    ],
  },
]

export default function ProjectsBody() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ul className="portfolio-projects">
      {PROJECTS.map((p) => {
        const isOpen = openId === p.id
        return (
          <li
            key={p.id}
            className={isOpen ? 'portfolio-project portfolio-project--open' : 'portfolio-project'}
          >
            <button
              type="button"
              className="portfolio-project-toggle"
              aria-expanded={isOpen}
              aria-controls={`portfolio-project-${p.id}`}
              onClick={() => setOpenId(isOpen ? null : p.id)}
            >
              <span>
                <span className="portfolio-project-name">{p.name}</span>
                <span className="portfolio-project-blurb">{p.blurb}</span>
              </span>
              <span className="portfolio-project-chevron" aria-hidden="true">
                ›
              </span>
            </button>
            <div className="portfolio-project-details" id={`portfolio-project-${p.id}`}>
              <div className="portfolio-project-details-inner">
                <div className="portfolio-project-details-content">
                  <div
                    className="portfolio-project-gallery"
                    role="group"
                    aria-label={`${p.name} gallery`}
                  >
                    {p.media.map((m) => {
                      if (m.type === 'live') {
                        // Mounted only while expanded so collapsed cards
                        // don't run hidden scenes in the background.
                        return isOpen ? (
                          <iframe
                            key={m.src}
                            className="portfolio-project-slide portfolio-project-slide--live"
                            src={m.src}
                            title={`${p.name} live preview`}
                            loading="lazy"
                            tabIndex={-1}
                            aria-hidden="true"
                            onLoad={(e) => {
                              // The embed loading can drag the snap strip to
                              // its end; pin it back to the first slide.
                              const gallery = e.currentTarget.closest(
                                '.portfolio-project-gallery',
                              )
                              if (gallery) gallery.scrollLeft = 0
                              // Same-origin embed: hide the scene's own Home
                              // pill — this is a preview, not a page.
                              const doc = e.currentTarget.contentDocument
                              if (doc) {
                                const style = doc.createElement('style')
                                style.textContent = 'a[href="/"] { display: none !important; }'
                                doc.head.appendChild(style)
                              }
                            }}
                          />
                        ) : null
                      }
                      if (m.type === 'video') {
                        return (
                          <video
                            key={m.src}
                            className="portfolio-project-slide"
                            src={m.src}
                            controls
                            playsInline
                            preload="metadata"
                          />
                        )
                      }
                      return (
                        <img
                          key={m.src}
                          className="portfolio-project-slide"
                          src={m.src}
                          alt={m.alt ?? ''}
                          loading="lazy"
                        />
                      )
                    })}
                  </div>
                  <p>{p.detail}</p>
                  <p className="portfolio-project-tech">{p.tech}</p>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

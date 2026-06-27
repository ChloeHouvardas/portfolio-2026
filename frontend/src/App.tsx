import { useCallback, useEffect, useRef, useState, type MouseEvent, type MutableRefObject, type PointerEvent } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Mail, X } from 'lucide-react'

import HoloPhotoCard from './components/HoloPhotoCard'
import bird4323 from './assets/birds/optimized/IMG_4323.jpg'
import bird4330 from './assets/birds/optimized/IMG_4330.jpg'
import bird4358 from './assets/birds/optimized/IMG_4358.jpg'
import bird4479 from './assets/birds/optimized/IMG_4479.jpg'
import bird4538 from './assets/birds/optimized/IMG_4538.jpg'
import bird4587 from './assets/birds/optimized/IMG_4587.jpg'
import bird4615 from './assets/birds/optimized/IMG_4615.jpg'
import bird4692 from './assets/birds/optimized/IMG_4692.jpg'
import aboutPhoto from './assets/photos/optimized/IMG_0224_sdr.jpg'
import chloeOranges from './assets/photos/optimized/chloe_oranges.jpg'
import chinaPresentation from './assets/photos/optimized/china_presentation.jpeg'
import paperCutsDevpost from './assets/photos/optimized/paper_cuts/paper_cuts_devpost.jpg'
import paperCutsGameplay from './assets/photos/optimized/paper_cuts/paper_cuts_gameplay.jpg'
import paperCutsStage from './assets/photos/optimized/paper_cuts/group_stage.jpg'
import prismExtension from './assets/photos/optimized/prism/extension_view.jpg'
import prismGroup from './assets/photos/optimized/prism/group_photo.jpg'
import prismInstagram from './assets/photos/optimized/prism/instagram_view.jpg'

type ProjectPreview = {
  label: string
  title: string
  image?: string
  alt?: string
  accent?: string
}

type Project = {
  title: string
  meta: string
  award: string
  copy: string
  previews: ProjectPreview[]
  githubUrl: string
}

type ProjectTransitionDirection = 'previous' | 'next'

type ProjectCarouselTransition = {
  fromIndex: number
  toIndex: number
  direction: ProjectTransitionDirection
}

type SwipeState = {
  pointerId: number | null
  startX: number | null
  startY: number | null
  didSwipe: boolean
}

type ExperienceRole = {
  title: string
  dates: string
}

type ExperienceItem = {
  title: string
  meta: string
  copy?: string
  roles?: ExperienceRole[]
}

type ExperienceCategory = {
  label: string
  items: ExperienceItem[]
}

type ContactMethodId = 'github' | 'linkedin' | 'email'

type ContactMethod = {
  id: ContactMethodId
  label: string
  value: string
  displayValue: string
  note: string
  gradient: string
}

function ContactMethodIcon({ id, className, size = 34 }: { id: ContactMethodId; className?: string; size?: number }) {
  if (id === 'email') {
    return <Mail className={className} size={size} strokeWidth={2.2} />
  }

  if (id === 'github') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.34 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.61-3.37-1.16-3.37-1.16-.45-1.15-1.11-1.46-1.11-1.46-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.93.85.09-.66.35-1.11.64-1.36-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.34 9.34 0 0 1 12 7.05c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.74 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.12 10.12 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"
      />
    </svg>
  )
}

const projectGalleryTransitionMs = 420
const projectGalleryTransitionStartDelayMs = 40
const projectTextFadeMs = 140
const contactCopiedResetMs = 2600
const carouselSwipeThresholdPx = 48
const birdCardSwipeThresholdPx = 28
const carouselSwipeIntentRatio = 1.15
const birdCardSwipeIntentRatio = 0.8

const createSwipeState = (): SwipeState => ({
  pointerId: null,
  startX: null,
  startY: null,
  didSwipe: false,
})

const startCarouselSwipe = (swipeState: MutableRefObject<SwipeState>, event: PointerEvent<HTMLElement>) => {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  swipeState.current.pointerId = event.pointerId
  swipeState.current.startX = event.clientX
  swipeState.current.startY = event.clientY
  swipeState.current.didSwipe = false
}

const finishCarouselSwipe = (
  swipeState: MutableRefObject<SwipeState>,
  event: PointerEvent<HTMLElement>,
  showPrevious: () => void,
  showNext: () => void,
  swipeThresholdPx = carouselSwipeThresholdPx,
  swipeIntentRatio = carouselSwipeIntentRatio,
) => {
  const { pointerId, startX, startY } = swipeState.current

  if (pointerId !== event.pointerId || startX === null || startY === null) {
    return
  }

  const swipeDistanceX = event.clientX - startX
  const swipeDistanceY = event.clientY - startY
  const isHorizontalSwipe =
    Math.abs(swipeDistanceX) >= swipeThresholdPx && Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) * swipeIntentRatio

  swipeState.current.pointerId = null
  swipeState.current.startX = null
  swipeState.current.startY = null

  if (!isHorizontalSwipe) {
    return
  }

  event.preventDefault()
  swipeState.current.didSwipe = true

  if (swipeDistanceX > 0) {
    showPrevious()
  } else {
    showNext()
  }
}

const cancelCarouselSwipe = (swipeState: MutableRefObject<SwipeState>) => {
  swipeState.current.pointerId = null
  swipeState.current.startX = null
  swipeState.current.startY = null
}

const stopClickAfterSwipe = (swipeState: MutableRefObject<SwipeState>, event: MouseEvent<HTMLElement>) => {
  if (!swipeState.current.didSwipe) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  swipeState.current.didSwipe = false
}

const navItems = [
  ['Welcome', 'hero'],
  ['About', 'about'],
  ['Featured Projects', 'featured-projects'],
  ['Experience', 'experience'],
  ['Contact', 'contact'],
]

const projects: Project[] = [
  {
    title: 'Paper Cuts',
    meta: 'HTML / CSS / JavaScript / HTML5 Canvas / Node.js / WebSockets / FastAPI / Redis / AWS Trainium',
    award: 'Won 1st Place Cal Hacks AI Hackathon - $5000 USD',
    copy:
      'A creation-first game platform where players draw game pieces, turn sketches into playable sprites, and drop them into a live world. Paper Cuts combines a vanilla Canvas game engine, Node WebSocket relay, FastAPI services, AI recognition and sprite enhancement, safe mechanic composition, and Redis vector memory.',
    previews: [
      {
        label: 'Gameplay loop',
        title: 'Draw to play',
        image: paperCutsGameplay,
        alt: 'Paper Cuts gameplay with hand-drawn platform fighter characters and objects',
      },
      {
        label: 'Devpost',
        title: 'Paper Cuts',
        image: paperCutsDevpost,
        alt: 'Paper Cuts project page artwork with a hand-drawn game screenshot',
      },
      {
        label: 'We made it on stage!',
        title: 'Grand prize winner',
        image: paperCutsStage,
        alt: 'Paper Cuts team on stage holding a grand prize check',
      },
    ],
    githubUrl: 'https://github.com/Jeremyliu-621/paper-cuts',
  },
  {
    title: 'Prism',
    meta: 'React / FastAPI / Claude / Brave Search / Google Vision / Chrome Extensions',
    award: 'Won 1st Place Hack Her Hackathon - $500',
    copy:
      'A Chrome extension that helps people evaluate online content in context. Prism scans social posts, images, videos, and profiles for misleading patterns, then surfaces concise risk labels, source checks, and supporting context inside the browsing flow.',
    previews: [
      {
        label: 'Extension view',
        title: 'Browser companion',
        image: prismExtension,
        alt: 'Prism Chrome extension panel open in a browser window',
      },
      {
        label: 'Instagram analysis',
        title: 'Context labels',
        image: prismInstagram,
        alt: 'Prism analyzing Instagram content with misleading and context labels',
      },
      {
        label: 'We finally submitted!',
        title: 'Prism team',
        image: prismGroup,
        alt: 'Prism team showing the extension on a laptop',
      },
    ],
    githubUrl: 'https://github.com/ChloeHouvardas/prism',
  },
]

const projectPreviewImageSources = Array.from(
  new Set(
    projects.flatMap((project) => project.previews.map((preview) => preview.image).filter((image): image is string => Boolean(image))),
  ),
)

const experienceCategories: ExperienceCategory[] = [
  {
    label: 'Experience',
    items: [
      {
        title: 'Software Engineering Intern',
        meta: 'Digitara Interactive / May 2023 to August 2023',
      },
      {
        title: 'Data Analyst',
        meta: 'Statistics Canada / May 2024 to October 2024',
      },
      {
        title: 'Volleyball Coach',
        meta: 'JAM / April 2024 to September 2024',
        copy: 'Coached volleyball with a focus on skill development, teamwork, and creating a positive environment for players.',
      },
      {
        title: 'Sales and Trading Intern',
        meta: 'National Bank / May 2025 to August 2025',
      },
    ],
  },
  {
    label: 'Volunteer Experience',
    items: [
      {
        title: 'Data Scientist',
        meta: 'QMIND / October 2023 to March 2024',
        copy: 'Collaborated with a Fortune 500 company to build a prototype secure AI marketing email tool.',
      },
      {
        title: 'Technical Consultant',
        meta: 'QSC (Queen Startup Consulting) / Dates TBD',
        copy: 'Worked alongside a team of technical consultants to provide software solutions for a legal services startup.',
      },
      {
        title: 'QTMA',
        meta: 'Queen Technology and Media Association / March 2024 to present',
        roles: [
          {
            title: 'Software Developer',
            dates: 'March 2024 to March 2025',
          },
          {
            title: 'Co-chair',
            dates: 'March 2025 to April 2026',
          },
          {
            title: 'Director of Developers',
            dates: 'April 2026 to present',
          },
        ],
      },
    ],
  },
  // TODO: Restore the Awards category when real awards content is ready.
  // {
  //   label: 'Awards',
  //   items: [
  //     {
  //       title: 'Award one',
  //       meta: 'Placeholder',
  //       copy: 'Add award name, issuer, date, and the reason it matters.',
  //     },
  //     {
  //       title: 'Award two',
  //       meta: 'Placeholder',
  //       copy: 'A second placeholder for scholarships, hackathon wins, or recognitions.',
  //     },
  //     {
  //       title: 'Award three',
  //       meta: 'Placeholder',
  //       copy: 'Use this block for another award or recognition.',
  //     },
  //     {
  //       title: 'Award four',
  //       meta: 'Placeholder',
  //       copy: 'Use this block for another award or recognition.',
  //     },
  //     {
  //       title: 'Award five',
  //       meta: 'Placeholder',
  //       copy: 'Use this block for another award or recognition.',
  //     },
  //     {
  //       title: 'Award six',
  //       meta: 'Placeholder',
  //       copy: 'Use this block for another award or recognition.',
  //     },
  //   ],
  // },
]

const contactMethods: ContactMethod[] = [
  {
    id: 'github',
    label: 'GitHub',
    value: 'https://github.com/ChloeHouvardas',
    displayValue: '@ChloeHouvardas',
    note: 'Project links and code live here.',
    gradient: 'from-sky-300 via-cyan-200 to-emerald-200',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'https://www.linkedin.com/in/chloe-houvardas/',
    displayValue: 'chloe-houvardas',
    note: 'Professional updates and work history live here.',
    gradient: 'from-blue-300 via-indigo-200 to-fuchsia-200',
  },
  {
    id: 'email',
    label: 'Email',
    value: 'chloe.houvardas@queensu.ca',
    displayValue: 'chloe.houvardas@queensu.ca',
    note: 'Best place for direct messages.',
    gradient: 'from-amber-200 via-rose-200 to-pink-200',
  },
]

const holoCards = [
  {
    title: 'Blue Jay',
    subtitle: 'Toronto, Ontario',
    image: bird4323,
    variant: 'blue' as const,
    rotateImage: false,
  },
  {
    title: 'Northern Cardinal (male)',
    subtitle: 'Toronto, Ontario',
    image: bird4330,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Northern Cardinal (male)',
    subtitle: 'Toronto, Ontario',
    image: bird4358,
    variant: 'violet' as const,
    rotateImage: false,
  },
  {
    title: 'American Goldfinch (male)',
    subtitle: 'Toronto, Ontario',
    image: bird4479,
    variant: 'blue' as const,
    rotateImage: false,
  },
  {
    title: 'Blue Jay',
    subtitle: 'Toronto, Ontario',
    image: bird4538,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Northern Cardinal (female)',
    subtitle: 'Toronto, Ontario',
    image: bird4587,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Northern Cardinal (male)',
    subtitle: 'Toronto, Ontario',
    image: bird4615,
    variant: 'violet' as const,
    rotateImage: false,
  },
  {
    title: 'Northern Cardinal (male)',
    subtitle: 'Toronto, Ontario',
    image: bird4692,
    variant: 'blue' as const,
    rotateImage: false,
  },
]

const aboutSlides = [
  {
    image: aboutPhoto,
    imageTitle: 'Mount Fuji, Japan',
    cardTitle: 'Solo Traveling Japan!',
    cardSubtitle: 'Mount Fuji, Japan',
    variant: 'green' as const,
    crop: 'portrait' as const,
    paragraphs: [
      'I am drawn to backend systems and AI because they reward both speed and depth. I like building quickly at hackathons, but I also care about understanding the fundamentals underneath.',
      'That means asking how systems fit together, where the edge cases are, and what makes software reliable enough to keep improving.',
    ],
  },
  {
    image: chinaPresentation,
    imageTitle: 'Fintech Hackathon, Chengdu China',
    cardTitle: 'Our Winning Pitch!',
    cardSubtitle: 'Fintech Hackathon, Chengdu China',
    variant: 'blue' as const,
    crop: 'default' as const,
    paragraphs: [
      'I like environments where people move quickly, share ideas early, and figure things out together. I am comfortable presenting, joining unfamiliar teams, meeting new people, and learning from different domains.',
      'A lot of my best work comes from taking initiative when the path is still unclear and helping a team turn momentum into something concrete.',
    ],
  },
  {
    image: chloeOranges,
    imageTitle: 'Jeju Island, Korea',
    cardTitle: 'My Weekly Dose of Vitamin C!',
    cardSubtitle: 'Jeju Island, Korea',
    variant: 'violet' as const,
    crop: 'default' as const,
    paragraphs: [
      'Usually you can find me, playing volleyball, video games, watching Formula 1, travelling, or a at a hackathon. I studied abroad in Korea to watch my favorite volleyball player, Kim Yeon-koung, before she retired.',
      'Some favorite games are Pokemon Silver and Outer Wilds, my favorite race distance is a 5K, I speak English and French but am also working on a few others, and there is a non-zero chance this portfolio only exists to show off my bird photos.',
    ],
  },
]

const polaroidPlacements = [
  'left-[10%] top-[12%] rotate-[-8deg] sm:left-[7%]',
  'right-[10%] top-[15%] rotate-[7deg] sm:right-[8%]',
  'left-[30%] bottom-[8%] rotate-[2deg] sm:left-[31%]',
]

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">{title}</h2>
    </div>
  )
}

function ProjectPreviewArtwork({ preview, imageLoading }: { preview: ProjectPreview; imageLoading: 'eager' | 'lazy' }) {
  return (
    <>
      <div className="isolate aspect-[4/3] overflow-hidden bg-white [backface-visibility:hidden]">
        {preview.image ? (
          <img
            className="block h-full w-full transform-gpu object-cover [backface-visibility:hidden] [will-change:transform]"
            src={preview.image}
            alt={preview.alt}
            decoding="async"
            loading={imageLoading}
          />
        ) : (
          <div className={`flex h-full w-full items-end bg-gradient-to-br ${preview.accent} p-3 text-white [backface-visibility:hidden]`}>
            <p className="text-lg font-bold leading-tight">{preview.title}</p>
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-center text-xs font-bold text-neutral-950">{preview.label}</p>
    </>
  )
}

function App() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [activeAboutIndex, setActiveAboutIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [projectTransition, setProjectTransition] = useState<ProjectCarouselTransition | null>(null)
  const [isProjectTransitionActive, setIsProjectTransitionActive] = useState(false)
  const [isProjectImageDecodePending, setIsProjectImageDecodePending] = useState(false)
  const [isProjectTextVisible, setIsProjectTextVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [expandedProjectPreviewIndex, setExpandedProjectPreviewIndex] = useState<number | null>(null)
  const [isProjectPreviewExpanded, setIsProjectPreviewExpanded] = useState(false)
  const [activeExperienceCategoryIndex, setActiveExperienceCategoryIndex] = useState(0)
  const [flippedContactMethodIds, setFlippedContactMethodIds] = useState<ContactMethodId[]>([])
  const [copiedContactMethodIds, setCopiedContactMethodIds] = useState<ContactMethodId[]>([])
  const holoCardsSwipe = useRef(createSwipeState())
  const aboutSwipe = useRef(createSwipeState())
  const projectSwipe = useRef(createSwipeState())
  const experienceSwipe = useRef(createSwipeState())
  const projectPreviewOpenAnimationFrame = useRef<number | null>(null)
  const projectPreviewCloseTimeout = useRef<number | null>(null)
  const projectTransitionStartTimeout = useRef<number | null>(null)
  const projectTransitionTimeout = useRef<number | null>(null)
  const projectTextTimeout = useRef<number | null>(null)
  const contactCopiedResetTimeouts = useRef<Map<ContactMethodId, number>>(new Map())
  const decodedProjectPreviewImages = useRef<Set<string>>(new Set())
  const projectPreviewImageDecodePromises = useRef<Map<string, Promise<void>>>(new Map())
  const projectNavigationInProgress = useRef(false)
  const activeAboutSlide = aboutSlides[activeAboutIndex]
  const activeProject = projects[activeProjectIndex]
  const activeExperienceCategory = experienceCategories[activeExperienceCategoryIndex]
  const expandedProjectPreview = expandedProjectPreviewIndex === null ? null : activeProject.previews[expandedProjectPreviewIndex]
  const isProjectCarouselBusy = isProjectImageDecodePending || projectTransition !== null || !isProjectTextVisible
  const visibleHoloCards = [-1, 0, 1].map((position) => {
    const index = (activeCardIndex + position + holoCards.length) % holoCards.length

    return {
      ...holoCards[index],
      index,
      position,
    }
  })

  const decodeProjectPreviewImage = useCallback((imageSource: string) => {
    if (decodedProjectPreviewImages.current.has(imageSource)) {
      return Promise.resolve()
    }

    const existingDecodePromise = projectPreviewImageDecodePromises.current.get(imageSource)

    if (existingDecodePromise) {
      return existingDecodePromise
    }

    const decodePromise = new Promise<void>((resolve) => {
      const image = new Image()
      let isSettled = false

      const finish = () => {
        if (isSettled) {
          return
        }

        isSettled = true
        decodedProjectPreviewImages.current.add(imageSource)
        projectPreviewImageDecodePromises.current.delete(imageSource)
        resolve()
      }

      const decodeLoadedImage = () => {
        if (typeof image.decode === 'function') {
          void image.decode().then(finish, finish)
          return
        }

        finish()
      }

      image.decoding = 'async'
      image.onload = decodeLoadedImage
      image.onerror = finish
      image.src = imageSource

      if (image.complete) {
        decodeLoadedImage()
      }
    })

    projectPreviewImageDecodePromises.current.set(imageSource, decodePromise)

    return decodePromise
  }, [])

  const decodeProjectPreviewImages = useCallback((project: Project) =>
    Promise.all(project.previews.map((preview) => (preview.image ? decodeProjectPreviewImage(preview.image) : Promise.resolve()))).then(
      () => undefined,
    ), [decodeProjectPreviewImage])

  useEffect(() => {
    projectPreviewImageSources.forEach((imageSource) => {
      void decodeProjectPreviewImage(imageSource)
    })
  }, [decodeProjectPreviewImage])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotionPreference = () => {
      setPrefersReducedMotion(motionQuery.matches)
    }

    updateReducedMotionPreference()

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', updateReducedMotionPreference)
    } else {
      motionQuery.addListener(updateReducedMotionPreference)
    }

    return () => {
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', updateReducedMotionPreference)
      } else {
        motionQuery.removeListener(updateReducedMotionPreference)
      }
    }
  }, [])

  useEffect(() => {
    const contactResetTimeouts = contactCopiedResetTimeouts.current

    return () => {
      if (projectPreviewOpenAnimationFrame.current !== null) {
        window.cancelAnimationFrame(projectPreviewOpenAnimationFrame.current)
      }

      if (projectPreviewCloseTimeout.current !== null) {
        window.clearTimeout(projectPreviewCloseTimeout.current)
      }

      if (projectTransitionStartTimeout.current !== null) {
        window.clearTimeout(projectTransitionStartTimeout.current)
      }

      if (projectTransitionTimeout.current !== null) {
        window.clearTimeout(projectTransitionTimeout.current)
      }

      if (projectTextTimeout.current !== null) {
        window.clearTimeout(projectTextTimeout.current)
      }

      contactResetTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
      contactResetTimeouts.clear()
    }
  }, [])

  const toggleContactMethod = (methodId: ContactMethodId) => {
    setFlippedContactMethodIds((currentMethodIds) =>
      currentMethodIds.includes(methodId) ? currentMethodIds.filter((currentMethodId) => currentMethodId !== methodId) : [...currentMethodIds, methodId],
    )
  }

  const copyContactMethod = async (method: ContactMethod) => {
    try {
      await navigator.clipboard.writeText(method.value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = method.value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopiedContactMethodIds((currentMethodIds) =>
      currentMethodIds.includes(method.id) ? currentMethodIds : [...currentMethodIds, method.id],
    )

    const existingResetTimeout = contactCopiedResetTimeouts.current.get(method.id)

    if (existingResetTimeout !== undefined) {
      window.clearTimeout(existingResetTimeout)
    }

    const resetTimeout = window.setTimeout(() => {
      setCopiedContactMethodIds((currentMethodIds) => currentMethodIds.filter((currentMethodId) => currentMethodId !== method.id))
      contactCopiedResetTimeouts.current.delete(method.id)
    }, contactCopiedResetMs)

    contactCopiedResetTimeouts.current.set(method.id, resetTimeout)
  }

  const showPreviousCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex - 1 + holoCards.length) % holoCards.length)
  }

  const showNextCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex + 1) % holoCards.length)
  }

  const showPreviousAboutSlide = () => {
    setActiveAboutIndex((currentIndex) => (currentIndex - 1 + aboutSlides.length) % aboutSlides.length)
  }

  const showNextAboutSlide = () => {
    setActiveAboutIndex((currentIndex) => (currentIndex + 1) % aboutSlides.length)
  }

  const clearProjectPreviewTimers = () => {
    if (projectPreviewOpenAnimationFrame.current !== null) {
      window.cancelAnimationFrame(projectPreviewOpenAnimationFrame.current)
      projectPreviewOpenAnimationFrame.current = null
    }

    if (projectPreviewCloseTimeout.current !== null) {
      window.clearTimeout(projectPreviewCloseTimeout.current)
      projectPreviewCloseTimeout.current = null
    }
  }

  const expandProjectPreview = (previewIndex: number) => {
    clearProjectPreviewTimers()
    setIsProjectPreviewExpanded(false)
    setExpandedProjectPreviewIndex(previewIndex)

    projectPreviewOpenAnimationFrame.current = window.requestAnimationFrame(() => {
      setIsProjectPreviewExpanded(true)
      projectPreviewOpenAnimationFrame.current = null
    })
  }

  const closeExpandedProjectPreview = () => {
    clearProjectPreviewTimers()
    setIsProjectPreviewExpanded(false)

    projectPreviewCloseTimeout.current = window.setTimeout(() => {
      setExpandedProjectPreviewIndex(null)
      projectPreviewCloseTimeout.current = null
    }, 320)
  }

  const resetProjectPreview = () => {
    clearProjectPreviewTimers()
    setIsProjectPreviewExpanded(false)
    setExpandedProjectPreviewIndex(null)
  }

  const clearProjectTransitionTimers = () => {
    if (projectTransitionStartTimeout.current !== null) {
      window.clearTimeout(projectTransitionStartTimeout.current)
      projectTransitionStartTimeout.current = null
    }

    if (projectTransitionTimeout.current !== null) {
      window.clearTimeout(projectTransitionTimeout.current)
      projectTransitionTimeout.current = null
    }

    if (projectTextTimeout.current !== null) {
      window.clearTimeout(projectTextTimeout.current)
      projectTextTimeout.current = null
    }
  }

  const showProject = async (direction: ProjectTransitionDirection) => {
    if (projectNavigationInProgress.current || projectTransition !== null) {
      return
    }

    projectNavigationInProgress.current = true
    const nextProjectIndex =
      direction === 'previous'
        ? (activeProjectIndex - 1 + projects.length) % projects.length
        : (activeProjectIndex + 1) % projects.length

    resetProjectPreview()
    setIsProjectImageDecodePending(true)
    await decodeProjectPreviewImages(projects[nextProjectIndex])
    setIsProjectImageDecodePending(false)

    if (prefersReducedMotion) {
      setActiveProjectIndex(nextProjectIndex)
      projectNavigationInProgress.current = false
      return
    }

    clearProjectTransitionTimers()
    setProjectTransition({
      fromIndex: activeProjectIndex,
      toIndex: nextProjectIndex,
      direction,
    })
    setIsProjectTransitionActive(false)

    projectTransitionStartTimeout.current = window.setTimeout(() => {
      setIsProjectTransitionActive(true)
      projectTransitionStartTimeout.current = null
    }, projectGalleryTransitionStartDelayMs)

    setIsProjectTextVisible(false)
    projectTextTimeout.current = window.setTimeout(() => {
      setActiveProjectIndex(nextProjectIndex)
      setIsProjectTextVisible(true)
      projectTextTimeout.current = null
    }, projectTextFadeMs)

    projectTransitionTimeout.current = window.setTimeout(() => {
      projectTransitionTimeout.current = null
      setProjectTransition(null)
      setIsProjectTransitionActive(false)
      projectNavigationInProgress.current = false
    }, projectGalleryTransitionStartDelayMs + projectGalleryTransitionMs)
  }

  const showPreviousProject = () => {
    void showProject('previous')
  }

  const showNextProject = () => {
    void showProject('next')
  }

  const showPreviousExperienceCategory = () => {
    setActiveExperienceCategoryIndex((currentIndex) => (currentIndex - 1 + experienceCategories.length) % experienceCategories.length)
  }

  const showNextExperienceCategory = () => {
    setActiveExperienceCategoryIndex((currentIndex) => (currentIndex + 1) % experienceCategories.length)
  }

  const getProjectGalleryMotionClass = (galleryRole: 'from' | 'to', direction: ProjectTransitionDirection) => {
    const inactiveClass =
      galleryRole === 'from'
        ? 'translate-x-0'
        : direction === 'previous'
          ? '-translate-x-full'
          : 'translate-x-full'

    const activeClass =
      galleryRole === 'to'
        ? 'translate-x-0'
        : direction === 'previous'
          ? 'translate-x-full'
          : '-translate-x-full'

    return isProjectTransitionActive ? activeClass : inactiveClass
  }

  const getProjectGalleryLayerState = (projectIndex: number) => {
    if (projectTransition) {
      if (projectIndex === projectTransition.fromIndex) {
        return {
          className: `z-10 transition-all duration-[420ms] ease-out ${getProjectGalleryMotionClass('from', projectTransition.direction)}`,
          galleryRole: 'from',
          isInteractive: false,
          shouldExposeTestIds: true,
        }
      }

      if (projectIndex === projectTransition.toIndex) {
        return {
          className: `z-20 transition-all duration-[420ms] ease-out ${getProjectGalleryMotionClass('to', projectTransition.direction)}`,
          galleryRole: 'to',
          isInteractive: false,
          shouldExposeTestIds: true,
        }
      }

      return {
        className: 'translate-x-full',
        galleryRole: 'hidden',
        isInteractive: false,
        shouldExposeTestIds: false,
      }
    }

    if (projectIndex === activeProjectIndex) {
      return {
        className: 'z-10 translate-x-0',
        galleryRole: 'active',
        isInteractive: true,
        shouldExposeTestIds: true,
      }
    }

    return {
      className: 'translate-x-full',
      galleryRole: 'hidden',
      isInteractive: false,
      shouldExposeTestIds: false,
    }
  }

  const renderProjectGallery = (
    project: Project,
    projectIndex: number,
    className = 'translate-x-0',
    isInteractive = true,
    galleryRole = 'active',
    shouldExposeTestIds = true,
  ) => {
    const panelExpandedProjectPreview = projectIndex === activeProjectIndex ? expandedProjectPreview : null

    return (
      <div
        key={project.title}
        className={`absolute inset-0 transform-gpu [backface-visibility:hidden] [will-change:transform] ${className}`}
        data-gallery-role={galleryRole}
        aria-hidden={isInteractive ? undefined : 'true'}
        aria-label={`${project.title} image gallery`}
      >
        <div
          className={`relative h-full transition duration-500 ease-out ${
            isProjectPreviewExpanded ? 'pointer-events-none scale-[0.96] opacity-0 blur-[1px]' : 'scale-100 opacity-100'
          } ${isInteractive ? '' : 'pointer-events-none'}`}
        >
          {project.previews.map((preview, index) => {
            const placement = polaroidPlacements[index % polaroidPlacements.length]

            return (
              <button
                key={`project-${projectIndex}-preview-${preview.label}`}
                type="button"
                onClick={() => expandProjectPreview(index)}
                disabled={!isInteractive}
                className={`isolate absolute w-[38%] max-w-[220px] transform-gpu bg-white p-2 pb-4 text-left shadow-2xl shadow-black/30 transition duration-300 ease-out [backface-visibility:hidden] [will-change:transform] hover:z-20 hover:scale-[1.025] focus:z-20 focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-default sm:w-[42%] ${placement}`}
                data-testid={shouldExposeTestIds ? 'project-polaroid' : undefined}
                data-preview-label={shouldExposeTestIds ? preview.label : undefined}
                aria-label={`Expand ${preview.label}`}
              >
                <ProjectPreviewArtwork preview={preview} imageLoading="eager" />
              </button>
            )
          })}
        </div>

        {panelExpandedProjectPreview ? (
          <>
            <button
              type="button"
              className={`absolute inset-0 z-10 cursor-zoom-out bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
                isProjectPreviewExpanded ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={closeExpandedProjectPreview}
              aria-label="Close expanded preview backdrop"
            />
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6 sm:p-8 md:p-10">
              <div
                className={`pointer-events-auto relative isolate w-full max-w-[390px] transform-gpu bg-white p-2 pb-4 text-left shadow-2xl shadow-black/40 transition duration-500 ease-out [backface-visibility:hidden] [will-change:transform] ${
                  isProjectPreviewExpanded ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.92] opacity-0'
                }`}
                data-testid="project-preview-modal"
              >
                <button
                  type="button"
                className="holo-icon-button absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition"
                  onClick={closeExpandedProjectPreview}
                  aria-label="Close expanded project image"
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
                <ProjectPreviewArtwork preview={panelExpandedProjectPreview} imageLoading="eager" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    )
  }

  const renderProjectText = (project: Project) => (
    <div
      className={`absolute bottom-0 left-0 right-0 top-[320px] flex flex-col justify-start bg-white p-6 transition-opacity duration-150 ease-out md:left-[57.5%] md:top-0 md:justify-between md:p-8 ${
        isProjectTextVisible ? 'opacity-100' : 'opacity-0'
      }`}
      data-testid="project-copy"
      aria-live="polite"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-700">{project.meta}</p>
        <h3 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950" data-testid="project-title">
          {project.title}
        </h3>
        <p className="mt-3 text-sm font-bold text-neutral-800">{project.award}</p>
        <p className="mt-6 text-lg leading-8 text-neutral-800">{project.copy}</p>
      </div>

      <div className="mt-6 md:mt-10">
        <a href={project.githubUrl} className="holo-action relative inline-flex rounded-md px-4 py-3 font-bold text-neutral-950 transition">
          Github
        </a>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4">
          <a href="#hero" className="text-lg font-bold tracking-tight text-neutral-950">
            Chloe Houvardas
          </a>
          <div className="hidden items-center gap-5 text-sm text-neutral-800 md:flex">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition hover:text-neutral-950">
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="hero" className="scroll-mt-20 overflow-x-hidden px-5 pt-32 pb-32 md:pt-40 md:pb-40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-700">Software engineer and builder</p>
            <h1 className="mt-5 max-w-3xl text-6xl font-bold tracking-tight text-neutral-950 md:text-8xl">
              Chloe Houvardas
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-neutral-800">
              Nice to meet you, welcome to my website! Feel free to scroll around and see what I've been up to lately :-)
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#featured-projects" className="holo-action relative rounded-md px-5 py-3 font-bold text-neutral-950 transition">
                View projects
              </a>
              <a href="#contact" className="holo-action relative rounded-md px-5 py-3 font-bold text-neutral-950 transition">
                Contact
              </a>
            </div>
          </div>
          <div
            className="relative mx-auto h-[470px] w-full max-w-[700px] touch-pan-y sm:h-[520px] md:mx-0 md:ml-auto md:h-[560px]"
            data-testid="bird-card-carousel"
            data-active-card-index={activeCardIndex}
            onPointerDown={(event) => startCarouselSwipe(holoCardsSwipe, event)}
            onPointerUp={(event) => finishCarouselSwipe(holoCardsSwipe, event, showPreviousCard, showNextCard)}
            onPointerCancel={() => cancelCarouselSwipe(holoCardsSwipe)}
            onPointerLeave={() => cancelCarouselSwipe(holoCardsSwipe)}
            onClickCapture={(event) => stopClickAfterSwipe(holoCardsSwipe, event)}
          >
            <div className="absolute inset-x-0 top-0 h-[430px] sm:h-[480px] md:h-[500px]">
              {visibleHoloCards.map((card) => {
                const placement =
                  card.position === -1
                    ? '-translate-x-[82%] rotate-[-5deg] scale-[0.72]'
                    : card.position === 1
                      ? 'translate-x-[-18%] rotate-[5deg] scale-[0.72]'
                      : '-translate-x-1/2 rotate-0 scale-100 opacity-100'
                const isActive = card.position === 0

                return (
                  <button
                    key={card.index}
                    type="button"
                    onClick={() => setActiveCardIndex(card.index)}
                    className={`absolute left-1/2 top-0 rounded-[22px] text-left transition duration-300 ease-out ${isActive ? 'z-30' : 'z-10 saturate-75 brightness-95'} ${placement}`}
                    aria-label={`Show ${card.title}`}
                  >
                    <div className="holo-static-border rounded-[22px] bg-white p-4">
                      <HoloPhotoCard image={card.image} title={card.title} variant={card.variant} rotateImage={card.rotateImage} loading={isActive ? 'eager' : 'lazy'} />
                      <div className="px-2 pb-1 pt-5 text-center">
                        <p className="text-2xl font-bold tracking-tight text-neutral-950">{card.title}</p>
                        <p className="mt-1 text-lg text-neutral-700">{card.subtitle}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div
              className="absolute inset-x-0 top-0 z-50 h-[430px] touch-pan-y md:hidden"
              aria-hidden="true"
              onPointerDown={(event) => startCarouselSwipe(holoCardsSwipe, event)}
              onPointerUp={(event) =>
                finishCarouselSwipe(
                  holoCardsSwipe,
                  event,
                  showPreviousCard,
                  showNextCard,
                  birdCardSwipeThresholdPx,
                  birdCardSwipeIntentRatio,
                )
              }
              onPointerCancel={() => cancelCarouselSwipe(holoCardsSwipe)}
              onPointerLeave={() => cancelCarouselSwipe(holoCardsSwipe)}
            />

            <button
              type="button"
              onClick={showPreviousCard}
              className="holo-icon-button absolute left-2 top-[170px] z-40 hidden h-11 w-11 items-center justify-center rounded-full transition sm:left-4 sm:top-[195px] sm:h-12 sm:w-12 md:flex md:top-[210px]"
              aria-label="Previous card"
            >
              <ChevronLeft size={30} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={showNextCard}
              className="holo-icon-button absolute right-2 top-[170px] z-40 hidden h-11 w-11 items-center justify-center rounded-full transition sm:right-4 sm:top-[195px] sm:h-12 sm:w-12 md:flex md:top-[210px]"
              aria-label="Next card"
            >
              <ChevronRight size={30} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="About" />
          <article
            className="holo-static-border mt-10 touch-pan-y rounded-lg bg-white p-6 md:p-8"
            aria-label="About carousel"
            data-about-index={activeAboutIndex}
            onPointerDown={(event) => startCarouselSwipe(aboutSwipe, event)}
            onPointerUp={(event) => finishCarouselSwipe(aboutSwipe, event, showPreviousAboutSlide, showNextAboutSlide)}
            onPointerCancel={() => cancelCarouselSwipe(aboutSwipe)}
            onPointerLeave={() => cancelCarouselSwipe(aboutSwipe)}
            onClickCapture={(event) => stopClickAfterSwipe(aboutSwipe, event)}
          >
            <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr]">
              <div className="flex justify-center md:justify-start">
                <div className="about-photo-card holo-static-border w-full max-w-[19rem] rounded-[22px] bg-white p-3 sm:max-w-[23.5rem] sm:p-4 md:max-w-none">
                  <HoloPhotoCard
                    image={activeAboutSlide.image}
                    title={activeAboutSlide.imageTitle}
                    variant={activeAboutSlide.variant}
                    crop={activeAboutSlide.crop}
                    loading="lazy"
                  />
                  <div className="px-2 pb-1 pt-5 text-center">
                    <p className="text-2xl font-bold tracking-tight text-neutral-950">{activeAboutSlide.cardTitle}</p>
                    <p className="mt-1 text-lg text-neutral-700">{activeAboutSlide.cardSubtitle}</p>
                  </div>
                </div>
              </div>
              <div className="text-xl leading-9 text-neutral-900" aria-live="polite">
                {activeAboutSlide.paragraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index === 0 ? undefined : 'mt-6'}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 border-t border-neutral-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                {aboutSlides.map((slide, index) => (
                  <button
                    key={slide.cardTitle}
                    type="button"
                    onClick={() => setActiveAboutIndex(index)}
                    className={`h-2.5 rounded-full transition ${activeAboutIndex === index ? 'w-8 bg-neutral-950' : 'w-2.5 bg-neutral-300 hover:bg-neutral-500'}`}
                    aria-label={`Show ${slide.cardTitle}`}
                    aria-current={activeAboutIndex === index ? 'true' : undefined}
                  />
                ))}
              </div>

              <div className="hidden items-center justify-center gap-3 sm:justify-end md:flex">
                <p className="mr-1 text-sm text-neutral-700">
                  {activeAboutIndex + 1} / {aboutSlides.length}
                </p>
                <button
                  type="button"
                  onClick={showPreviousAboutSlide}
                  className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition"
                  aria-label="Previous about slide"
                >
                  <ChevronLeft size={24} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={showNextAboutSlide}
                  className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition"
                  aria-label="Next about slide"
                >
                  <ChevronRight size={24} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="featured-projects" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading title="Featured Projects" />
            <div className="hidden gap-3 md:flex">
              <button
                type="button"
                onClick={showPreviousProject}
                disabled={isProjectCarouselBusy}
                className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-default disabled:opacity-50"
                aria-label="Previous project"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={showNextProject}
                disabled={isProjectCarouselBusy}
                className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition disabled:cursor-default disabled:opacity-50"
                aria-label="Next project"
              >
                <ChevronRight size={24} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <article
            className="holo-static-border mt-10 touch-pan-y overflow-hidden rounded-lg bg-white"
            data-testid="featured-projects-carousel"
            onPointerDown={(event) => startCarouselSwipe(projectSwipe, event)}
            onPointerUp={(event) => finishCarouselSwipe(projectSwipe, event, showPreviousProject, showNextProject)}
            onPointerCancel={() => cancelCarouselSwipe(projectSwipe)}
            onPointerLeave={() => cancelCarouselSwipe(projectSwipe)}
            onClickCapture={(event) => stopClickAfterSwipe(projectSwipe, event)}
          >
            <div
              className="relative min-h-[980px] bg-white sm:min-h-[900px] md:min-h-[540px]"
              data-testid="project-card"
              data-project-index={activeProjectIndex}
              data-carousel-transition={projectTransition?.direction ?? 'idle'}
              data-image-decode-pending={isProjectImageDecodePending ? 'true' : 'false'}
            >
              <div
                className="absolute left-0 right-0 top-0 h-[320px] overflow-hidden bg-neutral-950 md:bottom-0 md:right-auto md:h-auto md:w-[57.5%]"
                data-testid="project-gallery-region"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgb(255_255_255_/_0.16),transparent_26%),radial-gradient(circle_at_75%_22%,rgb(168_85_247_/_0.16),transparent_30%),radial-gradient(circle_at_52%_78%,rgb(45_212_191_/_0.12),transparent_34%),linear-gradient(135deg,rgb(12_10_18),rgb(18_22_30)_50%,rgb(10_10_14))]" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255_/_0.10),transparent_32%,rgb(255_255_255_/_0.08)_48%,transparent_68%),radial-gradient(circle_at_50%_45%,transparent,rgb(0_0_0_/_0.44)_74%)]" />

                {projects.map((project, projectIndex) => {
                  const galleryLayerState = getProjectGalleryLayerState(projectIndex)

                  return renderProjectGallery(
                    project,
                    projectIndex,
                    galleryLayerState.className,
                    galleryLayerState.isInteractive,
                    galleryLayerState.galleryRole,
                    galleryLayerState.shouldExposeTestIds,
                  )
                })}
              </div>

              {renderProjectText(activeProject)}
            </div>
          </article>

          <div className="mt-4 text-sm text-neutral-700" data-testid="project-counter">
            {activeProjectIndex + 1} / {projects.length}
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div
            className="holo-static-border touch-pan-y rounded-lg bg-white p-6 md:p-8"
            data-testid="experience-carousel"
            data-experience-index={activeExperienceCategoryIndex}
            onPointerDown={(event) => startCarouselSwipe(experienceSwipe, event)}
            onPointerUp={(event) => finishCarouselSwipe(experienceSwipe, event, showPreviousExperienceCategory, showNextExperienceCategory)}
            onPointerCancel={() => cancelCarouselSwipe(experienceSwipe)}
            onPointerLeave={() => cancelCarouselSwipe(experienceSwipe)}
            onClickCapture={(event) => stopClickAfterSwipe(experienceSwipe, event)}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionHeading title={activeExperienceCategory.label} />
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  onClick={showPreviousExperienceCategory}
                  className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                  aria-label="Previous experience category"
                >
                  <ChevronLeft size={24} strokeWidth={2.4} />
                </button>
                <p className="min-w-12 text-center text-sm text-neutral-700">
                  {activeExperienceCategoryIndex + 1} / {experienceCategories.length}
                </p>
                <button
                  type="button"
                  onClick={showNextExperienceCategory}
                  className="holo-icon-button relative flex h-11 w-11 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                  aria-label="Next experience category"
                >
                  <ChevronRight size={24} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3" role="tablist" aria-label="Experience categories">
              {experienceCategories.map((category, index) => (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => setActiveExperienceCategoryIndex(index)}
                  className="holo-action relative rounded-md px-4 py-2 font-bold text-neutral-950 transition focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                  role="tab"
                  aria-selected={activeExperienceCategoryIndex === index}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {activeExperienceCategory.label === 'Awards' ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2" aria-live="polite" data-testid="experience-awards-grid">
                {activeExperienceCategory.items.map((item) => (
                  <article key={`${activeExperienceCategory.label}-${item.title}`} className="holo-static-border rounded-lg bg-white p-5">
                    <p className="text-sm text-neutral-700">{item.meta}</p>
                    <h3 className="mt-2 text-2xl font-bold text-neutral-950">{item.title}</h3>
                    {item.copy ? <p className="mt-4 leading-7 text-neutral-800">{item.copy}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="relative mt-10" aria-live="polite" data-testid="experience-timeline">
                <div className="absolute bottom-5 left-[1.35rem] top-5 w-px bg-neutral-900/20 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
                <div className="grid gap-6">
                  {activeExperienceCategory.items.map((item, index) => {
                    const isLeftAligned = index % 2 === 0

                    return (
                      <div key={`${activeExperienceCategory.label}-${item.title}`} className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:items-center">
                        <div
                          className={`pl-16 md:pl-0 ${
                            isLeftAligned ? 'md:col-start-1 md:row-start-1 md:text-right' : 'md:col-start-3 md:row-start-1'
                          }`}
                        >
                          <article className="holo-static-border rounded-lg bg-white p-5">
                            <p className="text-sm text-neutral-700">{item.meta}</p>
                            <h3 className="mt-2 text-2xl font-bold text-neutral-950">{item.title}</h3>
                            {item.roles ? (
                              <div className="mt-4 grid gap-3 text-left">
                                {item.roles.map((role) => (
                                  <div key={`${role.title}-${role.dates}`} className="rounded-md border border-neutral-900/10 bg-white/90 px-4 py-3 shadow-sm">
                                    <p className="text-lg font-bold leading-tight text-neutral-950">{role.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-neutral-700">{role.dates}</p>
                                  </div>
                                ))}
                              </div>
                            ) : item.copy ? (
                              <p className="mt-4 leading-7 text-neutral-800">{item.copy}</p>
                            ) : null}
                          </article>
                        </div>

                        <div className="holo-static-border absolute left-0 top-3 flex h-11 w-11 items-center justify-center rounded-full text-neutral-950 md:static md:col-start-2 md:row-start-1 md:mx-auto">
                          <ChevronDown size={22} strokeWidth={2.4} aria-hidden="true" />
                        </div>

                        <div className={`${isLeftAligned ? 'hidden md:col-start-3 md:row-start-1 md:block' : 'hidden md:col-start-1 md:row-start-1 md:block'}`} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Contact" />
          <p className="mt-3 text-sm font-bold lowercase tracking-[0.18em] text-neutral-700">click to flip!</p>
          <div className="mt-10 grid justify-center gap-5 sm:grid-cols-[repeat(3,minmax(0,14rem))] sm:items-center sm:gap-6">
            {contactMethods.map((method) => {
              const isFlipped = flippedContactMethodIds.includes(method.id)
              const isCopied = copiedContactMethodIds.includes(method.id)

              return (
                <div
                  key={method.id}
                  className="contact-flip-card group"
                  data-contact-method={method.id}
                  data-flipped={isFlipped ? 'true' : 'false'}
                >
                  <button
                    type="button"
                    className="contact-flip-card__toggle"
                    onClick={() => toggleContactMethod(method.id)}
                    aria-label={`Flip ${method.label} contact card`}
                    aria-pressed={isFlipped}
                  >
                    <span className="contact-flip-card__inner">
                      <span className="contact-flip-card__face contact-flip-card__front">
                        <span className="contact-flip-card__content">
                          <ContactMethodIcon id={method.id} className="contact-flip-card__icon contact-flip-card__icon--front" size={150} />
                        </span>
                      </span>
                      <span className="contact-flip-card__face contact-flip-card__back">
                        <span className="contact-flip-card__content contact-flip-card__content--back">
                          <span className="contact-flip-card__value">{method.displayValue}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="contact-flip-card__copy"
                    data-copied={isCopied ? 'true' : 'false'}
                    onClick={() => void copyContactMethod(method)}
                    aria-label={isCopied ? `${method.label} contact value copied` : `Copy ${method.label} contact value`}
                    tabIndex={isFlipped ? 0 : -1}
                  >
                    {isCopied ? (
                      <Check className="contact-flip-card__copy-icon" size={20} strokeWidth={2.6} aria-hidden="true" />
                    ) : (
                      <Copy className="contact-flip-card__copy-icon" size={20} strokeWidth={2.5} aria-hidden="true" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

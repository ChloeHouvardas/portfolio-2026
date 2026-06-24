import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import Galaxy from './components/Galaxy'
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

const projectGalleryTransitionMs = 420
const projectGalleryTransitionStartDelayMs = 40
const projectTextFadeMs = 140

const navItems = [
  ['Hero', 'hero'],
  ['About', 'about'],
  ['Featured Projects', 'featured-projects'],
  ['Experience', 'experience'],
  ['Highlights', 'highlights'],
  ['Writing / Research', 'writing-research'],
  ['Skills', 'skills'],
  ['Contact', 'contact'],
]

const projects: Project[] = [
  {
    title: 'Portfolio system',
    meta: 'React / TypeScript / Visual systems',
    copy: 'A personal site evolving into a compact archive of projects, experiments, and technical notes. This project can hold screenshots, process notes, and the decisions behind the visual system.',
    previews: [
      {
        label: 'Portfolio preview',
        title: 'Portfolio system',
        accent: 'from-neutral-950 via-neutral-700 to-neutral-300',
      },
      {
        label: 'About carousel',
        title: 'Personal profile cards',
        image: aboutPhoto,
        alt: 'Chloe by the water',
      },
      {
        label: 'Presentation image',
        title: 'Image-led sections',
        image: chinaPresentation,
        alt: 'Chloe presenting with a microphone',
      },
    ],
    githubUrl: 'https://github.com/',
  },
  {
    title: 'Holographic photo card',
    meta: 'CSS interaction / Image treatment',
    copy: 'A Pokemon V Alternate Art-inspired photo treatment using layered gradients, glare, pointer motion, and optimized image assets. The interaction is designed to feel tactile on desktop and mobile.',
    previews: [
      {
        label: 'Interactive card study',
        title: 'Blue Jay V',
        image: bird4323,
        alt: 'Blue jay perched in backyard light',
      },
      {
        label: 'Foil treatment',
        title: 'Garden Perch V',
        image: bird4330,
        alt: 'Bird perched near green leaves',
      },
      {
        label: 'Motion detail',
        title: 'Wing Glint V',
        image: bird4615,
        alt: 'Bird catching violet light',
      },
    ],
    githubUrl: 'https://github.com/',
  },
  {
    title: 'Interface prototypes',
    meta: 'Frontend / Product thinking',
    copy: 'Focused prototypes for turning rough workflows into clear, usable browser experiences. This space can include problem framing, before-and-after screenshots, and implementation details.',
    previews: [
      {
        label: 'Prototype archive',
        title: 'Interface prototypes',
        accent: 'from-emerald-500 via-cyan-500 to-violet-400',
      },
      {
        label: 'Process image',
        title: 'Build notes',
        image: chloeOranges,
        alt: 'Chloe standing in front of orange trees',
      },
      {
        label: 'Visual study',
        title: 'Detail archive',
        image: bird4538,
        alt: 'Bird perched in natural light',
      },
    ],
    githubUrl: 'https://github.com/',
  },
]

const projectPreviewImageSources = Array.from(
  new Set(
    projects.flatMap((project) => project.previews.map((preview) => preview.image).filter((image): image is string => Boolean(image))),
  ),
)

const experience = [
  {
    role: 'Software engineer',
    place: 'Current focus',
    copy: 'Building responsive frontend systems with attention to interaction quality, maintainability, and shipping pace.',
  },
  {
    role: 'Builder',
    place: 'Independent projects',
    copy: 'Exploring creative tooling, portfolio systems, and polished web interactions from idea through implementation.',
  },
]

const highlights = [
  'Frontend architecture with React, TypeScript, Vite, and modern CSS.',
  'Comfortable turning ambiguous requirements into concrete shipped interfaces.',
  'Strong interest in visual systems, interaction details, and practical product polish.',
]

const writing = [
  {
    title: 'Research note placeholder',
    copy: 'A space for technical writeups, design notes, and project retrospectives.',
  },
  {
    title: 'Build log placeholder',
    copy: 'Short entries about experiments, implementation decisions, and lessons learned while shipping.',
  },
]

const skills = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'CSS animation',
  'Responsive UI',
  'Interaction design',
  'Frontend systems',
]

const holoCards = [
  {
    title: 'Blue Jay V',
    subtitle: 'Alternate Art / Backyard Light',
    image: bird4323,
    variant: 'blue' as const,
    rotateImage: false,
  },
  {
    title: 'Garden Perch V',
    subtitle: 'Alternate Art / Backyard Light',
    image: bird4330,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Branch Watch V',
    subtitle: 'Alternate Art / Morning Green',
    image: bird4358,
    variant: 'violet' as const,
    rotateImage: false,
  },
  {
    title: 'Feather Flash V',
    subtitle: 'Alternate Art / Sunlit Detail',
    image: bird4479,
    variant: 'blue' as const,
    rotateImage: false,
  },
  {
    title: 'Backyard Scout V',
    subtitle: 'Alternate Art / Natural Foil',
    image: bird4538,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Fence Watch V',
    subtitle: 'Alternate Art / Garden Fence',
    image: bird4587,
    variant: 'green' as const,
    rotateImage: false,
  },
  {
    title: 'Wing Glint V',
    subtitle: 'Alternate Art / Violet Sheen',
    image: bird4615,
    variant: 'violet' as const,
    rotateImage: false,
  },
  {
    title: 'Fence Line V',
    subtitle: 'Alternate Art / Blue Foil',
    image: bird4692,
    variant: 'blue' as const,
    rotateImage: false,
  },
]

const aboutSlides = [
  {
    image: aboutPhoto,
    imageTitle: 'Chloe by the water',
    cardTitle: 'Chloe Houvardas',
    cardSubtitle: 'About / Builder profile',
    variant: 'green' as const,
    crop: 'portrait' as const,
    paragraphs: [
      'I like work that combines clear thinking, technical precision, and enough visual detail to make software feel considered.',
      'This site is becoming a home for selected projects, experiments, writing, and the process behind the work.',
    ],
  },
  {
    image: chinaPresentation,
    imageTitle: 'Chloe presenting with a microphone',
    cardTitle: 'Visual Systems',
    cardSubtitle: 'Interfaces / Interaction detail',
    variant: 'blue' as const,
    crop: 'default' as const,
    paragraphs: [
      'I care about interfaces that are quiet, direct, and still memorable when the details matter.',
      'That usually means structured layouts, restrained motion, and visual decisions that support the task instead of decorating around it.',
    ],
  },
  {
    image: chloeOranges,
    imageTitle: 'Chloe standing in front of orange trees',
    cardTitle: 'Build Notes',
    cardSubtitle: 'Experiments / Process',
    variant: 'violet' as const,
    crop: 'default' as const,
    paragraphs: [
      'I use this portfolio as a place to test ideas in public: components, interaction patterns, project writeups, and small technical studies.',
      'The goal is to show the finished work and the thinking that made it hold together.',
    ],
  },
]

const polaroidPlacements = [
  'left-[7%] top-[12%] rotate-[-8deg]',
  'right-[8%] top-[15%] rotate-[7deg]',
  'left-[31%] bottom-[8%] rotate-[2deg]',
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
  const aboutSwipeStartX = useRef<number | null>(null)
  const aboutSwipePointerId = useRef<number | null>(null)
  const projectPreviewOpenAnimationFrame = useRef<number | null>(null)
  const projectPreviewCloseTimeout = useRef<number | null>(null)
  const projectTransitionStartTimeout = useRef<number | null>(null)
  const projectTransitionTimeout = useRef<number | null>(null)
  const projectTextTimeout = useRef<number | null>(null)
  const decodedProjectPreviewImages = useRef<Set<string>>(new Set())
  const projectPreviewImageDecodePromises = useRef<Map<string, Promise<void>>>(new Map())
  const projectNavigationInProgress = useRef(false)
  const activeAboutSlide = aboutSlides[activeAboutIndex]
  const activeProject = projects[activeProjectIndex]
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
    }
  }, [])

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

  const startAboutSwipe = (event: PointerEvent<HTMLElement>) => {
    aboutSwipeStartX.current = event.clientX
    aboutSwipePointerId.current = event.pointerId
  }

  const finishAboutSwipe = (event: PointerEvent<HTMLElement>) => {
    if (aboutSwipePointerId.current !== event.pointerId || aboutSwipeStartX.current === null) {
      return
    }

    const swipeDistance = event.clientX - aboutSwipeStartX.current
    aboutSwipeStartX.current = null
    aboutSwipePointerId.current = null

    if (Math.abs(swipeDistance) < 48) {
      return
    }

    if (swipeDistance > 0) {
      showPreviousAboutSlide()
    } else {
      showNextAboutSlide()
    }
  }

  const cancelAboutSwipe = () => {
    aboutSwipeStartX.current = null
    aboutSwipePointerId.current = null
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
                className={`isolate absolute w-[42%] max-w-[220px] transform-gpu bg-white p-2 pb-4 text-left shadow-2xl shadow-black/30 transition duration-300 ease-out [backface-visibility:hidden] [will-change:transform] hover:z-20 hover:scale-[1.025] focus:z-20 focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-default ${placement}`}
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
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-950 shadow-lg ring-1 ring-neutral-900/10 transition hover:bg-white"
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
      className={`absolute bottom-0 left-0 right-0 top-[320px] flex flex-col justify-between bg-white p-6 transition-opacity duration-150 ease-out md:left-[57.5%] md:top-0 md:p-8 ${
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
        <p className="mt-6 text-lg leading-8 text-neutral-800">{project.copy}</p>
      </div>

      <div className="mt-10">
        <a href={project.githubUrl} className="inline-flex rounded-md border border-neutral-300 px-4 py-3 font-bold text-neutral-950 transition hover:border-neutral-950">
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
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-700">Hero</p>
            <h1 className="mt-5 max-w-3xl text-6xl font-bold tracking-tight text-neutral-950 md:text-8xl">
              Chloe Houvardas
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-neutral-800">
              A software engineer and builder turning complex, high-pressure problems into shipped software.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#featured-projects" className="rounded-md bg-neutral-950 px-5 py-3 font-bold text-white transition hover:bg-neutral-800">
                View projects
              </a>
              <a href="#contact" className="rounded-md border border-neutral-300 px-5 py-3 font-bold text-neutral-900 transition hover:border-neutral-950">
                Contact
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-[470px] w-full max-w-[700px] sm:h-[520px] md:mx-0 md:ml-auto md:h-[560px]">
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
                    key={card.title}
                    type="button"
                    onClick={() => setActiveCardIndex(card.index)}
                    className={`absolute left-1/2 top-0 rounded-[22px] text-left transition duration-300 ease-out ${isActive ? 'z-30' : 'z-10 saturate-75 brightness-95'} ${placement}`}
                    aria-label={`Show ${card.title}`}
                  >
                    <div className="rounded-[22px] border border-neutral-900/10 bg-white p-4">
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

            <button
              type="button"
              onClick={showPreviousCard}
              className="absolute left-2 top-[170px] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg ring-1 ring-neutral-900/10 transition hover:bg-white sm:left-4 sm:top-[195px] sm:h-12 sm:w-12 md:top-[210px]"
              aria-label="Previous card"
            >
              <ChevronLeft size={30} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={showNextCard}
              className="absolute right-2 top-[170px] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg ring-1 ring-neutral-900/10 transition hover:bg-white sm:right-4 sm:top-[195px] sm:h-12 sm:w-12 md:top-[210px]"
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
            className="mt-10 touch-pan-y rounded-lg border border-neutral-900/10 bg-white p-6 md:p-8"
            aria-label="About carousel"
            onPointerDown={startAboutSwipe}
            onPointerUp={finishAboutSwipe}
            onPointerCancel={cancelAboutSwipe}
            onPointerLeave={cancelAboutSwipe}
          >
            <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr]">
              <div className="flex justify-center md:justify-start">
                <div className="rounded-[22px] border border-neutral-900/10 bg-white p-4">
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

              <div className="flex items-center justify-center gap-3 sm:justify-end">
                <p className="mr-1 text-sm text-neutral-700">
                  {activeAboutIndex + 1} / {aboutSlides.length}
                </p>
                <button
                  type="button"
                  onClick={showPreviousAboutSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950"
                  aria-label="Previous about slide"
                >
                  <ChevronLeft size={24} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={showNextAboutSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950"
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={showPreviousProject}
                disabled={isProjectCarouselBusy}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950 disabled:cursor-default disabled:opacity-50"
                aria-label="Previous project"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={showNextProject}
                disabled={isProjectCarouselBusy}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950 disabled:cursor-default disabled:opacity-50"
                aria-label="Next project"
              >
                <ChevronRight size={24} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <article className="mt-10 overflow-hidden rounded-lg border border-neutral-900/10 bg-white" data-testid="featured-projects-carousel">
            <div
              className="relative min-h-[720px] bg-white sm:min-h-[660px] md:min-h-[430px]"
              data-testid="project-card"
              data-project-index={activeProjectIndex}
              data-carousel-transition={projectTransition?.direction ?? 'idle'}
              data-image-decode-pending={isProjectImageDecodePending ? 'true' : 'false'}
            >
              <div
                className="absolute left-0 right-0 top-0 h-[320px] overflow-hidden bg-neutral-950 md:bottom-0 md:right-auto md:h-auto md:w-[57.5%]"
                data-testid="project-gallery-region"
              >
                <div className="absolute inset-0 bg-black" />
                <Galaxy
                  className="absolute inset-0 h-full w-full opacity-80"
                  disableAnimation
                  mouseInteraction={false}
                  mouseRepulsion={false}
                  twinkleIntensity={0}
                  rotationSpeed={0}
                  starSpeed={0.36}
                  speed={0}
                  density={1.08}
                  hueShift={210}
                  glowIntensity={0.38}
                  saturation={0.55}
                  transparent={false}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent,rgb(0_0_0_/_0.34)_62%,rgb(0_0_0_/_0.72)),linear-gradient(135deg,rgb(15_23_42_/_0.18),rgb(0_0_0_/_0.38))]" />

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
          <SectionHeading title="Experience" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {experience.map((item) => (
              <article key={item.role} className="rounded-lg border border-neutral-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm text-neutral-700">{item.place}</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-950">{item.role}</h3>
                <p className="mt-4 leading-7 text-neutral-800">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="highlights" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading title="Highlights" />
          <div className="grid gap-4">
            {highlights.map((highlight) => (
              <p key={highlight} className="rounded-lg border border-neutral-900/10 bg-white p-5 text-lg leading-8 text-neutral-900 shadow-sm">
                {highlight}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="writing-research" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Writing / Research" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {writing.map((item) => (
              <article key={item.title} className="rounded-lg border border-neutral-900/10 bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-neutral-950">{item.title}</h3>
                <p className="mt-4 leading-7 text-neutral-800">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Skills" />
          <div className="mt-10 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-md border border-neutral-900/10 bg-white px-4 py-2 text-neutral-900 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Contact" />
          <p className="mt-6 max-w-2xl text-xl leading-9 text-neutral-800">
            Add your preferred email, LinkedIn, GitHub, and resume links here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:hello@example.com" className="rounded-md bg-neutral-950 px-5 py-3 font-bold text-white transition hover:bg-neutral-800">
              Email
            </a>
            <a href="#hero" className="rounded-md border border-neutral-300 px-5 py-3 font-bold text-neutral-900 transition hover:border-neutral-950">
              Back to top
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

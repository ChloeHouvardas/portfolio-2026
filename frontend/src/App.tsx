import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

const projects = [
  {
    title: 'Portfolio system',
    meta: 'React / TypeScript / Visual systems',
    copy: 'A personal site evolving into a compact archive of projects, experiments, and technical notes. This project can hold screenshots, process notes, and the decisions behind the visual system.',
    imageLabel: 'Portfolio preview',
    accent: 'from-neutral-950 via-neutral-700 to-neutral-300',
    githubUrl: 'https://github.com/',
  },
  {
    title: 'Holographic photo card',
    meta: 'CSS interaction / Image treatment',
    copy: 'A Pokemon V Alternate Art-inspired photo treatment using layered gradients, glare, pointer motion, and optimized image assets. The interaction is designed to feel tactile on desktop and mobile.',
    imageLabel: 'Interactive card study',
    accent: 'from-sky-500 via-fuchsia-500 to-amber-200',
    githubUrl: 'https://github.com/',
  },
  {
    title: 'Interface prototypes',
    meta: 'Frontend / Product thinking',
    copy: 'Focused prototypes for turning rough workflows into clear, usable browser experiences. This space can include problem framing, before-and-after screenshots, and implementation details.',
    imageLabel: 'Prototype archive',
    accent: 'from-emerald-500 via-cyan-500 to-violet-400',
    githubUrl: 'https://github.com/',
  },
]

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

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">{title}</h2>
    </div>
  )
}

function App() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const activeProject = projects[activeProjectIndex]
  const visibleHoloCards = [-1, 0, 1].map((position) => {
    const index = (activeCardIndex + position + holoCards.length) % holoCards.length

    return {
      ...holoCards[index],
      index,
      position,
    }
  })

  const showPreviousCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex - 1 + holoCards.length) % holoCards.length)
  }

  const showNextCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex + 1) % holoCards.length)
  }

  const showPreviousProject = () => {
    setActiveProjectIndex((currentIndex) => (currentIndex - 1 + projects.length) % projects.length)
  }

  const showNextProject = () => {
    setActiveProjectIndex((currentIndex) => (currentIndex + 1) % projects.length)
  }

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
          <div className="mt-10 grid items-center gap-10 rounded-lg border border-neutral-900/10 bg-white p-6 md:grid-cols-[0.85fr_1.15fr] md:p-8">
            <div className="flex justify-center md:justify-start">
              <div className="rounded-[22px] border border-neutral-900/10 bg-white p-4">
                <HoloPhotoCard
                  image={aboutPhoto}
                  title="Chloe by the water"
                  variant="green"
                  crop="portrait"
                  loading="lazy"
                />
                <div className="px-2 pb-1 pt-5 text-center">
                  <p className="text-2xl font-bold tracking-tight text-neutral-950">Chloe Houvardas</p>
                  <p className="mt-1 text-lg text-neutral-700">About / Builder profile</p>
                </div>
              </div>
            </div>
            <div className="text-xl leading-9 text-neutral-900">
              <p>
                I like work that combines clear thinking, technical precision, and enough visual detail to make software feel considered.
              </p>
              <p className="mt-6">
                This site is becoming a home for selected projects, experiments, writing, and the process behind the work.
              </p>
            </div>
          </div>
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950"
                aria-label="Previous project"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={showNextProject}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition hover:border-neutral-950"
                aria-label="Next project"
              >
                <ChevronRight size={24} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <article className="mt-10 overflow-hidden rounded-lg border border-neutral-900/10 bg-white">
            <div className="grid md:grid-cols-[1.15fr_0.85fr]">
              <div className={`flex min-h-[280px] items-end bg-gradient-to-br ${activeProject.accent} p-6 md:min-h-[430px]`}>
                <div className="w-full rounded-lg border border-white/30 bg-white/20 p-5 text-white backdrop-blur-md">
                  <p className="text-sm uppercase tracking-[0.28em] text-white/70">{activeProject.imageLabel}</p>
                  <p className="mt-20 text-3xl font-bold md:text-5xl">{activeProject.title}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-neutral-700">{activeProject.meta}</p>
                  <h3 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950">{activeProject.title}</h3>
                  <p className="mt-6 text-lg leading-8 text-neutral-800">{activeProject.copy}</p>
                </div>

                <div className="mt-10">
                  <a
                    href={activeProject.githubUrl}
                    className="inline-flex rounded-md border border-neutral-300 px-4 py-3 font-bold text-neutral-950 transition hover:border-neutral-950"
                  >
                    Github
                  </a>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-4 text-sm text-neutral-700">
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

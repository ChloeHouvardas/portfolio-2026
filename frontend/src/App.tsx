import { useState } from 'react'

import HoloPhotoCard from './components/HoloPhotoCard'
import birdImage from './assets/birds/image-2.png'

const navItems = [
  ['Hero', 'hero'],
  ['Featured Projects', 'featured-projects'],
  ['Experience', 'experience'],
  ['Highlights', 'highlights'],
  ['Writing / Research', 'writing-research'],
  ['About', 'about'],
  ['Skills', 'skills'],
  ['Contact', 'contact'],
]

const projects = [
  {
    title: 'Portfolio system',
    meta: 'React / TypeScript / Visual systems',
    copy: 'A personal site evolving into a compact archive of projects, experiments, and technical notes.',
  },
  {
    title: 'Holographic photo card',
    meta: 'CSS interaction / Image treatment',
    copy: 'A Pokemon V Alternate Art-inspired photo treatment using layered gradients, glare, and pointer motion.',
  },
  {
    title: 'Interface prototypes',
    meta: 'Frontend / Product thinking',
    copy: 'Focused prototypes for turning rough workflows into clear, usable browser experiences.',
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
    subtitle: 'Alternate Art / Garden Fence',
    image: birdImage,
    variant: 'blue' as const,
  },
  {
    title: 'Backyard Flash V',
    subtitle: 'Alternate Art / Leaf Glare',
    image: birdImage,
    variant: 'green' as const,
  },
  {
    title: 'Fence Perch V',
    subtitle: 'Alternate Art / Violet Foil',
    image: birdImage,
    variant: 'violet' as const,
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
  const activeHoloCard = holoCards[activeCardIndex]

  const showPreviousCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex - 1 + holoCards.length) % holoCards.length)
  }

  const showNextCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex + 1) % holoCards.length)
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-900/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4">
          <a href="#hero" className="text-lg font-bold tracking-tight text-neutral-950">
            Chloe Houvardas
          </a>
          <div className="hidden items-center gap-5 text-sm text-neutral-600 md:flex">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition hover:text-neutral-950">
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="hero" className="scroll-mt-20 px-5 pt-32 pb-20 md:pt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">Hero</p>
            <h1 className="mt-5 max-w-3xl text-6xl font-bold tracking-tight text-neutral-950 md:text-8xl">
              Chloe Houvardas
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-neutral-600">
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
          <div className="flex flex-col items-center md:items-end">
            <HoloPhotoCard
              key={activeHoloCard.title}
              image={activeHoloCard.image}
              title={activeHoloCard.title}
              variant={activeHoloCard.variant}
            />
            <div className="mt-5 w-full max-w-[340px] rounded-lg border border-neutral-900/10 bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-neutral-950">{activeHoloCard.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{activeHoloCard.subtitle}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPreviousCard}
                  className="rounded-md border border-neutral-300 px-4 py-2 font-bold text-neutral-900 transition hover:border-neutral-950"
                >
                  Previous
                </button>
                <p className="text-sm text-neutral-500">
                  {activeCardIndex + 1} / {holoCards.length}
                </p>
                <button
                  type="button"
                  onClick={showNextCard}
                  className="rounded-md bg-neutral-950 px-4 py-2 font-bold text-white transition hover:bg-neutral-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-projects" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Featured Projects" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.title} className="rounded-lg border border-neutral-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">{project.meta}</p>
                <h3 className="mt-4 text-2xl font-bold text-neutral-950">{project.title}</h3>
                <p className="mt-4 leading-7 text-neutral-600">{project.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Experience" />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {experience.map((item) => (
              <article key={item.role} className="rounded-lg border border-neutral-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm text-neutral-500">{item.place}</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-950">{item.role}</h3>
                <p className="mt-4 leading-7 text-neutral-600">{item.copy}</p>
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
              <p key={highlight} className="rounded-lg border border-neutral-900/10 bg-white p-5 text-lg leading-8 text-neutral-700 shadow-sm">
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
                <p className="mt-4 leading-7 text-neutral-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading title="About" />
          <div className="text-xl leading-9 text-neutral-700">
            <p>
              I like work that combines clear thinking, technical precision, and enough visual detail to make software feel considered.
            </p>
            <p className="mt-6">
              This site is becoming a home for selected projects, experiments, writing, and the process behind the work.
            </p>
          </div>
        </div>
      </section>

      <section id="skills" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Skills" />
          <div className="mt-10 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-md border border-neutral-900/10 bg-white px-4 py-2 text-neutral-700 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-neutral-900/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Contact" />
          <p className="mt-6 max-w-2xl text-xl leading-9 text-neutral-600">
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

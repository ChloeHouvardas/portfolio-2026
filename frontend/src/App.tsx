import Galaxy from './components/Galaxy'

/*
const navItems = ['About', 'Experience', 'Projects', 'Skills', 'Contact']

const projects = [
  {
    title: 'Interactive web experiences',
    meta: 'React / Motion / Interface systems',
    copy: 'Immersive browser-based work with polished interaction details and responsive layouts.',
  },
  {
    title: 'Frontend systems',
    meta: 'TypeScript / Components / Product UI',
    copy: 'Reusable UI foundations built for clarity, speed, and consistent product experiences.',
  },
  {
    title: 'Creative tooling',
    meta: 'Prototypes / Workflows / Experiments',
    copy: 'Small tools and experiments that turn loose ideas into usable software quickly.',
  },
]

const skills = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Vite',
  'UI design',
  'Web animation',
]
*/

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(8,8,12)] font-['Space_Grotesk',sans-serif] text-zinc-300">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-200/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#home" className="font-['Atures','Space_Grotesk',sans-serif] text-xl tracking-wide text-zinc-100">
            🪿
          </a>
          {/* <div className="flex gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500 md:gap-7">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-cyan-100">
                {item}
              </a>
            ))}
          </div> */}
        </div>
      </nav>

      <section id="home" className="relative z-10 min-h-screen overflow-hidden bg-[rgb(8,8,12)]">
        <div className="absolute inset-0">
          <Galaxy density={1.5} glowIntensity={0.5} hueShift={500} saturation={0.8} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[38vh] bg-gradient-to-b from-transparent via-[rgba(8,8,12,0.68)] to-[rgb(8,8,12)]" />
        <div className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-cyan-100/45">Hey, I'm</p>
          <h1 className="font-['Atures','Space_Grotesk',sans-serif] text-6xl font-bold tracking-wide text-zinc-300 md:text-8xl">
            Chloe Houvardas
          </h1>
          <p className="font-['Space_Grotesk',sans-serif] mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            A software engineer + builder at heart who thrives on turning complex, high-pressure problems into shipped software.
          </p>
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-zinc-500">
            Website in progress
          </p>
        </div>
      </section>

      {/*
      <div className="relative -mt-40 bg-[radial-gradient(circle_at_50%_42rem,rgba(124,58,237,0.16),transparent_34rem),linear-gradient(to_bottom,rgb(8,8,12),rgb(8,8,12)_28rem,rgba(16,12,28,0.92)_52rem,rgb(8,8,12))] pt-48">
      <section id="about" className="relative z-10 scroll-mt-20 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 border-t border-cyan-100/10 pt-12 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/45">01 / About</p>
            <h2 className="mt-4 text-4xl font-bold text-zinc-100">Builder profile</h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-7 shadow-[0_0_80px_rgba(59,130,246,0.08)] backdrop-blur-md">
            <p className="text-xl leading-9 text-zinc-300">
              I create responsive, visually thoughtful digital products with a focus on interaction, clarity, and
              shipping under real constraints.
            </p>
            <p className="mt-6 leading-8 text-zinc-500">
              This site is a growing archive of selected work, experiments, interface systems, and the process behind
              them.
            </p>
          </div>
        </div>
      </section>

      <section id="experience" className="relative z-10 scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl border-t border-cyan-100/10 pt-12">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/45">02 / Experience</p>
          <h2 className="mt-4 text-4xl font-bold text-zinc-100">Operating modes</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <article className="rounded-lg border border-violet-200/10 bg-zinc-950/35 p-6 backdrop-blur-md transition hover:border-cyan-100/25 hover:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/45">Current focus</p>
              <h3 className="mt-3 text-2xl font-bold text-zinc-100">Frontend development</h3>
              <p className="mt-4 leading-7 text-zinc-400">
                Building accessible, responsive interfaces with React, TypeScript, and modern CSS.
              </p>
            </article>
            <article className="rounded-lg border border-violet-200/10 bg-zinc-950/35 p-6 backdrop-blur-md transition hover:border-cyan-100/25 hover:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/45">Creative practice</p>
              <h3 className="mt-3 text-2xl font-bold text-zinc-100">Interaction design</h3>
              <p className="mt-4 leading-7 text-zinc-400">
                Exploring motion, visual systems, and immersive UI details that make products feel memorable.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="projects" className="relative z-10 scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl border-t border-cyan-100/10 pt-12">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/45">03 / Projects</p>
          <h2 className="mt-4 text-4xl font-bold text-zinc-100">Selected transmissions</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.title} className="group rounded-lg border border-white/10 bg-black/25 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-200/25 hover:shadow-[0_0_60px_rgba(124,58,237,0.12)]">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">{project.meta}</p>
                <h3 className="mt-4 text-xl font-bold text-zinc-100">{project.title}</h3>
                <p className="mt-4 leading-7 text-zinc-400">
                  {project.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="relative z-10 scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl border-t border-cyan-100/10 pt-12">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/45">04 / Skills</p>
          <h2 className="mt-4 text-4xl font-bold text-zinc-100">Tool matrix</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full border border-cyan-100/10 bg-zinc-950/35 px-4 py-2 text-zinc-300 backdrop-blur-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 scroll-mt-20 px-5 py-28">
        <div className="mx-auto max-w-6xl border-t border-cyan-100/10 pt-12">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/45">05 / Contact</p>
          <h2 className="mt-4 text-4xl font-bold text-zinc-100">Open channel</h2>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-zinc-400">
            Interested in collaborating or seeing more work? Add your email, LinkedIn, GitHub, and resume links here.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="mailto:hello@example.com" className="rounded-full border border-cyan-100/20 bg-cyan-100/10 px-5 py-3 font-bold text-cyan-50 backdrop-blur-md transition hover:bg-cyan-100/20">
              Email
            </a>
            <a href="#home" className="rounded-full border border-white/15 px-5 py-3 font-bold text-zinc-200 transition hover:border-white/30">
              Back to top
            </a>
          </div>
        </div>
      </section>
      </div>
      */}
    </main>
  )
}

export default App

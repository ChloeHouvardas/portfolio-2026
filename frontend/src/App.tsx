import Galaxy from './components/Galaxy'

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(18,18,20)]">
      <div className="absolute inset-0">
        <Galaxy density={1.5} glowIntensity={0.5} hueShift={500} saturation={0.8} />
      </div>
      <section id="center" className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center px-6 text-center font-['Atures','Space_Grotesk',sans-serif] text-6xl font-bold tracking-wide text-zinc-300 md:text-8xl">
        Hey, I'm Chloe Houvardas
      </section>
    </main>
  )
}

export default App

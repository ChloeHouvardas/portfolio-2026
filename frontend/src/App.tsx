import Galaxy from './components/Galaxy'

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(18,18,20)]">
      <div className="absolute inset-0">
        <Galaxy density={1.5} glowIntensity={0.5} hueShift={240} saturation={0.8} />
      </div>
      <section id="center" className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center font-['Aldrich',sans-serif] text-8xl text-zinc-400 md:text-9xl">
        Hi, my name is Chloe
      </section>
    </main>
  )
}

export default App

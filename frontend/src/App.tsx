import Waves from './components/Waves'

function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(18,18,20)]">
      <Waves className="pointer-events-none" lineColor="black" />
      <section id="center" className="relative z-10 flex min-h-screen items-center justify-center text-6xl text-white">
        Hi, my name is Chloe
      </section>
    </main>
  )
}

export default App

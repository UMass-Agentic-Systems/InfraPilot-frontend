import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import FeaturesSection from '../components/FeaturesSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <HeroSection />
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <ArchitectureDiagram />
      </section>
      <FeaturesSection />
    </div>
  )
}

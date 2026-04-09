import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

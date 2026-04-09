import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center px-4 py-24">
      <div className="inline-flex items-center gap-2 bg-brand-600/10 text-brand-300 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
        <Rocket className="w-4 h-4" />
        AI-Powered Kubernetes Deployments
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl">
        Deploy Three-Tier Apps with{' '}
        <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
          AI Agents
        </span>
      </h1>
      <p className="mt-6 text-lg text-gray-400 max-w-2xl">
        InfraPilot uses two specialised AI agents — an Infra Agent for Kubernetes provisioning
        and an SRE Agent for monitoring and incident response — to deploy and manage your
        applications through natural language.
      </p>
      <Link
        to="/signin"
        className="mt-10 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors text-lg"
      >
        Get Started
      </Link>
    </section>
  )
}

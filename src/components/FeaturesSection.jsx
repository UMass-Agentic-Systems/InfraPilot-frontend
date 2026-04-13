import { Wrench, Shield, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: Wrench,
    title: 'Infra Provisioning',
    description:
      'Generates Kubernetes manifests, configures networking, storage, and deployments from natural language descriptions.',
  },
  {
    icon: Shield,
    title: 'SRE Monitoring',
    description:
      'Continuously monitors cluster health and analyzes warning events, generates remediation plans.',
  },
  {
    icon: MessageSquare,
    title: 'Chat Interface',
    description:
      'A unified chat interface for interacting with both the Infra and SRE agents to manage your infrastructure.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

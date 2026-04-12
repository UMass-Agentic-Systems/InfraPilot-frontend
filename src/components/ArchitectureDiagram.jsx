import { Monitor, Server, Database, Wrench, Shield, ArrowRight } from 'lucide-react'

const TIERS = [
  {
    key: 'frontend',
    icon: Monitor,
    iconColour: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    label: 'Frontend',
    tech: 'React · Nginx',
    detail: 'LoadBalancer · 443',
  },
  {
    key: 'backend',
    icon: Server,
    iconColour: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    label: 'Backend',
    tech: 'Node.js · Express',
    detail: 'ClusterIP · 3000',
  },
  {
    key: 'database',
    icon: Database,
    iconColour: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    label: 'Database',
    tech: 'PostgreSQL',
    detail: 'StatefulSet · 5432',
  },
]

const AGENTS = [
  {
    icon: Wrench,
    iconColour: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    label: 'Infra Agent',
    detail: 'Provisioning',
  },
  {
    icon: Shield,
    iconColour: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    label: 'SRE Agent',
    detail: 'Monitoring & Remediation',
  },
]

function TierNode({ icon: Icon, iconColour, bg, border, label, tech, detail }) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-4 flex flex-col items-center gap-1.5 w-32 sm:w-36 text-center`}>
      <Icon className={`w-6 h-6 ${iconColour}`} />
      <span className="text-sm font-semibold text-gray-100">{label}</span>
      <span className="text-xs text-gray-400">{tech}</span>
      <span className="text-xs text-gray-600">{detail}</span>
    </div>
  )
}

function AgentNode({ icon: Icon, iconColour, bg, border, label, detail }) {
  return (
    <div className={`${bg} border ${border} rounded-lg px-4 py-2.5 flex items-center gap-2.5`}>
      <Icon className={`w-4 h-4 ${iconColour} flex-shrink-0`} />
      <div>
        <div className="text-xs font-semibold text-gray-200">{label}</div>
        <div className="text-xs text-gray-500">{detail}</div>
      </div>
    </div>
  )
}

export default function ArchitectureDiagram() {
  return (
    <div className="relative border border-dashed border-gray-700 rounded-2xl p-6 w-full">
      <span className="absolute -top-2.5 left-5 bg-gray-950 px-2 text-xs text-gray-500 font-medium tracking-wide">
        Kubernetes Cluster
      </span>

      {/* Three-tier flow */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {TIERS.map((tier, i) => (
          <div key={tier.key} className="flex items-center gap-2">
            <TierNode {...tier} />
            {i < TIERS.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* AI Agents */}
      <div className="mt-5 pt-5 border-t border-gray-800 flex flex-wrap justify-center gap-3">
        {AGENTS.map((agent) => (
          <AgentNode key={agent.label} {...agent} />
        ))}
      </div>
    </div>
  )
}

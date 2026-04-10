import { Monitor, Server, Database } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'

const TIER_CONFIG = {
  frontend: { icon: Monitor, colour: 'text-blue-400' },
  backend:  { icon: Server,  colour: 'text-amber-400' },
  database: { icon: Database, colour: 'text-emerald-400' },
}

export default function TierCard({ tierKey, tier }) {
  const { icon: Icon, colour } = TIER_CONFIG[tierKey] ?? { icon: Server, colour: 'text-gray-400' }
  const { name, tech, pods, resources, service, hpa, storage } = tier

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${colour}`} />
        <span className="font-semibold text-gray-100">{name}</span>
      </div>

      {/* Tech stack badges */}
      <div className="flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span key={t} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300">
            {t}
          </span>
        ))}
      </div>

      {/* Pod status */}
      <div className="flex flex-wrap gap-3">
        <StatusBadge count={pods.running} status="running" />
        <StatusBadge count={pods.pending} status="pending" />
        <StatusBadge count={pods.error}   status="error" />
      </div>

      {/* Resource usage */}
      <div className="space-y-2">
        <ProgressBar value={resources.cpuUsage}    label="CPU" />
        <ProgressBar value={resources.memoryUsage} label="Memory" />
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 space-y-1 border-t border-gray-800 pt-3">
        <div>{service.type} : {service.port}</div>
        {hpa && (
          <div>HPA {hpa.minReplicas}–{hpa.maxReplicas} replicas · {hpa.cpuTarget}% CPU target</div>
        )}
        {storage && (
          <div>{storage.used} / {storage.size} ({storage.class})</div>
        )}
      </div>
    </div>
  )
}

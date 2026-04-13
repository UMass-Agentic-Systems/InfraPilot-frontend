import { Monitor, Server, Database, Globe, FileText, HardDrive } from 'lucide-react'
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 min-w-0 h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Icon className={`w-6 h-6 ${colour}`} />
        <span className="text-lg font-bold text-gray-100">{name}</span>
      </div>

      {/* Tech stack badges */}
      <div className="flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span key={t} className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300">
            {t}
          </span>
        ))}
      </div>

      {/* Pod status */}
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pods</span>
        <div className="flex flex-wrap gap-3 mt-1.5">
          <StatusBadge count={pods.running} status="running" />
          <StatusBadge count={pods.pending} status="pending" />
          <StatusBadge count={pods.error}   status="error" />
        </div>
      </div>

      {/* Resource usage */}
      <div className="space-y-3">
        <ProgressBar label="CPU" value={resources.cpuUsage} limit={resources.cpuLimit} />
        <ProgressBar label="Memory" value={resources.memoryUsage} limit={resources.memoryLimit} />
      </div>

      {/* Footer */}
      <div className="mt-auto" />
      <div className="text-xs text-gray-400 space-y-1.5 border-t border-gray-800 pt-3">
        {service && (
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            {service.type} :{service.port}
          </div>
        )}
        {hpa && (
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            HPA {hpa.minReplicas}-{hpa.maxReplicas} replicas (CPU target {hpa.cpuTarget}%)
          </div>
        )}
        {storage && (
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-gray-500" />
            {storage.used} / {storage.size} ({storage.class})
          </div>
        )}
      </div>
    </div>
  )
}

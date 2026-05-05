import { Monitor, Server, Database, Box, Globe, FileText, HardDrive } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'

function classifyTier(name) {
  const n = (name || '').toLowerCase()
  if (/(frontend|web|ui|nginx)/.test(n)) return { Icon: Monitor, colour: 'text-blue-400' }
  if (/(backend|api|server)/.test(n)) return { Icon: Server, colour: 'text-amber-400' }
  if (/(database|db|postgres|mysql|redis|clickhouse|mongo)/.test(n)) {
    return { Icon: Database, colour: 'text-emerald-400' }
  }
  return { Icon: Box, colour: 'text-gray-400' }
}

export default function TierCard({ tier }) {
  if (!tier) return null
  const { name, kind, containers = [], pods, resources, service, hpa, storage } = tier
  const { Icon, colour } = classifyTier(name)

  const cpuPercent = resources?.cpu_usage_percent
  const memoryPercent = resources?.memory_usage_percent

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 min-w-0 h-full">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-6 h-6 ${colour}`} />
        <div className="min-w-0">
          <div className="text-lg font-bold text-gray-100 truncate">{name}</div>
          {kind && <div className="text-xs text-gray-500">{kind}</div>}
        </div>
      </div>

      {containers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {containers.map((c, i) => (
            <span
              key={`${c.name}-${i}`}
              title={c.image}
              className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300 truncate max-w-full"
            >
              {c.image || c.name}
            </span>
          ))}
        </div>
      )}

      {pods && (
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pods</span>
          <div className="flex flex-wrap gap-3 mt-1.5">
            <StatusBadge count={pods.running} status="running" />
            <StatusBadge count={pods.pending} status="pending" />
            <StatusBadge count={pods.failed} status="error" />
          </div>
        </div>
      )}

      {(cpuPercent != null || memoryPercent != null) && (
        <div className="space-y-3">
          {cpuPercent != null && (
            <ProgressBar
              label="CPU"
              value={Math.round(cpuPercent)}
              limit={resources?.cpu_requests}
            />
          )}
          {memoryPercent != null && (
            <ProgressBar
              label="Memory"
              value={Math.round(memoryPercent)}
              limit={resources?.memory_requests}
            />
          )}
        </div>
      )}

      <div className="mt-auto" />
      {(service || hpa || storage) && (
        <div className="text-xs text-gray-400 space-y-1.5 border-t border-gray-800 pt-3">
          {service && (service.type || service.port != null) && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              {service.type}
              {service.port != null && ` :${service.port}`}
            </div>
          )}
          {hpa && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              HPA {hpa.min_replicas}-{hpa.max_replicas} replicas (CPU target {hpa.cpu_target_percent}%)
            </div>
          )}
          {storage && (
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-gray-500" />
              {storage.used_gi}Gi / {storage.capacity_gi}Gi ({storage.storage_class})
            </div>
          )}
        </div>
      )}
    </div>
  )
}

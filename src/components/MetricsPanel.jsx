import { Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

const METRICS = [
  { key: 'requestsPerSec', label: 'Requests/sec', icon: Zap,            iconColour: 'text-brand-400',   unit: '',   format: (v) => v.toLocaleString() },
  { key: 'avgLatency',     label: 'Avg Latency',  icon: Clock,          iconColour: 'text-blue-400',    unit: 'ms', format: (v) => v },
  { key: 'p95Latency',     label: 'p95 Latency',  icon: Clock,          iconColour: 'text-amber-400',   unit: 'ms', format: (v) => v },
  { key: 'p99Latency',     label: 'p99 Latency',  icon: Clock,          iconColour: 'text-orange-400',  unit: 'ms', format: (v) => v },
  { key: 'errorRate',      label: 'Error Rate',    icon: AlertTriangle,  iconColour: null,               unit: '%',  format: (v) => v },
  { key: 'uptime',         label: 'Uptime',        icon: CheckCircle,    iconColour: 'text-emerald-400', unit: '%',  format: (v) => v },
]

function metricColour(key, value) {
  if (key === 'errorRate') return value > 1 ? 'text-red-400' : 'text-emerald-400'
  if (key === 'uptime')    return value < 99.9 ? 'text-amber-400' : 'text-emerald-400'
  return 'text-gray-100'
}

export default function MetricsPanel({ traffic }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Traffic & Performance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {METRICS.map(({ key, label, icon: Icon, iconColour, unit, format }) => {
          const value = traffic[key]
          const colour = metricColour(key, value)
          const resolvedIconColour = iconColour ?? colour

          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon className={`w-3.5 h-3.5 ${resolvedIconColour}`} />
                {label}
              </div>
              <div className={`text-2xl font-bold tabular-nums ${colour}`}>
                {format(value)}
                {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

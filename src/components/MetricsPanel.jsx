const METRICS = [
  { key: 'requestsPerSec', label: 'Requests / sec', format: (v) => v.toLocaleString() },
  { key: 'avgLatency',     label: 'Avg Latency',    format: (v) => `${v} ms` },
  { key: 'p95Latency',     label: 'p95 Latency',    format: (v) => `${v} ms` },
  { key: 'p99Latency',     label: 'p99 Latency',    format: (v) => `${v} ms` },
  { key: 'errorRate',      label: 'Error Rate',     format: (v) => `${v}%` },
  { key: 'uptime',         label: 'Uptime',         format: (v) => `${v}%` },
]

function metricColour(key, value) {
  if (key === 'errorRate') return value >= 1 ? 'text-red-400' : value >= 0.5 ? 'text-amber-400' : 'text-emerald-400'
  if (key === 'uptime')    return value < 99.9 ? 'text-amber-400' : 'text-emerald-400'
  return 'text-gray-100'
}

export default function MetricsPanel({ traffic }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Traffic &amp; Latency</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {METRICS.map(({ key, label, format }) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-sm font-semibold tabular-nums ${metricColour(key, traffic[key])}`}>
              {format(traffic[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

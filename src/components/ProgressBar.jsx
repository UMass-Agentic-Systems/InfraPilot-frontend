function barColour(value) {
  if (value >= 80) return 'bg-red-500'
  if (value >= 60) return 'bg-amber-500'
  return 'bg-emerald-500'
}

export default function ProgressBar({ value, label }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColour(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

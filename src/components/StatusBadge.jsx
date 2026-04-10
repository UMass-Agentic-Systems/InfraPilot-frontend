const DOT_COLOURS = {
  running: 'bg-emerald-500',
  pending: 'bg-amber-500',
  error: 'bg-red-500',
}

export default function StatusBadge({ count, status }) {
  if (!count) return null

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-300">
      <span className={`w-2 h-2 rounded-full ${DOT_COLOURS[status] ?? 'bg-gray-500'}`} />
      {count} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

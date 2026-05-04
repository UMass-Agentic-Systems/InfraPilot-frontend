import { MessageSquare, LayoutDashboard } from 'lucide-react'

const TABS = [
  { id: 'chat',          label: 'Chat',          Icon: MessageSquare },
  { id: 'visualization', label: 'Visualization', Icon: LayoutDashboard },
]

export default function ViewToggle({ activeView, onViewChange, deploymentCount = 0 }) {
  return (
    <div role="tablist" className="flex border-b border-gray-800 bg-gray-900">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeView === id
        // Visualization tab stays clickable even with 0 deployments so the
        // user can confirm a teardown. Just visually muted with a tooltip.
        const isMuted = id === 'visualization' && deploymentCount === 0
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(id)}
            title={isMuted ? 'No active deployments — open to see status.' : undefined}
            className={[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-brand-500 text-brand-300 -mb-px'
                : isMuted
                ? 'text-gray-600 hover:text-gray-400'
                : 'text-gray-500 hover:text-gray-300',
            ].join(' ')}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

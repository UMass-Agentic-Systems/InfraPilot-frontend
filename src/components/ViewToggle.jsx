import { MessageSquare, LayoutDashboard } from 'lucide-react'

const TABS = [
  { id: 'chat',          label: 'Chat',          Icon: MessageSquare   },
  { id: 'visualization', label: 'Visualization', Icon: LayoutDashboard },
]

export default function ViewToggle({ activeView, onViewChange }) {
  return (
    <div role="tablist" className="flex border-b border-gray-800 bg-gray-900">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeView === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(id)}
            className={[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-brand-500 text-brand-300 -mb-px'
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

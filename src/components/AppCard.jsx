import { Box } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AppCard({ app, isActive, collapsed }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/dashboard/${app.id}`)}
      title={collapsed ? app.name : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-brand-600/20 text-brand-300'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
      }`}
    >
      <Box className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">{app.name}</span>
      )}
    </button>
  )
}

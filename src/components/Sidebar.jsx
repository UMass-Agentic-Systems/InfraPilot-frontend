import { useState } from 'react'
import { PanelLeftClose, PanelLeft, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import AppCard from './AppCard'
import NewAppModal from './NewAppModal'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { apps } = useChat()
  const { appId } = useParams()

  return (
    <>
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 flex-shrink-0 transition-all duration-300 overflow-hidden ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800 flex-shrink-0">
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-300">Your Apps</span>
          )}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors ${
              collapsed ? 'mx-auto' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* New App Button */}
        <div className="px-2 py-2 flex-shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-gray-100 hover:border-gray-500 transition-colors text-sm ${
              collapsed ? 'justify-center' : ''
            }`}
            aria-label="New App"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New App</span>}
          </button>
        </div>

        {/* App List */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isActive={app.id === appId}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </aside>

      <NewAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

import { useEffect, useState } from 'react'
import { PanelLeftClose, PanelLeft, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import SessionCard from './SessionCard'
import NewSessionModal from './NewSessionModal'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { sessions, refreshSessions } = useChat()
  const { sessionId } = useParams()

  useEffect(() => {
    refreshSessions().catch(() => {})
  }, [refreshSessions])

  return (
    <>
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 flex-shrink-0 transition-all duration-300 overflow-hidden ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800 flex-shrink-0">
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-300">Chat Sessions</span>
          )}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors ${
              collapsed ? 'mx-auto' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-2 py-2 flex-shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-gray-100 hover:border-gray-500 transition-colors text-sm ${
              collapsed ? 'justify-center' : ''
            }`}
            aria-label="New Chat"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {sessions.length === 0 && !collapsed && (
            <p className="px-3 py-2 text-xs text-gray-500">No sessions yet.</p>
          )}
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={String(session.id) === String(sessionId)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </aside>

      <NewSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'

export default function SessionCard({ session, isActive, collapsed }) {
  const navigate = useNavigate()
  const { sessionId: activeParam } = useParams()
  const { deleteSession } = useChat()
  const [busy, setBusy] = useState(false)

  const handleClick = () => navigate(`/dashboard/${session.id}`)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (busy) return
    if (!window.confirm(`Delete "${session.title}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      await deleteSession(session.id)
      if (String(activeParam) === String(session.id)) {
        navigate('/dashboard')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`group relative flex items-center rounded-lg transition-colors ${
        isActive ? 'bg-brand-600/20 text-brand-300' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        title={collapsed ? session.title : undefined}
        className="flex-1 flex items-center gap-3 px-3 py-2 min-w-0 text-left"
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        {!collapsed && (
          <span className="truncate text-sm font-medium">{session.title}</span>
        )}
      </button>
      {!collapsed && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          aria-label={`Delete session ${session.title}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 mr-1 p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded-md transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

import { Shield, X, AlertTriangle } from 'lucide-react'
import { useChat } from '../context/ChatContext'

function Toast({ toast, onDismiss }) {
  const isError = toast.variant === 'error'
  const Icon = isError ? AlertTriangle : Shield
  const accent = isError
    ? 'border-red-500/40 bg-red-500/10'
    : 'border-amber-500/40 bg-amber-500/10'
  const iconColour = isError ? 'text-red-300' : 'text-amber-300'

  const handleClick = () => {
    if (toast.messageId) {
      const node = document.getElementById(`chat-msg-${toast.messageId}`)
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    onDismiss(toast.id)
  }

  return (
    <div
      className={`pointer-events-auto w-80 max-w-full p-3 rounded-lg border ${accent} shadow-lg backdrop-blur-sm cursor-pointer`}
      onClick={handleClick}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColour}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${iconColour}`}>
            {isError ? 'Error' : `SRE Alert: ${toast.appName}`}
          </p>
          <p className="text-xs text-gray-200 mt-0.5 line-clamp-2 break-words">
            {toast.content}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(toast.id)
          }}
          className="text-gray-400 hover:text-gray-100"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function ToastNotification() {
  const { toasts, dismissToast } = useChat()
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed top-16 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useChat } from '../context/ChatContext'

const STATE_CONFIG = {
  idle: { dot: 'bg-gray-500', label: 'Idle' },
  connecting: { dot: 'bg-amber-400 animate-pulse', label: 'Connecting...' },
  connected: { dot: 'bg-emerald-500', label: 'Connected' },
  disconnected: { dot: 'bg-red-500', label: 'Disconnected — Reconnecting...' },
  error: { dot: 'bg-red-500', label: 'Connection error' },
}

// Custom hook: returns true for `duration` ms after `value` becomes `target`.
function useTransientFlag(value, target, duration) {
  const [active, setActive] = useState(false)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value === target && prevRef.current !== target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(true)
      const t = setTimeout(() => setActive(false), duration)
      prevRef.current = value
      return () => clearTimeout(t)
    }
    prevRef.current = value
    return undefined
  }, [value, target, duration])

  return active
}

export default function ConnectionStatus() {
  const { wsStatus, retryConnection, fatalError } = useChat()
  const showConnectedLabel = useTransientFlag(wsStatus, 'connected', 2000)

  const cfg = STATE_CONFIG[wsStatus] || STATE_CONFIG.idle
  const showLabel = wsStatus !== 'connected' || showConnectedLabel
  const labelText = fatalError?.message || cfg.label

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
      {showLabel && <span className="text-gray-400">{labelText}</span>}
      {wsStatus === 'error' && (
        <button
          type="button"
          onClick={retryConnection}
          className="ml-1 px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}

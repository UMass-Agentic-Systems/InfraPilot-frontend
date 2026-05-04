import { useCallback, useRef, useState } from 'react'

const AUTO_DISMISS_MS = 8000
const MAX_VISIBLE = 3

export function useToastState() {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const next = { ...toast, id }
      setToasts((prev) => [next, ...prev].slice(0, MAX_VISIBLE))
      const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
      timersRef.current.set(id, timer)
      return id
    },
    [dismissToast]
  )

  return { toasts, pushToast, dismissToast }
}

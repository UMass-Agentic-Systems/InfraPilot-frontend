import { useCallback, useEffect, useRef, useState } from 'react'
import { connectWebSocket } from '../services/api'

const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 30000]
const MAX_RECONNECT_ATTEMPTS = 5
const FATAL_CLOSE_CODES = new Set([4001, 4004, 4010])

export function useWebSocket(sessionId, token, handlers = {}) {
  const [status, setStatus] = useState('idle')
  const [epoch, setEpoch] = useState(0)
  const handlersRef = useRef(handlers)
  const connRef = useRef(null)
  const attemptRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const teardownRef = useRef(false)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const sendMessage = useCallback((data) => {
    if (connRef.current) {
      return connRef.current.send(data)
    }
    return false
  }, [])

  const retry = useCallback(() => {
    setEpoch((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!sessionId || !token) {
      return undefined
    }

    teardownRef.current = false
    attemptRef.current = 0
    let active = true

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    const closeCurrent = () => {
      if (connRef.current) {
        connRef.current.onClose = null
        connRef.current.onError = null
        connRef.current.onMessage = null
        connRef.current.onOpen = null
        try {
          connRef.current.close()
        } catch {
          // ignore
        }
        connRef.current = null
      }
    }

    const open = () => {
      if (!active || teardownRef.current) return
      setStatus('connecting')
      const conn = connectWebSocket(sessionId, token)
      connRef.current = conn

      conn.onOpen = () => {
        if (!active) return
        const isReconnect = attemptRef.current > 0
        attemptRef.current = 0
        setStatus('connected')
        handlersRef.current.onOpen?.({ isReconnect })
      }

      conn.onMessage = (frame) => {
        if (!active) return
        if (!frame || typeof frame !== 'object') return
        switch (frame.type) {
          case 'agent_response':
            handlersRef.current.onAgentResponse?.(frame)
            break
          case 'sre_alert':
            handlersRef.current.onSreAlert?.(frame)
            break
          case 'plan_update':
            handlersRef.current.onPlanUpdate?.(frame)
            break
          case 'typing':
            handlersRef.current.onTyping?.(frame)
            break
          case 'error':
            handlersRef.current.onError?.(frame)
            break
          default:
            break
        }
      }

      conn.onClose = (ev) => {
        if (!active || teardownRef.current) return
        const code = ev?.code

        if (FATAL_CLOSE_CODES.has(code)) {
          setStatus('error')
          handlersRef.current.onFatalClose?.(code)
          return
        }

        if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setStatus('error')
          return
        }

        setStatus('disconnected')
        const delay = RECONNECT_DELAYS_MS[Math.min(attemptRef.current, RECONNECT_DELAYS_MS.length - 1)]
        attemptRef.current += 1
        reconnectTimerRef.current = setTimeout(() => {
          if (!active) return
          handlersRef.current.onReconnectAttempt?.()
          open()
        }, delay)
      }

      conn.onError = () => {
        // close handler runs after with the code; let it drive state
      }
    }

    open()

    return () => {
      active = false
      teardownRef.current = true
      clearReconnectTimer()
      closeCurrent()
    }
  }, [sessionId, token, epoch])

  const visibleStatus = !sessionId || !token ? 'idle' : status

  return { status: visibleStatus, sendMessage, retry }
}

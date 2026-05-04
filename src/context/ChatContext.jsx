import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { useToastState } from '../hooks/useToast'
import * as api from '../services/api'

const ChatContext = createContext(null)

const EMPTY_TYPING = { 'infra-agent': false, 'sre-agent': false }

export function parseMetadata(metadataJson) {
  if (!metadataJson) return null
  if (typeof metadataJson === 'object') return metadataJson
  try {
    return JSON.parse(metadataJson)
  } catch {
    return null
  }
}

// The backend chat module currently does not populate `metadata_json` for the
// agent's deploy/SRE replies (only the background SRE monitor does). Fall back
// to parsing the agent's reply text so the Visualization tab and inline action
// buttons still work end-to-end. Spec FR-7.8 / FR-10.4 / FR-11.2 depend on
// surfacing `deployment_id` and `plan_id` from chat history.
const DEPLOY_RE = /deployment id[:\s]+(\d+)(?:[^\d]+status[:\s]+(\w+))?/i
const DEPLOY_APP_RE = /app[:\s]+([\w.-]+)/i
const DEPLOY_FAIL_RE = /deployment failed/i
const DELETE_RE = /deleted deployment id[:\s]+(\d+)/i
const PLAN_RE = /plan id[:\s]+(\d+)(?:[^a-z]+status[:\s]+([\w_]+))?/i

export function deriveMessageMetadata(message) {
  if (!message) return null
  const explicit = parseMetadata(message.metadata_json)
  if (explicit) return explicit

  const content = typeof message.content === 'string' ? message.content : ''

  if (message.role === 'infra-agent') {
    const deleteMatch = content.match(DELETE_RE)
    if (deleteMatch) {
      const appMatch = content.match(DEPLOY_APP_RE)
      return {
        deployment_id: Number(deleteMatch[1]),
        app_name: appMatch ? appMatch[1] : undefined,
        status: 'deleted',
      }
    }
    const deployMatch = content.match(DEPLOY_RE)
    if (deployMatch) {
      const appMatch = content.match(DEPLOY_APP_RE)
      return {
        deployment_id: Number(deployMatch[1]),
        app_name: appMatch ? appMatch[1] : undefined,
        status: deployMatch[2] || 'deployed',
      }
    }
    if (DEPLOY_FAIL_RE.test(content)) {
      return { deployment_id: null, status: 'failed' }
    }
  }

  if (message.role === 'sre-agent') {
    const planMatch = content.match(PLAN_RE)
    if (planMatch) {
      const planStatus = (planMatch[2] || '').toLowerCase()
      return {
        plan_id: Number(planMatch[1]),
        status: planStatus || 'awaiting_approval',
      }
    }
  }

  return null
}

export function ChatProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const { toasts, pushToast, dismissToast } = useToastState()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messagesBySession, setMessagesBySession] = useState({})
  const [isTyping, setIsTyping] = useState(EMPTY_TYPING)
  const [pendingPlans, setPendingPlans] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [fatalError, setFatalError] = useState(null)

  const activeSessionIdRef = useRef(activeSessionId)
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  const refreshSessions = useCallback(async () => {
    if (!token) return []
    const list = await api.listSessions(token)
    const sorted = (list || []).slice().sort((a, b) =>
      (b.updated_at || '').localeCompare(a.updated_at || '')
    )
    setSessions(sorted)
    return sorted
  }, [token])

  const refreshPendingPlans = useCallback(async () => {
    if (!token) return []
    try {
      const plans = await api.listPlans(token)
      const pending = (plans || []).filter((p) => !p.approved && !p.applied)
      setPendingPlans(pending)
      return pending
    } catch {
      return []
    }
  }, [token])

  const createSession = useCallback(
    async (title) => {
      if (!token) throw new Error('Not authenticated')
      const session = await api.createSession(token, title)
      setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)])
      return session
    },
    [token]
  )

  const deleteSession = useCallback(
    async (sessionId) => {
      if (!token) return
      await api.deleteSession(token, sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      setMessagesBySession((prev) => {
        if (!(sessionId in prev)) return prev
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
    },
    [token]
  )

  const loadHistory = useCallback(
    async (sessionId) => {
      if (!token || !sessionId) return null
      setHistoryLoading(true)
      try {
        const detail = await api.getSession(token, sessionId)
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: detail?.messages || [],
        }))
        return detail
      } finally {
        setHistoryLoading(false)
      }
    },
    [token]
  )

  // When the active session changes, load its history.
  useEffect(() => {
    if (!activeSessionId || !token) return
    loadHistory(activeSessionId).catch(() => {
      // history failure is non-fatal; the WS will retry
    })
  }, [activeSessionId, token, loadHistory])

  // When auth changes, refresh pending plans.
  useEffect(() => {
    if (isAuthenticated) {
      refreshPendingPlans()
    } else {
      setSessions([])
      setMessagesBySession({})
      setActiveSessionId(null)
      setPendingPlans([])
      setIsTyping(EMPTY_TYPING)
      setFatalError(null)
    }
  }, [isAuthenticated, refreshPendingPlans])

  // WebSocket handlers — defined as a stable object via refs.
  const handlers = useMemo(
    () => ({
      onOpen: ({ isReconnect }) => {
        setFatalError(null)
        if (isReconnect && activeSessionIdRef.current) {
          // Refresh history to catch any messages that arrived while disconnected.
          loadHistory(activeSessionIdRef.current).catch(() => {})
        }
      },
      onAgentResponse: (frame) => {
        const sid = activeSessionIdRef.current
        if (!sid || !frame?.message) return
        const msg = frame.message
        setMessagesBySession((prev) => {
          const list = prev[sid] || []
          if (list.some((m) => m.id === msg.id)) return prev
          return { ...prev, [sid]: [...list, msg] }
        })
        if (msg.role === 'infra-agent' || msg.role === 'sre-agent') {
          setIsTyping((prev) => ({ ...prev, [msg.role]: false }))
        }
      },
      onSreAlert: (frame) => {
        const sid = activeSessionIdRef.current
        const msg = frame?.message
        if (sid && msg) {
          setMessagesBySession((prev) => {
            const list = prev[sid] || []
            if (list.some((m) => m.id === msg.id)) return prev
            return { ...prev, [sid]: [...list, msg] }
          })
        }
        pushToast({
          variant: 'sre',
          appName: frame?.app_name || 'Deployment',
          deploymentId: frame?.deployment_id,
          messageId: msg?.id,
          content: msg?.content || 'New alert',
        })
        refreshPendingPlans()
      },
      onTyping: (frame) => {
        if (!frame?.agent) return
        setIsTyping((prev) => ({ ...prev, [frame.agent]: !!frame.is_typing }))
      },
      onError: (frame) => {
        pushToast({
          variant: 'error',
          appName: 'Server',
          content: frame?.detail || 'Server error',
        })
      },
      onFatalClose: (code) => {
        const messages = {
          4001: 'Authentication failed. Please sign in again.',
          4004: 'This chat session is no longer available.',
          4010: 'This chat session was deleted.',
        }
        setFatalError({ code, message: messages[code] || 'Connection closed' })
        if (code === 4001) {
          // AuthContext listens for 401-style logout, but explicit cue helps.
          window.dispatchEvent(new CustomEvent(api.UNAUTHORIZED_EVENT))
        }
      },
    }),
    [pushToast, refreshPendingPlans, loadHistory]
  )

  const { status: wsStatus, sendMessage: wsSend, retry: wsRetry } = useWebSocket(
    activeSessionId,
    token,
    handlers
  )

  const sendMessage = useCallback(
    (content) => {
      const sid = activeSessionIdRef.current
      if (!sid || !content?.trim()) return false
      const trimmed = content.trim()
      // Optimistically append user message; backend won't echo it back.
      const optimistic = {
        id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: trimmed,
        metadata_json: null,
        position: -1,
        created_at: new Date().toISOString(),
        _optimistic: true,
      }
      setMessagesBySession((prev) => {
        const list = prev[sid] || []
        return { ...prev, [sid]: [...list, optimistic] }
      })
      return wsSend({ type: 'message', content: trimmed })
    },
    [wsSend]
  )

  const value = useMemo(
    () => ({
      sessions,
      activeSessionId,
      setActiveSessionId,
      messagesBySession,
      isTyping,
      wsStatus,
      pendingPlans,
      historyLoading,
      fatalError,
      toasts,
      refreshSessions,
      refreshPendingPlans,
      createSession,
      deleteSession,
      sendMessage,
      retryConnection: wsRetry,
      pushToast,
      dismissToast,
    }),
    [
      sessions,
      activeSessionId,
      messagesBySession,
      isTyping,
      wsStatus,
      pendingPlans,
      historyLoading,
      fatalError,
      toasts,
      refreshSessions,
      refreshPendingPlans,
      createSession,
      deleteSession,
      sendMessage,
      wsRetry,
      pushToast,
      dismissToast,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  return useContext(ChatContext)
}

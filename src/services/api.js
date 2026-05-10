const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
export const WS_BASE = API_BASE.replace(/^http/, 'ws')

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    throw new Error('Unauthorized')
  }

  if (res.status === 204) return null

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const detail = (data && data.detail) || res.statusText || 'Request failed'
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

// Auth
export const authLogin = (email, password) =>
  apiFetch('/api/v1/auth/login', { method: 'POST', body: { email, password } })

export const authRegister = (email, password) =>
  apiFetch('/api/v1/auth/register', { method: 'POST', body: { email, password } })

// Chat sessions
export const createSession = (token, title) =>
  apiFetch('/api/v1/chat/sessions', { method: 'POST', body: { title }, token })

export const listSessions = (token) =>
  apiFetch('/api/v1/chat/sessions', { token })

export const getSession = (token, id) =>
  apiFetch(`/api/v1/chat/sessions/${id}`, { token })

export const deleteSession = (token, id) =>
  apiFetch(`/api/v1/chat/sessions/${id}`, { method: 'DELETE', token })

export const listSessionDeployments = (token, sessionId) =>
  apiFetch(`/api/v1/chat/sessions/${sessionId}/deployments`, { token })

// Visualization
export const getVisualization = (token, deploymentId, sessionId) => {
  const qs = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
  return apiFetch(`/api/v1/visualize/${deploymentId}${qs}`, { token })
}

// Monitoring
export const listPlans = (token) =>
  apiFetch('/api/v1/monitor/plans', { token })

export const approvePlan = (token, planId, approved) =>
  apiFetch(`/api/v1/monitor/plans/${planId}/approve`, {
    method: 'POST',
    body: { approved },
    token,
  })

// WebSocket
export function connectWebSocket(sessionId, token) {
  const url = `${WS_BASE}/api/v1/chat/sessions/${sessionId}/ws?token=${encodeURIComponent(token)}`
  const socket = new WebSocket(url)

  const conn = {
    socket,
    onOpen: null,
    onMessage: null,
    onClose: null,
    onError: null,
    send(data) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data))
        return true
      }
      return false
    },
    close(code = 1000, reason = 'client closing') {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        try {
          socket.close(code, reason)
        } catch {
          // ignore
        }
      }
    },
  }

  socket.addEventListener('open', (ev) => conn.onOpen?.(ev))
  socket.addEventListener('message', (ev) => {
    let parsed
    try {
      parsed = JSON.parse(ev.data)
    } catch {
      return
    }
    conn.onMessage?.(parsed)
  })
  socket.addEventListener('close', (ev) => conn.onClose?.(ev))
  socket.addEventListener('error', (ev) => conn.onError?.(ev))

  return conn
}

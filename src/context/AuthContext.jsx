import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authLogin, authRegister, UNAUTHORIZED_EVENT } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'infrapilot_token'
const USER_KEY = 'infrapilot_user'

function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded + '==='.slice((padded.length + 3) % 4))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isExpired(payload) {
  if (!payload?.exp) return false
  return payload.exp * 1000 < Date.now()
}

function loadInitialAuth() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return { token: null, user: null }
  const payload = decodeJwt(token)
  if (!payload || isExpired(payload)) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return { token: null, user: null }
  }
  let user = null
  try {
    const stored = localStorage.getItem(USER_KEY)
    user = stored ? JSON.parse(stored) : null
  } catch {
    user = null
  }
  if (!user) {
    user = { id: payload.sub, email: '' }
  }
  return { token, user }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => loadInitialAuth().token)
  const [user, setUser] = useState(() => loadInitialAuth().user)

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_KEY, nextToken)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
    persist(null, null)
  }, [persist])

  useEffect(() => {
    const handler = () => signOut()
    window.addEventListener(UNAUTHORIZED_EVENT, handler)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler)
  }, [signOut])

  const handleAuthSuccess = useCallback(
    (accessToken, email) => {
      const payload = decodeJwt(accessToken)
      if (!payload) throw new Error('Invalid token returned by server')
      const nextUser = { id: payload.sub, email }
      setToken(accessToken)
      setUser(nextUser)
      persist(accessToken, nextUser)
    },
    [persist]
  )

  const login = useCallback(
    async (email, password) => {
      const res = await authLogin(email, password)
      if (!res?.access_token) throw new Error('Login failed')
      handleAuthSuccess(res.access_token, email)
    },
    [handleAuthSuccess]
  )

  const register = useCallback(
    async (email, password) => {
      const res = await authRegister(email, password)
      if (!res?.access_token) throw new Error('Registration failed')
      handleAuthSuccess(res.access_token, email)
    },
    [handleAuthSuccess]
  )

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      register,
      signOut,
    }),
    [token, user, login, register, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

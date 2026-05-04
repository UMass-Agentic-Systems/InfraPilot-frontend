import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

// Build a JWT-shaped string so the provider's decoder accepts it.
function fakeJwt({ sub = '1', exp = Math.floor(Date.now() / 1000) + 3600 } = {}) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub, exp }))
  const signature = 'sig'
  return `${header}.${payload}.${signature}`
}

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('has null user and isAuthenticated false initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login stores token and exposes user/email', async () => {
    const token = fakeJwt({ sub: '42' })
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ access_token: token, token_type: 'bearer' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('a@b.com', 'pw')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ id: '42', email: 'a@b.com' })
    expect(localStorage.getItem('infrapilot_token')).toBe(token)

    vi.unstubAllGlobals()
  })

  it('signOut clears state and storage', async () => {
    const token = fakeJwt({ sub: '5' })
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ access_token: token }), { status: 200 })
        )
      )
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('a@b.com', 'pw')
    })
    act(() => result.current.signOut())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('infrapilot_token')).toBeNull()

    vi.unstubAllGlobals()
  })

  it('useAuth outside AuthProvider returns null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBeNull()
  })
})

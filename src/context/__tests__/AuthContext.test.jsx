import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockUser } from '../../data/mockData'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  it('has null user and isAuthenticated false initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('signIn sets user to mockUser and isAuthenticated to true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.signIn())
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('signOut clears user back to null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.signIn())
    act(() => result.current.signOut())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('supports full signIn → signOut → signIn cycle', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.signIn())
    expect(result.current.isAuthenticated).toBe(true)
    act(() => result.current.signOut())
    expect(result.current.isAuthenticated).toBe(false)
    act(() => result.current.signIn())
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('useAuth outside AuthProvider returns null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBeNull()
  })
})

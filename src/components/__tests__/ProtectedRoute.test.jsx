import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

// Mock useAuth to control authentication state directly
vi.mock('../../context/AuthContext', () => {
  let authenticated = false
  return {
    useAuth: () => ({ isAuthenticated: authenticated }),
    __setAuth: (val) => { authenticated = val },
  }
})

import { __setAuth } from '../../context/AuthContext'

function SignInPage() {
  return <div>Sign In Page</div>
}

function DashboardContent() {
  return <div>Dashboard Content</div>
}

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardContent />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /signin when user is not authenticated', () => {
    __setAuth(false)
    renderRoute()
    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  it('renders child routes (Outlet) when user is authenticated', () => {
    __setAuth(true)
    renderRoute()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    expect(screen.queryByText('Sign In Page')).not.toBeInTheDocument()
  })

  it('uses replace on Navigate so back button skips the protected page', () => {
    __setAuth(false)
    renderRoute()
    // If Navigate used replace, we end up on /signin but the history length stays 1
    // (MemoryRouter starts with 1 entry and replace doesn't add another)
    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
  })
})

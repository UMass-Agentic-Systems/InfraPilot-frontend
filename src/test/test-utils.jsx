import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ChatProvider } from '../context/ChatContext'

export function renderWithProviders(ui, { initialEntries = ['/'], ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export { render }
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

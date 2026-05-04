import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      if (err.status === 401) {
        setError('Invalid email or password')
      } else {
        setError(err.message || 'Login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Cloud className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Welcome to InfraPilot</h1>
          <p className="text-gray-400">Sign in to manage your deployments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await register(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      if (err.status === 409) {
        setError('Email already registered')
      } else if (err.status === 422) {
        const detail = err.data?.detail
        const msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail
        setError(msg || 'Validation failed')
      } else {
        setError(err.message || 'Registration failed')
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
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Create your account</h1>
          <p className="text-gray-400">Start deploying with AI agents</p>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm text-gray-300 mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Re-enter password"
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
            Create Account
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

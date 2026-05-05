import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'

function validate(name) {
  const trimmed = name.trim()
  if (!trimmed) return 'Session title is required.'
  if (trimmed.length < 3) return 'Session title must be at least 3 characters.'
  if (trimmed.length > 40) return 'Session title must be 40 characters or fewer.'
  return ''
}

function ModalContent({ onClose }) {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)
  const { createSession } = useChat()
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const trimmedLength = name.trim().length
  const validationError = validate(name)
  const currentError = touched ? validationError : ''
  const isValid = !validationError

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    setServerError('')
    try {
      const session = await createSession(name.trim())
      onClose()
      navigate(`/dashboard/${session.id}`)
    } catch (err) {
      setServerError(err.message || 'Failed to create session')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">New Chat Session</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-300">Title</label>
              <span className="text-xs text-gray-500">{trimmedLength} / 40</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={40}
              placeholder="e.g. E-Commerce Platform Deploy"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
            {currentError && (
              <p className="mt-1.5 text-xs text-red-400">{currentError}</p>
            )}
            {serverError && (
              <p className="mt-1.5 text-xs text-red-400">{serverError}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewSessionModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return <ModalContent onClose={onClose} />
}

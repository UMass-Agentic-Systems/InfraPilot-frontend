import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, isTyping }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const canSend = value.trim().length > 0 && !isTyping

  function handleSend() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder="Describe your infrastructure needs..."
          className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
            canSend
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-gray-800 text-gray-600 opacity-50 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

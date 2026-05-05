import { useEffect, useRef, useState } from 'react'
import { Loader2, ArrowDown } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ConnectionStatus from './ConnectionStatus'
import PendingPlansBanner from './PendingPlansBanner'
import TypingIndicator from './TypingIndicator'

const SCROLL_THRESHOLD_PX = 80

export default function ChatWindow({ sessionId }) {
  const { messagesBySession, isTyping, wsStatus, sendMessage, historyLoading } = useChat()
  const messages = messagesBySession[sessionId] || []
  const scrollerRef = useRef(null)
  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)
  const [hasNewBelow, setHasNewBelow] = useState(false)

  const isAtBottom = () => {
    const el = scrollerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD_PX
  }

  useEffect(() => {
    const last = messages[messages.length - 1]
    const lastId = last?.id ?? null
    if (lastId === lastIdRef.current) return
    lastIdRef.current = lastId

    if (isAtBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasNewBelow(false)
    } else {
      setHasNewBelow(true)
    }
  }, [messages])

  useEffect(() => {
    if (isTyping['infra-agent'] || isTyping['sre-agent']) {
      if (isAtBottom()) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [isTyping])

  const handleScroll = () => {
    if (isAtBottom()) setHasNewBelow(false)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHasNewBelow(false)
  }

  const inputDisabled =
    wsStatus !== 'connected' || isTyping['infra-agent'] || isTyping['sre-agent']

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
        <ConnectionStatus />
      </div>
      <PendingPlansBanner />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative"
      >
        {historyLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Loading messages...</span>
          </div>
        ) : messages.length === 0 && !isTyping['infra-agent'] && !isTyping['sre-agent'] ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 text-sm">Send a message to start deploying your app.</p>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}

        {isTyping['infra-agent'] && <TypingIndicator agent="infra-agent" />}
        {isTyping['sre-agent'] && <TypingIndicator agent="sre-agent" />}

        <div ref={bottomRef} />
      </div>

      {hasNewBelow && (
        <div className="absolute right-6 bottom-24 z-10">
          <button
            type="button"
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            New messages
          </button>
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={inputDisabled} />
    </div>
  )
}

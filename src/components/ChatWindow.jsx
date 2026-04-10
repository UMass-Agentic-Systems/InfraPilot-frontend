import { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatWindow() {
  const { appId } = useParams()
  const { messages, isTyping, sendMessage } = useChat()
  const bottomRef = useRef(null)

  const appMessages = messages[appId] || []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [appMessages.length, isTyping])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {appMessages.length === 0 && !isTyping ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 text-sm">Send a message to start deploying your app.</p>
          </div>
        ) : (
          appMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Agents are responding...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={(content) => sendMessage(appId, content)} isTyping={isTyping} />
    </div>
  )
}

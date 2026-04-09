import { createContext, useContext, useState } from 'react'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [apps, setApps] = useState([])
  const [messages, setMessages] = useState({})
  const [isTyping, setIsTyping] = useState(false)

  const createApp = (name) => {
    const newApp = { id: `app-${Date.now()}`, name, createdAt: new Date().toISOString() }
    setApps((prev) => [...prev, newApp])
    setMessages((prev) => ({ ...prev, [newApp.id]: [] }))
    return newApp
  }

  const sendMessage = (appId, content) => {
    const userMessage = { id: `m-${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() }
    setMessages((prev) => ({ ...prev, [appId]: [...(prev[appId] || []), userMessage] }))
    setIsTyping(true)

    setTimeout(() => {
      const infraMessage = { id: `m-${Date.now()}-infra`, role: 'infra-agent', content: 'Infrastructure provisioning response.', timestamp: new Date().toISOString() }
      setMessages((prev) => ({ ...prev, [appId]: [...(prev[appId] || []), infraMessage] }))

      setTimeout(() => {
        const sreMessage = { id: `m-${Date.now()}-sre`, role: 'sre-agent', content: 'SRE monitoring response.', timestamp: new Date().toISOString() }
        setMessages((prev) => ({ ...prev, [appId]: [...(prev[appId] || []), sreMessage] }))
        setIsTyping(false)
      }, 1500)
    }, 1000)
  }

  return (
    <ChatContext.Provider value={{ apps, messages, isTyping, createApp, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}

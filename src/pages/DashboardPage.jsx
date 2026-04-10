import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import VisualizationView from '../components/VisualizationView'
import ViewToggle from '../components/ViewToggle'

export default function DashboardPage() {
  const { appId } = useParams()
  const [activeView, setActiveView] = useState('chat')

  // FR-12.3: reset to Chat when navigating between apps
  useEffect(() => {
    setActiveView('chat')
  }, [appId])

  if (!appId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">Select or create an app to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? <ChatWindow /> : <VisualizationView />}
      </div>
    </div>
  )
}

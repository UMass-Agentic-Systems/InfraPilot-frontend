import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import VisualizationView from '../components/VisualizationView'
import ViewToggle from '../components/ViewToggle'

function AppView() {
  const [activeView, setActiveView] = useState('chat')

  return (
    <div className="flex flex-col h-full">
      <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? <ChatWindow /> : <VisualizationView />}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { appId } = useParams()

  if (!appId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">Select or create an app to get started.</p>
      </div>
    )
  }

  return <AppView key={appId} />
}

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import VisualizationView from '../components/VisualizationView'
import ViewToggle from '../components/ViewToggle'
import { useChat, parseMetadata } from '../context/ChatContext'

export const VIEW_INFRA_EVENT = 'infrapilot:view-infrastructure'

function extractDeployments(messages) {
  if (!messages) return []
  const seen = new Map()
  for (const msg of messages) {
    const meta = parseMetadata(msg.metadata_json)
    if (!meta || meta.deployment_id == null) continue
    const existing = seen.get(meta.deployment_id)
    const candidate = {
      deployment_id: meta.deployment_id,
      app_name: meta.app_name || `Deployment ${meta.deployment_id}`,
      status: meta.status || 'unknown',
      created_at: msg.created_at,
    }
    if (!existing || (msg.created_at || '') > (existing.created_at || '')) {
      seen.set(meta.deployment_id, candidate)
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    (b.created_at || '').localeCompare(a.created_at || '')
  )
}

function SessionView({ sessionId }) {
  const [activeView, setActiveView] = useState('chat')
  const { messagesBySession, setActiveSessionId } = useChat()

  useEffect(() => {
    setActiveSessionId(sessionId)
    return () => setActiveSessionId(null)
  }, [sessionId, setActiveSessionId])

  const messages = messagesBySession[sessionId]
  const deployments = useMemo(() => extractDeployments(messages || []), [messages])
  const [userSelectedDeploymentId, setUserSelectedDeploymentId] = useState(null)

  const selectedDeploymentId = useMemo(() => {
    if (deployments.length === 0) return null
    if (
      userSelectedDeploymentId != null &&
      deployments.some((d) => d.deployment_id === userSelectedDeploymentId)
    ) {
      return userSelectedDeploymentId
    }
    return deployments[0].deployment_id
  }, [deployments, userSelectedDeploymentId])

  useEffect(() => {
    const handler = (e) => {
      const id = e.detail?.deploymentId
      if (id != null) {
        setUserSelectedDeploymentId(id)
        setActiveView('visualization')
      }
    }
    window.addEventListener(VIEW_INFRA_EVENT, handler)
    return () => window.removeEventListener(VIEW_INFRA_EVENT, handler)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <ViewToggle
        activeView={activeView}
        onViewChange={setActiveView}
        deploymentCount={deployments.length}
      />
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <ChatWindow sessionId={sessionId} />
        ) : (
          <VisualizationView
            deployments={deployments}
            selectedDeploymentId={selectedDeploymentId}
            onSelectDeployment={setUserSelectedDeploymentId}
          />
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { sessionId } = useParams()

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">Select or create a chat session to get started.</p>
      </div>
    )
  }

  return <SessionView key={sessionId} sessionId={sessionId} />
}

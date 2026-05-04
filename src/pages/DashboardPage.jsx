import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import VisualizationView from '../components/VisualizationView'
import ViewToggle from '../components/ViewToggle'
import { useChat, deriveMessageMetadata } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { listSessionDeployments } from '../services/api'

export const VIEW_INFRA_EVENT = 'infrapilot:view-infrastructure'
export const DEPLOYMENTS_CHANGED_EVENT = 'infrapilot:deployments-changed'

function normaliseDeployment(d) {
  return {
    deployment_id: d.id,
    app_name: d.app_name,
    status: d.status,
    created_at: d.created_at,
  }
}

function SessionView({ sessionId }) {
  const [activeView, setActiveView] = useState('chat')
  const { messagesBySession, setActiveSessionId } = useChat()
  const { token } = useAuth()

  useEffect(() => {
    setActiveSessionId(sessionId)
    return () => setActiveSessionId(null)
  }, [sessionId, setActiveSessionId])

  const [deployments, setDeployments] = useState([])
  const [hadDeployments, setHadDeployments] = useState(false)
  const [userSelectedDeploymentId, setUserSelectedDeploymentId] = useState(null)

  const refetchDeployments = useCallback(async () => {
    if (!token || !sessionId) return
    try {
      const list = await listSessionDeployments(token, sessionId)
      const normalised = (list || []).map(normaliseDeployment)
      if (normalised.length > 0) setHadDeployments(true)
      setDeployments(normalised)
    } catch {
      // 404 (session gone) or transient — leave the list empty rather than
      // throw; the visualization tab will gracefully show its empty state.
      setDeployments([])
    }
  }, [token, sessionId])

  // Initial fetch on session change.
  useEffect(() => {
    // refetchDeployments is async — setState calls happen after await, so
    // they're not the synchronous setState the lint rule warns about.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchDeployments()
  }, [refetchDeployments])

  // Refetch when the chat stream surfaces a new deploy/delete bubble. The
  // ChatContext dispatches DEPLOYMENTS_CHANGED_EVENT on those events; the
  // window-event channel keeps this page lightly coupled to ChatContext.
  useEffect(() => {
    const handler = () => refetchDeployments()
    window.addEventListener(DEPLOYMENTS_CHANGED_EVENT, handler)
    return () => window.removeEventListener(DEPLOYMENTS_CHANGED_EVENT, handler)
  }, [refetchDeployments])

  // Defence-in-depth: any time a new infra-agent bubble lands in this session
  // mentioning a deploy or delete, refetch. Cheaper than re-rendering the
  // dropdown every keystroke.
  const messages = messagesBySession[sessionId]
  const lastDeployTouch = useMemo(() => {
    if (!messages || messages.length === 0) return null
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i]
      if (m.role !== 'infra-agent') continue
      const meta = deriveMessageMetadata(m)
      if (meta && (meta.deployment_id != null || meta.status === 'deleted')) {
        return m.id
      }
    }
    return null
  }, [messages])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lastDeployTouch != null) refetchDeployments()
  }, [lastDeployTouch, refetchDeployments])

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
            sessionId={Number(sessionId)}
            deployments={deployments}
            selectedDeploymentId={selectedDeploymentId}
            onSelectDeployment={setUserSelectedDeploymentId}
            hadDeployments={hadDeployments}
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

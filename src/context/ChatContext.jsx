import { createContext, useContext, useState } from 'react'
import { mockApps, mockMessages } from '../data/mockData'

const ChatContext = createContext(null)

const infraAgentResponses = [
  "I've provisioned your three-tier architecture:\n\n- **Frontend**: 3 replicas behind a LoadBalancer on port 443\n- **Backend**: API service with ClusterIP on port 3000, 3 replicas\n- **Database**: StatefulSet with 2 replicas and 50Gi persistent volumes\n\nAll resources deployed to the `app-prod` namespace.",
  'HPA is configured for the backend tier:\n\n- **Min replicas**: 2\n- **Max replicas**: 10\n- **CPU target**: 70%\n\nThe backend will automatically scale based on CPU utilisation. Current pod count: 3.',
  'Network policies applied to isolate tier traffic:\n\n- **Frontend → Backend**: Allowed on port 3000\n- **Backend → Database**: Allowed on port 5432\n- **External → Frontend**: Allowed on port 443\n- **All other ingress/egress**: Denied by default\n\nPolicies enforce least-privilege access between all tiers.',
  'Persistent volumes provisioned for the database tier:\n\n- **Storage class**: gp3 (AWS EBS)\n- **Capacity**: 50Gi per replica\n- **Access mode**: ReadWriteOnce\n- **Reclaim policy**: Retain\n\nVolumes are bound and ready. Data will persist across pod restarts.',
]

const sreAgentResponses = [
  'Monitoring stack deployed:\n\n- **Prometheus**: Scraping all pod metrics at 15s intervals\n- **Grafana**: Dashboards for request rate, latency percentiles, error rate, and pod health\n- **Node Exporter**: Host-level CPU, memory, and disk metrics collected\n\nAll targets are healthy and reporting data.',
  'Alert rules configured:\n\n- **Error rate > 1%**: Warning after 5 min, critical after 15 min → PagerDuty\n- **p99 latency > 500ms**: Warning → Slack #on-call\n- **Pod restart loop**: Critical after 3 restarts in 10 min → PagerDuty\n- **HPA at max capacity > 5 min**: Warning → Slack #infra\n\nAll alerts routed through Alertmanager.',
  'Runbooks generated and linked to alert rules:\n\n- **High error rate**: Check pod logs, verify downstream dependencies, roll back if needed\n- **OOM pod**: Increase memory limits, check for memory leaks, review recent deployments\n- **Database connection exhaustion**: Scale connection pool, check for long-running queries\n\nRunbooks stored in the team wiki and auto-linked from Grafana panels.',
  'Incident response configured:\n\n- **P1/P2**: Auto-page on-call via PagerDuty, open incident channel in Slack\n- **P3**: Slack notification to #infra-alerts, auto-create Linear ticket\n- **Post-incident**: Automated timeline generated from alert history and deployment events\n\nMTTR dashboard enabled in Grafana to track incident resolution trends.',
]

export function ChatProvider({ children }) {
  const [apps, setApps] = useState(mockApps)
  const [messages, setMessages] = useState(mockMessages)
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
      const infraContent = infraAgentResponses[Math.floor(Math.random() * infraAgentResponses.length)]
      const infraMessage = { id: `m-${Date.now()}-infra`, role: 'infra-agent', content: infraContent, timestamp: new Date().toISOString() }
      setMessages((prev) => ({ ...prev, [appId]: [...(prev[appId] || []), infraMessage] }))

      setTimeout(() => {
        const sreContent = sreAgentResponses[Math.floor(Math.random() * sreAgentResponses.length)]
        const sreMessage = { id: `m-${Date.now()}-sre`, role: 'sre-agent', content: sreContent, timestamp: new Date().toISOString() }
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

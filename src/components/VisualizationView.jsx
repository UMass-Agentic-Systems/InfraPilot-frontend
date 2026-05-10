import { useEffect, useState } from 'react'
import { LayoutDashboard, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getVisualization } from '../services/api'
import ClusterInfo from './ClusterInfo'
import ArchitectureDiagram from './ArchitectureDiagram'
import MetricsPanel from './MetricsPanel'
import DeploymentSelector from './DeploymentSelector'
import RemediationPlans from './RemediationPlans'

function EmptyState({ hadDeployments }) {
  const headline = hadDeployments
    ? 'All deployments removed'
    : 'Infrastructure not yet provisioned'
  const detail = hadDeployments
    ? 'Every deployment in this session has been deleted. Deploy a new app via chat to see infrastructure here.'
    : 'Use the chat to deploy your app first.'
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
        <LayoutDashboard className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300">{headline}</p>
        <p className="text-xs text-gray-500 mt-1">{detail}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 bg-gray-800 rounded animate-pulse" />
      <div className="h-32 bg-gray-800 rounded-xl animate-pulse" />
      <div className="h-48 bg-gray-800 rounded-xl animate-pulse" />
    </div>
  )
}

export default function VisualizationView({ sessionId, deployments, selectedDeploymentId, onSelectDeployment, hadDeployments = false }) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    if (!selectedDeploymentId || !token) return undefined
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setFetchError('')
    getVisualization(token, selectedDeploymentId, sessionId)
      .then((res) => {
        if (cancelled) return
        setData(res)
      })
      .catch((err) => {
        if (cancelled) return
        setFetchError(err.message || 'Failed to load visualization')
        setData(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedDeploymentId, token, sessionId, reloadTick])

  const matchedData = data && data.deployment_id === selectedDeploymentId ? data : null

  if (!deployments || deployments.length === 0) {
    return <EmptyState hadDeployments={hadDeployments} />
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {deployments.length > 1 ? (
          <DeploymentSelector
            deployments={deployments}
            value={selectedDeploymentId}
            onChange={onSelectDeployment}
          />
        ) : (
          <div className="text-sm text-gray-300">
            <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">Deployment</span>
            {deployments[0].app_name} <span className="text-gray-500">#{deployments[0].deployment_id}</span>
          </div>
        )}
        {matchedData?.status && (
          <span className="text-xs text-gray-400">
            Status: <span className="text-gray-200">{matchedData.status}</span>
          </span>
        )}
      </div>

      {loading && !matchedData && <LoadingSkeleton />}

      {fetchError && !loading && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {matchedData && (
        <>
          {matchedData.error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Live cluster data unavailable. {matchedData.error}</span>
            </div>
          )}

          <ClusterInfo cluster={matchedData.cluster} namespace={matchedData.namespace} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Architecture
              </h3>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
            </div>
            <ArchitectureDiagram tiers={matchedData.tiers} />
          </div>

          <MetricsPanel traffic={matchedData.traffic} />

          <RemediationPlans
            plans={matchedData.remediation_plans}
            onChanged={() => setReloadTick((n) => n + 1)}
          />
        </>
      )}
    </div>
  )
}

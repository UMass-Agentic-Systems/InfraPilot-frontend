import { LayoutDashboard } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { mockVisualizationData } from '../data/mockData'
import ClusterInfo from './ClusterInfo'
import TierCard from './TierCard'
import MetricsPanel from './MetricsPanel'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
        <LayoutDashboard className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300">No visualization data</p>
        <p className="text-xs text-gray-500 mt-1">
          Deploy an application via the Chat tab to see infrastructure metrics here.
        </p>
      </div>
    </div>
  )
}

export default function VisualizationView() {
  const { appId } = useParams()
  const data = mockVisualizationData[appId]

  if (!data) return <EmptyState />

  const { cluster, tiers, traffic } = data

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Cluster header */}
      <div>
        <h2 className="text-sm font-semibold text-gray-100">{cluster.name}</h2>
        <div className="mt-2">
          <ClusterInfo cluster={cluster} />
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(tiers).map(([tierKey, tier]) => (
          <TierCard key={tierKey} tierKey={tierKey} tier={tier} />
        ))}
      </div>

      {/* Traffic metrics */}
      <MetricsPanel traffic={traffic} />
    </div>
  )
}

import { LayoutDashboard } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { mockVisualizationData } from '../data/mockData'
import ClusterInfo from './ClusterInfo'
import ArchitectureDiagram from './ArchitectureDiagram'
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
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Cluster info */}
      <ClusterInfo cluster={cluster} />

      {/* Architecture diagram */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Architecture</h3>
        <ArchitectureDiagram tiers={tiers} />
      </div>

      {/* Traffic metrics */}
      <MetricsPanel traffic={traffic} />
    </div>
  )
}

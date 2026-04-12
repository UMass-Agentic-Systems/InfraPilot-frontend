import { useParams } from 'react-router-dom'
import { mockVisualizationData } from '../data/mockData'
import ClusterInfo from './ClusterInfo'
import TierCard from './TierCard'
import MetricsPanel from './MetricsPanel'

export default function VisualizationView() {
  const { appId } = useParams()
  const data = mockVisualizationData[appId]

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">No visualization data available.</p>
      </div>
    )
  }

  const { cluster, tiers, traffic } = data

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <ClusterInfo cluster={cluster} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(tiers).map(([tierKey, tier]) => (
          <TierCard key={tierKey} tierKey={tierKey} tier={tier} />
        ))}
      </div>

      <MetricsPanel traffic={traffic} />
    </div>
  )
}

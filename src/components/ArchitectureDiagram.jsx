import { Fragment } from 'react'
import { ArrowRight, ArrowDown } from 'lucide-react'
import TierCard from './TierCard'

export default function ArchitectureDiagram({ tiers }) {
  if (!tiers || tiers.length === 0) {
    return (
      <p className="text-sm text-gray-500">No workloads found in cluster.</p>
    )
  }

  return (
    <div>
      {/* Desktop: horizontal flow with arrows between tiers */}
      <div className="hidden lg:flex items-stretch gap-3 overflow-x-auto">
        {tiers.map((tier, i) => (
          <Fragment key={`${tier.name}-${i}`}>
            <div className="flex-1 min-w-[18rem]">
              <TierCard tier={tier} />
            </div>
            {i < tiers.length - 1 && (
              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Mobile: vertical stack with downward arrows */}
      <div className="flex lg:hidden flex-col items-center gap-3">
        {tiers.map((tier, i) => (
          <div key={`${tier.name}-${i}`} className="w-full flex flex-col items-center gap-3">
            <div className="w-full">
              <TierCard tier={tier} />
            </div>
            {i < tiers.length - 1 && (
              <ArrowDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

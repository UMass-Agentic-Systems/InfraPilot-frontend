import { ArrowRight, ArrowDown } from 'lucide-react'
import TierCard from './TierCard'

const TIER_ORDER = ['frontend', 'backend', 'database']

export default function ArchitectureDiagram({ tiers }) {
  return (
    <div>
      {/* Desktop: horizontal with ArrowRight */}
      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
        {TIER_ORDER.map((tierKey, i) => (
          <>
            <TierCard key={tierKey} tierKey={tierKey} tier={tiers[tierKey]} />
            {i < TIER_ORDER.length - 1 && (
              <div key={`arrow-${tierKey}`} className="flex items-center">
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </>
        ))}
      </div>

      {/* Mobile: vertical with ArrowDown */}
      <div className="flex lg:hidden flex-col items-center gap-3">
        {TIER_ORDER.map((tierKey, i) => (
          <div key={tierKey} className="w-full flex flex-col items-center gap-3">
            <div className="w-full">
              <TierCard tierKey={tierKey} tier={tiers[tierKey]} />
            </div>
            {i < TIER_ORDER.length - 1 && (
              <ArrowDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

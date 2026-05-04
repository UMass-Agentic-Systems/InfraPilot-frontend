import { Bell } from 'lucide-react'
import { useChat } from '../context/ChatContext'

export default function PendingPlansBanner() {
  const { pendingPlans } = useChat()
  if (!pendingPlans || pendingPlans.length === 0) return null

  const count = pendingPlans.length

  return (
    <div className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
      <Bell className="w-3.5 h-3.5 flex-shrink-0" />
      <span>
        You have {count} pending remediation plan{count === 1 ? '' : 's'} requiring approval.
      </span>
    </div>
  )
}

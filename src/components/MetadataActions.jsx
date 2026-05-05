import { CheckCircle2, XCircle, LayoutDashboard, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { approvePlan } from '../services/api'
import { VIEW_INFRA_EVENT } from '../pages/DashboardPage'

function StatusPill({ tone, children }) {
  const tones = {
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    amber: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    blue: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
    gray: 'bg-gray-700/40 text-gray-300 border-gray-600/40',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  )
}

export default function MetadataActions({ metadata }) {
  const { sendMessage, refreshPendingPlans, dismissPlan } = useChat()
  const { token } = useAuth()
  const [busy, setBusy] = useState(false)
  const [decided, setDecided] = useState(null) // null | { approved: bool }

  if (!metadata || typeof metadata !== 'object') return null

  // Deploy / delete result
  if (metadata.deployment_id != null && metadata.status && metadata.plan_id == null) {
    const isDeployed = metadata.status === 'deployed'
    const isFailed = metadata.status === 'failed'
    const isDeleted = metadata.status === 'deleted'
    return (
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {isDeployed && <StatusPill tone="green">Deployed</StatusPill>}
        {isFailed && <StatusPill tone="red">Failed</StatusPill>}
        {isDeleted && <StatusPill tone="gray">Deleted</StatusPill>}
        {!isDeployed && !isFailed && !isDeleted && (
          <StatusPill tone="amber">{metadata.status}</StatusPill>
        )}
        {!isDeleted && (
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(VIEW_INFRA_EVENT, { detail: { deploymentId: metadata.deployment_id } })
              )
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            View Infrastructure
          </button>
        )}
      </div>
    )
  }

  // Approval result
  if (metadata.plan_id != null && 'approved' in metadata && 'applied' in metadata) {
    if (metadata.approved && metadata.applied) {
      return (
        <div className="mt-2">
          <StatusPill tone="green">
            <CheckCircle2 className="w-3 h-3" />
            Approved & Applied
          </StatusPill>
        </div>
      )
    }
    if (metadata.approved && !metadata.applied) {
      return (
        <div className="mt-2">
          <StatusPill tone="amber">Approved, applying...</StatusPill>
        </div>
      )
    }
    return (
      <div className="mt-2">
        <StatusPill tone="gray">
          <XCircle className="w-3 h-3" />
          Rejected
        </StatusPill>
      </div>
    )
  }

  // Awaiting approval (background or manual)
  if (metadata.plan_id != null && metadata.status === 'awaiting_approval') {
    if (decided !== null) {
      if (decided.approved) {
        return (
          <div className="mt-2">
            <StatusPill tone="green">
              <CheckCircle2 className="w-3 h-3" />
              Approved &amp; Applied
            </StatusPill>
          </div>
        )
      }
      return (
        <div className="mt-2">
          <StatusPill tone="gray">
            <XCircle className="w-3 h-3" />
            Rejected
          </StatusPill>
        </div>
      )
    }

    const decide = async (approved) => {
      if (busy) return
      setBusy(true)
      try {
        if (token) {
          await approvePlan(token, metadata.plan_id, approved)
          setDecided({ approved })
          if (approved) {
            await refreshPendingPlans()
          } else {
            dismissPlan(metadata.plan_id)
          }
        } else {
          sendMessage(approved ? 'approve' : 'reject')
        }
      } catch {
        // fall back to chat keyword
        sendMessage(approved ? 'approve' : 'reject')
      } finally {
        setBusy(false)
      }
    }

    return (
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md transition-colors"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(false)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-100 rounded-md transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    )
  }

  return null
}

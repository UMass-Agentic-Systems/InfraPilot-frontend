import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { approvePlan } from '../services/api'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// The visualize endpoint's RemediationPlanRef returns only {approved, applied}
// for state — there's no `rejected` field, so we cannot distinguish "rejected"
// from "pending" here. Stick to the three states we can prove from the data.
function statusInfo(plan) {
  if (plan.applied) return { label: 'Applied', tone: 'bg-blue-500/15 text-blue-200 border-blue-500/30' }
  if (plan.approved) return { label: 'Approved', tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  return { label: 'Pending', tone: 'bg-amber-500/15 text-amber-200 border-amber-500/30' }
}

function PlanCard({ plan, onAfterDecision }) {
  const { token } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const isPending = !plan.approved && !plan.applied
  const status = statusInfo(plan)

  const decide = async (approved) => {
    if (!token || busy) return
    setBusy(true)
    setErr('')
    try {
      await approvePlan(token, plan.id, approved)
      onAfterDecision?.()
    } catch (e) {
      setErr(e.message || 'Decision failed')
    } finally {
      setBusy(false)
    }
  }

  const sourceLabel = plan.source === 'background' ? 'Background' : 'Manual'
  const analysis = plan.analysis || ''
  const truncated = analysis.length > 220 && !expanded ? analysis.slice(0, 220) + '…' : analysis

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${status.tone}`}>
            {status.label === 'Pending' && <Clock className="w-3 h-3" />}
            {status.label === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
            {status.label === 'Applied' && <CheckCircle2 className="w-3 h-3" />}
            {status.label}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full border bg-gray-800 text-gray-300 border-gray-700">
            {sourceLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatDate(plan.created_at)}</span>
      </div>

      {analysis && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-left w-full"
        >
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{truncated}</p>
          {analysis.length > 220 && (
            <span className="text-xs text-brand-400 mt-1 inline-block">
              {expanded ? 'Show less' : 'Show more'}
            </span>
          )}
        </button>
      )}

      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}

      {isPending && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md transition-colors"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-100 rounded-md transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default function RemediationPlans({ plans, onChanged }) {
  const { refreshPendingPlans } = useChat()

  if (!plans) return null

  if (plans.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Remediation Plans
        </h3>
        <p className="text-sm text-gray-500">
          No remediation plans — your deployment is healthy.
        </p>
      </div>
    )
  }

  const sorted = plans.slice().sort((a, b) =>
    (b.created_at || '').localeCompare(a.created_at || '')
  )

  const handleAfter = () => {
    refreshPendingPlans()
    onChanged?.()
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Remediation Plans
      </h3>
      <div className="space-y-3">
        {sorted.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onAfterDecision={handleAfter} />
        ))}
      </div>
    </div>
  )
}

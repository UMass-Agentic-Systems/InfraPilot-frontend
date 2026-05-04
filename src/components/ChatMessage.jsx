import { Wrench, Shield } from 'lucide-react'
import { parseMetadata } from '../context/ChatContext'
import MetadataActions from './MetadataActions'
import SreAlertBanner from './SreAlertBanner'

const AGENT_CONFIG = {
  'infra-agent': { Icon: Wrench, colour: 'text-amber-400', label: 'Infra Agent' },
  'sre-agent': { Icon: Shield, colour: 'text-emerald-400', label: 'SRE Agent' },
}

function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function ChatMessage({ message }) {
  const { id, role, content, created_at, metadata_json } = message
  const metadata = parseMetadata(metadata_json)
  const isBackgroundAlert = metadata?.source === 'background'
  const domId = typeof id === 'number' ? `chat-msg-${id}` : undefined

  if (role === 'user') {
    return (
      <div id={domId} className="flex justify-end w-full">
        <div className="bg-brand-600 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%]">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
          <div className="flex justify-end mt-1.5">
            <span className="text-xs text-brand-300">{formatTime(created_at)}</span>
          </div>
        </div>
      </div>
    )
  }

  const cfg = AGENT_CONFIG[role]
  if (!cfg) return null
  const { Icon, colour, label } = cfg

  const inner = (
    <>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${colour}`} />
        <span className={`text-xs font-semibold ${colour}`}>{label}</span>
      </div>
      <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>
      <MetadataActions metadata={metadata} />
      <div className="flex justify-end mt-1.5">
        <span className="text-xs text-gray-500">{formatTime(created_at)}</span>
      </div>
    </>
  )

  return (
    <div id={domId} className="flex justify-start w-full">
      <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[75%]">
        {isBackgroundAlert ? <SreAlertBanner>{inner}</SreAlertBanner> : inner}
      </div>
    </div>
  )
}

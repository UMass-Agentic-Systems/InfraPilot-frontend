import { Wrench, Shield } from 'lucide-react'

const AGENT_CONFIG = {
  'infra-agent': { Icon: Wrench, colour: 'text-amber-400', label: 'Infra Agent' },
  'sre-agent': { Icon: Shield, colour: 'text-emerald-400', label: 'SRE Agent' },
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function ChatMessage({ message }) {
  const { role, content, timestamp } = message

  if (role === 'user') {
    return (
      <div className="flex justify-end w-full">
        <div className="bg-brand-600 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%]">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{content}</p>
          <div className="flex justify-end mt-1.5">
            <span className="text-xs text-brand-300">{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    )
  }

  const { Icon, colour, label } = AGENT_CONFIG[role]

  return (
    <div className="flex justify-start w-full">
      <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[75%]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className={`w-3.5 h-3.5 ${colour}`} />
          <span className={`text-xs font-semibold ${colour}`}>{label}</span>
        </div>
        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">{content}</p>
        <div className="flex justify-end mt-1.5">
          <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

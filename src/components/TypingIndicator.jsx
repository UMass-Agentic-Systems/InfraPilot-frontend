import { Wrench, Shield, Loader2 } from 'lucide-react'

const AGENT_CONFIG = {
  'infra-agent': { Icon: Wrench, colour: 'text-amber-400', label: 'Infra Agent' },
  'sre-agent': { Icon: Shield, colour: 'text-emerald-400', label: 'SRE Agent' },
}

export default function TypingIndicator({ agent }) {
  const cfg = AGENT_CONFIG[agent]
  if (!cfg) return null
  const { Icon, colour, label } = cfg

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <Icon className={`w-4 h-4 ${colour}`} />
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{label} is responding...</span>
    </div>
  )
}

import { GitBranch, HardDrive, FolderOpen } from 'lucide-react'

function Pill({ icon: Icon, label, highlight }) {
  return (
    <span
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border',
        highlight === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : highlight === 'warn'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-gray-800 border-gray-700 text-gray-300',
      ].join(' ')}
    >
      <Icon className={`w-3.5 h-3.5 ${highlight === 'error' ? 'text-red-400' : highlight === 'warn' ? 'text-amber-400' : 'text-brand-400'}`} />
      {label}
    </span>
  )
}

function nodesHighlight(ready, total) {
  if (ready === 0) return 'error'
  if (ready < total) return 'warn'
  return null
}

export default function ClusterInfo({ cluster, namespace }) {
  if (!cluster) return null
  const { k8s_version, nodes } = cluster
  const ready = nodes?.ready ?? 0
  const total = nodes?.total ?? 0

  return (
    <div className="flex flex-wrap gap-2">
      {k8s_version && <Pill icon={GitBranch} label={`k8s ${k8s_version}`} />}
      <Pill
        icon={HardDrive}
        label={`${ready}/${total} Nodes`}
        highlight={nodesHighlight(ready, total)}
      />
      {namespace && <Pill icon={FolderOpen} label={namespace} />}
    </div>
  )
}

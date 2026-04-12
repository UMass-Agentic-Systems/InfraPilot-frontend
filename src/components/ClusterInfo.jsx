import { Cloud, MapPin, GitBranch, HardDrive, FolderOpen } from 'lucide-react'

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

function nodesHighlight(nodesReady, nodesTotal) {
  if (nodesReady === 0) return 'error'
  if (nodesReady < nodesTotal) return 'warn'
  return null
}

export default function ClusterInfo({ cluster }) {
  const { provider, region, version, nodesReady, nodesTotal, namespace } = cluster

  return (
    <div className="flex flex-wrap gap-2">
      <Pill icon={Cloud}      label={provider} />
      <Pill icon={MapPin}     label={region} />
      <Pill icon={GitBranch}  label={`k8s ${version}`} />
      <Pill
        icon={HardDrive}
        label={`${nodesReady}/${nodesTotal} Nodes`}
        highlight={nodesHighlight(nodesReady, nodesTotal)}
      />
      <Pill icon={FolderOpen} label={namespace} />
    </div>
  )
}

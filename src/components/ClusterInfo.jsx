import { Cloud, MapPin, GitBranch, HardDrive, FolderOpen } from 'lucide-react'

function Pill({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300">
      <Icon className="w-3.5 h-3.5 text-brand-400" />
      {label}
    </span>
  )
}

export default function ClusterInfo({ cluster }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Pill icon={Cloud} label={cluster.provider} />
      <Pill icon={MapPin} label={cluster.region} />
      <Pill icon={GitBranch} label={`k8s ${cluster.version}`} />
      <Pill icon={HardDrive} label={`${cluster.nodesReady}/${cluster.nodesTotal} Nodes`} />
      <Pill icon={FolderOpen} label={cluster.namespace} />
    </div>
  )
}

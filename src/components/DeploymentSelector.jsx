export default function DeploymentSelector({ deployments, value, onChange }) {
  if (!deployments || deployments.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="deployment-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Deployment
      </label>
      <select
        id="deployment-select"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
      >
        {deployments.map((d) => (
          <option key={d.deployment_id} value={d.deployment_id}>
            {d.app_name} (#{d.deployment_id})
          </option>
        ))}
      </select>
    </div>
  )
}

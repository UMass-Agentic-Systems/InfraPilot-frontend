export const mockUser = {
  id: '1',
  name: 'Atharva Patil',
  email: 'atharva@example.com',
  avatar: 'https://ui-avatars.com/api/?name=Atharva+Patil&background=6366f1&color=fff',
}

export const mockApps = [
  { id: 'app-1', name: 'E-Commerce Platform', createdAt: '2026-03-01T00:00:00.000Z' },
  { id: 'app-2', name: 'Analytics Dashboard', createdAt: '2026-03-03T00:00:00.000Z' },
]

export const mockMessages = {
  'app-1': [
    {
      id: 'm-1',
      role: 'user',
      content: 'Deploy a three-tier e-commerce app with React frontend, Node.js backend, and PostgreSQL database.',
      timestamp: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'm-2',
      role: 'infra-agent',
      content: 'I\'ll provision your e-commerce platform with the following setup:\n\n- **Frontend**: React app served via Nginx, 3 replicas behind a LoadBalancer on port 443\n- **Backend**: Node.js/Express API, 3 replicas with HPA (2-10 pods, 70% CPU target)\n- **Database**: PostgreSQL StatefulSet, 2 replicas with 50Gi gp3 persistent volumes\n\nAll resources will be deployed to the `ecommerce-prod` namespace.',
      timestamp: '2026-03-01T10:00:01.000Z',
    },
    {
      id: 'm-3',
      role: 'sre-agent',
      content: 'I\'ve configured the monitoring stack for your e-commerce platform:\n\n- **Prometheus**: Scraping metrics from all pods at 15s intervals\n- **Grafana**: Dashboards for request latency, error rates, and pod health\n- **Alerting**: PagerDuty integration with alerts for >1% error rate, >500ms p99 latency, and pod restart loops\n\nRunbooks have been generated for common incident scenarios.',
      timestamp: '2026-03-01T10:00:02.500Z',
    },
    {
      id: 'm-4',
      role: 'user',
      content: 'Can you add autoscaling for the backend based on CPU usage?',
      timestamp: '2026-03-01T10:05:00.000Z',
    },
    {
      id: 'm-5',
      role: 'infra-agent',
      content: 'HPA is already configured for the backend tier. Current settings:\n\n- **Min replicas**: 2\n- **Max replicas**: 10\n- **CPU target**: 70%\n\nThe backend will automatically scale between 2 and 10 pods based on CPU utilisation. Currently running 3 pods at 62% average CPU.',
      timestamp: '2026-03-01T10:05:01.000Z',
    },
    {
      id: 'm-6',
      role: 'sre-agent',
      content: 'I\'ve added scaling-specific alerts:\n\n- **Warning**: When HPA reaches 80% of max replicas (8/10 pods)\n- **Critical**: When HPA is at max capacity (10/10 pods) for >5 minutes\n- **Info**: Slack notification on every scale-up/down event\n\nGrafana dashboard updated with HPA metrics panel.',
      timestamp: '2026-03-01T10:05:02.500Z',
    },
  ],
  'app-2': [
    {
      id: 'm-7',
      role: 'user',
      content: 'Set up an analytics dashboard with Next.js, FastAPI backend, and ClickHouse for data storage.',
      timestamp: '2026-03-03T14:00:00.000Z',
    },
    {
      id: 'm-8',
      role: 'infra-agent',
      content: 'Provisioning your analytics stack:\n\n- **Frontend**: Next.js served via Nginx, 2 replicas with LoadBalancer on port 443\n- **Backend**: FastAPI/Uvicorn, 2 replicas with HPA (2-8 pods, 75% CPU target)\n- **Database**: ClickHouse StatefulSet, 4 replicas with 200Gi io2 volumes for high-throughput analytics\n\nDeploying to `analytics-prod` namespace in us-west-2.',
      timestamp: '2026-03-03T14:00:01.000Z',
    },
    {
      id: 'm-9',
      role: 'sre-agent',
      content: 'Monitoring configured for the analytics platform:\n\n- **Prometheus**: Custom metrics for query execution time and ingestion rate\n- **Grafana**: Real-time dashboards for data pipeline health, query performance, and storage utilisation\n- **Alerts**: Error rate >1.5%, query latency >200ms, storage >80% capacity\n\nIncident response playbook created for data pipeline failures.',
      timestamp: '2026-03-03T14:00:02.500Z',
    },
    {
      id: 'm-10',
      role: 'user',
      content: 'The backend pod seems to have an error. Can you check?',
      timestamp: '2026-03-03T14:30:00.000Z',
    },
    {
      id: 'm-11',
      role: 'infra-agent',
      content: 'I can see one backend pod is in error state:\n\n- `analytics-backend-7d4f8b-x2k9p` — CrashLoopBackOff due to OOM (Out of Memory)\n- Current memory usage is at 82%, exceeding the 512Mi limit\n\nI\'ve increased the memory limit to 1Gi and the pod is restarting. The other 2 pods are handling traffic normally.',
      timestamp: '2026-03-03T14:30:01.000Z',
    },
    {
      id: 'm-12',
      role: 'sre-agent',
      content: 'Incident logged and tracked:\n\n- **Severity**: P3 (degraded performance, no customer impact)\n- **Root cause**: Memory limit too low for analytics query processing\n- **Resolution**: Memory limit increased from 512Mi to 1Gi\n- **Follow-up**: Added memory utilisation alert at 75% threshold\n\nRunbook updated with OOM troubleshooting steps for the analytics backend.',
      timestamp: '2026-03-03T14:30:02.500Z',
    },
  ],
}

export const mockVisualizationData = {
  'app-1': {
    cluster: {
      name: 'infrapilot-prod',
      provider: 'AWS EKS',
      region: 'us-east-1',
      version: '1.29',
      nodesReady: 3,
      nodesTotal: 3,
      namespace: 'ecommerce-prod',
    },
    tiers: {
      frontend: {
        name: 'Frontend',
        tech: ['React', 'Nginx', 'Ingress Controller'],
        pods: { running: 3, pending: 0, error: 0 },
        resources: { cpuUsage: 35, cpuLimit: '500m', memoryUsage: 42, memoryLimit: '512Mi' },
        service: { type: 'LoadBalancer', port: 443 },
      },
      backend: {
        name: 'API / Backend',
        tech: ['Node.js', 'Express', 'ClusterIP Service'],
        pods: { running: 3, pending: 1, error: 0 },
        resources: { cpuUsage: 62, cpuLimit: '1000m', memoryUsage: 71, memoryLimit: '1Gi' },
        service: { type: 'ClusterIP', port: 3000 },
        hpa: { minReplicas: 2, maxReplicas: 10, cpuTarget: 70 },
      },
      database: {
        name: 'Database',
        tech: ['PostgreSQL', 'StatefulSet', 'PersistentVolume'],
        pods: { running: 2, pending: 0, error: 0 },
        resources: { cpuUsage: 48, cpuLimit: '2000m', memoryUsage: 65, memoryLimit: '4Gi' },
        service: { type: 'ClusterIP', port: 5432 },
        storage: { used: '32Gi', size: '50Gi', class: 'gp3' },
      },
    },
    traffic: {
      requestsPerSec: 1247,
      avgLatency: 45,
      p95Latency: 120,
      p99Latency: 280,
      errorRate: 0.3,
      uptime: 99.97,
    },
  },
  'app-2': {
    cluster: {
      name: 'analytics-prod',
      provider: 'AWS EKS',
      region: 'us-west-2',
      version: '1.29',
      nodesReady: 5,
      nodesTotal: 5,
      namespace: 'analytics-prod',
    },
    tiers: {
      frontend: {
        name: 'Frontend',
        tech: ['Next.js', 'Nginx', 'Ingress Controller'],
        pods: { running: 2, pending: 0, error: 0 },
        resources: { cpuUsage: 28, cpuLimit: '500m', memoryUsage: 38, memoryLimit: '512Mi' },
        service: { type: 'LoadBalancer', port: 443 },
      },
      backend: {
        name: 'API / Backend',
        tech: ['FastAPI', 'Uvicorn', 'ClusterIP Service'],
        pods: { running: 2, pending: 0, error: 1 },
        resources: { cpuUsage: 74, cpuLimit: '1000m', memoryUsage: 82, memoryLimit: '2Gi' },
        service: { type: 'ClusterIP', port: 8000 },
        hpa: { minReplicas: 2, maxReplicas: 8, cpuTarget: 75 },
      },
      database: {
        name: 'Database',
        tech: ['ClickHouse', 'StatefulSet', 'PersistentVolume'],
        pods: { running: 4, pending: 0, error: 0 },
        resources: { cpuUsage: 56, cpuLimit: '2000m', memoryUsage: 73, memoryLimit: '8Gi' },
        service: { type: 'ClusterIP', port: 8123 },
        storage: { used: '118Gi', size: '200Gi', class: 'io2' },
      },
    },
    traffic: {
      requestsPerSec: 3842,
      avgLatency: 32,
      p95Latency: 85,
      p99Latency: 210,
      errorRate: 1.2,
      uptime: 99.91,
    },
  },
}

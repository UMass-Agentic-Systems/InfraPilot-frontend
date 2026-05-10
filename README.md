# InfraPilot

**AI-Powered Kubernetes Infrastructure Management for the Five College Community**

> CS 520 Project — University of Massachusetts Amherst (Team 40)

## Team

| Name | GitHub |
|------|--------|
| Jerin Thomas | [@jerinthomas1404](https://github.com/jerinthomas1404) |
| Yash Sant | [@JaycePiltover](https://github.com/JaycePiltover) |
| Pranjeet Dhanapune | [@pranjeet](https://github.com/pranjeet) |
| Atharva Patil | [@atharvadpatil](https://github.com/atharvadpatil) |

## Repositories

- **Backend:** [InfraPilot-backend](https://github.com/UMass-Agentic-Systems/InfraPilot-backend)
- **Frontend:** [InfraPilot-frontend](https://github.com/UMass-Agentic-Systems/InfraPilot-frontend)

## Overview

Managing Kubernetes infrastructure is a significant barrier for student teams, researchers, and small organizations within the Five College community (UMass Amherst, Amherst College, Hampshire College, Mount Holyoke College, and Smith College). InfraPilot addresses this gap by providing an AI-powered backend that automates Kubernetes provisioning and site-reliability engineering through intelligent, conversational agents.

The system targets students, faculty, and lab administrators who need to deploy three-tier applications on shared Kubernetes clusters without mastering `kubectl`, YAML manifests, or observability tooling. It combines a **Provisioning Agent** that translates natural-language requirements into production-ready K8s manifests with an **SRE Agent** that continuously monitors cluster health and proposes auditable remediation plans with human-in-the-loop approval.

Multi-tenant namespace isolation ensures that each user's resources are securely partitioned, making it safe for shared academic environments.

## Features

- **User Authentication & Multi-Tenant Namespace Management** — Secure registration, login, and automatic provisioning of isolated Kubernetes namespaces per user.
- **AI-Powered Infrastructure Provisioning** — Natural-language interface that translates application requirements into production-ready Kubernetes manifests and deploys them to the cluster.
- **Intelligent SRE Monitoring with Human-in-the-Loop Approval** — Continuous cluster health monitoring using AI to analyze warning events, generate remediation plans, and require explicit human approval before applying any fix.
- **Auditable Remediation Trail** — Every SRE-proposed action is persisted with a rationale, approval status, and execution record for full traceability.
- **Deployment State Management** — Persistent tracking of desired-state YAML, deployment status, and history in PostgreSQL.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user and provision a K8s namespace |
| POST | `/api/v1/auth/login` | Authenticate and receive a JWT access token |

### Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/deploy/` | Deploy an application via natural-language requirements |
| GET | `/api/v1/deploy/{deployment_id}` | View deployment status and desired-state YAML |

### Monitoring & Remediation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/monitor/scan` | Trigger an SRE health scan for a deployment |
| GET | `/api/v1/monitor/plans` | List all remediation plans for the authenticated user |
| POST | `/api/v1/monitor/plans/{plan_id}/approve` | Approve or reject a pending remediation plan |

## Quickstart

```bash
git clone https://github.com/UMass-Agentic-Systems/InfraPilot-frontend.git
cd InfraPilot-frontend
npm install
cp .env.example .env        # adjust VITE_API_BASE_URL if backend isn't on localhost:8000
npm run dev                 # http://localhost:5173
npm run build               # production bundle in dist/
```

For prerequisites, environment variables, deployment steps, and CI details, see [BUILD.md](BUILD.md).

## Documentation

- [BUILD.md](BUILD.md) — installation, local development, production build & deployment, CI
- [docs/api_documentation.md](docs/api_documentation.md) — REST + WebSocket API reference consumed by the frontend
- [docs/non_functional.md](docs/non_functional.md) — non-functional requirements, challenges & risks

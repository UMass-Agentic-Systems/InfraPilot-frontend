# Non-Functional Requirements & Risks — InfraPilot Frontend

This document captures the quality attributes the frontend must uphold, plus the risks the team has identified and how they are being mitigated. Installation and deployment are in [BUILD.md](../BUILD.md).

---

## 1. Non-Functional Requirements

### 1.1 Project-Wide Quality Attributes

These were originally tracked in the root README and are inherited from the InfraPilot project as a whole.

- **Data Security** — Passwords are hashed with bcrypt server-side; the frontend stores only short-lived JWTs and never logs them. All authenticated REST and WebSocket calls attach `Authorization: Bearer <jwt>` (REST) or `?token=<jwt>` (WebSocket) — see [src/services/api.js](../src/services/api.js).
- **Tenant Isolation** — The backend enforces a unique Kubernetes namespace per user and rejects cross-user access. The frontend never assumes another user's data is reachable; ownership is always verified server-side.
- **Auditability** — Every remediation plan persists rationale, approval decision, and execution status with timestamps. The frontend surfaces these fields without modification in the Remediation Plans section.
- **Availability** — The backend `/health` endpoint returns `200 OK` even when the database or K8s cluster is temporarily unreachable. The frontend mirrors this resilience by rendering fallback states (cluster info hidden, traffic metrics unavailable banner) rather than crashing when partial data arrives.

### 1.2 Frontend-Specific Quality Attributes

- **Responsiveness** — The UI must remain interactive while REST calls and WebSocket frames are in flight. Loading skeletons (chat history, visualization), per-button disabled states (chat input, approve/reject), and typing indicators keep the user informed without blocking the thread.
- **Resilience** — WebSocket disconnects are expected. The chat client auto-reconnects with exponential backoff (1s → 2s → 4s → 8s → 30s, max 5 attempts) and replays missed messages by re-fetching session history on every successful reconnect.
- **Accessibility** — All interactive controls are keyboard-reachable; focus state is visible against the dark theme; colour is never the sole signal (status badges pair colour with a label or icon). Brand and semantic colours are tuned for AA contrast on the `#030712` background.
- **Browser Support** — Modern evergreen browsers — current Chrome, Edge, Firefox, and Safari. Vite 7 + React 19 do not target legacy IE/old-Edge; users on outdated browsers will see a blank page, which is an accepted limitation.
- **Performance Budget** — Initial JS bundle from `npm run build` should remain under ~250 KB gzipped. TailwindCSS v4 and Vite's tree-shaking keep CSS small; Lucide icons are imported per-icon to avoid pulling the full set.
- **Observability** — The frontend logs unexpected WebSocket close codes and REST error payloads to the browser console for debugging. No production telemetry/analytics pipeline is configured at this time (tracked under §2.6 below).

---

## 2. Challenges & Risks

### 2.1 LLM Output Reliability

The Provisioning Agent depends on Gemini-Pro to generate valid Kubernetes YAML from natural language. LLMs may produce malformed manifests or insecure defaults, which would surface in the chat as a failed deploy or partially-rendered visualization.

**Mitigations**
- Backend validates YAML with `yaml.safe_load()` before applying.
- Backend uses low LLM temperature and structured prompts.
- Frontend renders deploy result metadata with a clear failure badge (`status: failed`) so users see errors immediately rather than an inconsistent visualization.

### 2.2 Kubernetes Integration Complexity

Differences between Minikube, managed clusters (GKE/EKS), and bare-metal setups introduce inconsistencies in API behaviour and RBAC policies. The visualization view depends on backend access to the live cluster.

**Mitigations**
- Minikube is the documented development baseline (see backend README).
- Frontend renders a "Live cluster data unavailable" banner and falls back to whatever partial data the API returned, instead of failing closed.

### 2.3 Project Timeline & Dependency Drift

The project depends on rapidly evolving libraries (React 19, Vite 7, TailwindCSS v4, LangGraph, LangChain) and must ship within an academic semester.

**Mitigations**
- Frontend dependencies are pinned by minor version in [package.json](../package.json) and locked in `package-lock.json`.
- CI runs `npm ci` (lockfile-strict) on every push to catch upstream breakage early.
- Scope was prioritised around the core workflow (auth → chat → deploy → SRE approve → visualize); peripheral features were deferred.

### 2.4 WebSocket Reliability

The chat experience depends on a long-lived WebSocket. Mid-conversation disconnects (network drops, backend restarts, idle timeouts on intermediate proxies) would be fatal if not handled.

**Mitigations**
- Auto-reconnect with exponential backoff and capped retries.
- Connection state is surfaced visibly in the chat header (`connecting`, `connected`, `disconnected`, `error`) so the user always knows whether their messages are being delivered.
- Full message history is reloaded after every reconnect to capture frames received while disconnected (especially background SRE alerts).
- Manual Retry button after 5 failed attempts to avoid burning client CPU in a permanent-failure scenario.

### 2.5 Build-Time Environment Coupling

Vite inlines `VITE_*` variables into the JS bundle at build time. A single artifact cannot be promoted across environments — staging and production each need their own build.

**Mitigations**
- Documented prominently in [BUILD.md](../BUILD.md) §3 and §6.
- CI builds without a `VITE_API_BASE_URL` override (relies on `.env.example` default) so that environment-specific builds happen in the deploy pipeline, not in CI.

### 2.6 Limited Production Telemetry

There is no error reporting (Sentry), analytics, or RUM pipeline wired into the frontend today. Production issues surface only when users report them.

**Mitigations** *(planned, not yet implemented)*
- Add a thin error-reporting layer (Sentry or similar) in a follow-up sprint.
- Treat this as a known gap rather than blocking the academic-deliverable scope.

### 2.7 Cross-Tab State Sync

If a user opens the same chat session in two browser tabs, both tabs will independently establish WebSockets and may show divergent optimistic state.

**Mitigations**
- Documented as a known limitation; the backend persists every message so reloading either tab reconciles state.
- A `BroadcastChannel`-based sync layer is a candidate follow-up but is out of scope for the initial release.

---

## See Also

- [README.md](../README.md) — project overview
- [BUILD.md](../BUILD.md) — installation & deployment
- [docs/api_documentation.md](api_documentation.md) — REST + WebSocket API reference

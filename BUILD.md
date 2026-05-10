# Build, Install & Deploy — InfraPilot Frontend

This document covers everything required to run the InfraPilot frontend locally and to ship a production build. The frontend is a Vite + React 19 single-page application that talks to the [InfraPilot-backend](https://github.com/UMass-Agentic-Systems/InfraPilot-backend) over REST and WebSocket.

---

## 1. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | >= 18 (CI uses 20) | `node --version` |
| npm | >= 9 | Bundled with Node 18+ |
| InfraPilot backend | Running | Default expected at `http://localhost:8000` |

The frontend will start without the backend running, but every page that requires authentication or live data (login, dashboard, chat, visualization) will fail until the backend is reachable.

---

## 2. Installation

```bash
git clone https://github.com/UMass-Agentic-Systems/InfraPilot-frontend.git
cd InfraPilot-frontend
npm install
```

`npm install` resolves the lockfile in [package-lock.json](package-lock.json). For reproducible installs (matching CI), use `npm ci` instead.

---

## 3. Environment Configuration

Copy the example env file and adjust if your backend runs on a non-default host:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL for REST calls. The WebSocket base URL is derived automatically by replacing the scheme (`http` → `ws`, `https` → `wss`). See [src/services/api.js](src/services/api.js#L1-L2). |

> **Note:** Vite inlines `VITE_*` variables at **build time**, not runtime. Production deployments must rebuild with the correct value rather than relying on a runtime env var.

---

## 4. Local Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the Vite dev server with HMR. Defaults to `http://localhost:5173`. |
| `npm run lint` | Run ESLint (flat config in [eslint.config.js](eslint.config.js)). |
| `npm test` | Run unit/component tests with Vitest. |

The dev server proxies nothing — the frontend calls `VITE_API_BASE_URL` directly. Make sure the backend has CORS configured for `http://localhost:5173` (the backend's default development CORS allowlist already covers this).

---

## 5. Continuous Integration

CI is defined in [.github/workflows/ci.yml](.github/workflows/ci.yml).

| Step | Command |
|------|---------|
| Triggers | `push` to `main`, `pull_request` targeting `main` |
| Runtime | `ubuntu-latest`, Node.js 20 (with npm cache) |
| Install | `npm ci` |
| Lint | `npm run lint` |
| Build | `npm run build` |

A failing lint or build blocks the PR. CI does not currently publish artifacts — deployment is performed separately by the static host.

---

## 6. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Login or register hangs / network error | Backend not running, or `VITE_API_BASE_URL` incorrect | Confirm backend is up at the configured URL; restart `npm run dev` after editing `.env`. |
| WebSocket fails to connect after login | Backend reachable for REST but blocking WebSocket origin, or HTTPS/HTTP mismatch | Ensure `VITE_API_BASE_URL` scheme matches your backend (HTTPS frontend must use HTTPS backend, otherwise mixed-content blocks `ws://`). |
| Blank page in production with REST 404s | Forgot to set `VITE_API_BASE_URL` at build time | Rebuild with the correct env var; remember Vite inlines it during `npm run build`. |
| Refreshing `/dashboard/:id` returns 404 from host | Static host not configured for SPA fallback | Configure `try_files` / rewrite rule to serve `index.html` for unknown paths. |
| `401` toasts appear and you are bounced to `/login` | JWT expired or backend secret mismatch | Re-login. The frontend listens for the `auth:unauthorized` event raised by [src/services/api.js](src/services/api.js#L4) on any 401 response. |

---

## See Also

- [README.md](README.md) — project overview and feature summary
- [docs/api_documentation.md](docs/api_documentation.md) — REST + WebSocket API reference
- [docs/non_functional.md](docs/non_functional.md) — non-functional requirements & risks

# API Documentation — InfraPilot Frontend ↔ Backend

This file is the authoritative reference for every backend endpoint and WebSocket frame consumed by the InfraPilot frontend. All entries are derived from the centralised API client at [src/services/api.js](../src/services/api.js); any new endpoint must be added there and documented here.

---

## 1. Overview

### 1.1 Base URL

| Channel | Source | Resolution |
|---------|--------|-----------|
| REST | `import.meta.env.VITE_API_BASE_URL` | Defaults to `http://localhost:8000`. Set at build time (Vite inlines). |
| WebSocket | Derived from REST base | Scheme rewrite: `http` → `ws`, `https` → `wss`. Implemented in [src/services/api.js](../src/services/api.js#L1-L2). |

### 1.2 Authentication

| Channel | Mechanism |
|---------|-----------|
| REST | `Authorization: Bearer <jwt>` header on every request except `/api/v1/auth/*`. |
| WebSocket | `?token=<jwt>` query parameter on the connection URL. |

The JWT is issued by the backend on `login` / `register` and stored client-side in `AuthContext` and `localStorage`. On any HTTP `401`, the API client dispatches an `auth:unauthorized` window event ([src/services/api.js:4](../src/services/api.js#L4)) which the auth context handles by clearing the token and redirecting to `/login`.

### 1.3 Content Type

All REST requests and responses use `application/json; charset=utf-8`. Empty `204 No Content` responses (e.g. `DELETE`) resolve to `null` from the API client.

### 1.4 Error Surface

| Status | API Client Behaviour |
|--------|----------------------|
| `2xx` | Resolves with parsed JSON (or `null` for `204`). |
| `401` | Dispatches `auth:unauthorized`; throws `Error('Unauthorized')`. |
| `4xx` / `5xx` (other) | Throws `Error` with `.status`, `.data`, and a message derived from `data.detail` if present, otherwise `res.statusText`. |
| Network failure | Native `fetch` rejection bubbles up. |

---

## 2. Authentication Endpoints

### 2.1 `POST /api/v1/auth/register`

Register a new user and provision a Kubernetes namespace.

| | |
|---|---|
| Auth | None |
| Client | `authRegister(email, password)` — [src/services/api.js:48](../src/services/api.js#L48) |

**Request**

```json
{ "email": "user@example.com", "password": "min-8-chars" }
```

**Response** — `200 OK`

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

**Errors**

| Status | Meaning |
|--------|---------|
| `409` | Email already registered |
| `422` | Validation error (short password, invalid email) |

---

### 2.2 `POST /api/v1/auth/login`

Authenticate an existing user.

| | |
|---|---|
| Auth | None |
| Client | `authLogin(email, password)` — [src/services/api.js:45](../src/services/api.js#L45) |

**Request**

```json
{ "email": "user@example.com", "password": "..." }
```

**Response** — `200 OK`

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

**Errors**

| Status | Meaning |
|--------|---------|
| `401` | Invalid credentials |

---

## 3. Chat Session Endpoints

All endpoints in this section require `Authorization: Bearer <jwt>`.

### 3.1 `POST /api/v1/chat/sessions`

Create a new chat session.

| | |
|---|---|
| Client | `createSession(token, title)` — [src/services/api.js:52](../src/services/api.js#L52) |

**Request**

```json
{ "title": "E-Commerce Platform Deploy" }
```

**Response** — `200 OK`

```json
{
  "id": "uuid",
  "title": "E-Commerce Platform Deploy",
  "created_at": "2026-05-09T10:00:00Z",
  "updated_at": "2026-05-09T10:00:00Z"
}
```

---

### 3.2 `GET /api/v1/chat/sessions`

List all sessions owned by the authenticated user, used to populate the sidebar.

| | |
|---|---|
| Client | `listSessions(token)` — [src/services/api.js:55](../src/services/api.js#L55) |

**Response** — `200 OK`

```json
[
  { "id": "uuid", "title": "...", "created_at": "...", "updated_at": "..." }
]
```

Frontend sorts the result by `updated_at DESC` before rendering.

---

### 3.3 `GET /api/v1/chat/sessions/{id}`

Fetch a single session with its full message history. Called on session open and after every WebSocket reconnect to reconcile any messages received while disconnected.

| | |
|---|---|
| Client | `getSession(token, id)` — [src/services/api.js:58](../src/services/api.js#L58) |

**Response** — `200 OK`

```json
{
  "id": "uuid",
  "title": "...",
  "created_at": "...",
  "updated_at": "...",
  "messages": [
    {
      "id": "uuid",
      "role": "user | infra-agent | sre-agent",
      "content": "string",
      "metadata_json": { "...": "..." },
      "position": 0,
      "created_at": "..."
    }
  ]
}
```

**Errors**

| Status | Meaning |
|--------|---------|
| `404` | Session does not exist or is not owned by the caller |

---

### 3.4 `DELETE /api/v1/chat/sessions/{id}`

Permanently delete a session and its messages.

| | |
|---|---|
| Client | `deleteSession(token, id)` — [src/services/api.js:61](../src/services/api.js#L61) |

**Response** — `204 No Content`

---

### 3.5 `GET /api/v1/chat/sessions/{sessionId}/deployments`

List the deployments associated with a session. Used by the visualization tab to enumerate selectable deployments.

| | |
|---|---|
| Client | `listSessionDeployments(token, sessionId)` — [src/services/api.js:64](../src/services/api.js#L64) |

**Response** — `200 OK`

```json
[
  { "id": "uuid", "status": "deployed | failed", "created_at": "..." }
]
```

---

## 4. WebSocket Protocol

`WS /api/v1/chat/sessions/{sessionId}/ws?token={jwt}` — established by `connectWebSocket(sessionId, token)` ([src/services/api.js:83](../src/services/api.js#L83)).

A single WebSocket per browser tab is open at any time; switching sessions closes the previous socket and opens a new one. Frames are JSON objects with a `type` discriminator.

### 4.1 Client → Server Frames

| Type | Payload | When |
|------|---------|------|
| `message` | `{ "type": "message", "content": "<user text>" }` | User sends a chat message via the input field. |
| `approve` | `{ "type": "approve", "plan_id": "<uuid>" }` | User clicks the "Approve" inline action on a remediation plan. |
| `reject` | `{ "type": "reject", "plan_id": "<uuid>" }` | User clicks the "Reject" inline action on a remediation plan. |

> The exact payload shape for `approve` / `reject` follows backend conventions documented in `requirements_backend.md §6.4`. The frontend may also send approval as a free-text `message` ("approve", "reject") which the backend's intent detection routes to the SRE agent.

### 4.2 Server → Client Frames

| Type | Payload Sketch | UI Effect |
|------|---------------|-----------|
| `agent_response` | `{ "type": "agent_response", "message": { "id", "role", "content", "metadata_json", "position", "created_at" } }` | Append to the active session's message list; clear the corresponding agent's typing indicator. |
| `sre_alert` | `{ "type": "sre_alert", "message": { ..., "metadata_json": { "source": "background", ... } } }` | Append to the message list and trigger a top-right toast notification. |
| `typing` | `{ "type": "typing", "agent": "infra-agent \| sre-agent", "is_typing": true \| false }` | Toggle the agent-specific typing indicator. |
| `error` | `{ "type": "error", "detail": "<string>" }` | Render an inline error in the chat. |

### 4.3 Close Codes

| Code | Meaning | Frontend Action |
|------|---------|----------------|
| `1000` | Normal close | Attempt auto-reconnect. |
| `4001` | Unauthorized (invalid/expired JWT) | Clear auth state, redirect to `/login`. |
| `4004` | Session not found or not owned | Navigate to `/dashboard`, show error toast. |
| `4010` | Session deleted server-side | Remove session from sidebar, navigate to `/dashboard`. |
| Other / abnormal | Network drop, server crash | Auto-reconnect with exponential backoff (1s → 2s → 4s → 8s → 30s, max 5 attempts). |

### 4.4 Reconnect Semantics

After every successful (re)connection the client calls [§3.3](#33-get-apiv1chatsessionsid) to reload the full message history so any frames sent while the socket was closed (especially `sre_alert`) are not lost. This guarantees `sre_alert` and `agent_response` frames sent during a brief disconnect are not silently lost.

---

## 5. Visualization Endpoint

### 5.1 `GET /api/v1/visualize/{deploymentId}`

Fetch live cluster state for a deployment, used to render the Visualization tab.

| | |
|---|---|
| Auth | Bearer JWT |
| Client | `getVisualization(token, deploymentId)` — [src/services/api.js:68](../src/services/api.js#L68) |

**Response** — `200 OK`

```json
{
  "deployment_id": "uuid",
  "app_name": "string",
  "status": "deployed | failed",
  "cluster": {
    "provider": "AWS EKS",
    "region": "us-east-1",
    "version": "1.29",
    "nodes_ready": 3,
    "nodes_total": 3,
    "namespace": "user-<id>"
  },
  "tiers": [
    {
      "name": "frontend",
      "kind": "Deployment",
      "containers": [{ "image": "nginx:1.25" }],
      "pods": { "running": 2, "pending": 0, "failed": 0 },
      "resources": { "cpu_pct": 35, "memory_pct": 48 },
      "service": { "type": "ClusterIP", "port": 80 },
      "hpa": { "min": 2, "max": 5, "cpu_target": 70 },
      "storage": null
    }
  ],
  "traffic": {
    "rps": 12.4,
    "avg_latency_ms": 88,
    "p95_latency_ms": 210,
    "p99_latency_ms": 340,
    "error_rate_pct": 0.2,
    "uptime_pct": 99.95
  },
  "remediation_plans": [
    {
      "id": "uuid",
      "analysis": "string",
      "status": "pending | approved | rejected | applied",
      "approved": false,
      "applied": false,
      "source": "manual | background",
      "created_at": "..."
    }
  ]
}
```

**Fallback Behaviour**

When the backend cannot reach the live cluster, it returns a partial payload with `cluster: null` and/or `tiers: null`. The frontend displays a "Live cluster data unavailable" banner and renders whatever sections do have data.

**Errors**

| Status | Meaning |
|--------|---------|
| `404` | Deployment not found or not owned by caller |

---

## 6. Monitoring & Remediation Endpoints

All endpoints in this section require `Authorization: Bearer <jwt>`.

### 6.1 `GET /api/v1/monitor/plans`

List all remediation plans owned by the authenticated user. Called when a session is opened to detect background plans that have not yet been surfaced in chat.

| | |
|---|---|
| Client | `listPlans(token)` — [src/services/api.js:72](../src/services/api.js#L72) |

**Response** — `200 OK`

```json
[
  {
    "id": "uuid",
    "deployment_id": "uuid",
    "analysis": "string",
    "plan_json": { "...": "..." },
    "approved": false,
    "applied": false,
    "source": "manual | background",
    "status": "pending | approved | rejected | applied",
    "created_at": "..."
  }
]
```

---

### 6.2 `POST /api/v1/monitor/plans/{planId}/approve`

Approve or reject a pending remediation plan. The frontend uses this for the "Approve" / "Reject" inline buttons in the Remediation Plans section of the visualization tab; equivalent approvals from inside chat are sent over the WebSocket (§4.1).

| | |
|---|---|
| Client | `approvePlan(token, planId, approved)` — [src/services/api.js:75](../src/services/api.js#L75) |

**Request**

```json
{ "approved": true }
```

**Response** — `200 OK` — updated plan object (same shape as §6.1 entries).

**Errors**

| Status | Meaning |
|--------|---------|
| `404` | Plan not found or not owned |
| `409` | Plan already approved/rejected — cannot transition again |

---

## 7. Cross-Reference

| Concern | Location |
|---------|----------|
| API client implementation | [src/services/api.js](../src/services/api.js) |
| Build / deploy / env vars | [BUILD.md](../BUILD.md) |
| Non-functional requirements | [docs/non_functional.md](non_functional.md) |

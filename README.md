# EventFlow — Real-Time Event Analytics Dashboard

A full-stack TypeScript system for collecting events and displaying analytics in a live dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js · Express · TypeScript |
| Storage | SQLite (better-sqlite3) |
| Real-time | WebSocket (ws) |
| Frontend | React 18 · Vite · TypeScript |
| Charts | Recharts |
| Styling | Vanilla CSS (light mode) |
| Monorepo | npm workspaces |

---

## Project Structure

```
/
├── package.json                  ← workspace root + concurrently dev script
├── packages/
│   ├── shared/                   ← shared TypeScript types
│   │   └── src/types.ts
│   ├── server/                   ← Express + SQLite + WebSocket
│   │   └── src/
│   │       ├── index.ts          ← app entry, HTTP + WS server
│   │       ├── db.ts             ← SQLite setup & schema
│   │       ├── ws.ts             ← WebSocket broadcaster
│   │       └── routes/
│   │           ├── events.ts     ← POST /api/events
│   │           └── analytics.ts  ← GET /api/analytics/*
│   └── dashboard/                ← React + Vite frontend
│       └── src/
│           ├── App.tsx
│           ├── hooks/
│           │   ├── useAnalytics.ts
│           │   └── useWebSocket.ts
│           └── components/
│               ├── KPICards.tsx
│               ├── TimeSeriesChart.tsx
│               ├── BreakdownChart.tsx
│               ├── FunnelChart.tsx
│               ├── LiveFeed.tsx
│               └── EventSimulator.tsx
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# 1. Install all dependencies (root + all workspaces)
npm install

# 2. Start both server and dashboard concurrently
npm run dev
```

- **Dashboard** → http://localhost:5173  
- **API Server** → http://localhost:4000  
- **Health check** → http://localhost:4000/health

---

## API Reference

### Ingest Events

```
POST /api/events
Content-Type: application/json
```

**Single event:**
```json
{
  "name": "page_view",
  "userId": "user-001",
  "sessionId": "sess-abc",
  "properties": { "path": "/home" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Batch (array):**
```json
[
  { "name": "signup", "userId": "user-002" },
  { "name": "purchase", "userId": "user-002", "properties": { "amount": 49.99 } }
]
```

**Response:**
```json
{ "ingested": 2, "ids": ["uuid1", "uuid2"] }
```

### Analytics Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/analytics/all` | All analytics in one request (dashboard initial load) |
| `DELETE /api/analytics/all` | Deletes all events from the database |
| `GET /api/analytics/overview` | Alias for all |
| `GET /api/analytics/timeseries` | Events per minute (last 60 min) |
| `GET /api/analytics/breakdown` | Event counts by type |
| `GET /api/analytics/funnel` | Conversion funnel: page_view → click → signup → purchase → error |
| `GET /api/analytics/recent` | Latest 50 raw events |

### WebSocket

Connect to `ws://localhost:4000/ws` (proxied via Vite to `/ws` in dev).

**Messages from server:**

```json
{ "type": "NEW_EVENT", "payload": { "id": "...", "name": "click", "userId": "...", ... } }
```

---

## Dashboard Features

- **KPI Cards** — Total events, unique users, sessions, events/min
- **Time Series Area Chart** — Events per minute over last 60 minutes
- **Conversion Funnel** — page_view → click → signup → purchase → error with drop-off rates
- **Event Breakdown** — Donut chart + bar list of events by type
- **Live Event Feed** — Real-time scrolling feed via WebSocket
- **Event Simulator** — Fire individual events or a 20-event burst with configurable user/session IDs

---

## Live Demo Walkthrough

1. Open http://localhost:5173
2. In the **Event Simulator** (bottom-right), set a User ID and Session ID
3. Click individual event buttons (page_view, signup, purchase, etc.)
4. Watch the **Live Feed** update instantly via WebSocket
5. KPI cards and charts refresh every 8 seconds (or on event send)
6. Hit **🚀 Burst: 20 Random Events** to stress-test the ingestion pipeline
7. Observe the Time Series chart, Funnel, and Breakdown populate with data

---

## Event Schema

```typescript
interface RawEvent {
  id: string;           // UUID (server-generated)
  name: string;         // Event name (page_view, click, etc.)
  userId: string;       // User identifier
  sessionId: string;    // Session identifier
  properties: Record<string, unknown>;  // Arbitrary metadata
  timestamp: string;    // ISO-8601
}
```

Data persists to `packages/server/data/analytics.db` (SQLite file).

---

## Architecture

```
Browser (React + Vite)
  │
  ├── POST /api/events ──────► Express Server ──► SQLite DB
  │                                  │
  │◄── WebSocket NEW_EVENT ◄──────────┤
  │                                  │
  └── GET /api/analytics/all ────────┘
```

Events are ingested synchronously into SQLite. After each write, the server broadcasts a `NEW_EVENT` WebSocket message to all connected dashboard clients for instant live updates.

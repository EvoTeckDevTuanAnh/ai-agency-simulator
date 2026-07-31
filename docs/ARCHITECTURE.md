# Architecture

## Monorepo Structure

```
ai-agency-simulator/
├── apps/
│   ├── web-dashboard/       # React + Vite + R3F frontend
│   ├── api-gateway/         # NestJS — single entry point for frontend
│   ├── auth-service/        # NestJS — authentication (hardcoded password + JWT)
│   └── agent-service/       # NestJS — agent CRUD (in-memory)
├── packages/
│   ├── contracts/           # Shared DTOs, types, enums
│   ├── config/              # Shared environment / config loader
│   ├── logger/              # Shared logger
│   └── validation/          # Shared validation schemas
├── infrastructure/
│   ├── docker/              # Docker Compose (future)
│   └── scripts/             # Dev helpers
├── docs/
│   ├── ROADMAP.md
│   └── ARCHITECTURE.md
└── AGENTS.md
```

## Data Flow

```
User Browser
    │
    ▼
web-dashboard (React + Vite)
    │  REST
    ▼
api-gateway (NestJS)
    ├──▶ auth-service  ──▶ in-memory session store
    └──▶ agent-service ──▶ in-memory agent store
```

- Frontend never talks directly to auth-service or agent-service.
- All requests pass through API Gateway (single endpoint for the browser).
- 3D scene data (positions, animations, state) is runtime-only — NOT sent to backend every frame.
- Agent state changes (add, remove) are synced via API calls.

## Service Boundaries

| Service        | Responsibility                                  | Storage    |
|----------------|-------------------------------------------------|------------|
| web-dashboard  | UI rendering, 3D scene, user interaction        | None       |
| api-gateway    | Route requests, auth middleware, error mapping  | None       |
| auth-service   | Login/logout, JWT issue/verify                  | In-memory  |
| agent-service  | Agent CRUD, naming (auto-increment), validation | In-memory  |

## Key Design Decisions
- In-memory storage for MVP (swap to Notion later per requirement 26)
- Each service independently runnable via pnpm
- 3D logic separated from React components (state machines in pure TS)
- Director is a special entity: fixed, non-deletable, non-editable

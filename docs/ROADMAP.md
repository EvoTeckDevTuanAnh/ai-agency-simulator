# Roadmap

## Phase 1 — Monorepo Foundation
- Init pnpm workspace with `apps/`, `packages/`, `infrastructure/`, `docs/`
- Configure TypeScript strict, ESLint, Prettier
- Create `packages/` (contracts, config, logger, validation) as minimal TS libs
- Verify build pipeline

## Phase 2 — Auth Service
- NestJS `auth-service` with hardcoded password login
- JWT-based session (persists until logout)
- Login/logout endpoints + middleware in API Gateway

## Phase 3 — API Gateway
- NestJS `api-gateway` routing to auth and agent services
- REST endpoints for agent CRUD

## Phase 4 — Agent Service
- NestJS `agent-service` with in-memory CRUD
- Agent entity: name, role (Developer|Designer|Content|Tester), status, position
- Auto-increment naming (Agent 01, Agent 02…) — never reuse deleted numbers
- Director is fixed, non-deletable, non-editable
- Max 5 agents + director

## Phase 5 — 3D Office (Frontend Core)
- React + Vite + React Three Fiber scene
- Fixed orthographic/tilted camera (no rotate, no zoom, drag to pan)
- Low-poly office — no roof, walls, floor, desks, chairs, computers
- Director room — director always seated working
- Agents spawn at door → walk to desk → sit → work → stand → wander → return → loop

## Phase 6 — Agent Management Screen
- Sidebar nav switching between Office and Management views
- Card layout with search by name/role
- Click card or 3D character → detail popup
- Add / remove agents (desk removed with agent)
- Desk auto-arrangement in rows

## Phase 7 — UI Polish & Integration
- Connect frontend to API Gateway
- Full CRUD flow through all layers
- Error handling, loading states
- Final integration test

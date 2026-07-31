# AI Agency Simulator — Project Rules

## Tech Stack
- TypeScript (strict), pnpm workspace, React + Vite, Three.js / React Three Fiber
- NestJS backend, REST between frontend and API Gateway

## Architecture
- Monorepo: `apps/` (web-dashboard, api-gateway, auth-service, agent-service), `packages/` (contracts, config, logger, validation), `infrastructure/`, `docs/`
- Services run independently. No Redis, message broker, or K8s in MVP.
- 3D runtime data is NOT sent to backend every frame.

## Code Quality
- Max 700 lines per source file
- No God classes/components
- DTOs, types, enums, contracts in separate files
- No hardcoded secrets. No tokens/passwords in frontend code
- Strict TypeScript enabled. ESLint + Prettier configured.
- Gameplay logic decoupled from React UI. State machine decoupled from 3D model component.

## Workflow
- Do not install packages until actually needed
- Do not build multiple phases at once
- Do not change scope beyond current task
- Read existing structure before editing
- Run lint, test, build after each feature
- Do not declare completion without testing

## Success Check
Only print `[SUCCESS] <PHASE_NAME>` when ALL pass:
- Install succeeds
- TypeScript compiles
- Lint passes
- Phase tests pass
- Production build succeeds
- Acceptance criteria verified

On failure: print cause, fix, recheck. Never print SUCCESS with errors.

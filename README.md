# AI Agency Simulator

A 3D office simulation with agent management, built as a NestJS + React monorepo.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Run all services
pnpm dev
```

- **Dashboard**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Agent Service**: http://localhost:3002
- **Auth Service**: http://localhost:3003

## Docker

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop
docker compose down
```

Dashboard: http://localhost (port 80)
API Gateway: http://localhost:3000

## Windows Launcher (EXE)

A self-contained Windows executable that starts all services via Docker Compose with one click.

### Requirements

- Windows 10 or later (x64)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Build the EXE

```bash
# From the project root:
.\scripts\build-windows-launcher.ps1

# Or via pnpm:
pnpm launcher:build
```

The EXE is created at `dist/windows/AiAgencySimulator.exe`.

### Usage

Double-click `AiAgencySimulator.exe` or run from terminal:

| Command | Description |
|---------|-------------|
| `AiAgencySimulator.exe` | Start all services and open browser |
| `--start` | Start all services without opening browser |
| `--stop` | Stop all services (`docker compose down`) |
| `--restart` | Restart all services |
| `--status` | Show container status |
| `--logs` | Show recent container logs |

### What the Launcher Does

1. Finds the project root (walks up from the EXE location)
2. Verifies `docker-compose.yml` and `.env` exist
3. Checks Docker is installed, engine is running, compose is available
4. Runs `docker compose up -d --build`
5. Waits for all services to be healthy (polling health endpoints)
6. Opens the dashboard in your default browser
7. Displays progress and error messages

### Important Notes

- The EXE does **not** contain any passwords, tokens, or secrets
- Copy `.env.example` to `.env` and configure it before running
- Containers continue running after closing the launcher window
- Use `--stop` to shut down containers
- The EXE is self-contained (no .NET Runtime required)

## Notion Persistence

Optionally store agent data in a Notion database instead of the local JSON file.

### 1. Create a Notion Integration

1. Go to https://www.notion.so/profile/integrations
2. Click "New Integration"
3. Name it (e.g., "AI Agency Simulator")
4. Select the workspace where your database will live
5. Copy the **Internal Integration Secret** (the `NOTION_TOKEN`)

### 2. Create the Database

Create a new database in Notion with these properties:

| Property        | Type      | Notes                                                        |
|-----------------|-----------|--------------------------------------------------------------|
| `id`            | Title     | Primary key (e.g., `director-001`, `agent-01`)              |
| `sequenceNumber` | Number   | Auto-incremented integer                                     |
| `name`          | Rich Text | Agent display name                                            |
| `role`          | Select    | Options: `DIRECTOR`, `DEVELOPER`, `DESIGNER`, `CONTENT`, `TESTER` |
| `isDirector`    | Checkbox  | `true` for the director                                       |
| `createdAt`     | Date      | ISO timestamp                                                 |

### 3. Share the Database

1. Open your database page in Notion
2. Click **Share** in the top-right
3. Add the integration you created (search by its name)
4. The integration needs at least **Read** and **Insert** permissions

### 4. Configure Environment

```bash
# In your .env file:
AGENT_REPOSITORY=notion
NOTION_TOKEN=ntn_xxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Verify

```bash
# Start the agent service and check logs
pnpm --filter @ai-agency/agent-service dev
# The default Director agent will be created in Notion on first startup
```

To switch back to JSON storage, set `AGENT_REPOSITORY=json` or remove the variable.

## Default Login

- Password: `admin` (configurable via `AUTH_ADMIN_PASSWORD` in `.env`)

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific service
pnpm --filter @ai-agency/agent-service test
```

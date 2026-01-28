# Brain-Doctor Hospital V4 — Repository Structure

> **Suggested Folder Layout**  
> **Version:** 4.0  
> **Last Updated:** 2026-01-28

This document defines the recommended directory structure for the AlgoBrainDoctor (Brain-Doctor Hospital V4) project.

---

## Complete Directory Tree

```
AlgoBrainDoctor/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous integration (lint, test)
│   │   ├── deploy-api.yml            # Deploy API servers to ECS
│   │   ├── deploy-orchestrator.yml   # Deploy orchestrator to ECS
│   │   ├── deploy-workers.yml        # Deploy worker pool to ECS
│   │   └── deploy-frontend.yml       # Deploy UI to S3 + CloudFront
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── worker_failure.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── src/
│   ├── orchestrator/
│   │   ├── index.ts                  # Main orchestrator entry point
│   │   ├── scheduler.ts              # Job scheduling logic
│   │   ├── supervisor.ts             # Worker health monitoring
│   │   ├── config.ts                 # Orchestrator configuration
│   │   └── lifecycle.ts              # Startup/shutdown handlers
│   │
│   ├── healdec/
│   │   ├── engine.ts                 # Main Healdec auto-healing engine
│   │   ├── classifier.ts             # Failure type classification
│   │   ├── strategies/
│   │   │   ├── index.ts              # Export all strategies
│   │   │   ├── retry.ts              # Retry strategy (transient failures)
│   │   │   ├── restart.ts            # Restart strategy (worker crashes)
│   │   │   ├── quarantine.ts         # Quarantine strategy (data errors)
│   │   │   ├── rollback.ts           # Rollback strategy (partial success)
│   │   │   └── escalate.ts           # Escalate strategy (critical failures)
│   │   └── logger.ts                 # Healdec log writer
│   │
│   ├── workers/
│   │   ├── base/
│   │   │   ├── Worker.ts             # Abstract base worker class
│   │   │   ├── WorkerPool.ts         # Worker pool manager
│   │   │   └── types.ts              # Shared worker types
│   │   ├── IndexWorker.ts            # Discover repositories
│   │   ├── IdentityWorker.ts         # Extract developer identities
│   │   ├── ScoreWorker.ts            # Compute health scores
│   │   ├── IngestWorker.ts           # Process GitHub webhooks
│   │   ├── SyncWorker.ts             # Sync repo metadata
│   │   ├── GCWorker.ts               # Garbage collection
│   │   ├── AlertWorker.ts            # Monitor & notify
│   │   ├── ExportWorker.ts           # Generate reports
│   │   ├── AuditWorker.ts            # Compliance logging
│   │   ├── RepairWorker.ts           # Fix data inconsistencies
│   │   ├── BackfillWorker.ts         # Historical data population
│   │   └── MaintenanceWorker.ts      # Database optimization
│   │
│   ├── api/
│   │   ├── server.ts                 # Express server setup
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── health.ts             # GET /health
│   │   │   ├── repos.ts              # Repo CRUD endpoints
│   │   │   ├── identities.ts         # Identity endpoints
│   │   │   ├── scores.ts             # Score endpoints
│   │   │   ├── jobs.ts               # Job management endpoints
│   │   │   ├── events.ts             # Event query endpoints
│   │   │   └── admin.ts              # Admin-only endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── rateLimit.ts          # Rate limiting
│   │   │   ├── validation.ts         # Request validation
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── logger.ts             # Request logging
│   │   └── webhooks/
│   │       ├── github.ts             # GitHub webhook handler
│   │       └── signature.ts          # Webhook signature verification
│   │
│   ├── ui/
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── favicon.ico
│   │   │   └── manifest.json
│   │   ├── src/
│   │   │   ├── App.tsx               # Main app component
│   │   │   ├── main.tsx              # React entry point
│   │   │   ├── router.tsx            # React Router setup
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── TopNav.tsx
│   │   │   │   │   ├── LeftPanel.tsx
│   │   │   │   │   ├── CenterPanel.tsx
│   │   │   │   │   └── RightPanel.tsx
│   │   │   │   ├── modals/
│   │   │   │   │   ├── VitalsModal.tsx
│   │   │   │   │   ├── HealthReportModal.tsx
│   │   │   │   │   ├── BlackboxModal.tsx
│   │   │   │   │   ├── ImmunizerModal.tsx
│   │   │   │   │   ├── ActionWorkflowModal.tsx
│   │   │   │   │   └── IdentityMergeModal.tsx
│   │   │   │   ├── cards/
│   │   │   │   │   ├── RepoCard.tsx
│   │   │   │   │   ├── IdentityCard.tsx
│   │   │   │   │   ├── JobCard.tsx
│   │   │   │   │   └── ScanBox.tsx
│   │   │   │   ├── charts/
│   │   │   │   │   ├── ScoreChart.tsx
│   │   │   │   │   ├── TrendChart.tsx
│   │   │   │   │   └── HealthBar.tsx
│   │   │   │   ├── SmartBrainTerminal.tsx
│   │   │   │   ├── RepoSwitcher.tsx
│   │   │   │   └── common/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       ├── Select.tsx
│   │   │   │       └── Spinner.tsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── RepositoriesPage.tsx
│   │   │   │   ├── IdentitiesPage.tsx
│   │   │   │   ├── JobsPage.tsx
│   │   │   │   ├── HealdecPage.tsx
│   │   │   │   └── LogsPage.tsx
│   │   │   ├── styles/
│   │   │   │   ├── index.css          # Global styles
│   │   │   │   ├── aura-fx.css        # Aura FX neon effects
│   │   │   │   ├── neo-glow.css       # Neo-Glow cyber theme
│   │   │   │   ├── github-dark.css    # GitHub Dark base
│   │   │   │   ├── colors.css         # Color palette variables
│   │   │   │   └── components.css     # Component-specific styles
│   │   │   ├── hooks/
│   │   │   │   ├── useApi.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useTheme.ts
│   │   │   ├── store/
│   │   │   │   ├── index.ts
│   │   │   │   ├── reposSlice.ts
│   │   │   │   ├── identitiesSlice.ts
│   │   │   │   ├── jobsSlice.ts
│   │   │   │   └── authSlice.ts
│   │   │   └── utils/
│   │   │       ├── api.ts            # API client
│   │   │       ├── formatters.ts     # Data formatters
│   │   │       └── validators.ts     # Client-side validation
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_healdec_log.sql
│   │   │   ├── 003_add_workers_table.sql
│   │   │   ├── 004_add_indexes.sql
│   │   │   └── README.md
│   │   ├── seeds/
│   │   │   ├── development.sql       # Dev seed data
│   │   │   └── test.sql              # Test fixtures
│   │   ├── schema.ts                 # TypeScript schema types
│   │   ├── client.ts                 # Database client (pg pool)
│   │   └── queries/
│   │       ├── repos.ts
│   │       ├── identities.ts
│   │       ├── scores.ts
│   │       ├── jobs.ts
│   │       └── healdec.ts
│   │
│   └── shared/
│       ├── types/
│       │   ├── index.ts              # Type exports
│       │   ├── repo.ts
│       │   ├── identity.ts
│       │   ├── score.ts
│       │   ├── job.ts
│       │   ├── event.ts
│       │   └── worker.ts
│       ├── utils/
│       │   ├── logger.ts             # Pino logger setup
│       │   ├── errors.ts             # Custom error classes
│       │   ├── retry.ts              # Retry utilities
│       │   └── validation.ts         # Zod schemas
│       └── config/
│           ├── index.ts              # Config loader
│           ├── database.ts           # Database config
│           ├── redis.ts              # Cache config
│           ├── github.ts             # GitHub API config
│           └── workers.ts            # Worker config
│
├── docs/
│   ├── ARCHITECTURE.md               # Full architecture spec
│   ├── MERMEDA.md                    # Mermaid diagram suite
│   ├── REPOSITORY_STRUCTURE.md       # This file
│   ├── DOCS_SITE_STRUCTURE.md        # Documentation site layout
│   ├── OPERATOR_HANDBOOK.md          # Operations guide
│   ├── api/
│   │   ├── README.md
│   │   ├── authentication.md
│   │   ├── endpoints.md
│   │   └── webhooks.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── orchestrator.md
│   │   ├── healdec.md
│   │   ├── workers.md
│   │   └── database.md
│   ├── ui/
│   │   ├── design-system.md
│   │   ├── components.md
│   │   ├── aura-fx.md
│   │   └── colors.md
│   ├── ops/
│   │   ├── deployment.md
│   │   ├── monitoring.md
│   │   └── troubleshooting.md
│   └── contributing.md
│
├── tests/
│   ├── unit/
│   │   ├── orchestrator/
│   │   ├── healdec/
│   │   ├── workers/
│   │   ├── api/
│   │   └── db/
│   ├── integration/
│   │   ├── api/
│   │   ├── workers/
│   │   └── healdec/
│   ├── e2e/
│   │   ├── onboarding.test.ts
│   │   ├── healing.test.ts
│   │   └── ui.test.ts
│   ├── fixtures/
│   │   ├── repos.json
│   │   ├── identities.json
│   │   └── webhooks.json
│   └── helpers/
│       ├── db.ts
│       ├── api.ts
│       └── mocks.ts
│
├── scripts/
│   ├── setup/
│   │   ├── init-db.sh               # Initialize database
│   │   ├── seed-dev.sh              # Seed dev data
│   │   └── bootstrap.sh             # Full local setup
│   ├── deploy/
│   │   ├── build-api.sh
│   │   ├── build-orchestrator.sh
│   │   ├── build-workers.sh
│   │   └── build-ui.sh
│   ├── db/
│   │   ├── migrate.sh               # Run migrations
│   │   ├── rollback.sh              # Rollback migration
│   │   └── backup.sh                # Database backup
│   └── ops/
│       ├── scale-workers.sh         # Scale worker pool
│       ├── restart-orchestrator.sh
│       └── health-check.sh
│
├── infra/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── vpc.tf
│   │   ├── ecs.tf
│   │   ├── rds.tf
│   │   ├── elasticache.tf
│   │   ├── s3.tf
│   │   ├── cloudfront.tf
│   │   ├── alb.tf
│   │   ├── iam.tf
│   │   ├── secrets.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.orchestrator
│   │   ├── Dockerfile.workers
│   │   └── docker-compose.yml       # Local development
│   └── k8s/
│       ├── api-deployment.yaml
│       ├── orchestrator-deployment.yaml
│       ├── workers-deployment.yaml
│       ├── configmap.yaml
│       └── secrets.yaml
│
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── extensions.json
│
├── .env.example                      # Environment variables template
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json                     # Root TypeScript config
├── tsconfig.build.json               # Build-specific config
├── package.json                      # Root package.json (workspaces)
├── pnpm-workspace.yaml               # pnpm workspace config
├── LICENSE                           # MIT License
└── README.md                         # Project overview
```

---

## Directory Descriptions

### Root Level

| Directory | Purpose |
|-----------|---------|
| `.github/` | GitHub-specific files (workflows, templates) |
| `src/` | All source code for backend and frontend |
| `docs/` | Complete documentation suite |
| `tests/` | Unit, integration, and E2E tests |
| `scripts/` | Utility scripts for setup, deploy, operations |
| `infra/` | Infrastructure as code (Terraform, Docker, K8s) |
| `.vscode/` | VS Code workspace settings |

---

### `src/orchestrator/`

Contains the **One-File Orchestrator** that coordinates all workers and manages the job queue.

| File | Responsibility |
|------|----------------|
| `index.ts` | Main entry point, starts scheduler and supervisor |
| `scheduler.ts` | Job polling, worker assignment, concurrency control |
| `supervisor.ts` | Worker health monitoring, heartbeat tracking |
| `config.ts` | Orchestrator configuration (poll interval, max jobs) |
| `lifecycle.ts` | Startup/shutdown lifecycle management |

---

### `src/healdec/`

The **Healdec Auto-Healing Engine** that detects and recovers from failures.

| File/Directory | Responsibility |
|----------------|----------------|
| `engine.ts` | Main Healdec engine, coordinates classifier and strategies |
| `classifier.ts` | Failure type classification (transient, crash, data, etc.) |
| `strategies/` | Recovery strategy implementations |
| `strategies/retry.ts` | Retry with exponential backoff |
| `strategies/restart.ts` | Worker restart and job reassignment |
| `strategies/quarantine.ts` | Move job to quarantine queue |
| `strategies/rollback.ts` | Compensating transactions |
| `strategies/escalate.ts` | Page on-call engineer |
| `logger.ts` | Write to `healdec_log` table |

---

### `src/workers/`

All **12 worker implementations** that process jobs.

| File | Worker Type | Purpose |
|------|-------------|---------|
| `base/Worker.ts` | Abstract | Base worker interface and shared logic |
| `base/WorkerPool.ts` | Manager | Manages worker lifecycle and scaling |
| `IndexWorker.ts` | Batch | Discover repositories in GitHub organizations |
| `IdentityWorker.ts` | Batch | Extract developer identities from Git commits |
| `ScoreWorker.ts` | Batch | Compute repository health scores |
| `IngestWorker.ts` | Real-time | Process GitHub webhook events |
| `SyncWorker.ts` | Scheduled | Sync repo metadata with GitHub |
| `GCWorker.ts` | Scheduled | Garbage collection (prune old data) |
| `AlertWorker.ts` | Real-time | Monitor thresholds and send notifications |
| `ExportWorker.ts` | On-demand | Generate reports and exports |
| `AuditWorker.ts` | Real-time | Log all actions for compliance |
| `RepairWorker.ts` | On-demand | Fix data inconsistencies |
| `BackfillWorker.ts` | On-demand | Populate historical data |
| `MaintenanceWorker.ts` | Scheduled | Database optimization |

---

### `src/api/`

The **Public API** (Express + TypeScript) that serves frontend and external clients.

| Directory | Contents |
|-----------|----------|
| `routes/` | API endpoint definitions (repos, identities, scores, jobs) |
| `middleware/` | Auth, rate limiting, validation, error handling |
| `webhooks/` | GitHub webhook handlers |
| `server.ts` | Express server setup and startup |

**Key Routes:**
- `GET /health` - Health check
- `GET /api/v1/repos` - List repositories
- `GET /api/v1/repos/:id` - Get repo details
- `GET /api/v1/repos/:id/score` - Get latest score
- `GET /api/v1/identities` - List identities
- `POST /api/v1/jobs` - Create manual job
- `POST /webhooks/github` - GitHub webhook endpoint

---

### `src/ui/`

The **Operator Dashboard** and **Admin Console** (React + TypeScript + Vite).

| Directory | Contents |
|-----------|----------|
| `components/layout/` | Page layout (TopNav, panels) |
| `components/modals/` | Fullscreen/overlay modals (Vitals, Health Report, etc.) |
| `components/cards/` | Reusable card components (RepoCard, JobCard) |
| `components/charts/` | Data visualization (score trends, health bars) |
| `components/common/` | Atomic UI components (Button, Input, etc.) |
| `pages/` | Top-level page components (Home, Repos, Jobs, etc.) |
| `styles/` | CSS modules (Aura FX, Neo-Glow, GitHub Dark theme) |
| `hooks/` | Custom React hooks (useApi, useWebSocket, useAuth) |
| `store/` | Redux state management |
| `utils/` | API client, formatters, validators |

**Core Components:**
- `VitalsModal` - Quick health metrics view
- `HealthReportModal` - Full diagnostic report
- `RepoCard` - Repository list item
- `ScanBox` - Individual scan result
- `SmartBrainTerminal` - Real-time log viewer
- `BlackboxModal` - Job queue inspector
- `ImmunizerModal` - Healdec healing controls
- `ActionWorkflowModal` - Trigger manual jobs

---

### `src/db/`

Database **migrations, schemas, and query builders**.

| Directory | Contents |
|-----------|----------|
| `migrations/` | SQL migration files (versioned) |
| `seeds/` | Dev and test seed data |
| `queries/` | TypeScript query builders by entity |
| `schema.ts` | TypeScript types for database tables |
| `client.ts` | PostgreSQL connection pool setup |

**Migration Naming:**
```
001_initial_schema.sql
002_add_healdec_log.sql
003_add_indexes.sql
```

---

### `src/shared/`

**Shared utilities and types** used across orchestrator, workers, and API.

| Directory | Contents |
|-----------|----------|
| `types/` | TypeScript type definitions (Repo, Identity, Job, etc.) |
| `utils/` | Logging (Pino), errors, retry helpers, validation (Zod) |
| `config/` | Configuration loaders (DB, Redis, GitHub, workers) |

**Key Files:**
- `logger.ts` - Structured logging with Pino
- `errors.ts` - Custom error classes (ValidationError, NotFoundError)
- `validation.ts` - Zod schemas for request/response validation
- `config/index.ts` - Load environment variables and secrets

---

### `docs/`

**Complete documentation suite** (Markdown + Mermaid diagrams).

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | Full production architecture specification |
| `MERMEDA.md` | Comprehensive Mermaid diagram suite |
| `REPOSITORY_STRUCTURE.md` | This file (folder layout) |
| `DOCS_SITE_STRUCTURE.md` | MkDocs/Docusaurus site structure |
| `OPERATOR_HANDBOOK.md` | Deployment and operations runbooks |

**Subdirectories:**
- `api/` - API documentation (endpoints, auth, webhooks)
- `architecture/` - Deep dives into orchestrator, Healdec, workers
- `ui/` - UI/UX design system (Aura FX, color palette, components)
- `ops/` - Operational guides (deployment, monitoring, troubleshooting)

---

### `tests/`

**Comprehensive test suite** (Jest + Supertest + Playwright).

| Directory | Test Type |
|-----------|-----------|
| `unit/` | Unit tests for individual modules |
| `integration/` | Integration tests (API + DB, worker + Healdec) |
| `e2e/` | End-to-end tests (full user flows) |
| `fixtures/` | Test data (repos, identities, webhooks) |
| `helpers/` | Test utilities (DB setup, mocks, API client) |

**Test Patterns:**
- Unit: Mock external dependencies (DB, GitHub API)
- Integration: Use test database and real GitHub stubs
- E2E: Playwright tests against full stack (UI + API + DB)

---

### `scripts/`

**Automation scripts** for development, deployment, and operations.

| Directory | Purpose |
|-----------|---------|
| `setup/` | Initial setup (database, seed data) |
| `deploy/` | Build scripts for each service |
| `db/` | Database operations (migrations, backups) |
| `ops/` | Operational tasks (scaling, health checks) |

**Common Scripts:**
- `scripts/setup/bootstrap.sh` - Full local development setup
- `scripts/db/migrate.sh` - Run database migrations
- `scripts/ops/scale-workers.sh` - Scale worker pool dynamically

---

### `infra/`

**Infrastructure as Code** (Terraform + Docker + Kubernetes).

| Directory | IaC Tool |
|-----------|----------|
| `terraform/` | AWS infrastructure (VPC, ECS, RDS, etc.) |
| `docker/` | Dockerfiles and docker-compose for local dev |
| `k8s/` | Kubernetes manifests (optional, for K8s deployment) |

**Terraform Modules:**
- `vpc.tf` - Networking (subnets, NAT, security groups)
- `ecs.tf` - Fargate tasks (API, orchestrator, workers)
- `rds.tf` - Aurora Serverless PostgreSQL
- `elasticache.tf` - Redis cluster
- `alb.tf` - Application Load Balancer
- `s3.tf` + `cloudfront.tf` - Frontend hosting
- `secrets.tf` - Secrets Manager

---

## File Naming Conventions

### TypeScript Files
- **PascalCase** for classes and React components: `IndexWorker.ts`, `RepoCard.tsx`
- **camelCase** for utilities and hooks: `logger.ts`, `useApi.ts`
- **kebab-case** for CSS files: `aura-fx.css`, `github-dark.css`

### Database Migrations
- **Numbered prefix + snake_case description**: `001_initial_schema.sql`
- Always increment numbers, never reuse

### Scripts
- **kebab-case + .sh extension**: `init-db.sh`, `scale-workers.sh`
- Always include shebang: `#!/bin/bash`

### Documentation
- **UPPERCASE for top-level docs**: `ARCHITECTURE.md`, `MERMEDA.md`
- **lowercase for nested docs**: `design-system.md`, `deployment.md`

---

## Environment-Specific Configurations

### Development (`NODE_ENV=development`)
```bash
DATABASE_URL=postgresql://localhost:5432/algobrain_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
HEALDEC_ENABLED=true
```

### Test (`NODE_ENV=test`)
```bash
DATABASE_URL=postgresql://localhost:5432/algobrain_test
REDIS_URL=redis://localhost:6380
LOG_LEVEL=error
HEALDEC_ENABLED=false  # Disable auto-healing in tests
```

### Production (`NODE_ENV=production`)
```bash
DATABASE_URL=<from AWS Secrets Manager>
REDIS_URL=<from AWS Secrets Manager>
LOG_LEVEL=info
HEALDEC_ENABLED=true
SENTRY_DSN=<from AWS Secrets Manager>
```

---

## Workspace Structure (pnpm)

Using **pnpm workspaces** for monorepo management:

```yaml
# pnpm-workspace.yaml
packages:
  - 'src/api'
  - 'src/orchestrator'
  - 'src/workers'
  - 'src/ui'
  - 'src/shared'
```

**Root package.json:**
```json
{
  "name": "algobrain-doctor",
  "version": "4.0.0",
  "private": true,
  "workspaces": [
    "src/api",
    "src/orchestrator",
    "src/workers",
    "src/ui",
    "src/shared"
  ],
  "scripts": {
    "dev": "pnpm --parallel --stream run dev",
    "build": "pnpm --recursive run build",
    "test": "pnpm --recursive run test",
    "lint": "pnpm --recursive run lint"
  }
}
```

---

## Quick Start Guide

### 1. Clone and Install
```bash
git clone https://github.com/Algodons/AlgoBrainDoctor.git
cd AlgoBrainDoctor
pnpm install
```

### 2. Setup Database
```bash
./scripts/setup/init-db.sh
./scripts/db/migrate.sh
./scripts/setup/seed-dev.sh
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your GitHub token and other secrets
```

### 4. Start Services
```bash
# Terminal 1: Start database and cache
docker-compose up -d postgres redis

# Terminal 2: Start API
cd src/api && pnpm dev

# Terminal 3: Start orchestrator
cd src/orchestrator && pnpm dev

# Terminal 4: Start UI
cd src/ui && pnpm dev
```

### 5. Access UI
Open http://localhost:5173 in your browser.

---

## Dependencies

### Backend (Shared)
- **Node.js**: 20.x LTS
- **TypeScript**: 5.x
- **PostgreSQL**: 15.x
- **Redis**: 7.x

### API
- **Express**: 4.x
- **Pino**: 8.x (logging)
- **Zod**: 3.x (validation)
- **jsonwebtoken**: 9.x (auth)

### Orchestrator & Workers
- **node-cron**: 3.x (scheduling)
- **@octokit/rest**: 20.x (GitHub API)
- **pg**: 8.x (PostgreSQL client)
- **ioredis**: 5.x (Redis client)

### UI
- **React**: 18.x
- **Vite**: 5.x
- **React Router**: 6.x
- **Redux Toolkit**: 2.x
- **Recharts**: 2.x (charts)
- **Tailwind CSS**: 3.x

### Testing
- **Jest**: 29.x
- **Supertest**: 6.x
- **Playwright**: 1.x
- **ts-jest**: 29.x

---

## Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full architecture specification
- [MERMEDA.md](./MERMEDA.md) - Mermaid diagram suite
- [docs/OPERATOR_HANDBOOK.md](./OPERATOR_HANDBOOK.md) - Operations guide
- [docs/DOCS_SITE_STRUCTURE.md](./DOCS_SITE_STRUCTURE.md) - Documentation site layout

---

**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  
**License:** MIT

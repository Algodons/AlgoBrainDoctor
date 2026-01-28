# Brain-Doctor Hospital V4 — Architecture Specification

> **Version:** 4.0  
> **Status:** In Progress  
> **Last Updated:** 2026-01-28

---

## Table of Contents

1. [Overview](#overview)
2. [One-File Orchestrator](#one-file-orchestrator)
3. [Healdec Auto-Healing Engine](#healdec-auto-healing-engine)
4. [12 Parallel Workers](#12-parallel-workers)
5. [Database Schema](#database-schema)
6. [Data Flows](#data-flows)
7. [Full-Stack Applications](#full-stack-applications)
8. [UI/UX Design System](#uiux-design-system)
9. [Production Deployment](#production-deployment)
10. [Implementation Status](#implementation-status)

---

## Overview

**Brain-Doctor Hospital V4** (AlgoBrainDoctor) is a production-grade repository health monitoring and auto-healing platform. The system continuously scans Git repositories, tracks developer identities, computes health scores, and automatically remediates detected issues through intelligent recovery strategies.

### Core Principles

- **Self-Healing**: Autonomous error detection, classification, and recovery via Healdec engine
- **Parallel Execution**: 12 specialized workers process jobs concurrently with minimal contention
- **Single Orchestrator**: One centralized scheduler manages all coordination and supervision
- **Immutable Events**: All actions logged as append-only events for audit and replay
- **Graceful Degradation**: System continues operating even when individual workers fail

### Key Capabilities

- Real-time repository health scoring (0-100 scale)
- Developer identity claim resolution and merging
- Automated healing workflows for common failure patterns
- Multi-tenant support with organization-level isolation
- Full observability through structured logs and metrics
- Production-ready API with authentication and rate limiting

---

## One-File Orchestrator

### Design Philosophy

The **One-File Orchestrator** is the central nervous system of Brain-Doctor Hospital. It follows a single-responsibility pattern where all coordination logic resides in one entry point, making the system easier to reason about, debug, and deploy.

### Responsibilities

#### Job Scheduling
- Polls the `jobs` table for pending work
- Assigns jobs to available workers based on priority and capacity
- Enforces concurrency limits per worker type
- Implements fair scheduling to prevent starvation

#### Worker Supervision
- Monitors worker health via heartbeats
- Detects stuck or crashed workers
- Triggers graceful shutdown on termination signals
- Reports worker status to monitoring systems

#### Resource Management
- Manages database connection pools
- Controls Redis cache access
- Enforces memory and CPU limits
- Implements backpressure when queues grow

#### Lifecycle Management
- Handles startup initialization (schema validation, migrations)
- Coordinates graceful shutdown (drain queues, finish in-flight jobs)
- Supports rolling deploys with zero downtime
- Manages configuration hot-reloading

### Orchestrator Flow

```
1. INIT: Load config, connect to DB/cache, validate schema
2. SCHEDULE: Poll jobs table every N seconds
3. DISPATCH: Assign jobs to workers based on availability
4. SUPERVISE: Monitor worker heartbeats and health
5. HEAL: Invoke Healdec on detected failures
6. REPEAT: Loop back to SCHEDULE until shutdown signal
```

### Configuration

```typescript
interface OrchestratorConfig {
  pollIntervalMs: number;           // Job polling frequency (default: 5000)
  maxConcurrentJobs: number;        // Global job limit (default: 100)
  workerTimeoutMs: number;          // Worker heartbeat timeout (default: 60000)
  gracefulShutdownTimeoutMs: number; // Max time for shutdown (default: 30000)
  healdecEnabled: boolean;          // Enable auto-healing (default: true)
}
```

---

## Healdec Auto-Healing Engine

### Overview

**Healdec** (Health Decision Controller) is the autonomous recovery system that detects, classifies, and heals failures without human intervention. It operates on a feedback loop that learns from past recovery attempts to optimize future decisions.

### Recovery Strategies

#### 1. Retry Strategy
**When:** Transient network errors, rate limiting, timeouts  
**How:** Exponential backoff with jitter (1s, 2s, 4s, 8s, max 60s)  
**Invariants:**
- Max 5 retry attempts per job
- Reset retry counter on successful completion
- Log each retry with failure context

#### 2. Restart Strategy
**When:** Worker crashes, memory leaks, corrupted state  
**How:** Terminate worker process, spawn new instance, reassign job  
**Invariants:**
- Preserve job data and history
- Increment restart counter
- Alert on >3 restarts within 1 hour

#### 3. Quarantine Strategy
**When:** Repeated failures, data corruption, invalid inputs  
**How:** Move job to quarantine queue, mark as needs-human-review  
**Invariants:**
- Job removed from active scheduling
- Original error preserved for debugging
- Operator notified via Slack/email

#### 4. Rollback Strategy
**When:** Partial completion with side effects (DB writes, API calls)  
**How:** Invoke compensating transactions to undo changes  
**Invariants:**
- Maintain operation log for rollback
- Verify rollback completion
- Mark job as failed after rollback

#### 5. Escalate Strategy
**When:** Critical system errors, resource exhaustion, security issues  
**How:** Page on-call engineer, halt related jobs, capture full diagnostics  
**Invariants:**
- Immediate notification
- System state snapshot preserved
- Safe mode activated (read-only operations)

### Failure Classification

```mermaid
graph TD
    A[Job Failed] --> B{Error Type?}
    B -->|Transient| C[Retry Strategy]
    B -->|Worker Crash| D[Restart Strategy]
    B -->|Data Error| E[Quarantine Strategy]
    B -->|Partial Success| F[Rollback Strategy]
    B -->|System Critical| G[Escalate Strategy]
    
    C --> H{Max Retries?}
    H -->|No| C
    H -->|Yes| E
    
    D --> I{Max Restarts?}
    I -->|No| D
    I -->|Yes| G
```

### Healdec Log Schema

```typescript
interface HealdecLog {
  id: string;
  timestamp: Date;
  jobId: string;
  workerId: string;
  failureType: 'transient' | 'crash' | 'data' | 'partial' | 'critical';
  strategy: 'retry' | 'restart' | 'quarantine' | 'rollback' | 'escalate';
  attemptNumber: number;
  success: boolean;
  context: Record<string, any>;
  operatorNotified: boolean;
}
```

### Invariants

1. **No Infinite Loops**: Every strategy has a bounded retry limit
2. **State Preservation**: All failure context is logged before recovery
3. **Idempotency**: Recovery actions can be safely repeated
4. **Observability**: Every Healdec action emits structured logs
5. **Human Override**: Operators can disable auto-healing per job type

---

## 12 Parallel Workers

### Worker Architecture

Each worker is an independent, long-running process that:
- Polls for jobs of its designated type
- Executes job logic with proper error handling
- Reports progress via heartbeats
- Respects graceful shutdown signals
- Logs all actions to the events table

### Worker Contracts

All workers implement the base `Worker` interface:

```typescript
interface Worker {
  readonly name: string;
  readonly jobType: string;
  readonly concurrency: number;
  
  start(): Promise<void>;
  stop(): Promise<void>;
  execute(job: Job): Promise<JobResult>;
  healthCheck(): Promise<boolean>;
}
```

---

### 1. IndexWorker

**Purpose:** Discover and index new repositories in organizations  
**Trigger:** Scheduled hourly, manual API call  
**Concurrency:** 5  

**Flow:**
1. Query GitHub API for org repos
2. Compare against local `repos` table
3. Insert new repos with initial status
4. Emit `repo.discovered` events
5. Trigger downstream identity and score jobs

**Output:** New rows in `repos` table

---

### 2. IdentityWorker

**Purpose:** Extract developer identities from Git commits  
**Trigger:** New repo indexed, manual refresh  
**Concurrency:** 10  

**Flow:**
1. Clone repo (shallow, last 1000 commits)
2. Parse `git log` for author/committer data
3. Normalize email addresses (lowercase, trim)
4. Insert unique identities into `identities` table
5. Create identity claims linking identities to repos

**Output:** New rows in `identities`, `identity_claims` tables

---

### 3. ScoreWorker

**Purpose:** Compute repository health scores based on metrics  
**Trigger:** Scheduled daily, post-commit hook  
**Concurrency:** 8  

**Flow:**
1. Fetch repo metadata (stars, forks, issues, PRs)
2. Analyze commit frequency (last 30/90/365 days)
3. Check for README, LICENSE, CI config
4. Compute weighted score (0-100)
5. Store in `scores` table with breakdown

**Scoring Formula:**
```
score = (
  activity_score * 0.40 +
  documentation_score * 0.25 +
  community_score * 0.20 +
  maintenance_score * 0.15
)
```

**Output:** New rows in `scores` table

---

### 4. IngestWorker

**Purpose:** Stream real-time events from GitHub webhooks  
**Trigger:** GitHub webhook delivery (push, PR, issue)  
**Concurrency:** 20  

**Flow:**
1. Validate webhook signature
2. Parse event payload
3. Store raw event in `events` table
4. Trigger relevant downstream jobs (score recalc, identity update)
5. Acknowledge webhook within 10s

**Output:** New rows in `events` table, spawned jobs

---

### 5. SyncWorker

**Purpose:** Synchronize local repo state with GitHub source of truth  
**Trigger:** Scheduled every 6 hours  
**Concurrency:** 5  

**Flow:**
1. Fetch latest repo metadata from GitHub API
2. Compare with local `repos` table
3. Update changed fields (stars, description, archived status)
4. Emit `repo.synced` events
5. Handle deleted repos (mark as archived)

**Output:** Updated rows in `repos` table

---

### 6. GCWorker (Garbage Collection)

**Purpose:** Clean up old data, prune stale jobs, reclaim disk space  
**Trigger:** Scheduled nightly at 2 AM UTC  
**Concurrency:** 1  

**Flow:**
1. Delete events older than 90 days (configurable retention)
2. Remove quarantined jobs older than 30 days
3. Vacuum database tables to reclaim space
4. Prune unused identity claims
5. Emit `gc.completed` event with stats

**Output:** Deleted rows, freed disk space

---

### 7. AlertWorker

**Purpose:** Monitor system health and send notifications  
**Trigger:** Real-time on threshold breach  
**Concurrency:** 3  

**Flow:**
1. Subscribe to metrics stream (worker failures, queue depth)
2. Evaluate alerting rules (e.g., failure rate >5% for 5 min)
3. Deduplicate alerts (same alert within 1 hour)
4. Send notifications via Slack, email, PagerDuty
5. Log alert in `healdec_log` table

**Output:** External notifications, logged alerts

---

### 8. ExportWorker

**Purpose:** Generate reports and export data to external systems  
**Trigger:** Scheduled weekly, manual API call  
**Concurrency:** 2  

**Flow:**
1. Query aggregated data (scores, identities, events)
2. Generate CSV/JSON/PDF reports
3. Upload to S3 or send via email
4. Update `exports` table with status
5. Emit `export.completed` event

**Output:** Files in S3, rows in `exports` table

---

### 9. AuditWorker

**Purpose:** Track and log all system actions for compliance  
**Trigger:** Real-time on sensitive operations  
**Concurrency:** 5  

**Flow:**
1. Subscribe to events stream (user actions, config changes)
2. Enrich with user context (IP, session ID, permissions)
3. Write to immutable `audit_log` table
4. Optionally forward to SIEM (Splunk, Datadog)
5. Enforce retention policies (7 years for compliance)

**Output:** New rows in `audit_log` table

---

### 10. RepairWorker

**Purpose:** Fix data inconsistencies and corrupted state  
**Trigger:** Manual trigger by operator, Healdec escalation  
**Concurrency:** 1  

**Flow:**
1. Receive repair job with target entity (repo ID, identity ID)
2. Run diagnostic checks (orphaned claims, duplicate identities)
3. Apply fixes (merge duplicates, rebuild indexes)
4. Validate repair success
5. Log repair actions in `healdec_log`

**Output:** Corrected data, logged repair actions

---

### 11. BackfillWorker

**Purpose:** Populate historical data for newly added metrics  
**Trigger:** Manual trigger after schema migration  
**Concurrency:** 3  

**Flow:**
1. Query all repos missing new metric (e.g., `security_score`)
2. Fetch historical data from GitHub API
3. Compute metric for past dates
4. Insert into `scores_history` table
5. Emit `backfill.completed` event

**Output:** Historical rows in `scores_history` table

---

### 12. MaintenanceWorker

**Purpose:** Perform routine maintenance tasks (reindex, optimize)  
**Trigger:** Scheduled weekly on Sunday 3 AM UTC  
**Concurrency:** 1  

**Flow:**
1. Reindex database tables for query performance
2. Update materialized views (top repos, trending identities)
3. Optimize query plans
4. Run database health checks (fragmentation, bloat)
5. Emit `maintenance.completed` event with stats

**Output:** Optimized database, updated views

---

### Worker Priority Levels

| Worker | Priority | Notes |
|--------|----------|-------|
| IngestWorker | 10 (Highest) | Real-time webhook ingestion |
| AlertWorker | 9 | Critical for observability |
| AuditWorker | 8 | Compliance requirement |
| IdentityWorker | 6 | Blocks score computation |
| ScoreWorker | 6 | Core business logic |
| SyncWorker | 5 | Can tolerate delays |
| IndexWorker | 5 | Scheduled batch work |
| RepairWorker | 4 | On-demand only |
| ExportWorker | 3 | Low priority batch |
| BackfillWorker | 2 | One-time operations |
| MaintenanceWorker | 1 | Background optimization |
| GCWorker | 1 | Can run off-peak |

---

## Database Schema

### Core Tables

#### repos
Primary entity representing a Git repository.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(512) NOT NULL UNIQUE,
  description TEXT,
  url VARCHAR(1024) NOT NULL,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  INDEX idx_repos_org (org_id),
  INDEX idx_repos_archived (archived)
);
```

#### identities
Developer identities extracted from Git commits.

```sql
CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  github_username VARCHAR(255),
  avatar_url VARCHAR(1024),
  merged_into UUID REFERENCES identities(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_identities_email (email),
  INDEX idx_identities_merged (merged_into)
);
```

#### identity_claims
Many-to-many relationship: identities ↔ repos.

```sql
CREATE TABLE identity_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id),
  repo_id UUID NOT NULL REFERENCES repos(id),
  commit_count INTEGER DEFAULT 0,
  first_commit_at TIMESTAMP,
  last_commit_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (identity_id, repo_id),
  INDEX idx_claims_identity (identity_id),
  INDEX idx_claims_repo (repo_id)
);
```

#### scores
Repository health scores over time.

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL REFERENCES repos(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  activity_score INTEGER,
  documentation_score INTEGER,
  community_score INTEGER,
  maintenance_score INTEGER,
  breakdown JSONB,
  computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_scores_repo (repo_id),
  INDEX idx_scores_computed (computed_at DESC)
);
```

#### events
Immutable event log for audit and replay.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_events_type (event_type),
  INDEX idx_events_entity (entity_type, entity_id),
  INDEX idx_events_created (created_at DESC)
);
```

---

### Orchestration Tables

#### jobs
Work queue for all worker types.

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  payload JSONB NOT NULL,
  worker_id VARCHAR(100),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  scheduled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_jobs_status (status, scheduled_at),
  INDEX idx_jobs_type (job_type),
  INDEX idx_jobs_worker (worker_id)
);
```

#### healdec_log
Auto-healing decision log.

```sql
CREATE TABLE healdec_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  worker_id VARCHAR(100),
  failure_type VARCHAR(50) NOT NULL,
  strategy VARCHAR(50) NOT NULL,
  attempt_number INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  context JSONB,
  operator_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_healdec_job (job_id),
  INDEX idx_healdec_strategy (strategy),
  INDEX idx_healdec_created (created_at DESC)
);
```

#### migrations
Schema version tracking.

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Data Flows

### 1. Repository Onboarding Flow

```
┌─────────────┐
│ GitHub Org  │
└──────┬──────┘
       │
       v
┌─────────────────┐
│  IndexWorker    │──> Discover repos via GitHub API
└────────┬────────┘
         │
         v
    ┌────────┐
    │ repos  │──> Insert new repos
    └────┬───┘
         │
         ├──> Spawn IdentityWorker job
         │
         └──> Spawn ScoreWorker job
         
┌──────────────────┐
│ IdentityWorker   │──> Clone repo, extract identities
└─────────┬────────┘
          │
          v
     ┌────────────┐
     │ identities │──> Insert unique identities
     └──────┬─────┘
            │
            v
   ┌────────────────┐
   │ identity_claims│──> Link identities to repos
   └────────────────┘
   
┌──────────────────┐
│  ScoreWorker     │──> Compute health score
└─────────┬────────┘
          │
          v
     ┌────────┐
     │ scores │──> Store score + breakdown
     └────────┘
```

### 2. Identity Claim Lifecycle

```
1. IdentityWorker discovers new commits
   └─> Extract author email/name from git log
   
2. Check if identity exists
   ├─> YES: Fetch existing identity_id
   └─> NO:  Insert new identity, get identity_id
   
3. Check if claim exists for (identity_id, repo_id)
   ├─> YES: Update commit_count, last_commit_at
   └─> NO:  Insert new claim
   
4. Emit identity.claimed event
   
5. Trigger identity merge job if duplicates detected
   ├─> Compare by email similarity
   ├─> Check GitHub username match
   └─> Merge identities, update merged_into field
```

### 3. Auto-Healing Lifecycle

```
┌──────────┐
│ Job Fails│
└─────┬────┘
      │
      v
┌─────────────────┐
│ Healdec Invoked │
└────────┬────────┘
         │
         v
   ┌──────────────────┐
   │ Classify Failure │
   └──────┬───────────┘
          │
          ├──> Transient? → Retry Strategy
          ├──> Worker Crash? → Restart Strategy
          ├──> Data Error? → Quarantine Strategy
          ├──> Partial Success? → Rollback Strategy
          └──> Critical? → Escalate Strategy
          
   Each strategy:
   1. Log decision to healdec_log
   2. Execute recovery action
   3. Update job status
   4. Emit healdec.action event
   5. If success: Mark job completed
   6. If failure: Apply next strategy or quarantine
```

---

## Full-Stack Applications

### 1. Public API

**Technology:** Node.js + Express + TypeScript  
**Port:** 3000  
**Auth:** JWT tokens, API keys  

**Endpoints:**
- `GET /api/v1/repos` - List repositories
- `GET /api/v1/repos/:id` - Get repo details
- `GET /api/v1/repos/:id/score` - Get latest score
- `GET /api/v1/identities` - List identities
- `POST /api/v1/jobs` - Create manual job
- `GET /api/v1/health` - Health check

**Features:**
- Rate limiting (100 req/min per API key)
- Request validation with Zod schemas
- Structured logging with Pino
- OpenAPI spec auto-generation
- CORS support for web clients

---

### 2. Operator Dashboard

**Technology:** React + TypeScript + Vite  
**URL:** https://dashboard.algobrain.doctor  

**Pages:**
- **Home**: System overview (active jobs, worker status, recent events)
- **Repositories**: Searchable table with health scores and filters
- **Identities**: Developer identity management and merge tools
- **Jobs**: Job queue monitor with retry/cancel actions
- **Healdec**: Auto-healing history and manual override controls
- **Logs**: Real-time log streaming with filtering

**Access Control:**
- Read-only: View data, no mutations
- Operator: Read + trigger jobs, approve merges
- Admin: Full access + user management

---

### 3. Admin Console

**Technology:** React + TypeScript + Vite  
**URL:** https://admin.algobrain.doctor  

**Features:**
- Organization management (create, configure, disable)
- User management (invite, assign roles, revoke access)
- System configuration (worker concurrency, Healdec rules)
- Database tools (run migrations, trigger backfills)
- Monitoring dashboards (Grafana embeds)
- Incident response (force job cancellation, quarantine inspection)

**Security:**
- Admin-only access (enforced at API level)
- Audit logging for all admin actions
- 2FA required for sensitive operations

---

## UI/UX Design System

### Design Language: Aura FX Neo-Glow + GitHub Dark

The Brain-Doctor Hospital V4 interface combines **Aura FX** (soft neon diffusion effects), **Neo-Glow** (cyber-medical aesthetics), and **GitHub Dark** (familiar developer theme) to create a distinctive yet professional experience.

---

### Color Palette

#### Primary Accents
```css
--violet-aura: #A78BFA;      /* Soft purple glow for primary actions */
--aqua-pulse: #4FD1C5;       /* Cyan pulse for health indicators */
--coral-heat: #F87171;       /* Red-orange for alerts and warnings */
--cyber-yellow: #FACC15;     /* Bright yellow for caution states */
```

#### Neutrals (GitHub Dark Base)
```css
--bg-primary: #0d1117;       /* Main background */
--bg-secondary: #161b22;     /* Card/panel background */
--bg-tertiary: #21262d;      /* Hover states */
--border-default: #30363d;   /* Borders and dividers */
--text-primary: #c9d1d9;     /* Primary text */
--text-secondary: #8b949e;   /* Secondary text */
--text-muted: #6e7681;       /* Muted/disabled text */
```

#### Semantic Colors
```css
--success: #3fb950;          /* Success states */
--warning: #d29922;          /* Warning states */
--error: #f85149;            /* Error states */
--info: #58a6ff;             /* Info states */
```

---

### Typography

```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
--font-family-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;

--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 2rem;       /* 32px */
```

---

### Layout System

#### Three-Column Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│                      Top Nav Bar                        │
├──────────┬─────────────────────────────────┬────────────┤
│          │                                 │            │
│  LEFT    │          CENTER                 │   RIGHT    │
│  PANEL   │          PANEL                  │   PANEL    │
│          │                                 │            │
│  Repo    │    Vitals + Scan Results        │   Logs +   │
│ Switcher │    Health Charts                │   Health   │
│          │    Action Buttons               │   Stream   │
│          │                                 │            │
│  240px   │         Flexible                │   320px    │
│          │                                 │            │
└──────────┴─────────────────────────────────┴────────────┘
```

**Breakpoints:**
- Desktop: ≥1280px (3-column layout)
- Tablet: 768px - 1279px (2-column: left hidden, center + right stacked)
- Mobile: <768px (1-column: hamburger menu for left, stacked content)

---

### Core Components

#### Component Table

| Component | Purpose | Visual Style | Interactions |
|-----------|---------|--------------|--------------|
| **VitalsModal** | Display key repo health metrics | Glassmorphic card with neon borders | Hover glow, click to expand details |
| **HealthReportModal** | Full diagnostic report with breakdown | Fullscreen overlay with tabs | Scroll sections, download PDF |
| **RepoCard** | Repository list item with quick stats | Card with color-coded health bar | Hover lift effect, click to open |
| **ScanBox** | Individual scan result display | Bordered box with status icon | Pulse animation on active scan |
| **SmartBrainTerminal** | Real-time log viewer with AI insights | Monospace text with syntax highlighting | Auto-scroll, filter, search |
| **BlackboxModal** | Job queue inspector | Dark modal with JSON viewer | Expand/collapse, copy to clipboard |
| **ImmunizerModal** | Healdec healing controls | Cyber-medical theme with action buttons | Confirm dialogs, progress bars |
| **ActionWorkflowModal** | Trigger manual jobs and workflows | Step-by-step wizard | Form validation, real-time preview |

---

### Aura FX Effects

#### 1. Neon Edge Glow
Applied to cards, buttons, and focus states.

```css
.aura-glow {
  box-shadow: 
    0 0 10px rgba(167, 139, 250, 0.3),
    0 0 20px rgba(167, 139, 250, 0.2),
    0 0 30px rgba(167, 139, 250, 0.1);
  transition: box-shadow 0.3s ease;
}

.aura-glow:hover {
  box-shadow: 
    0 0 15px rgba(167, 139, 250, 0.5),
    0 0 30px rgba(167, 139, 250, 0.3),
    0 0 45px rgba(167, 139, 250, 0.2);
}
```

#### 2. Pulse Animation
Used for active scans and real-time updates.

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pulse-effect {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### 3. Neon Edge Sweep
Border animation for loading states.

```css
@keyframes neon-sweep {
  0% { border-color: var(--violet-aura); }
  33% { border-color: var(--aqua-pulse); }
  66% { border-color: var(--coral-heat); }
  100% { border-color: var(--violet-aura); }
}

.neon-sweep {
  animation: neon-sweep 3s linear infinite;
}
```

---

### Interaction Model

#### Hover States
- **Cards**: Lift effect (translateY -2px) + glow intensifies
- **Buttons**: Background lightens + border glow
- **Links**: Underline appears + text color shifts to accent

#### Click/Tap Feedback
- **Scale down**: Scale 0.98 for 100ms on click
- **Ripple effect**: Radial gradient spreads from click point
- **Success flash**: Brief aqua-pulse glow on action completion

#### Loading States
- **Skeleton screens**: Animated gradient shimmer
- **Spinners**: Rotating neon ring (violet-aura)
- **Progress bars**: Gradient fill with pulse effect

#### Error States
- **Input validation**: Red border + shake animation
- **Failed actions**: Coral-heat glow + error message toast
- **Network errors**: Dimmed overlay + retry button

---

### Mobile Responsiveness

#### Touch Targets
- Minimum 44x44px for all tappable elements
- Increased padding on buttons and cards

#### Gesture Support
- **Swipe left/right**: Navigate between dashboard tabs
- **Pull to refresh**: Reload current data view
- **Pinch to zoom**: Scale charts and graphs

#### Adaptive Layout
- **Hamburger menu**: Left panel collapses into slide-out drawer
- **Stacked cards**: Center and right panels stack vertically
- **Floating action button**: Primary action always accessible

---

### Accessibility

- **WCAG AA compliance**: Color contrast ratios ≥4.5:1
- **Keyboard navigation**: Tab order follows visual hierarchy
- **Screen reader support**: Semantic HTML + ARIA labels
- **Focus indicators**: High-contrast outline (not just glow)
- **Reduced motion**: Respects `prefers-reduced-motion` media query

---

## Production Deployment

### Topology

```
┌─────────────────────────────────────────────────────┐
│              Load Balancer (AWS ALB)                │
└────────────┬──────────────────────────┬─────────────┘
             │                          │
    ┌────────v────────┐        ┌────────v────────┐
    │   API Server    │        │   API Server    │
    │   (ECS Fargate) │        │   (ECS Fargate) │
    └────────┬────────┘        └────────┬────────┘
             │                          │
             └─────────┬────────────────┘
                       │
             ┌─────────v─────────┐
             │   PostgreSQL      │
             │   (RDS Aurora)    │
             │   Multi-AZ        │
             └─────────┬─────────┘
                       │
             ┌─────────v─────────┐
             │   Redis Cache     │
             │   (ElastiCache)   │
             └───────────────────┘

┌─────────────────────────────────────────────────────┐
│         Orchestrator + Workers (ECS)                │
│  ┌───────────────┐  ┌─────────────────────────┐    │
│  │ Orchestrator  │  │  Worker Pool (12)       │    │
│  │ (1 instance)  │  │  (Auto-scaling 1-10x)   │    │
│  └───────────────┘  └─────────────────────────┘    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Static Frontend (S3 + CloudFront)           │
└─────────────────────────────────────────────────────┘
```

### Service Configuration

#### API Servers
- **Container**: Node.js 20 + Express
- **CPU**: 1 vCPU
- **Memory**: 2 GB
- **Auto-scaling**: 2-10 tasks based on CPU >70%
- **Health check**: `GET /health` every 30s

#### Orchestrator
- **Container**: Node.js 20 + TypeScript
- **CPU**: 2 vCPU
- **Memory**: 4 GB
- **Replicas**: 1 (singleton pattern)
- **Health check**: Heartbeat to DynamoDB every 60s

#### Workers
- **Container**: Node.js 20 + TypeScript
- **CPU**: 1 vCPU per worker
- **Memory**: 2 GB per worker
- **Auto-scaling**: 1-10 instances per worker type
- **Concurrency**: Controlled by orchestrator

#### Database
- **Engine**: PostgreSQL 15 (Aurora Serverless v2)
- **ACU**: 0.5 - 8 (auto-scaling)
- **Backup**: Daily snapshots, 7-day retention
- **Replicas**: 1 read replica in different AZ

#### Cache
- **Engine**: Redis 7
- **Node type**: cache.t4g.medium
- **Replicas**: 1 (automatic failover)
- **Eviction**: LRU policy

---

### Operational Invariants

1. **Zero Downtime Deploys**: Rolling updates with health checks
2. **Database Migrations**: Run in transaction, with rollback on failure
3. **Worker Isolation**: Each worker type in separate task definition
4. **Secrets Management**: AWS Secrets Manager, rotated every 90 days
5. **Log Retention**: CloudWatch logs kept for 30 days, then archived to S3
6. **Monitoring**: Datadog APM + custom metrics dashboard
7. **Alerting**: PagerDuty integration for critical failures
8. **Disaster Recovery**: RTO 4 hours, RPO 1 hour (point-in-time restore)

---

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=secret

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Orchestrator
ORCHESTRATOR_POLL_INTERVAL_MS=5000
ORCHESTRATOR_MAX_CONCURRENT_JOBS=100
HEALDEC_ENABLED=true

# Workers
WORKER_CONCURRENCY_INDEX=5
WORKER_CONCURRENCY_IDENTITY=10
WORKER_CONCURRENCY_SCORE=8
# ... (one per worker type)

# Observability
DATADOG_API_KEY=xxxxxxxxxxxxx
LOG_LEVEL=info
SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxxx

# API
JWT_SECRET=xxxxxxxxxxxxx
API_RATE_LIMIT_PER_MINUTE=100
```

---

## Implementation Status

### ✅ Completed (Production-Ready)

- [x] Database schema design and migrations
- [x] Core table implementation (repos, identities, identity_claims, scores, events)
- [x] Orchestration tables (jobs, healdec_log, migrations)
- [x] One-File Orchestrator skeleton
- [x] Worker base interface and contracts
- [x] Healdec engine framework (classification + strategies)
- [x] Public API scaffold with health endpoint
- [x] Basic authentication (JWT + API keys)
- [x] Logging infrastructure (Pino + structured logs)
- [x] CI/CD pipeline (GitHub Actions → AWS ECS)

### 🚧 In Progress

- [ ] IndexWorker implementation (70% complete)
- [ ] IdentityWorker implementation (60% complete)
- [ ] ScoreWorker implementation (50% complete)
- [ ] Operator Dashboard UI (40% complete)
  - [x] Layout system
  - [x] VitalsModal component
  - [ ] RepoCard component
  - [ ] SmartBrainTerminal
  - [ ] Other modals
- [ ] Healdec retry strategy (80% complete)
- [ ] Healdec restart strategy (40% complete)

### 📋 Planned (Not Started)

- [ ] IngestWorker (webhook ingestion)
- [ ] SyncWorker (GitHub sync)
- [ ] GCWorker (garbage collection)
- [ ] AlertWorker (notifications)
- [ ] ExportWorker (reports)
- [ ] AuditWorker (compliance logging)
- [ ] RepairWorker (data repair)
- [ ] BackfillWorker (historical data)
- [ ] MaintenanceWorker (DB optimization)
- [ ] Admin Console UI
- [ ] Healdec quarantine strategy
- [ ] Healdec rollback strategy
- [ ] Healdec escalate strategy
- [ ] Full API endpoint suite
- [ ] Rate limiting implementation
- [ ] OpenAPI spec generation
- [ ] Monitoring dashboards (Grafana)
- [ ] Production load testing
- [ ] Disaster recovery drills

---

### Version History

- **v4.0.0** (2026-01-28): Initial production architecture specification
- **v3.0.0** (2025-12): Prototype with 6 workers, basic healing
- **v2.0.0** (2025-06): MVP with manual job triggering
- **v1.0.0** (2024-12): Proof of concept, single-repo scoring

---

## References

- [MERMEDA.md](./MERMEDA.md) - Complete Mermaid diagram suite
- [docs/REPOSITORY_STRUCTURE.md](./docs/REPOSITORY_STRUCTURE.md) - Suggested folder layout
- [docs/OPERATOR_HANDBOOK.md](./docs/OPERATOR_HANDBOOK.md) - Deployment and operations guide
- [docs/DOCS_SITE_STRUCTURE.md](./docs/DOCS_SITE_STRUCTURE.md) - Documentation site layout

---

**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  
**License:** MIT

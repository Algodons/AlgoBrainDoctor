# AlgoBrainDoctor — Brain-Doctor Hospital V4 🧠⚡

> **Production-ready repository health monitoring and auto-healing platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-4.0.0-purple.svg)](ARCHITECTURE.md)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](docs/OPERATOR_HANDBOOK.md)

---

## 🎯 Overview

Brain-Doctor Hospital V4 is an advanced GitOps health monitoring system that continuously scans repositories, tracks developer identities, computes health scores, and automatically remediates issues through intelligent auto-healing strategies.

### Key Features

- 🔄 **Self-Healing**: Autonomous error detection and recovery via Healdec engine
- ⚡ **12 Parallel Workers**: Specialized workers for indexing, scoring, ingestion, and more
- 🎛️ **One-File Orchestrator**: Centralized job scheduling and worker supervision
- 📊 **Real-Time Scoring**: Repository health scores (0-100) with detailed breakdowns
- 🔍 **Identity Resolution**: Developer identity tracking and claim management
- 🎨 **Aura FX UI**: Neo-glow cyber-medical theme with GitHub Dark base
- 🚀 **Production-Ready**: AWS ECS deployment with auto-scaling and monitoring

---

## 📚 Documentation

### Core Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete production architecture specification
  - One-file orchestrator design
  - Healdec auto-healing engine
  - 12 parallel workers
  - Database schema
  - UI/UX design system (Aura FX Neo-Glow + GitHub Dark)
  - Production deployment topology

- **[MERMEDA.md](MERMEDA.md)** - Comprehensive Mermaid diagram suite
  - System architecture diagrams
  - Worker pipeline flows
  - Healdec recovery flows
  - Data flow diagrams
  - UI component hierarchy
  - Database schema ERD
  - Deployment topology

### Operational Guides

- **[docs/OPERATOR_HANDBOOK.md](docs/OPERATOR_HANDBOOK.md)** - Production operations guide
  - Deployment runbook
  - Monitoring & observability
  - Healing & recovery
  - Scaling strategies
  - Troubleshooting
  - Maintenance tasks

- **[docs/REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md)** - Complete folder layout
- **[docs/DOCS_SITE_STRUCTURE.md](docs/DOCS_SITE_STRUCTURE.md)** - MkDocs/Docusaurus configuration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- GitHub Personal Access Token

### Installation

```bash
# Clone repository
git clone https://github.com/Algodons/AlgoBrainDoctor.git
cd AlgoBrainDoctor

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Setup database
./scripts/setup/init-db.sh
./scripts/db/migrate.sh

# Start services
pnpm dev
```

### Access Dashboard

Open http://localhost:5173 in your browser.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Load Balancer (AWS ALB)                │
└──────────────┬──────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     │   API Servers     │
     └─────────┬─────────┘
               │
     ┌─────────┴─────────┐
     │   Orchestrator    │ ←─── Healdec Auto-Healing
     └─────────┬─────────┘
               │
     ┌─────────┴─────────┐
     │  12 Workers Pool  │
     └─────────┬─────────┘
               │
     ┌─────────┴─────────┐
     │  PostgreSQL + Redis│
     └───────────────────┘
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete details.

---

## 🎨 UI/UX Design System

### Aura FX Neo-Glow + GitHub Dark Theme

**Color Palette:**
- Violet Aura: `#A78BFA` - Primary actions and glow effects
- Aqua Pulse: `#4FD1C5` - Health indicators and success states
- Coral Heat: `#F87171` - Alerts and warnings
- Cyber Yellow: `#FACC15` - Caution states and highlights

**Core Components:**
- VitalsModal - Quick health metrics view
- HealthReportModal - Full diagnostic report
- RepoCard - Repository list item with health bar
- ScanBox - Individual scan result display
- SmartBrainTerminal - Real-time log viewer
- BlackboxModal - Job queue inspector
- ImmunizerModal - Healdec healing controls
- ActionWorkflowModal - Manual job triggers

See [ARCHITECTURE.md#uiux-design-system](ARCHITECTURE.md#uiux-design-system) for complete design specifications.

---

## 🔧 12 Parallel Workers

1. **IndexWorker** - Discover repositories
2. **IdentityWorker** - Extract developer identities
3. **ScoreWorker** - Compute health scores
4. **IngestWorker** - Process GitHub webhooks
5. **SyncWorker** - Sync repo metadata
6. **GCWorker** - Garbage collection
7. **AlertWorker** - Monitor and notify
8. **ExportWorker** - Generate reports
9. **AuditWorker** - Compliance logging
10. **RepairWorker** - Fix data inconsistencies
11. **BackfillWorker** - Historical data population
12. **MaintenanceWorker** - Database optimization

See [ARCHITECTURE.md#12-parallel-workers](ARCHITECTURE.md#12-parallel-workers) for worker details.

---

## 🏥 Healdec Auto-Healing Engine

Autonomous recovery system with 5 strategies:

1. **Retry** - Exponential backoff for transient failures
2. **Restart** - Worker process restart for crashes
3. **Quarantine** - Isolate problematic jobs for review
4. **Rollback** - Undo partial changes with compensating transactions
5. **Escalate** - Page on-call for critical failures

See [ARCHITECTURE.md#healdec-auto-healing-engine](ARCHITECTURE.md#healdec-auto-healing-engine) for recovery logic.

---

## 📊 Database Schema

Core tables:
- `repos` - Repository metadata
- `identities` - Developer identities
- `identity_claims` - Identity-repo relationships
- `scores` - Health score history
- `events` - Immutable event log

Orchestration tables:
- `jobs` - Work queue
- `healdec_log` - Auto-healing decisions
- `migrations` - Schema version tracking

See [MERMEDA.md#6-database-schema-erd](MERMEDA.md#6-database-schema-erd) for ERD.

---

## 🚀 Deployment

### AWS ECS Production Deployment

```bash
# Build and push Docker images
./scripts/deploy/build-api.sh
./scripts/deploy/build-orchestrator.sh
./scripts/deploy/build-workers.sh

# Deploy services
aws ecs update-service --cluster algobrain-prod --service api --force-new-deployment
aws ecs update-service --cluster algobrain-prod --service orchestrator --force-new-deployment
aws ecs update-service --cluster algobrain-prod --service workers --force-new-deployment

# Deploy frontend
cd src/ui && pnpm build
aws s3 sync dist/ s3://algobrain-frontend/ --delete
```

See [docs/OPERATOR_HANDBOOK.md#1-deployment-runbook](docs/OPERATOR_HANDBOOK.md#1-deployment-runbook) for complete deployment guide.

---

## 📈 Monitoring

Key metrics:
- Worker success rate (>99% target)
- Healdec action rate (<5% target)
- API latency p95 (<500ms target)
- Queue depth (<100 pending)
- Database connections (<80% pool)

See [docs/OPERATOR_HANDBOOK.md#2-monitoring--observability](docs/OPERATOR_HANDBOOK.md#2-monitoring--observability) for monitoring setup.

---

## 🤝 Contributing

See [docs/DOCS_SITE_STRUCTURE.md](docs/DOCS_SITE_STRUCTURE.md) for contribution guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Architecture Documentation](ARCHITECTURE.md)
- [Mermaid Diagrams](MERMEDA.md)
- [Operator Handbook](docs/OPERATOR_HANDBOOK.md)
- [Repository Structure](docs/REPOSITORY_STRUCTURE.md)
- [Documentation Site Structure](docs/DOCS_SITE_STRUCTURE.md)

---

**Version:** 4.0.0  
**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  

Made with 🧠⚡ by the AlgoBrainDoctor team
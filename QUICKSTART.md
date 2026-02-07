# Quick Start Guide

## Installation

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development

### Run the UI

```bash
cd src/ui
pnpm dev
```

The UI will be available at http://localhost:5173

### Build All Packages

```bash
# From root directory
pnpm build
```

## Project Structure

- `src/shared/` - Shared types and utilities
- `src/workers/` - Worker implementations (Index, Identity, Score)
- `src/healdec/` - Auto-healing engine with retry and restart strategies
- `src/ui/` - React UI with Operator Dashboard

## Key Features Implemented

### Workers (70-100% Complete)
- ✅ IndexWorker - Repository discovery
- ✅ IdentityWorker - Developer identity extraction
- ✅ ScoreWorker - Health score computation

### Healdec Strategies (80-100% Complete)
- ✅ Retry Strategy - Exponential backoff for transient failures
- ✅ Restart Strategy - Worker crash recovery

### UI Components (100% Complete)
- ✅ Operator Dashboard - Worker monitoring and system vitals
- ✅ VitalsModal - Repository health dashboard
- ✅ RepoCard - Repository display cards
- ✅ SmartBrainTerminal - Log viewer
- ✅ Layout System - Responsive grid layout

## Design System

The UI uses the **Aura FX Neo-Glow** design system with GitHub Dark base:

- **Violet Aura** (#A78BFA) - Primary actions
- **Aqua Pulse** (#4FD1C5) - Success states
- **Coral Heat** (#F87171) - Errors and alerts
- **Cyber Yellow** (#FACC15) - Warnings

## Next Steps

1. Implement remaining 9 workers (Ingest, Sync, GC, Alert, Export, Audit, Repair, Backfill, Maintenance)
2. Add API backend for data persistence
3. Implement additional modals (HealdecModal, ClaimModal)
4. Add unit and integration tests
5. Wire up real-time data connections

## Documentation

See the following files for detailed information:
- `ARCHITECTURE.md` - Complete architecture specification
- `README.md` - Project overview
- `MERMEDA.md` - System diagrams
- `docs/OPERATOR_HANDBOOK.md` - Operations guide

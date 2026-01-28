ADAPTIVE UI/UX SPEC — SPARK.MD (Production‑Aligned)
AuraFX Neo‑Glow • GitHub‑Dark • Operator‑Grade • Deterministic
1. Purpose
SPARK is the adaptive UI/UX layer for AlgoBrainDoctor v0.1 and Brain‑Doctor Hospital V4.

It provides:

A deterministic operator interface for orchestrator, Healdec, and all 12 workers

A cyber‑medical neon aesthetic (AuraFX Neo‑Glow)

A role‑aware adaptive layout for operators, admins, analysts, validators, and developers

A unified component system used across dashboards, modals, terminals, and workflows

A GitHub‑Dark‑compatible theme for seamless integration with repos and developer tools

SPARK is the canonical UI/UX contract for all modules.

2. Design Language — AuraFX Neo‑Glow
2.1 Aesthetic Principles
Dark medical cyber‑lab

Soft neon diffusion

Animated glow edges

High‑contrast GitHub‑Dark base

Zero visual noise

2.2 Color Tokens
Token	Hex	Purpose
--aura-violet	#A78BFA	Primary accent, identity, modals
--aura-aqua	#4FD1C5	Live metrics, vitals, sync
--aura-coral	#F87171	Errors, alerts, Healdec failures
--aura-yellow	#FACC15	Warnings, scan boxes
--bg-dark	#0B0E14	Global background
--bg-panel	#11151C	Cards, modals, terminals
--border-dark	#1C212B	Dividers, table lines
2.3 Glow Rules
Radius: 8–14px

Opacity: 0.35–0.55

Applied to:

Buttons

Active sidebar items

Live metrics

Worker health indicators

Scan boxes

Terminal cursors

3. Layout System
3.1 Global Structure
Matches the architecture’s operator dashboard:

Left: Navigation + Repo/Fleet switcher
Center: Vitals, scans, claims, governance, workers
Right: Logs, Healdec actions, live metrics

3.2 Responsive Grid
Device	Columns	Behavior
Mobile	4	Stacked panels, bottom nav
Tablet	8	Two‑column adaptive
Desktop	12	Full 3‑column layout
Ultra‑wide	12 + fluid	Data‑dense mode
3.3 Role‑Adaptive Views
Each role gets a tailored dashboard:

Operator
Fleet overview

Worker health

Healdec actions

Auto‑healing log

Admin
Backfills

Reindexing

Overrides

Raw record inspection

Analyst
Query builder

Table explorer

Graph surfaces

Export tools

Developer
API keys

Webhooks

Error traces

Sandbox console

Validator
Node uptime

Slashing risk

Performance metrics

4. Core Components (Aligned With Architecture.md)
4.1 VitalsModal
Real‑time repo vitals

Aqua pulse glow

Animated metric sweep

4.2 HealthReportModal
Full scan report

Violet aura glow

Timeline of events

4.3 RepoCard
Repo identity + health

GitHub‑Dark + neon border

4.4 ScanBox
Framework detection

Cyber‑yellow edge

Expandable details

4.5 SmartBrainTerminal
Surgeon + repair logs

Coral heat glow

Live cursor pulse

4.6 BlackboxModal
Execution trace

Deep neon blue

Step‑through mode

4.7 ImmunizerModal
Invariant locks

Violet shield glow

Auto‑heal triggers

4.8 ActionWorkflowModal
GitHub Actions analysis

Aqua grid glow

Step‑by‑step workflow

5. Interaction Model
5.1 Motion
120–180ms transitions

No bounce

No overshoot

Glow fades smoothly

5.2 Feedback
Toasts for success/error

Inline validation

Real‑time pulses for live metrics

5.3 AI Assistance
Right‑rail suggestions

Inline hints

Auto‑generated summaries

Context‑aware actions

6. Mobile Behavior
Bottom navigation

Collapsible repo switcher

Stacked modals

Touch‑optimized neon buttons

7. Accessibility
WCAG AA contrast

Keyboard navigation

Reduced motion mode

Screen reader labels

8. File Structure (Production‑Aligned)
Matches .algo/uispects.md conventions.

Code
/ui
  /tokens
    colors.json
    spacing.json
    typography.json
  /components
    vitals-modal.tsx
    health-report-modal.tsx
    repo-card.tsx
    scan-box.tsx
    smartbrain-terminal.tsx
    blackbox-modal.tsx
    immunizer-modal.tsx
    action-workflow-modal.tsx
  /layouts
    dashboard.tsx
    sidebar.tsx
    topnav.tsx
    right-rail.tsx
  /roles
    operator/
    admin/
    analyst/
    dev/
    validator/
  /themes
    aurafx-dark.css
9. Versioning
V1 — Base components + tokens

V2 — Role dashboards + adaptive density

V3 — AuraFX neon system + AI rail

V4 — Deterministic layouts + governance‑locked behavior

10. Alignment With ARCHITECTURE.md
This UI/UX spec is directly aligned with the architecture you attached.

It matches:

The orchestrator model

The Healdec auto‑healing engine

The 12‑worker pool

The operator dashboard views

The identity + scoring + claim flows

The database schema

The full‑stack app structure

This is the correct production‑grade UI/UX layer for your system.

# Brain-Doctor Hospital V4 — Documentation Site Structure

> **MkDocs/Docusaurus Layout Specification**  
> **Version:** 4.0  
> **Last Updated:** 2026-01-28

This document defines the complete structure for a production-ready documentation website using MkDocs or Docusaurus.

---

## Table of Contents

1. [MkDocs Configuration](#mkdocs-configuration)
2. [Docusaurus Configuration](#docusaurus-configuration)
3. [Documentation Tree](#documentation-tree)
4. [Getting Started Guide](#getting-started-guide)
5. [API Reference Skeleton](#api-reference-skeleton)
6. [Deployment Checklist](#deployment-checklist)

---

## MkDocs Configuration

### `mkdocs.yml`

```yaml
site_name: Brain-Doctor Hospital V4 Documentation
site_url: https://docs.algobrain.doctor
site_description: Production-ready repository health monitoring and auto-healing platform
site_author: AlgoBrainDoctor Core Team

repo_name: Algodons/AlgoBrainDoctor
repo_url: https://github.com/Algodons/AlgoBrainDoctor
edit_uri: edit/main/docs/

theme:
  name: material
  custom_dir: docs/overrides
  palette:
    # GitHub Dark theme integration
    - scheme: slate
      primary: deep purple  # Violet Aura
      accent: cyan          # Aqua Pulse
      toggle:
        icon: material/brightness-4
        name: Switch to light mode
    - scheme: default
      primary: deep purple
      accent: cyan
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode
  
  features:
    - navigation.instant      # Fast page loads
    - navigation.tracking     # URL updates in address bar
    - navigation.tabs         # Top-level tabs
    - navigation.sections     # Collapsible sections
    - navigation.expand       # Expand all sections by default
    - navigation.indexes      # Section index pages
    - navigation.top          # Back to top button
    - search.suggest          # Search suggestions
    - search.highlight        # Highlight search terms
    - content.code.copy       # Copy code button
    - content.tabs.link       # Link tabs across pages
  
  icon:
    repo: fontawesome/brands/github
    admonition:
      note: octicons/tag-16
      abstract: octicons/checklist-16
      info: octicons/info-16
      tip: octicons/light-bulb-16
      success: octicons/check-16
      question: octicons/question-16
      warning: octicons/alert-16
      failure: octicons/x-circle-16
      danger: octicons/zap-16
      bug: octicons/bug-16
      example: octicons/beaker-16
      quote: octicons/quote-16

  font:
    text: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif
    code: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace

extra_css:
  - stylesheets/aura-fx.css
  - stylesheets/neo-glow.css
  - stylesheets/custom.css

extra_javascript:
  - javascripts/mermaid.min.js

plugins:
  - search:
      lang: en
  - mermaid2:
      version: 10.6.1
  - git-revision-date-localized:
      type: date
  - minify:
      minify_html: true
  - social:
      cards_layout_options:
        background_color: "#0d1117"
        color: "#A78BFA"

markdown_extensions:
  # Python Markdown
  - abbr
  - admonition
  - attr_list
  - def_list
  - footnotes
  - md_in_html
  - tables
  - toc:
      permalink: true
      toc_depth: 3
  
  # Python Markdown Extensions
  - pymdownx.arithmatex:
      generic: true
  - pymdownx.betterem:
      smart_enable: all
  - pymdownx.caret
  - pymdownx.details
  - pymdownx.emoji:
      emoji_index: !!python/name:materialx.emoji.twemoji
      emoji_generator: !!python/name:materialx.emoji.to_svg
  - pymdownx.highlight:
      anchor_linenums: true
      line_spans: __span
      pygments_lang_class: true
  - pymdownx.inlinehilite
  - pymdownx.keys
  - pymdownx.mark
  - pymdownx.smartsymbols
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.tasklist:
      custom_checkbox: true
  - pymdownx.tilde

nav:
  - Home: index.md
  
  - Getting Started:
      - Quick Start: getting-started/quickstart.md
      - Installation: getting-started/installation.md
      - Configuration: getting-started/configuration.md
      - First Repository: getting-started/first-repo.md
  
  - Architecture:
      - Overview: architecture/overview.md
      - System Design: architecture/system-design.md
      - Orchestrator: architecture/orchestrator.md
      - Healdec Engine: architecture/healdec.md
      - Workers:
          - Overview: architecture/workers/overview.md
          - IndexWorker: architecture/workers/index-worker.md
          - IdentityWorker: architecture/workers/identity-worker.md
          - ScoreWorker: architecture/workers/score-worker.md
          - IngestWorker: architecture/workers/ingest-worker.md
          - SyncWorker: architecture/workers/sync-worker.md
          - GCWorker: architecture/workers/gc-worker.md
          - AlertWorker: architecture/workers/alert-worker.md
          - ExportWorker: architecture/workers/export-worker.md
          - AuditWorker: architecture/workers/audit-worker.md
          - RepairWorker: architecture/workers/repair-worker.md
          - BackfillWorker: architecture/workers/backfill-worker.md
          - MaintenanceWorker: architecture/workers/maintenance-worker.md
      - Database: architecture/database.md
      - Data Flows: architecture/data-flows.md
  
  - UI/UX:
      - Design System: ui/design-system.md
      - Color Palette: ui/colors.md
      - Aura FX Effects: ui/aura-fx.md
      - Neo-Glow Theme: ui/neo-glow.md
      - GitHub Dark Base: ui/github-dark.md
      - Components:
          - Overview: ui/components/overview.md
          - VitalsModal: ui/components/vitals-modal.md
          - HealthReportModal: ui/components/health-report-modal.md
          - RepoCard: ui/components/repo-card.md
          - ScanBox: ui/components/scan-box.md
          - SmartBrainTerminal: ui/components/smart-brain-terminal.md
          - BlackboxModal: ui/components/blackbox-modal.md
          - ImmunizerModal: ui/components/immunizer-modal.md
          - ActionWorkflowModal: ui/components/action-workflow-modal.md
      - Layout System: ui/layout.md
      - Responsive Design: ui/responsive.md
      - Accessibility: ui/accessibility.md
  
  - API Reference:
      - Overview: api/overview.md
      - Authentication: api/authentication.md
      - Rate Limiting: api/rate-limiting.md
      - Endpoints:
          - Health: api/endpoints/health.md
          - Repositories: api/endpoints/repositories.md
          - Identities: api/endpoints/identities.md
          - Scores: api/endpoints/scores.md
          - Jobs: api/endpoints/jobs.md
          - Events: api/endpoints/events.md
          - Admin: api/endpoints/admin.md
      - Webhooks:
          - GitHub Webhooks: api/webhooks/github.md
          - Signature Verification: api/webhooks/signatures.md
      - Error Handling: api/errors.md
      - Pagination: api/pagination.md
  
  - Operations:
      - Operator Handbook: ops/handbook.md
      - Deployment:
          - Overview: ops/deployment/overview.md
          - Prerequisites: ops/deployment/prerequisites.md
          - AWS Setup: ops/deployment/aws-setup.md
          - Database Migration: ops/deployment/database.md
          - Service Startup: ops/deployment/services.md
          - Health Checks: ops/deployment/health-checks.md
          - Rollback: ops/deployment/rollback.md
      - Monitoring:
          - Overview: ops/monitoring/overview.md
          - Key Metrics: ops/monitoring/metrics.md
          - Alerting: ops/monitoring/alerting.md
          - Dashboards: ops/monitoring/dashboards.md
          - Log Aggregation: ops/monitoring/logs.md
      - Healing & Recovery:
          - Healdec Logs: ops/healing/logs.md
          - Manual Reruns: ops/healing/reruns.md
          - Quarantine Inspection: ops/healing/quarantine.md
          - RepairWorker: ops/healing/repair.md
      - Scaling:
          - API Scaling: ops/scaling/api.md
          - Worker Tuning: ops/scaling/workers.md
          - Database Replicas: ops/scaling/database.md
          - Cache Optimization: ops/scaling/cache.md
      - Troubleshooting:
          - Common Issues: ops/troubleshooting/common.md
          - Worker Failures: ops/troubleshooting/workers.md
          - Database Issues: ops/troubleshooting/database.md
          - Queue Backpressure: ops/troubleshooting/queues.md
      - Maintenance:
          - Backfills: ops/maintenance/backfills.md
          - Schema Migrations: ops/maintenance/migrations.md
          - Garbage Collection: ops/maintenance/gc.md
          - Secrets Rotation: ops/maintenance/secrets.md
  
  - Diagrams:
      - System Architecture: diagrams/system-architecture.md
      - Worker Pipeline: diagrams/worker-pipeline.md
      - Healdec Flow: diagrams/healdec-flow.md
      - Data Flows: diagrams/data-flows.md
      - UI Components: diagrams/ui-components.md
      - Database Schema: diagrams/database-schema.md
      - Deployment Topology: diagrams/deployment-topology.md
  
  - Contributing:
      - Overview: contributing/overview.md
      - Development Setup: contributing/development.md
      - Coding Standards: contributing/coding-standards.md
      - Testing Guide: contributing/testing.md
      - Pull Request Process: contributing/pull-requests.md
      - Release Process: contributing/releases.md
  
  - Reference:
      - Glossary: reference/glossary.md
      - Configuration Options: reference/configuration.md
      - Environment Variables: reference/environment.md
      - CLI Commands: reference/cli.md
      - Database Schema: reference/schema.md
      - Job Types: reference/job-types.md
      - Event Types: reference/event-types.md
  
  - FAQ: faq.md
  - Changelog: changelog.md

extra:
  version:
    provider: mike
  social:
    - icon: fontawesome/brands/github
      link: https://github.com/Algodons/AlgoBrainDoctor
    - icon: fontawesome/brands/twitter
      link: https://twitter.com/algobrain
    - icon: fontawesome/brands/slack
      link: https://algobrain.slack.com

copyright: Copyright &copy; 2026 AlgoBrainDoctor Core Team | MIT License
```

---

## Docusaurus Configuration

### `docusaurus.config.js`

```javascript
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Brain-Doctor Hospital V4',
  tagline: 'Production-ready repository health monitoring and auto-healing platform',
  favicon: 'img/favicon.ico',

  url: 'https://docs.algobrain.doctor',
  baseUrl: '/',

  organizationName: 'Algodons',
  projectName: 'AlgoBrainDoctor',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Algodons/AlgoBrainDoctor/edit/main/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/algobrain-social-card.jpg',
      
      navbar: {
        title: 'Brain-Doctor Hospital V4',
        logo: {
          alt: 'AlgoBrainDoctor Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'gettingStarted',
            position: 'left',
            label: 'Getting Started',
          },
          {
            type: 'docSidebar',
            sidebarId: 'architecture',
            position: 'left',
            label: 'Architecture',
          },
          {
            type: 'docSidebar',
            sidebarId: 'api',
            position: 'left',
            label: 'API',
          },
          {
            type: 'docSidebar',
            sidebarId: 'operations',
            position: 'left',
            label: 'Operations',
          },
          {
            href: 'https://github.com/Algodons/AlgoBrainDoctor',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/getting-started/quickstart',
              },
              {
                label: 'Architecture',
                to: '/architecture/overview',
              },
              {
                label: 'API Reference',
                to: '/api/overview',
              },
            ],
          },
          {
            title: 'Operations',
            items: [
              {
                label: 'Operator Handbook',
                to: '/ops/handbook',
              },
              {
                label: 'Deployment Guide',
                to: '/ops/deployment/overview',
              },
              {
                label: 'Troubleshooting',
                to: '/ops/troubleshooting/common',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Algodons/AlgoBrainDoctor',
              },
              {
                label: 'Slack',
                href: 'https://algobrain.slack.com',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/algobrain',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AlgoBrainDoctor Core Team. Built with Docusaurus.`,
      },
      
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'typescript', 'sql', 'yaml', 'json'],
      },
      
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'algobrain',
        contextualSearch: true,
      },
      
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'community',
        path: 'community',
        routeBasePath: 'community',
        sidebarPath: require.resolve('./sidebarsCommunity.js'),
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },
  
  themes: ['@docusaurus/theme-mermaid'],
};

module.exports = config;
```

### `sidebars.js`

```javascript
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  gettingStarted: [
    'getting-started/quickstart',
    'getting-started/installation',
    'getting-started/configuration',
    'getting-started/first-repo',
  ],
  
  architecture: [
    'architecture/overview',
    'architecture/system-design',
    'architecture/orchestrator',
    'architecture/healdec',
    {
      type: 'category',
      label: 'Workers',
      items: [
        'architecture/workers/overview',
        'architecture/workers/index-worker',
        'architecture/workers/identity-worker',
        'architecture/workers/score-worker',
        'architecture/workers/ingest-worker',
        'architecture/workers/sync-worker',
        'architecture/workers/gc-worker',
        'architecture/workers/alert-worker',
        'architecture/workers/export-worker',
        'architecture/workers/audit-worker',
        'architecture/workers/repair-worker',
        'architecture/workers/backfill-worker',
        'architecture/workers/maintenance-worker',
      ],
    },
    'architecture/database',
    'architecture/data-flows',
  ],
  
  ui: [
    'ui/design-system',
    'ui/colors',
    'ui/aura-fx',
    'ui/neo-glow',
    'ui/github-dark',
    {
      type: 'category',
      label: 'Components',
      items: [
        'ui/components/overview',
        'ui/components/vitals-modal',
        'ui/components/health-report-modal',
        'ui/components/repo-card',
        'ui/components/scan-box',
        'ui/components/smart-brain-terminal',
        'ui/components/blackbox-modal',
        'ui/components/immunizer-modal',
        'ui/components/action-workflow-modal',
      ],
    },
    'ui/layout',
    'ui/responsive',
    'ui/accessibility',
  ],
  
  api: [
    'api/overview',
    'api/authentication',
    'api/rate-limiting',
    {
      type: 'category',
      label: 'Endpoints',
      items: [
        'api/endpoints/health',
        'api/endpoints/repositories',
        'api/endpoints/identities',
        'api/endpoints/scores',
        'api/endpoints/jobs',
        'api/endpoints/events',
        'api/endpoints/admin',
      ],
    },
    {
      type: 'category',
      label: 'Webhooks',
      items: [
        'api/webhooks/github',
        'api/webhooks/signatures',
      ],
    },
    'api/errors',
    'api/pagination',
  ],
  
  operations: [
    'ops/handbook',
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'ops/deployment/overview',
        'ops/deployment/prerequisites',
        'ops/deployment/aws-setup',
        'ops/deployment/database',
        'ops/deployment/services',
        'ops/deployment/health-checks',
        'ops/deployment/rollback',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring',
      items: [
        'ops/monitoring/overview',
        'ops/monitoring/metrics',
        'ops/monitoring/alerting',
        'ops/monitoring/dashboards',
        'ops/monitoring/logs',
      ],
    },
    {
      type: 'category',
      label: 'Healing & Recovery',
      items: [
        'ops/healing/logs',
        'ops/healing/reruns',
        'ops/healing/quarantine',
        'ops/healing/repair',
      ],
    },
    {
      type: 'category',
      label: 'Scaling',
      items: [
        'ops/scaling/api',
        'ops/scaling/workers',
        'ops/scaling/database',
        'ops/scaling/cache',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'ops/troubleshooting/common',
        'ops/troubleshooting/workers',
        'ops/troubleshooting/database',
        'ops/troubleshooting/queues',
      ],
    },
    {
      type: 'category',
      label: 'Maintenance',
      items: [
        'ops/maintenance/backfills',
        'ops/maintenance/migrations',
        'ops/maintenance/gc',
        'ops/maintenance/secrets',
      ],
    },
  ],
  
  diagrams: [
    'diagrams/system-architecture',
    'diagrams/worker-pipeline',
    'diagrams/healdec-flow',
    'diagrams/data-flows',
    'diagrams/ui-components',
    'diagrams/database-schema',
    'diagrams/deployment-topology',
  ],
  
  contributing: [
    'contributing/overview',
    'contributing/development',
    'contributing/coding-standards',
    'contributing/testing',
    'contributing/pull-requests',
    'contributing/releases',
  ],
  
  reference: [
    'reference/glossary',
    'reference/configuration',
    'reference/environment',
    'reference/cli',
    'reference/schema',
    'reference/job-types',
    'reference/event-types',
  ],
};

module.exports = sidebars;
```

---

## Documentation Tree

### Complete File Structure

```
docs/
├── index.md                          # Homepage
├── getting-started/
│   ├── quickstart.md
│   ├── installation.md
│   ├── configuration.md
│   └── first-repo.md
├── architecture/
│   ├── overview.md
│   ├── system-design.md
│   ├── orchestrator.md
│   ├── healdec.md
│   ├── workers/
│   │   ├── overview.md
│   │   ├── index-worker.md
│   │   ├── identity-worker.md
│   │   ├── score-worker.md
│   │   ├── ingest-worker.md
│   │   ├── sync-worker.md
│   │   ├── gc-worker.md
│   │   ├── alert-worker.md
│   │   ├── export-worker.md
│   │   ├── audit-worker.md
│   │   ├── repair-worker.md
│   │   ├── backfill-worker.md
│   │   └── maintenance-worker.md
│   ├── database.md
│   └── data-flows.md
├── ui/
│   ├── design-system.md
│   ├── colors.md
│   ├── aura-fx.md
│   ├── neo-glow.md
│   ├── github-dark.md
│   ├── components/
│   │   ├── overview.md
│   │   ├── vitals-modal.md
│   │   ├── health-report-modal.md
│   │   ├── repo-card.md
│   │   ├── scan-box.md
│   │   ├── smart-brain-terminal.md
│   │   ├── blackbox-modal.md
│   │   ├── immunizer-modal.md
│   │   └── action-workflow-modal.md
│   ├── layout.md
│   ├── responsive.md
│   └── accessibility.md
├── api/
│   ├── overview.md
│   ├── authentication.md
│   ├── rate-limiting.md
│   ├── endpoints/
│   │   ├── health.md
│   │   ├── repositories.md
│   │   ├── identities.md
│   │   ├── scores.md
│   │   ├── jobs.md
│   │   ├── events.md
│   │   └── admin.md
│   ├── webhooks/
│   │   ├── github.md
│   │   └── signatures.md
│   ├── errors.md
│   └── pagination.md
├── ops/
│   ├── handbook.md
│   ├── deployment/
│   │   ├── overview.md
│   │   ├── prerequisites.md
│   │   ├── aws-setup.md
│   │   ├── database.md
│   │   ├── services.md
│   │   ├── health-checks.md
│   │   └── rollback.md
│   ├── monitoring/
│   │   ├── overview.md
│   │   ├── metrics.md
│   │   ├── alerting.md
│   │   ├── dashboards.md
│   │   └── logs.md
│   ├── healing/
│   │   ├── logs.md
│   │   ├── reruns.md
│   │   ├── quarantine.md
│   │   └── repair.md
│   ├── scaling/
│   │   ├── api.md
│   │   ├── workers.md
│   │   ├── database.md
│   │   └── cache.md
│   ├── troubleshooting/
│   │   ├── common.md
│   │   ├── workers.md
│   │   ├── database.md
│   │   └── queues.md
│   └── maintenance/
│       ├── backfills.md
│       ├── migrations.md
│       ├── gc.md
│       └── secrets.md
├── diagrams/
│   ├── system-architecture.md
│   ├── worker-pipeline.md
│   ├── healdec-flow.md
│   ├── data-flows.md
│   ├── ui-components.md
│   ├── database-schema.md
│   └── deployment-topology.md
├── contributing/
│   ├── overview.md
│   ├── development.md
│   ├── coding-standards.md
│   ├── testing.md
│   ├── pull-requests.md
│   └── releases.md
├── reference/
│   ├── glossary.md
│   ├── configuration.md
│   ├── environment.md
│   ├── cli.md
│   ├── schema.md
│   ├── job-types.md
│   └── event-types.md
├── faq.md
└── changelog.md
```

---

## Getting Started Guide

### `docs/getting-started/quickstart.md`

```markdown
# Quick Start

Get Brain-Doctor Hospital V4 up and running in 10 minutes.

## Prerequisites

- Node.js 20.x or later
- PostgreSQL 15.x or later
- Redis 7.x or later
- GitHub Personal Access Token

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Algodons/AlgoBrainDoctor.git
cd AlgoBrainDoctor
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Configure Environment

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and set:

\`\`\`bash
DATABASE_URL=postgresql://localhost:5432/algobrain_dev
REDIS_URL=redis://localhost:6379
GITHUB_TOKEN=ghp_your_token_here
\`\`\`

### 4. Setup Database

\`\`\`bash
./scripts/setup/init-db.sh
./scripts/db/migrate.sh
./scripts/setup/seed-dev.sh
\`\`\`

### 5. Start Services

\`\`\`bash
# Terminal 1: API
cd src/api && pnpm dev

# Terminal 2: Orchestrator
cd src/orchestrator && pnpm dev

# Terminal 3: UI
cd src/ui && pnpm dev
\`\`\`

### 6. Access Dashboard

Open http://localhost:5173 in your browser.

## Next Steps

- [Add Your First Repository](./first-repo.md)
- [Configure Workers](./configuration.md)
- [Enable Auto-Healing](../architecture/healdec.md)

## Troubleshooting

If you encounter issues, see [Common Issues](../ops/troubleshooting/common.md).
```

---

## API Reference Skeleton

### `docs/api/endpoints/repositories.md`

```markdown
# Repositories API

Manage repository health monitoring.

## List Repositories

\`\`\`http
GET /api/v1/repos
\`\`\`

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `org_id` | UUID | No | Filter by organization |
| `archived` | boolean | No | Include archived repos |
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (max: 100) |

### Response

\`\`\`json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "my-repo",
      "full_name": "my-org/my-repo",
      "description": "My awesome repository",
      "url": "https://github.com/my-org/my-repo",
      "stars": 1234,
      "forks": 56,
      "archived": false,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2026-01-28T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 30,
    "total": 1,
    "total_pages": 1
  }
}
\`\`\`

### Example

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.algobrain.doctor/api/v1/repos
\`\`\`

## Get Repository

\`\`\`http
GET /api/v1/repos/:id
\`\`\`

### Response

\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-repo",
  "full_name": "my-org/my-repo",
  "description": "My awesome repository",
  "url": "https://github.com/my-org/my-repo",
  "stars": 1234,
  "forks": 56,
  "archived": false,
  "latest_score": {
    "score": 85,
    "computed_at": "2026-01-28T09:00:00Z"
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2026-01-28T09:00:00Z"
}
\`\`\`

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

See [Error Handling](../errors.md) for details.
```

---

## Deployment Checklist

### `docs/ops/deployment/overview.md`

```markdown
# Deployment Overview

Complete checklist for deploying Brain-Doctor Hospital V4 to production.

## Pre-Deployment Checklist

### Infrastructure
- [ ] AWS account configured
- [ ] VPC and subnets created
- [ ] RDS Aurora Serverless provisioned
- [ ] ElastiCache Redis cluster created
- [ ] S3 buckets created (frontend, exports)
- [ ] CloudFront distribution configured
- [ ] Application Load Balancer set up
- [ ] ECS cluster created
- [ ] IAM roles and policies configured

### Secrets
- [ ] GitHub Personal Access Token stored in Secrets Manager
- [ ] Database credentials stored in Secrets Manager
- [ ] Redis password stored in Secrets Manager
- [ ] JWT secret generated and stored
- [ ] Webhook secret generated and stored
- [ ] Datadog API key stored (if using)
- [ ] PagerDuty integration key stored (if using)

### Configuration
- [ ] Environment variables configured in Parameter Store
- [ ] Worker concurrency settings tuned
- [ ] Rate limiting thresholds set
- [ ] Log retention configured (30 days)
- [ ] Backup retention configured (7 days)

## Deployment Steps

### 1. Database Setup
\`\`\`bash
# Run migrations
./scripts/db/migrate.sh production

# Verify schema
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY id DESC LIMIT 5;"
\`\`\`

### 2. Deploy API Servers
\`\`\`bash
# Build Docker image
./scripts/deploy/build-api.sh

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URL
docker push $ECR_URL/algobrain-api:latest

# Update ECS service
aws ecs update-service --cluster algobrain --service api --force-new-deployment
\`\`\`

### 3. Deploy Orchestrator
\`\`\`bash
# Build and push
./scripts/deploy/build-orchestrator.sh

# Update ECS service (singleton)
aws ecs update-service --cluster algobrain --service orchestrator --force-new-deployment --desired-count 1
\`\`\`

### 4. Deploy Workers
\`\`\`bash
# Build and push
./scripts/deploy/build-workers.sh

# Update ECS service (auto-scaling)
aws ecs update-service --cluster algobrain --service workers --force-new-deployment
\`\`\`

### 5. Deploy Frontend
\`\`\`bash
# Build UI
cd src/ui && pnpm build

# Upload to S3
aws s3 sync dist/ s3://algobrain-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
\`\`\`

## Post-Deployment Verification

### Health Checks
- [ ] API health endpoint returns 200: `curl https://api.algobrain.doctor/health`
- [ ] Orchestrator heartbeat visible in DynamoDB
- [ ] At least 12 workers running: `aws ecs list-tasks --cluster algobrain --service workers`
- [ ] Database connection pool healthy: Check CloudWatch metrics
- [ ] Redis cache responding: `redis-cli -h $REDIS_HOST ping`

### Smoke Tests
- [ ] Create test job via API
- [ ] Verify job processed by worker
- [ ] Check Healdec logs for any immediate failures
- [ ] Test webhook delivery (trigger test push event)
- [ ] Verify UI loads and displays data

### Monitoring
- [ ] Datadog dashboards showing metrics
- [ ] PagerDuty integration working (test alert)
- [ ] CloudWatch alarms configured
- [ ] Log aggregation working (check CloudWatch Logs)

## Rollback Procedure

If deployment fails, see [Rollback Guide](./rollback.md).

## Post-Deployment Tasks

- [ ] Update status page (if applicable)
- [ ] Notify team of successful deployment
- [ ] Monitor for 30 minutes for any anomalies
- [ ] Document any issues encountered

## Next Steps

- [Configure Monitoring](../monitoring/overview.md)
- [Set Up Alerts](../monitoring/alerting.md)
- [Review Operator Handbook](../handbook.md)
```

---

## Custom CSS (Aura FX Theme)

### `docs/stylesheets/aura-fx.css`

```css
/* Aura FX Neo-Glow Theme for MkDocs */

:root {
  --violet-aura: #A78BFA;
  --aqua-pulse: #4FD1C5;
  --coral-heat: #F87171;
  --cyber-yellow: #FACC15;
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --text-primary: #c9d1d9;
}

/* Neon glow effect on headers */
.md-typeset h1,
.md-typeset h2 {
  color: var(--violet-aura);
  text-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
}

/* Code blocks with glow */
.md-typeset code {
  background-color: var(--bg-secondary);
  border: 1px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 0 5px rgba(167, 139, 250, 0.2);
}

/* Links with pulse effect */
.md-typeset a {
  color: var(--aqua-pulse);
  transition: all 0.3s ease;
}

.md-typeset a:hover {
  color: var(--violet-aura);
  text-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
}

/* Admonition boxes with neon borders */
.md-typeset .admonition {
  border-left: 4px solid var(--violet-aura);
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.2);
}

.md-typeset .admonition.warning {
  border-left-color: var(--cyber-yellow);
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
}

.md-typeset .admonition.danger {
  border-left-color: var(--coral-heat);
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.2);
}

/* Mermaid diagram styling */
.mermaid {
  background-color: var(--bg-primary);
  border: 1px solid var(--violet-aura);
  border-radius: 8px;
  padding: 1rem;
}
```

---

## Build & Deploy

### Build Documentation Site

```bash
# MkDocs
mkdocs build

# Docusaurus
npm run build
```

### Deploy to GitHub Pages

```bash
# MkDocs
mkdocs gh-deploy

# Docusaurus
npm run deploy
```

### Deploy to Custom Domain

```bash
# Build
mkdocs build
# or
npm run build

# Upload to S3
aws s3 sync site/ s3://docs.algobrain.doctor/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

---

## Additional Resources

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Full architecture specification
- [MERMEDA.md](../../MERMEDA.md) - Mermaid diagram suite
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) - Folder layout
- [OPERATOR_HANDBOOK.md](./OPERATOR_HANDBOOK.md) - Operations guide

---

**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  
**License:** MIT

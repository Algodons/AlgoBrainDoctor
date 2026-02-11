# AlgoBrainDoctor UI

React 19 frontend for the AlgoBrainDoctor repository health monitoring platform.

## 🎨 Design System

The UI uses the **Aura FX Neo-Glow** design system combined with **GitHub Dark** theme:

- **Violet Aura** (#A78BFA) - Primary actions and branding
- **Aqua Pulse** (#4FD1C5) - Health indicators and success states
- **Coral Heat** (#F87171) - Alerts and critical states
- **Cyber Yellow** (#FACC15) - Warning states

## 📁 Structure

```
src/
├── components/
│   ├── cards/
│   │   └── RepoCard.tsx          - Repository health card
│   ├── layout/
│   │   ├── Layout.tsx            - Main app layout wrapper
│   │   └── TopNav.tsx            - Navigation header
│   └── modals/
│       ├── VitalsModal.tsx       - Repository health dashboard modal
│       └── SmartBrainTerminal.tsx - Live log viewer component
├── pages/
│   ├── HomePage.tsx              - Main dashboard with repo cards
│   └── OperatorDashboard.tsx     - Worker & system monitoring (40% complete)
├── styles/
│   ├── index.css                 - Base styles & design system
│   └── components.css            - Component-specific styles
├── types/
│   └── index.ts                  - TypeScript type definitions
├── App.tsx                       - Root app component with routing
└── main.tsx                      - React entry point
```

## 🚀 Features

### HomePage
- Repository health score cards with metrics
- Real-time statistics dashboard
- SmartBrain terminal for live logs
- Modal-based repository details viewer

### OperatorDashboard (40% Complete)
- System vitals monitoring (CPU, memory, workers)
- 12 parallel worker status cards
- Real-time heartbeat monitoring
- Job processing metrics
- Live system logs

### Components
- **RepoCard** - Interactive cards showing repository health scores (0-100)
- **VitalsModal** - Detailed health metrics with progress bars
- **SmartBrainTerminal** - Styled terminal with log levels and worker tags
- **Layout/TopNav** - Responsive navigation and page structure

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📊 Mock Data

Components use mock data demonstrating:
- Repository health scores (healthy/warning/critical states)
- Worker statuses (active/idle/error)
- System vitals (CPU, memory, jobs)
- Log entries with timestamps and severity levels

## 🎯 Health Score Colors

- **80-100**: Excellent (Aqua Pulse)
- **60-79**: Good (Cyber Yellow)
- **0-59**: Poor (Coral Heat)

## 🔧 Technology Stack

- React 19
- TypeScript 5.3+
- Vite 7
- Custom CSS (no UI library)
- Space Grotesk & Inter fonts

## 📝 Notes

- All components are functional (no class components)
- TypeScript strict mode enabled
- Mobile-responsive design
- No external UI dependencies (pure CSS)
- Follows React 19 best practices

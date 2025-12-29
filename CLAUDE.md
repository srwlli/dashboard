# CodeRef Dashboard - AI Context Documentation

**Project:** coderef-dashboard
**Version:** 0.1.0
**Status:** 🚧 Development
**Created:** 2025-12-28
**Last Updated:** 2025-12-28

---

## Quick Summary

**CodeRef Dashboard** is a focused modular widget system that aggregates and visualizes workorders (active work) and stubs (backlog items) from multiple software projects into a unified, responsive dashboard with PWA and Electron support.

**Core Innovation:** Read-only file system-based architecture that scans project directories without requiring database infrastructure - deployable as both web PWA and native desktop app from a single Next.js codebase.

**Latest Update (v0.1.0):**
- ✅ Phase 6 - Widget Integration complete with modular widget system
- ✅ Responsive design (mobile, tablet, desktop) with overflow prevention
- ✅ Foundation documentation suite (ARCHITECTURE, API, COMPONENTS, SCHEMA)
- ✅ Comprehensive TypeScript type system across monorepo

---

## Problem & Vision

### The Problem

Managing multiple software projects with active workorders (ongoing implementations) and backlog stubs (planned features) becomes chaotic without a unified view. Developers context-switch between project directories, manually opening JSON files and markdown documents to check status. No single dashboard exists for CodeRef workorder structure.

Traditional project management tools (Jira, Linear) require cloud hosting, database setup, and complex configuration. For developers using file system-based workflows (CodeRef methodology), these tools add unnecessary overhead.

### The Solution

CodeRef Dashboard scans existing project directories and aggregates workorder metadata into a single responsive interface. Zero setup required beyond pointing to project folders. No database, no migrations, no server infrastructure. The dashboard is read-only - it visualizes existing data without modifying source files.

Deployable as both web PWA (for teams) and Electron desktop app (for individual developers), the system adapts to different workflow preferences while maintaining a single codebase.

### How It Works

1. **Configuration:** User defines project paths in `projects.config.json`
2. **Scanning:** API routes use Node.js file system APIs to recursively scan `coderef/workorder/` directories
3. **Aggregation:** Workorder metadata extracted from `communication.json` files and combined into unified dataset
4. **Visualization:** React components render responsive cards with status, progress, and metadata
5. **Interactivity:** Users filter, sort, and drill down into workorder details without leaving the dashboard

---

## Architecture

### Core Concepts

**1. Monorepo Package Architecture**

The system uses npm workspaces to organize three interdependent packages:

- **`@coderef-dashboard/core`** - Shared library (hooks, utils, types) consumed by both web and electron packages
- **`@coderef-dashboard/dashboard`** - Next.js 14 web application (App Router) with API routes and UI
- **`@coderef-dashboard/electron-app`** - Electron wrapper that bundles the Next.js app for desktop distribution

Benefits: Type safety across packages, shared component library, independent deployment targets from single codebase.

**2. File System Data Layer**

All data is read directly from the file system - no database required:

- **Workorders:** Scanned from `coderef/workorder/` directories in configured projects
- **Stubs:** Aggregated from centralized `stubs/` directory
- **Configuration:** JSON file (`projects.config.json`) defines project paths

Each workorder folder contains:
- `communication.json` - Workorder metadata (status, assignee, dates)
- `plan.json` - Implementation plan structure
- `DELIVERABLES.md` - Completion checklist

**3. Widget System**

Modular widgets load via dynamic import with React lazy loading:

```
Widget Registry → File System Access API → Dynamic Import → React Lazy Loading
```

Architecture:
```typescript
// Widget registry maps widget IDs to loader functions
const widgetRegistry = {
  'timeline': () => import('./widgets/TimelineWidget'),
  'burndown': () => import('./widgets/BurndownWidget'),
};

// Dashboard loads widgets on demand
const LazyWidget = React.lazy(widgetRegistry[widgetId]);
```

Each widget is self-contained with its own TypeScript module and can access core library utilities via shared imports. Widgets can be:
- Bundled with the app (default widgets like workorder grid)
- Loaded from external directories via File System Access API (custom user widgets)
- Dynamically registered at runtime without rebuilding the dashboard

Benefits: Reduced initial bundle size, extensibility without code changes, faster page loads via code splitting.

### Data Flow

```
[User Browser/Electron]
        ↓
[Next.js App Router]
        ↓
[API Routes: /api/workorders, /api/stubs]
        ↓
[Node.js File System API]
        ↓
[Project Directories] → coderef/workorder/*.json
[Centralized Stubs] → stubs/*.md
        ↓
[JSON Response] → { workorders: [], stubs: [] }
        ↓
[React Components] → Render UI Cards
```

### Key Integration Points

- **Depends on:** Next.js framework, Node.js file system APIs, Electron (for desktop)
- **Used by:** Developers tracking multiple projects with CodeRef workorder structure
- **Orchestrated via:** Browser (PWA) or Electron desktop app, configured via `projects.config.json`

---

## Features Catalog

| Feature | Purpose | Type |
|---------|---------|------|
| `Workorder Aggregation` | Scan and display all workorders from multiple projects | Core Feature |
| `Stub Management` | Centralized backlog item tracking across projects | Core Feature |
| `Responsive Design` | Mobile/tablet/desktop layouts with Tailwind breakpoints | UI/UX |
| `Dark Mode` | Theme toggle with customizable accent colors | UI/UX |
| `PWA Support` | Installable web app with offline capabilities | Deployment |
| `Electron App` | Native desktop distribution (Windows/macOS/Linux) | Deployment |
| `File System Access API` | Browser-based directory access for widget loading | Browser API |
| `Widget System` | Modular components with dynamic loading | Architecture |
| `Type Safety` | Full TypeScript coverage with shared type definitions | DX |
| `Monorepo Workspaces` | Multi-package development with shared dependencies | Architecture |

**Total:** 10 features across 4 categories (Core, UI/UX, Deployment, Architecture)

---

## Workorder & Stub Workflow

### Workorder Data Structure

Each workorder is represented by a folder in `coderef/workorder/{feature-name}/`:

```typescript
interface Workorder {
  workorder_id: string;       // "WO-AUTH-001"
  feature_name: string;       // "auth-system"
  status: "implementing" | "complete" | "pending_plan";
  assigned_agent: string;
  created_at: string;
  project_id: string;         // Links to projects.config.json
  plan_path: string;          // Path to plan.json
}
```

The dashboard scans all configured project directories and aggregates workorders into a unified view.

### Stub Data Structure

Stubs are markdown files in a centralized directory:

```typescript
interface Stub {
  stub_id: string;           // "STUB-042"
  title: string;
  description: string;
  category: "feature" | "bugfix" | "refactor";
  priority: "high" | "medium" | "low";
  project_id?: string;       // Optional project association
  created_at: string;
}
```

Stubs represent backlog items not yet converted to workorders.

### Configuration System

Projects are configured via `projects.config.json`:

```json
{
  "projects": [
    {
      "id": "project-alpha",
      "name": "Project Alpha",
      "path": "C:\\path\\to\\project",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:\\path\\to\\stubs"
  }
}
```

API routes read this config to determine which directories to scan.

---

## File Structure

```
coderef-dashboard/
├── packages/
│   ├── core/                          # Shared library
│   │   ├── src/
│   │   │   ├── components/            # Reusable React components
│   │   │   │   ├── WorkorderCard/
│   │   │   │   ├── StubCard/
│   │   │   │   └── ...
│   │   │   ├── hooks/                 # Custom hooks
│   │   │   │   ├── useWorkorders.ts
│   │   │   │   ├── useStubs.ts
│   │   │   │   └── useTheme.ts
│   │   │   ├── types/                 # TypeScript interfaces
│   │   │   │   ├── workorder.ts
│   │   │   │   ├── stub.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/                 # Helper functions
│   │   │   │   ├── formatDate.ts
│   │   │   │   └── parseStatus.ts
│   │   │   └── index.ts               # Public API exports
│   │   └── package.json
│   ├── dashboard/                     # Next.js web app
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   │   ├── api/               # REST API routes
│   │   │   │   │   ├── workorders/route.ts
│   │   │   │   │   └── stubs/route.ts
│   │   │   │   ├── prompts/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   ├── page.tsx           # Dashboard home
│   │   │   │   ├── layout.tsx         # Root layout
│   │   │   │   └── globals.css
│   │   │   ├── components/            # UI components
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Header/
│   │   │   │   └── ...
│   │   │   └── contexts/              # React contexts
│   │   ├── public/                    # Static assets
│   │   ├── tailwind.config.js
│   │   ├── next.config.js
│   │   └── package.json
│   └── electron-app/                  # Desktop wrapper
│       ├── main.js                    # Electron entry point
│       ├── preload.js                 # Preload script
│       ├── package.json
│       └── electron-builder.json      # Build configuration
├── coderef/
│   ├── foundation-docs/               # Architecture docs
│   │   ├── ARCHITECTURE.md
│   │   ├── API.md
│   │   ├── COMPONENTS.md
│   │   └── SCHEMA.md
│   └── workorder/                     # Example workorders
├── scripts/
│   └── build-widgets.js               # Build script
├── .gitignore
├── package.json                       # Workspace root
├── package-lock.json
├── CLAUDE.md                          # This file
└── README.md                          # User documentation
```

---

## Design Decisions

**1. File System Over Database**
- ✅ Chosen: Read directly from file system (JSON + Markdown)
- ❌ Rejected: PostgreSQL/SQLite database layer
- Reason: Zero setup for users - just point to project directories. No migrations, no server. Simplifies deployment and reduces infrastructure complexity.

**2. Monorepo with npm Workspaces**
- ✅ Chosen: Multi-package monorepo with `@coderef-dashboard/*` namespacing
- ❌ Rejected: Separate repositories for core/dashboard/electron
- Reason: Shared type definitions ensure consistency. Single `npm install` for all packages. Atomic commits across packages.

**3. Next.js App Router for Both Web and Electron**
- ✅ Chosen: Next.js 14 App Router as universal framework
- ❌ Rejected: Separate React app for Electron, SPA framework like Vite
- Reason: Single codebase deploys to both targets. API routes work in both contexts. SSR benefits for web, fast local rendering for Electron.

**4. Tailwind CSS with Custom Design Tokens**
- ✅ Chosen: Tailwind with `ind-*` custom tokens for theming
- ❌ Rejected: CSS Modules, Styled Components, plain CSS
- Reason: Utility-first enables rapid responsive development. Design tokens (`ind-bg-primary`, `ind-accent-color`) centralize theme customization. Minimal CSS bundle size.

---

## Integration Guide

### With Next.js Framework

The dashboard package uses Next.js 14 App Router as its foundation:

- **API Routes:** File-based routing in `src/app/api/` handles workorder/stub fetching
- **Server Components:** Default rendering strategy for static content
- **Client Components:** Interactive UI marked with `'use client'` directive
- **Route Handlers:** Export `GET` functions for REST endpoints

Next.js provides both the web server (development/production) and the static build consumed by Electron.

### With Electron Desktop

The electron-app package wraps the Next.js build:

```javascript
// main.js - Electron entry point
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 1200, height: 800 });

  if (isDev) {
    win.loadURL('http://localhost:3000'); // Dev mode
  } else {
    win.loadFile('../dashboard/.next/...'); // Production build
  }
});
```

Benefits: Native desktop experience, file system access without browser restrictions, OS integration (tray icons, notifications).

### With TypeScript Monorepo

The core package exports shared TypeScript definitions consumed by dashboard and electron-app:

```typescript
// packages/core/src/types/index.ts
export interface Workorder {
  workorder_id: string;
  feature_name: string;
  status: WorkorderStatus;
  // ... other fields
}

export type WorkorderStatus = "implementing" | "complete" | "pending_plan";

// packages/dashboard/src/app/api/workorders/route.ts
import type { Workorder } from '@coderef-dashboard/core';

export async function GET(request: Request) {
  const workorders: Workorder[] = await scanProjects();
  return Response.json({ workorders });
}
```

Benefits:
- **Type Safety:** API responses match UI component expectations
- **Autocomplete:** VSCode IntelliSense works across package boundaries
- **Refactor Safety:** Renaming types updates all references across packages
- **Single Source of Truth:** One type definition used by frontend, backend, and Electron

The monorepo uses workspace protocol (`"@coderef-dashboard/core": "file:../core"`) to link packages without publishing to npm.

---

## Essential Commands

### Development
```bash
# Install dependencies (all workspaces)
npm install

# Run Next.js dev server (web)
npm run dev

# Run Electron app (desktop)
npm run dev:electron

# Type check all packages
npm run type-check
```

### Testing
```bash
# Run tests across all workspaces
npm test

# Lint all packages
npm run lint
```

### Production
```bash
# Build all packages
npm run build

# Build dashboard only
npm run build:dashboard

# Package Windows executable
npm run package:win
```

---

## Use Cases

### UC-1: Multi-Project Dashboard View

**Scenario:** Developer manages 5 active projects (3 client projects, 2 internal tools), each with 2-3 active workorders. Needs unified view to track progress across all projects without manually opening folders.

**Steps:**
1. Create `projects.config.json` with all 5 project paths:
   ```json
   {
     "projects": [
       { "id": "client-alpha", "name": "Client Alpha", "path": "C:\\work\\client-alpha", "workorder_dir": "coderef/workorder" },
       { "id": "client-beta", "name": "Client Beta", "path": "C:\\work\\client-beta", "workorder_dir": "coderef/workorder" },
       ...
     ]
   }
   ```
2. Update API route paths to reference config file location
3. Start dashboard: `npm run dev`
4. Open browser: `http://localhost:3000`
5. Dashboard loads - API scans all 5 projects and finds 12 total workorders
6. View aggregated grid showing:
   - Workorder cards with project badges
   - Status indicators (implementing/complete/pending_plan)
   - Progress percentages from DELIVERABLES.md
   - Assigned agents
7. Filter by project using sidebar: "Show only Client Alpha"
8. Filter by status: "Show only implementing"
9. Click workorder card to navigate to detail view
10. See full plan, deliverables checklist, and communication metadata

**Result:** Developer gains instant visibility into all active work without context switching between project directories.

### UC-2: Desktop App for Offline Work

**Scenario:** Developer works on airplane without internet. Needs local workorder dashboard that doesn't require running dev server or browser.

**Steps:**
1. Build dashboard for production:
   ```bash
   npm run build:dashboard
   # Output: packages/dashboard/.next/ (static files)
   ```
2. Build Electron app:
   ```bash
   npm run build:electron
   # Output: packages/electron-app/dist/
   ```
3. Package Windows executable:
   ```bash
   npm run package:win
   # Output: packages/electron-app/dist/CodeRef-Dashboard-Setup.exe
   ```
4. Install on Windows machine (double-click installer)
5. Launch CodeRef Dashboard from Start Menu
6. Electron app loads instantly (no localhost, no browser)
7. App uses Node.js file system APIs directly (no browser restrictions)
8. Read projects from file system without CORS issues
9. OS integration: minimize to system tray, native notifications

**Result:** Native desktop experience with offline capabilities and better file system access than browser-based PWA.

### UC-3: Widget System for Custom Views

**Scenario:** Developer wants to add custom widget for visualizing workorder timelines or burndown charts beyond default grid view.

**Steps:**
1. Create new widget file: `packages/core/src/widgets/TimelineWidget.tsx`
   ```typescript
   export const TimelineWidget = () => {
     // Custom timeline visualization logic
     return <div>Timeline View</div>;
   };
   ```
2. Register widget in widget registry (modular system)
3. Widget dynamically imports via React lazy loading
4. Use File System Access API to load widget from custom directory
5. Widget accesses shared utilities from `@coderef-dashboard/core`:
   - `useWorkorders()` hook for data fetching
   - `WorkorderCard` component for consistency
   - TypeScript types from core package
6. Widget renders in dashboard alongside default views
7. Toggle between grid view and timeline view via settings

**Result:** Extensible widget architecture allows custom visualizations without modifying core codebase. Developers can create domain-specific views (Gantt charts, dependency graphs, metrics dashboards) as separate modules.

---

## Recent Changes

### v0.2.0 - CodeRef View Mode (2025-12-29)
- ✅ CodeRef view mode in Explorer: Switch between single-project (Projects) and multi-project (CodeRef) views
- ✅ File type filtering: Filter aggregated files by type (CLAUDE.md, plan.json, DELIVERABLES.md, ARCHITECTURE.md)
- ✅ Tree aggregation: Automatically merge coderef/ folders from all registered projects
- ✅ File count badges: Display number of files per filter type
- ✅ View mode toggle: Tab interface above ProjectSelector for seamless switching
- ✅ Pattern matching: Support for exact match, wildcard, and extension patterns

**Workorder:** WO-ASSISTANT-PAGE-REDESIGN-001

### v0.1.0 - Initial Public Release
- ✅ Phase 6 - Widget Integration: Modular widget system with File System Access API
- ✅ Phase 5 - Mobile Responsive: Comprehensive overflow prevention, touch-optimized cards
- ✅ Monorepo architecture: core/dashboard/electron packages with shared TypeScript types
- ✅ Workorder aggregation: Multi-project scanning with status tracking
- ✅ Stub management: Centralized backlog visualization
- ✅ Dark mode: Theme toggle with customizable `ind-*` accent color tokens
- ✅ Foundation docs: ARCHITECTURE.md, API.md, COMPONENTS.md, SCHEMA.md
- ✅ PWA support: Service workers, offline capabilities, installable web app
- ✅ Electron desktop: Windows packaging with native OS integration

### v0.0.1-alpha - Internal Prototype
- ✅ Basic Next.js 14 setup with App Router
- ✅ Single-project workorder scanning proof-of-concept
- ✅ Tailwind CSS integration with dark mode base
- ✅ API route structure for `/api/workorders`

---

## Next Steps

- ⏳ Add workorder filtering (by project, status, assignee)
- ⏳ Implement real-time workorder updates (WebSockets or polling)
- ⏳ Add stub detail view with markdown preview
- ⏳ Migrate to database layer (SQLite for Electron, PostgreSQL for web)
- ⏳ Add authentication system (JWT-based)

---

## Resources

- **[README.md](README.md)** - User-facing installation and usage guide
- **[ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md)** - Detailed system architecture
- **[API.md](coderef/foundation-docs/API.md)** - REST API endpoints and data models
- **[COMPONENTS.md](coderef/foundation-docs/COMPONENTS.md)** - UI component library reference
- **[SCHEMA.md](coderef/foundation-docs/SCHEMA.md)** - TypeScript interfaces and type definitions

---

**Maintained by:** CodeRef Team

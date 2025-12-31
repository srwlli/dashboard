# CodeRef Dashboard - AI Context Documentation

**Project:** coderef-dashboard
**Version:** 0.4.0
**Status:** 🚧 Development
**Created:** 2025-12-28
**Last Updated:** 2025-12-30

---

## Quick Summary

**CodeRef Dashboard** is a centralized development resource UI that provides a unified interface for building projects using the CodeRef ecosystem. It's a modular widget and component system that integrates with CodeRef MCP Server, Papertrail, and the CodeRef workflow system to streamline software development.

**Core Purpose:** Centralize all development resources (workorders, stubs, documentation, project files, AI prompts) into a single responsive dashboard where developers can visualize, track, and manage multi-project development workflows.

**Core Innovation:** File system-based architecture that integrates with CodeRef tooling without requiring database infrastructure - deployable as both web PWA and native desktop app from a single Next.js codebase.

**Ecosystem Integration:**
- **CodeRef MCP Server** - Integration with Model Context Protocol for AI-assisted development
- **Papertrail** - Workorder tracking and documentation trail
- **CodeRef System** - Workflow management and project structure standards

**Latest Update (v0.4.0):**
- ✅ Stats card enhancement with improved information density
- ✅ Unified card component system (eliminated 97 lines of duplication)
- ✅ CodeRef view mode for multi-project file aggregation
- ✅ Foundation documentation suite (ARCHITECTURE, API, COMPONENTS, SCHEMA)
- ✅ Comprehensive TypeScript type system across monorepo

---

## Problem & Vision

### The Problem

Building software projects requires juggling multiple development resources across scattered locations:
- **Workorders** buried in project directories
- **Documentation** spread across CLAUDE.md, ARCHITECTURE.md, README files
- **Stubs and backlogs** in separate tracking systems
- **AI prompts and workflows** stored in various files
- **Project metadata** hidden in JSON configuration files

Developers using the CodeRef methodology lack a centralized UI to:
- Visualize active work across multiple projects
- Access development resources without terminal navigation
- Integrate AI-assisted workflows (MCP servers) with project context
- Track workorder progress and documentation trails (Papertrail)
- Manage widget-based views for different development needs

Traditional IDEs and project management tools don't understand CodeRef structure or integrate with MCP-based AI tooling.

### The Solution

**CodeRef Dashboard** provides a centralized UI that brings all development resources into a single responsive interface:

- **Widget System:** Modular, extensible components for different views (workorders, stubs, documentation, prompts)
- **CodeRef Integration:** Native understanding of CodeRef workflow, Papertrail tracking, and MCP server protocols
- **File System Based:** Zero database setup - reads directly from project directories
- **Multi-Project Support:** Aggregate resources across unlimited projects
- **AI-Ready:** Built-in integration points for CodeRef MCP Server and AI-assisted workflows

Deployable as both web PWA (for teams) and Electron desktop app (for individual developers), the dashboard adapts to different workflow preferences while maintaining a single codebase.

### How It Works

1. **Configuration:** Define project paths in `projects.config.json` - points to all CodeRef-structured projects
2. **Resource Scanning:** API routes scan multiple resource types:
   - Workorders (`coderef/workorder/`)
   - Stubs (centralized backlog directory)
   - Documentation (CLAUDE.md, ARCHITECTURE.md, etc.)
   - Project files (plan.json, DELIVERABLES.md, communication.json)
3. **MCP Integration:** Connect to CodeRef MCP Server for AI-assisted development context
4. **Widget Rendering:** Modular widgets display resources in customizable layouts
5. **Papertrail Tracking:** Integrate with Papertrail for workorder documentation trails
6. **Interactivity:** Filter, search, and navigate resources without leaving the dashboard

---

## Architecture

### Core Concepts

**1. Monorepo Package Architecture**

The system uses npm workspaces to organize three interdependent packages:

- **`@coderef-dashboard/core`** - Shared library (hooks, utils, types) consumed by both web and electron packages
- **`@coderef-dashboard/dashboard`** - Next.js 16 web application (App Router) with API routes and UI
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

**Core Dependencies:**
- Next.js 16 framework (App Router, API routes)
- Node.js file system APIs (for project scanning)
- Electron (for desktop distribution)
- React 19 (UI components and state management)

**CodeRef Ecosystem Integration:**
- **CodeRef MCP Server** - Model Context Protocol server for AI-assisted development
  - Provides: Code analysis, documentation generation, workorder planning
  - Connection: MCP protocol over stdio/HTTP
  - Used for: AI context augmentation, intelligent code suggestions

- **Papertrail** - Documentation and workorder tracking system
  - Provides: Audit trails, workorder history, documentation versioning
  - Connection: File system integration via coderef/ directory structure
  - Used for: Tracking implementation progress, documentation updates

- **CodeRef Workflow System** - Project structure and workflow standards
  - Provides: Workorder structure, plan.json schemas, DELIVERABLES.md format
  - Connection: Native file system reading
  - Used for: Understanding project organization, validating workorder structure

**Deployment:**
- Browser (PWA) or Electron desktop app
- Configuration via `projects.config.json`
- Used by developers building projects with CodeRef methodology

---

## Features Catalog

| Feature | Purpose | Type |
|---------|---------|------|
| `Resource Aggregation` | Scan and display workorders, stubs, docs from multiple projects | Core Feature |
| `Widget System` | Modular, extensible components for different views | Core Architecture |
| `CodeRef MCP Integration` | AI-assisted development via Model Context Protocol | Ecosystem |
| `Papertrail Integration` | Workorder tracking and documentation audit trails | Ecosystem |
| `Multi-Project Support` | Aggregate and visualize unlimited CodeRef projects | Core Feature |
| `Documentation Explorer` | Browse CLAUDE.md, ARCHITECTURE.md, plan.json across projects | Core Feature |
| `Responsive Design` | Mobile/tablet/desktop layouts with Tailwind breakpoints | UI/UX |
| `Dark Mode` | Theme toggle with customizable accent colors | UI/UX |
| `PWA Support` | Installable web app with offline capabilities | Deployment |
| `Electron App` | Native desktop distribution (Windows/macOS/Linux) | Deployment |
| `File System Access API` | Browser-based directory access for widget loading | Browser API |
| `Type Safety` | Full TypeScript coverage with shared type definitions | DX |
| `Monorepo Workspaces` | Multi-package development with shared dependencies | Architecture |

**Total:** 13 features across 5 categories (Core, Ecosystem, UI/UX, Deployment, Architecture)

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
- ✅ Chosen: Next.js 16 App Router as universal framework
- ❌ Rejected: Separate React app for Electron, SPA framework like Vite
- Reason: Single codebase deploys to both targets. API routes work in both contexts. SSR benefits for web, fast local rendering for Electron.

**4. Tailwind CSS with Custom Design Tokens**
- ✅ Chosen: Tailwind with `ind-*` custom tokens for theming
- ❌ Rejected: CSS Modules, Styled Components, plain CSS
- Reason: Utility-first enables rapid responsive development. Design tokens (`ind-bg-primary`, `ind-accent-color`) centralize theme customization. Minimal CSS bundle size.

---

## Integration Guide

### With Next.js Framework

The dashboard package uses Next.js 16 App Router as its foundation:

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

### UC-1: Centralized Multi-Project Development Hub

**Scenario:** Developer uses CodeRef methodology to build 5 active projects (3 client projects, 2 internal tools). Needs a centralized UI to access all development resources across projects without terminal navigation or file hunting.

**Steps:**
1. Configure CodeRef Dashboard with all 5 projects:
   ```json
   {
     "projects": [
       { "id": "client-alpha", "name": "Client Alpha", "path": "C:\\work\\client-alpha", "workorder_dir": "coderef/workorder" },
       { "id": "client-beta", "name": "Client Beta", "path": "C:\\work\\client-beta", "workorder_dir": "coderef/workorder" },
       { "id": "internal-api", "name": "Internal API", "path": "C:\\work\\api", "workorder_dir": "coderef/workorder" }
     ]
   }
   ```
2. Start dashboard: `npm run dev` (opens on port 3005)
3. Dashboard home shows aggregated resources:
   - **Stats Overview:** 12 active workorders, 42 stubs, 8 projects tracked
   - **Workorder Grid:** Cards showing status, progress, project badges
   - **Stub Grid:** Backlog items with priority and category
4. Use CodeRef Explorer view to access documentation:
   - Switch to "CodeRef" view mode
   - Filter by file type: "CLAUDE.md" → see all project context docs
   - Filter by "ARCHITECTURE.md" → review all architecture documents
   - Filter by "plan.json" → access all implementation plans
5. Navigate to Assistant page for AI-powered workflows:
   - Access prompts library
   - Use MCP integration for code analysis
6. Track workorder progress with Papertrail integration:
   - View documentation audit trails
   - See workorder status history
7. Filter resources by project, status, priority across all views

**Result:** Developer has a centralized UI hub for all CodeRef development resources, eliminating terminal navigation and manual file hunting. All projects accessible from one interface.

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

### UC-3: Building Projects with Widget System and MCP Integration

**Scenario:** Developer is building a new feature for a client project. Uses CodeRef Dashboard as their central UI to access resources, manage workorders, and leverage AI assistance via MCP server.

**Steps:**
1. **Start New Workorder:**
   - Open CodeRef Dashboard → Dashboard page
   - View client project in workorder grid
   - Create new workorder folder via terminal: `coderef/workorder/new-feature/`
   - Refresh dashboard → new workorder appears

2. **Access Project Context:**
   - Navigate to Assistant → CodeRef Explorer
   - Filter by project: "Client Alpha"
   - View CLAUDE.md for project context
   - Review ARCHITECTURE.md for system design
   - Read plan.json for implementation guidance

3. **Use AI-Assisted Development:**
   - Navigate to Prompts page
   - Select "Code Review" prompt template
   - Attach files from project
   - MCP server provides code analysis and suggestions
   - Export results to markdown

4. **Track Progress with Widgets:**
   - Dashboard shows workorder status in real-time
   - Use timeline widget to visualize project schedule
   - Custom burndown widget shows completion percentage
   - Stats cards display aggregate metrics

5. **Papertrail Integration:**
   - All workorder updates tracked automatically
   - Documentation changes logged in audit trail
   - Status transitions recorded with timestamps

6. **Custom Widget Development:**
   - Create custom widget: `packages/core/src/widgets/DependencyGraph.tsx`
   - Widget uses `@coderef-dashboard/core` components and hooks
   - Register in widget registry → dynamically loads
   - Widget visualizes project dependencies from plan.json

**Result:** Developer uses CodeRef Dashboard as their primary UI for building projects - centralized access to resources, AI assistance, progress tracking, and custom visualizations. No terminal navigation required for daily development workflow.

---

## Recent Changes

### v0.4.0 - Stats Card Enhancement (2025-12-30)
- ✅ Reduced StatsCard size by ~25% (smaller padding, tighter spacing, reduced text sizes)
- ✅ Enhanced stub stats with 8 breakdowns instead of 1 redundant line
- ✅ Added status breakdown (stub, planned, in_progress, completed)
- ✅ Added priority breakdown (low, medium, high, critical)
- ✅ Improved dashboard information density without sacrificing readability
- ✅ Maintained backward compatibility (StatsCard API unchanged)

**Workorder:** WO-STATS-CARD-ENHANCEMENT-001

### v0.3.0 - Unified Card Component (2025-12-29)
- ✅ Created UnifiedCard base component with flexible slot-based API
- ✅ Refactored StubCard to use UnifiedCard as wrapper (91 → 81 lines)
- ✅ Refactored WorkorderCard to use UnifiedCard as wrapper (84 → 77 lines)
- ✅ Eliminated 97 lines of duplicate card styling logic
- ✅ Single source of truth for card UI across dashboard
- ✅ Maintained backward compatibility (zero breaking changes)
- ✅ Improved maintainability and consistency

**Workorder:** WO-UNIFIED-CARD-COMPONENT-001

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
- ✅ Basic Next.js 16 setup with App Router
- ✅ Single-project workorder scanning proof-of-concept
- ✅ Tailwind CSS integration with dark mode base
- ✅ API route structure for `/api/workorders`

---

## Resources

**Documentation:**
- **[README.md](README.md)** - User-facing installation and usage guide
- **[ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md)** - Detailed system architecture
- **[API.md](coderef/foundation-docs/API.md)** - REST API endpoints and data models
- **[COMPONENTS.md](coderef/foundation-docs/COMPONENTS.md)** - UI component library reference
- **[SCHEMA.md](coderef/foundation-docs/SCHEMA.md)** - TypeScript interfaces and type definitions

**Planning:**
- **[improvements.md](coderef/working/improvements.md)** - Future enhancements and ideas

---

## Developer Workflow Integration

### Primary Use: Building Projects

CodeRef Dashboard is designed as the **primary UI for building software projects** using the CodeRef methodology:

**Daily Workflow:**
1. **Open Dashboard** → Launch Electron app or web browser (port 3005)
2. **Check Status** → View all active workorders across projects
3. **Access Context** → Navigate to CodeRef Explorer for documentation
4. **Start Work** → Select workorder, review plan.json, check deliverables
5. **Use AI Tools** → Navigate to Prompts/Assistant for MCP-assisted development
6. **Track Progress** → Update workorder status, view Papertrail audit log
7. **Monitor Metrics** → Check stats cards, custom widgets for project health

**Development Resources Centralized:**
- Workorders (active implementations)
- Stubs (backlog planning)
- Documentation (CLAUDE.md, ARCHITECTURE.md, README)
- Implementation plans (plan.json)
- Deliverables tracking (DELIVERABLES.md)
- AI prompts and workflows
- Project configuration and metadata

**CodeRef Ecosystem Hub:**
The dashboard serves as the central UI connecting:
- **CodeRef MCP Server** → AI-assisted code analysis and generation
- **Papertrail** → Automated documentation and audit trails
- **CodeRef Workflow System** → Standardized project structure and processes

**Widget & Component System:**
Extend the dashboard with custom widgets for project-specific needs:
- Timeline visualizations
- Dependency graphs
- Custom metrics dashboards
- Integration with external tools

---

**Maintained by:** CodeRef Team

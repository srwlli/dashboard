# System Architecture

**Date:** 2025-12-28
**Version:** 0.1.0

---

## Overview

The CodeRef Dashboard is a modular widget system with PWA and Electron support, designed to aggregate and visualize workorder and stub data from multiple project directories. The system follows a monorepo architecture with three primary packages.

**Core Purpose:** Provide a unified dashboard interface for tracking workorders (active work) and stubs (backlog items) across multiple software projects.

---

## System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     CodeRef Dashboard                        │
│                      (Deployment Options)                    │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
        ┌───────▼────────┐           ┌────────▼────────┐
        │   Web (PWA)    │           │    Desktop      │
        │  localhost:3000│           │   (Electron)    │
        └───────┬────────┘           └────────┬────────┘
                │                             │
                └──────────┬──────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Next.js 14 App    │
                │   App Router        │
                │   (Dashboard)       │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌──────▼──────┐  ┌─────▼──────┐
    │   API     │   │  Components │  │   Hooks    │
    │  Routes   │   │     UI      │  │   Utils    │
    └─────┬─────┘   └──────┬──────┘  └─────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                ┌──────────▼──────────┐
                │  @coderef-dashboard │
                │       /core         │
                │  (Shared Library)   │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │   File System API   │
                │  (Node.js / Web)    │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌──────▼──────┐  ┌─────▼──────┐
    │  Project  │   │   Project   │  │ Centralized│
    │  Alpha    │   │    Beta     │  │   Stubs    │
    │ workorder/│   │  workorder/ │  │   stubs/   │
    └───────────┘   └─────────────┘  └────────────┘
```

---

## Package Structure

### Monorepo Organization

```
coderef-dashboard/
├── packages/
│   ├── core/                         # Shared library
│   │   ├── src/
│   │   │   ├── components/          # Core React components
│   │   │   ├── hooks/               # Shared React hooks
│   │   │   ├── types/               # TypeScript interfaces
│   │   │   ├── utils/               # Utility functions
│   │   │   └── index.ts             # Public API exports
│   │   └── package.json
│   │
│   ├── dashboard/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/                 # Next.js App Router
│   │   │   │   ├── api/             # API routes
│   │   │   │   │   ├── workorders/
│   │   │   │   │   └── stubs/
│   │   │   │   ├── page.tsx         # Dashboard home
│   │   │   │   ├── prompts/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/          # UI components
│   │   │   │   ├── WorkorderCard/
│   │   │   │   ├── StubCard/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── ...
│   │   │   ├── contexts/            # React contexts
│   │   │   ├── hooks/               # Custom hooks
│   │   │   ├── lib/                 # Business logic
│   │   │   │   └── api/             # API client libraries
│   │   │   └── types/               # TypeScript types
│   │   └── package.json
│   │
│   └── electron-app/                 # Electron wrapper
│       ├── src/
│       │   ├── main.ts              # Electron main process
│       │   └── preload.ts           # Preload script
│       └── package.json
│
├── scripts/                          # Build scripts
├── package.json                      # Root workspace config
└── tsconfig.json                     # TypeScript config
```

---

## Technology Stack

### Frontend Layer

**Framework:** Next.js 14 (App Router)
- **Rationale:** Server-side rendering, API routes, built-in optimization
- **Routing:** File-based routing with App Router
- **Rendering:** Client + Server components (React Server Components)

**UI Library:** React 19
- **Rationale:** Modern concurrent features, improved hooks, better TypeScript support
- **State Management:** React Context API for global state

**Styling:** Tailwind CSS
- **Rationale:** Utility-first, consistent design tokens, responsive by default
- **Design System:** Custom `ind-*` prefix for theme variables
- **Dark Mode:** CSS variables with theme switching

**Icons:** Lucide React
- **Rationale:** Tree-shakeable, consistent design, TypeScript support

**Language:** TypeScript 5.3.3
- **Rationale:** Type safety, better IDE support, fewer runtime errors
- **Configuration:** Strict mode enabled

---

### Backend Layer

**API Framework:** Next.js API Routes
- **Rationale:** Co-located with frontend, serverless-ready, TypeScript support
- **Location:** `packages/dashboard/src/app/api/`
- **Pattern:** RESTful JSON endpoints

**Data Layer:** File System
- **Database:** None (file-based architecture)
- **Storage:** JSON files + Markdown files
- **Configuration:** `projects.config.json` (external)

---

### Desktop Distribution

**Platform:** Electron
- **Rationale:** Cross-platform desktop app, native file system access
- **Architecture:** Main process (Node.js) + Renderer process (Web)
- **Preload Script:** Secure bridge between main and renderer

---

### Build Tools

**Package Manager:** npm with Workspaces
- **Rationale:** Native monorepo support, consistent dependency resolution

**Bundler (Web):** Next.js with Turbopack
- **Rationale:** Fast HMR, optimized production builds, built-in code splitting

**Bundler (Electron):** electron-builder
- **Rationale:** Cross-platform packaging, auto-updates support

**Compiler:** TypeScript + esbuild
- **Rationale:** Fast compilation, ESM support

---

## Module Boundaries

### Core Package (`@coderef-dashboard/core`)

**Purpose:** Shared utilities and components used by both dashboard and Electron app

**Responsibilities:**
- Error boundary components
- Shared TypeScript interfaces
- Utility functions (clipboard, file handlers)
- React hooks (session management)

**Dependencies:**
- React 19
- React DOM 19
- TypeScript 5.x

**Export Strategy:**
```typescript
// packages/core/src/index.ts
export { ErrorBoundary } from './components';
export { useSession, useSessionRefresh } from './hooks';
export { clipboard, fileHandlers } from './utils';
export type { WidgetConfig } from './types';
```

---

### Dashboard Package

**Purpose:** Web application for workorder and stub management

**Responsibilities:**
- API endpoints (`/api/workorders`, `/api/stubs`)
- UI components (WorkorderCard, StubCard, etc.)
- Routing and navigation
- Theme management
- PWA service worker

**Dependencies:**
- Next.js 16.1.1
- React 19
- Tailwind CSS
- Lucide React
- @coderef-dashboard/core

**API Design Pattern:**
```typescript
// packages/dashboard/src/app/api/workorders/route.ts
export async function GET(): Promise<NextResponse> {
  // 1. Load config
  // 2. Scan workorder directories
  // 3. Parse JSON files
  // 4. Aggregate results
  // 5. Return JSON response
}
```

---

### Electron Package

**Purpose:** Desktop distribution of the dashboard

**Responsibilities:**
- Application window management
- Native menu integration
- File system access via preload script
- Auto-update functionality

**Dependencies:**
- Electron
- electron-builder
- @coderef-dashboard/core

**IPC Bridge:**
```typescript
// packages/electron-app/src/preload.ts
contextBridge.exposeInMainWorld('CodeRefCore', {
  api: {
    openFile: () => ipcRenderer.invoke('open-file'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    isElectron: () => true
  }
});
```

---

## Data Flow

### Read Operations (Workorders)

```
User Request
    │
    ▼
Next.js Page (/workorders)
    │
    ▼
React Hook (useWorkorders)
    │
    ▼
Fetch /api/workorders
    │
    ▼
API Route Handler
    │
    ├─▶ Load projects.config.json
    ├─▶ Get workorder directories
    ├─▶ Scan each project's coderef/workorder/
    ├─▶ Parse communication.json, plan.json, DELIVERABLES.md
    └─▶ Aggregate + Return JSON
    │
    ▼
React State Update
    │
    ▼
UI Re-render (WorkorderList)
```

### Read Operations (Stubs)

```
User Request
    │
    ▼
Fetch /api/stubs
    │
    ▼
API Route Handler
    │
    ├─▶ Load projects.config.json
    ├─▶ Get centralized stubs directory
    ├─▶ Read stub.json files
    └─▶ Return JSON
    │
    ▼
UI Update (StubList)
```

### Theme Switching

```
User clicks ThemeToggle
    │
    ▼
ThemeContext.toggleTheme()
    │
    ├─▶ Update React state
    ├─▶ Save to localStorage
    └─▶ Update CSS variables
    │
    ▼
All components re-render with new theme
```

---

## Design Decisions & Rationale

### 1. File-Based Data Architecture

**Decision:** Use file system as "database" instead of SQL/NoSQL
**Rationale:**
- Workorders already exist as files in project directories
- No need for data migration or synchronization
- Developers already interact with files via CLI tools
- Eliminates database setup/maintenance overhead

**Trade-offs:**
- ✅ Zero setup, no database server required
- ✅ Data is version-controlled with code
- ❌ No ACID guarantees
- ❌ Limited query capabilities
- ❌ Slower for large datasets (100+ projects)

---

### 2. Monorepo Architecture

**Decision:** Use npm workspaces monorepo
**Rationale:**
- Share code between web and desktop apps
- Consistent dependency versions
- Single build command for all packages
- Easier refactoring across packages

**Trade-offs:**
- ✅ Code reuse via `@coderef-dashboard/core`
- ✅ Simplified dependency management
- ❌ Slower install times (all deps downloaded)
- ❌ Type errors cascade across packages

---

### 3. Next.js App Router

**Decision:** Use App Router (not Pages Router)
**Rationale:**
- Modern React patterns (Server Components)
- Better performance (server-side rendering)
- Co-located API routes
- Improved data fetching

**Trade-offs:**
- ✅ Server-side rendering for better SEO/performance
- ✅ API routes + frontend in one codebase
- ❌ Steeper learning curve
- ❌ Client components require `'use client'` directive

---

### 4. Tailwind CSS

**Decision:** Use Tailwind instead of CSS-in-JS or CSS modules
**Rationale:**
- Utility-first approach reduces custom CSS
- Built-in responsive design utilities
- Excellent TypeScript support
- Tree-shaking removes unused styles

**Trade-offs:**
- ✅ Fast development with utility classes
- ✅ Consistent design system via config
- ❌ Verbose className strings
- ❌ Learning curve for newcomers

---

### 5. React Context for State

**Decision:** Use React Context instead of Redux/MobX
**Rationale:**
- Simple state requirements (theme, sidebar, accent color, projects, explorer state)
- No complex state interactions
- Built-in React feature (no extra deps)
- Optimistic UI updates handled at context level

**Trade-offs:**
- ✅ No external dependencies
- ✅ Simpler mental model
- ✅ Automatic rollback on error (optimistic updates)
- ❌ Limited devtools support
- ❌ Performance issues with frequent updates (mitigated by splitting contexts)

**Context Architecture** (as of v0.7.0):

1. **ProjectsContext** (`packages/dashboard/src/contexts/ProjectsContext.tsx`)
   - **Purpose:** Global project list state management
   - **Features:**
     - Single API call on app mount (eliminates redundant fetches)
     - Optimistic UI updates for add/remove operations
     - Automatic rollback on API errors
   - **Performance Impact:** ~80% reduction in API calls
   - **Usage:** `const { projects, isLoading, addProject, removeProject } = useProjects()`

2. **ExplorerContext** (`packages/dashboard/src/contexts/ExplorerContext.tsx`)
   - **Purpose:** CodeRef Explorer view mode and file selection state
   - **Features:**
     - localStorage persistence for view mode across navigation
     - Centralized selected file state
     - Automatic selection clearing on view mode change
   - **Usage:** `const { viewMode, selectedFile, setViewMode, setSelectedFile } = useExplorer()`

3. **ThemeContext** - Dark/light mode toggle
4. **AccentColorContext** - Custom accent color selection
5. **SidebarContext** - Sidebar open/closed state

**Context Provider Hierarchy:**
```jsx
<ThemeProvider>
  <AccentColorProvider>
    <SidebarProvider>
      <ProjectsProvider>
        <ExplorerProvider>
          <RootClientWrapper>
            {children}
          </RootClientWrapper>
        </ExplorerProvider>
      </ProjectsProvider>
    </SidebarProvider>
  </AccentColorProvider>
</ThemeProvider>
```

---

## Security Considerations

### API Security

**Current State:** No authentication
**Recommendation:** Add API key authentication for production

**Input Validation:**
- File path sanitization to prevent directory traversal
- JSON parsing with try/catch error handling

### Electron Security

**IPC Bridge:** Uses `contextBridge.exposeInMainWorld()` for secure IPC
**File Access:** Preload script validates file paths before opening

---

## Performance Considerations

### Bundle Size

**Next.js Optimizations:**
- Code splitting by route
- Tree-shaking unused imports
- Image optimization via next/image

**Current Bundle Sizes:**
- First Load JS: ~200 KB (estimated)
- Shared chunks: ~150 KB (estimated)

### Rendering Performance

**Optimizations:**
- Server Components for static content
- Client Components only when needed (events, hooks)
- Memoization with `React.memo()` for expensive components

### Data Loading

**API Response Times:**
- `/api/workorders`: 100-500ms (depending on project count)
- `/api/stubs`: 50-200ms

**Caching Strategy:**
- No server-side caching (data changes frequently)
- Client-side caching via SWR/React Query (future enhancement)

---

## Deployment Architecture

### Web (PWA)

```
User → Browser → localhost:3000 (dev) or Vercel (prod)
                      │
                      ▼
              Next.js Server
                      │
                      ├─▶ Static pages (pre-rendered)
                      ├─▶ API routes (serverless functions)
                      └─▶ Service Worker (PWA caching)
```

### Desktop (Electron)

```
User → Electron App → Chromium Renderer
                          │
                          ├─▶ Main Process (Node.js)
                          ├─▶ Preload Script (IPC bridge)
                          └─▶ Dashboard (bundled Next.js build)
```

---

## Future Architecture Enhancements

### Short-term (Next 3 months)

1. **Add Database:** PostgreSQL or SQLite for faster queries
2. **Add Authentication:** JWT or session-based auth
3. **API Caching:** Redis for workorder list caching
4. **Real-time Updates:** WebSockets for live workorder status

### Long-term (6-12 months)

1. **Microservices:** Split API into separate services (workorders, stubs, users)
2. **GraphQL:** Replace REST with GraphQL for flexible queries
3. **Event Sourcing:** Track workorder status changes as events
4. **Search Index:** Elasticsearch for full-text search

---

## Migration Path

### Current State (v0.1.0)

- Monorepo with 3 packages
- File-based data storage
- Next.js App Router
- No authentication

### Target State (v1.0.0)

- Monorepo with 4 packages (add API service)
- Hybrid storage (files + database)
- GraphQL API layer
- JWT authentication

**Migration Strategy:**
1. Introduce database without removing file reading (dual reads)
2. Migrate data to database incrementally
3. Add authentication layer
4. Switch to database as primary source
5. Keep file reading as fallback

---

**AI Integration Notes:**

When working with this architecture:

1. **Module Boundaries:** Respect package boundaries - core should not depend on dashboard
2. **API Design:** Follow RESTful conventions for new endpoints
3. **Component Location:** Dashboard-specific components go in `dashboard/`, shared ones in `core/`
4. **Type Sharing:** Share types via `@coderef-dashboard/core/types`
5. **File System Access:** Always use absolute paths, sanitize inputs
6. **Error Handling:** Use predefined `ErrorCodes` from `types/api.ts`

**Common Pitfalls:**
- Don't circular dependencies between packages
- Don't bypass the IPC bridge in Electron (use preload script)
- Don't mutate config files from API routes (read-only)
- Don't forget `'use client'` for components with hooks/events

---

*This document was generated as part of the CodeRef Dashboard foundation documentation suite. See also: [API.md](./API.md), [SCHEMA.md](./SCHEMA.md), [COMPONENTS.md](./COMPONENTS.md)*

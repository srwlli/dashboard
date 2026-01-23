# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**CodeRef Dashboard** is a Next.js 16 monorepo that provides a centralized UI for managing CodeRef projects, workorders, stubs, and documentation. It's deployable as both a web PWA and an Electron desktop app.

**Core Purpose:** Aggregate development resources from multiple CodeRef projects into a single responsive dashboard with file system-based data (no database).

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.3+
- Tailwind CSS (custom `ind-*` design tokens)
- npm workspaces (monorepo)

---

## Essential Commands

### Development
```bash
# Install all workspace dependencies
npm install

# Run Next.js dev server (web) - port 3004
npm run dev

# Run Electron desktop app
npm run dev:electron

# Run both web and Electron concurrently
npm run dev:all
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Verbose test output
npm run test:verbose
```

### Build & Production
```bash
# Build all packages
npm run build

# Build dashboard only
npm run build:dashboard

# Build Electron app
npm run build:electron

# Package Windows executable
npm run package:win

# Type check all packages
npm run type-check

# Lint all packages
npm run lint
```

---

## Monorepo Architecture

The project uses **npm workspaces** with 4 packages:

```
packages/
├── core/              # @coderef-dashboard/core
│                      # Shared types, hooks, utilities
│                      # Consumed by dashboard and electron-app
│
├── coderef-core/      # @coderef/core
│                      # CodeRef scanning and analysis engine
│
├── dashboard/         # @coderef-dashboard/dashboard
│                      # Next.js 16 web application (main package)
│                      # App Router, API routes, UI components
│
└── electron-app/      # @coderef-dashboard/electron-app
                       # Electron wrapper for desktop distribution
```

**Key Principle:** Shared types and utilities live in `@coderef-dashboard/core` and are imported by dashboard/electron-app via workspace protocol.

**Import Pattern:**
```typescript
// In dashboard or electron-app
import { Workorder, Stub } from '@coderef-dashboard/core';
```

---

## Application Architecture

### Next.js App Router Structure

```
packages/dashboard/src/app/
├── layout.tsx                  # Root layout with providers
├── page.tsx                    # Dashboard home (/)
├── api/                        # REST API routes
│   ├── boards/                 # Kanban board CRUD
│   ├── coderef/                # File operations
│   │   ├── file/route.ts       # Read/write files
│   │   ├── notes/route.ts      # Notes CRUD
│   │   ├── projects/route.ts   # Project registration
│   │   └── tree/route.ts       # Directory tree
│   ├── scanner/                # CodeRef scanning
│   │   ├── scan/route.ts       # Scan execution
│   │   └── projects/route.ts   # Scanner project registry
│   └── sessions/               # Multi-agent sessions
│       ├── context-discovery/  # Semantic file discovery
│       └── create/route.ts     # Session creation
├── assistant/                  # AI assistant page
├── explorer/                   # File browser
├── notes/                      # Notes widget
├── prompts/                    # Prompt library
├── resources/                  # Resource management
├── scanner/                    # CodeRef scanner UI
├── sessions/                   # Session management
└── settings/                   # Settings page
```

### Context Providers (Nested in layout.tsx)

The app uses **7 context providers** in this order:

1. **ThemeProvider** - Dark/light mode toggle
2. **AccentColorProvider** - Dynamic accent color (red/orange/yellow/green/purple/blue)
3. **SidebarProvider** - Sidebar open/closed state
4. **ProjectsProvider** - Registered project registry (global state)
5. **ExplorerProvider** - File explorer state
6. **SearchProvider** - Global search functionality
7. **WorkflowContext** - (used in specific pages)

**Import Pattern:**
```typescript
import { useProjects } from '@/contexts/ProjectsContext';
import { useTheme } from '@/contexts/ThemeContext';
```

### File System Data Layer

**NO DATABASE** - All data read directly from file system:

- **Projects:** Registered via ProjectsContext (persisted in localStorage/IndexedDB)
- **Workorders:** Scanned from `coderef/workorder/` in each project
- **Stubs:** Read from centralized `stubs/` directory
- **Files:** Direct file system access via API routes

**Security:** All file operations validated through:
- Path validation (no directory traversal)
- Extension allowlist (`.md`, `.txt`, `.json`, `.ts`, `.tsx`, etc.)
- Size limits (1MB for notes, configurable for others)
- Registered project boundaries

---

## Design System (Tailwind)

### Custom Design Tokens

The dashboard uses **`ind-*` prefix** for industrial theme:

```css
/* Dark mode colors (default) */
bg-ind-bg              /* #0c0c0e - Main background */
bg-ind-panel           /* #141416 - Panel/card background */
border-ind-border      /* #3f3f46 - Border color */
text-ind-accent        /* Dynamic (CSS var) - Accent color */
text-ind-accent-hover  /* Dynamic (CSS var) - Accent hover */
text-ind-text          /* #f4f4f5 - Primary text */
text-ind-text-muted    /* #71717a - Muted text */
```

**Accent Colors:** Dynamically set via CSS variables
- Red: `#FF1744`
- Orange: `#FF6600` (default)
- Yellow: `#FFFF00`
- Green: `#00FF41`
- Purple: `#BB00FF`
- Blue: `#00D4FF`

### Responsive Breakpoints

```css
xs: 320px   /* Small phones */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Large tablets */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Component Patterns

**Cards:**
```tsx
<div className="bg-ind-panel border border-ind-border rounded p-4">
  <h3 className="text-ind-text font-semibold">Title</h3>
  <p className="text-ind-text-muted text-sm">Description</p>
</div>
```

**Buttons:**
```tsx
<button className="px-4 py-2 bg-ind-accent hover:bg-ind-accent-hover text-black rounded transition-colors">
  Action
</button>
```

---

## API Route Patterns

### Standard Response Format

```typescript
// Success response
return NextResponse.json({
  success: true,
  data: { /* payload */ },
  message: 'Operation completed',
});

// Error response
return NextResponse.json({
  success: false,
  error: 'Error message',
}, { status: 400 });
```

### File Operations Example

```typescript
// GET /api/coderef/file?path=/path/to/file.md
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  // Validate path, check extension, read file
  const content = await fs.readFile(filePath, 'utf-8');

  return NextResponse.json({ success: true, data: { content } });
}
```

### Server-Sent Events (SSE) Pattern

Used for streaming scanner output:

```typescript
// GET /api/scanner/scan/[scanId]/output
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    // Stream data
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

---

## Key Development Patterns

### 1. Client vs Server Components

- **Server Components (default):** Static pages, layout wrappers
- **Client Components (`'use client'`):** Interactive UI, hooks, context consumers

```typescript
// Server component (no directive)
export default function Page() {
  return <div>Static content</div>;
}

// Client component
'use client';
export default function InteractiveWidget() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### 2. Path Aliases

Uses `@/` prefix for absolute imports:

```typescript
import { Component } from '@/components/Component';
import { useHook } from '@/contexts/HookContext';
import { utility } from '@/lib/utils/utility';
```

### 3. TypeScript Interfaces

Shared types in `@coderef-dashboard/core`:

```typescript
// packages/core/src/types/workorder.ts
export interface Workorder {
  workorder_id: string;
  feature_name: string;
  status: 'implementing' | 'complete' | 'pending_plan';
  assigned_agent: string;
  created_at: string;
  project_id: string;
  plan_path: string;
}
```

### 4. Context Discovery (Semantic File Discovery)

The dashboard includes an intelligent **4-dimension semantic scoring system** for file discovery:

- **Pattern similarity (40pts):** Matches from `.coderef/reports/patterns.json`
- **Dependency relationships (30pts):** Graph analysis from `.coderef/graph.json`
- **Complexity matching (20pts):** Element count from `.coderef/index.json`
- **Test coverage (10pts):** Coverage data from `.coderef/reports/coverage.json`

**API:** `GET /api/sessions/context-discovery?keywords=auth,login&feature=authentication`

Discovers 8 file categories: docs, plans, deliverables, architecture, components, hooks, api routes, utils, tests.

### 5. Testing Patterns

Uses Jest + React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

**Mock API calls:**
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: {} }),
  })
) as jest.Mock;
```

---

## Common Tasks

### Adding a New Page

1. Create page component in `packages/dashboard/src/app/[route]/page.tsx`
2. Add navigation link in `packages/dashboard/src/components/Sidebar/index.tsx`
3. Add mobile nav link in `packages/dashboard/src/components/MobileNav/index.tsx`

### Adding a New API Route

1. Create route handler in `packages/dashboard/src/app/api/[route]/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` functions as needed
3. Use standard response format (see API Route Patterns)
4. Add security validation (path checks, extension allowlist, size limits)

### Adding a New Context

1. Create context in `packages/dashboard/src/contexts/[Name]Context.tsx`
2. Add provider to `packages/dashboard/src/app/layout.tsx`
3. Export hook: `export const use[Name] = () => useContext([Name]Context)`

### Adding Shared Types

1. Add type to `packages/core/src/types/[category].ts`
2. Export from `packages/core/src/types/index.ts`
3. Import in dashboard: `import { Type } from '@coderef-dashboard/core'`

---

## Testing Strategy

- **Unit tests:** `*.test.ts` or `*.test.tsx` files co-located with components/utilities
- **Integration tests:** `*.integration.test.ts` for API routes and complex workflows
- **Test location:** `__tests__/` directories or co-located with source files
- **Coverage:** Currently 0% threshold (increase as tests are added)

**Run tests before committing:**
```bash
npm test
npm run type-check
npm run lint
```

---

## Important Notes

### Electron Integration

The Electron app wraps the Next.js build:
- **Dev mode:** Loads `http://localhost:3004`
- **Production:** Loads from `.next` static export
- **IPC channels:** Defined in `packages/electron-app/preload.js` for native file system access

### Widget System

Widgets are modular components that can be:
- Bundled with the app (default)
- Loaded dynamically via File System Access API
- Registered in `packages/dashboard/src/lib/WidgetRegistry.ts`

### CodeRef Integration

The dashboard integrates with:
- **CodeRef MCP Server** - AI-assisted development via Model Context Protocol
- **Papertrail** - Workorder tracking and documentation audit trails
- **CodeRef Core** - Code scanning and analysis engine (in `packages/coderef-core`)

### Port Configuration

- **Next.js dev server:** Port 3004 (configured in `package.json`)
- **Electron dev mode:** Connects to `localhost:3004`

### Skills Directory

The `.skills/` directory contains **Vercel Skills** - reusable knowledge modules for AI agents:

- **Location:** `.skills/` in project root
- **Purpose:** Document project-specific patterns and best practices
- **Usage:** AI agents automatically reference skills when generating code

**Available Skills:**
- `coderef-dashboard-patterns.md` - Complete guide to established development patterns
  - Universal Target Selector Pattern
  - Target Adapter Pattern
  - Entity Converter Pattern
  - Context Menu Pattern (legacy)
  - **Unified Action Modal Pattern** (NEW - consolidates all entity actions into single modal)
  - Design System conventions
  - TypeScript best practices
  - Anti-patterns to avoid

**Adding Skills:**
```bash
# Browse available skills at https://skills.sh
npx skills add <github-org>/<repo-name>

# Or create custom skills manually in .skills/
```

See `.skills/README.md` for detailed documentation.

---

## Architecture Decisions

1. **File System Over Database:** Zero setup for users - just point to project directories
2. **Monorepo with npm Workspaces:** Shared type definitions, single `npm install`
3. **Next.js App Router:** Universal framework for both web and Electron
4. **Tailwind CSS:** Utility-first with custom `ind-*` design tokens for theming

---

## Additional Resources

- **[README.md](README.md)** - User-facing installation guide
- **[ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md)** - Detailed system architecture
- **[API.md](coderef/foundation-docs/API.md)** - Complete API reference
- **[COMPONENTS.md](coderef/foundation-docs/COMPONENTS.md)** - Component library
- **[SCHEMA.md](coderef/foundation-docs/SCHEMA.md)** - TypeScript type definitions
- **[.skills/README.md](.skills/README.md)** - Vercel Skills documentation
- **[.skills/coderef-dashboard-patterns.md](.skills/coderef-dashboard-patterns.md)** - Development patterns guide

---

**Version:** 0.8.2
**Last Updated:** 2026-01-23
**Maintained by:** CodeRef Team

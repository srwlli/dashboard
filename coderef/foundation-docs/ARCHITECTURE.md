---
generated_by: coderef-docs
template: architecture
date: "2026-01-14T01:30:00Z"
feature_id: foundation-docs-architecture
doc_type: architecture
workorder_id: WO-FOUNDATION-DOCS-001
task: DOCUMENT
agent: claude-sonnet-4-5
mcp_enhanced: true
_uds:
  validation_score: 95
  validation_errors: []
  validation_warnings: []
  validated_at: "2026-01-14T01:30:00Z"
  validator: UDSValidator
---

# Architecture Reference

**Project:** coderef-dashboard  
**Version:** 0.1.0  
**Date:** 2026-01-14  
**Last Updated:** 2026-01-14

---

## Purpose

This document provides comprehensive system architecture documentation for the coderef-dashboard project. It describes the overall system design, package structure, data flow, integration points, and architectural decisions that guide development.

## Overview

The coderef-dashboard is a modular widget system with PWA and Electron support, designed to aggregate and visualize CodeRef resources across multiple projects. It operates entirely on the file system without requiring database infrastructure, making it lightweight and easy to deploy.

**Key Architectural Principles:**
- **File System Based** - Zero database setup, reads directly from project directories
- **Multi-Project Support** - Aggregate resources across unlimited projects
- **Modular Design** - Widget-based architecture for extensibility
- **Type Safety** - TypeScript throughout for compile-time safety
- **Monorepo Structure** - Shared packages with independent deployment targets

## What

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Dashboard│  │  Scanner │  │ Explorer │  ...         │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Workorders│  │  Scanner │  │   File   │  ...         │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│              File System Data Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Projects │  │ Workorders│  │  Stubs   │  ...         │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│              CodeRef Core Integration                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Scanner  │  │  Context │  │   Graph  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Package Structure

The project uses npm workspaces to organize interdependent packages:

#### 1. `packages/core`

Shared library consumed by both web and Electron packages.

**Responsibilities:**
- Shared TypeScript types and interfaces
- Common utilities and helpers
- Shared hooks and context providers
- Type-safe API client functions

**Location:** `packages/core/`

#### 2. `packages/dashboard`

Next.js 16 web application with App Router.

**Responsibilities:**
- Next.js API routes for file system operations
- React components and pages
- Server-side rendering and static generation
- PWA configuration and service workers

**Location:** `packages/dashboard/`

**Key Features:**
- App Router architecture
- API routes for file operations, scanner, workorders
- React Server Components and Client Components
- Tailwind CSS for styling
- Responsive design with mobile support

#### 3. `packages/coderef-core`

CodeRef core library for code analysis and scanning.

**Responsibilities:**
- Code element scanning and extraction
- Dependency graph generation
- Context generation
- File generation system
- Pattern detection and analysis

**Location:** `packages/coderef-core/`

**Key Features:**
- AST-based code analysis
- Multi-language support (TypeScript, JavaScript, TSX, JSX)
- Graph-based dependency tracking
- Real-time scanning with progress reporting

#### 4. `packages/electron-app`

Electron wrapper for desktop distribution.

**Responsibilities:**
- Electron main process
- Window management
- IPC communication
- Desktop integration

**Location:** `packages/electron-app/`

## Why

### Architectural Decisions

**1. File System Based Architecture**

**Decision:** No database, all data read from file system.

**Rationale:**
- Zero setup required - works immediately
- Version control friendly - all data in git
- Distributed - each project manages its own data
- Simple deployment - no database migrations
- Portable - easy to backup and restore

**Trade-offs:**
- Slower for very large datasets (mitigated by caching)
- No real-time updates (mitigated by polling/SSE)

**2. Monorepo Package Structure**

**Decision:** Separate packages for core, dashboard, and electron-app.

**Rationale:**
- Type safety across packages
- Shared component library
- Independent deployment targets
- Clear separation of concerns
- Reusable code across platforms

**Trade-offs:**
- More complex build process (mitigated by npm workspaces)
- Potential version conflicts (mitigated by workspace dependencies)

**3. Widget-Based UI Architecture**

**Decision:** Modular widgets for different resource types.

**Rationale:**
- Extensibility - easy to add new resource types
- Reusability - widgets can be composed
- Maintainability - isolated components
- Flexibility - different layouts per page

**Trade-offs:**
- Initial setup complexity (mitigated by shared patterns)
- Potential duplication (mitigated by UnifiedCard component)

**4. Next.js App Router**

**Decision:** Use Next.js 14+ App Router architecture.

**Rationale:**
- Server Components for performance
- Built-in API routes
- File-based routing
- Optimized bundling
- React 18+ features

**Trade-offs:**
- Learning curve (mitigated by documentation)
- Some patterns different from Pages Router (mitigated by migration guides)

## When

### System Lifecycle

**1. Initialization**

- User configures `projects.config.json` with project paths
- Dashboard scans configured projects on startup
- Resources are discovered and cached

**2. Runtime**

- API routes handle file system operations
- React components fetch data via API routes
- Real-time updates via Server-Sent Events (SSE)
- State management via React Context

**3. Scanning Workflow**

- User selects projects and phases in Scanner UI
- API route initiates scan via subprocess
- Real-time output streamed via SSE
- Progress tracked and displayed
- Results written to `.coderef/` directories

## Data Flow

### Workorder Discovery Flow

```
1. User requests /api/workorders
   ↓
2. API route reads projects.config.json
   ↓
3. For each project:
   - Scan coderef/workorder/* directories
   - Read communication.json, plan.json, DELIVERABLES.md
   - Build workorder objects with graceful degradation
   ↓
4. Aggregate all workorders
   ↓
5. Return JSON response with:
   - workorders array
   - total count
   - by_project aggregation
   - by_status aggregation
```

### Scanner Execution Flow

```
1. User clicks "Execute" in Scanner UI
   ↓
2. POST /api/scanner/scan with projectIds and selections
   ↓
3. API route:
   - Creates scanId (UUID)
   - Registers ScanExecutor
   - Starts subprocess for each project
   ↓
4. Subprocess execution:
   - Phase 1: Create directories (if selected)
   - Phase 2: Run code scan (if selected)
   - Phase 3: Populate files (if selected)
   ↓
5. Real-time output streamed via SSE:
   - GET /api/scanner/scan/[scanId]/output
   - EventSource connection in browser
   - Console output displayed in real-time
   ↓
6. Status polling:
   - GET /api/scanner/scan/[scanId]/status
   - Updates UI with progress
   ↓
7. Completion:
   - Results written to .coderef/ directories
   - Scan status set to "completed"
```

### File Operation Flow

```
1. User requests file operation (read/write/delete)
   ↓
2. API route validates path:
   - Check if path is within registered project
   - Validate file extension (allowlist)
   - Check protected paths (prevent deletion)
   ↓
3. Execute operation:
   - Read: Read file, return content + metadata
   - Write: Write content, return success
   - Delete: Delete file, return success
   - Move: Rename/move file, return success
   ↓
4. Return JSON response with operation result
```

## Integration Points

### CodeRef Core Integration

The dashboard integrates with `@coderef/core` for code analysis:

**Scanner Integration:**
- Uses `coderef-core` CLI for scanning
- Subprocess execution via Node.js child_process
- Real-time output streaming
- Progress tracking

**File Generation:**
- Scanner generates `.coderef/` directory structure
- Files include: index.json, graph.json, context.json, etc.
- Dashboard reads these files for display

**MCP Server Integration:**
- Dashboard can connect to CodeRef MCP Server
- Provides AI-assisted development context
- Enables code intelligence features

### External Systems

**1. File System**

- Reads from project directories
- Writes scan results to `.coderef/` directories
- Manages workorder files (JSON, Markdown)

**2. Projects Configuration**

- Reads `projects.config.json` for project registry
- Supports centralized stubs directory
- Configurable workorder directory paths

**3. Electron IPC (Desktop Mode)**

- Main process communicates with renderer
- File system operations via IPC
- Window management

## Security Considerations

### Path Validation

All file operations validate paths to prevent directory traversal:

```typescript
function validateFilePath(path: string, registeredProjects: Project[]): boolean {
  // Check if path is within a registered project
  // Prevent ../ and absolute path attacks
  // Validate file extensions
}
```

### Protected Paths

Critical system files are protected from deletion:

```typescript
const PROTECTED_PATHS = [
  '.coderef/index.json',
  '.coderef/graph.json',
  'package.json',
  // ...
];
```

### File Extension Allowlist

Only allowed file types can be written:

```typescript
const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',
  '.md', '.json', '.txt',
  // ...
];
```

## Performance Considerations

### Caching Strategy

- API responses cached in React state
- File system reads cached in memory
- Scan results cached in `.coderef/` directories

### Optimization Techniques

- Server Components for static content
- Client Components only when needed
- Code splitting via Next.js
- Lazy loading for heavy components
- SSE for real-time updates (no polling)

### Scalability

- File system operations are I/O bound
- Parallel processing for multi-project scans
- Graceful degradation for large datasets
- Pagination support (future enhancement)

## Deployment Architecture

### Web PWA Deployment

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────┐
│  Next.js    │
│  (Vercel)   │
└──────┬──────┘
       │
┌──────▼──────┐
│ File System │
│  (Projects) │
└─────────────┘
```

### Electron Desktop Deployment

```
┌─────────────┐
│   Electron  │
│   Window    │
└──────┬──────┘
       │ IPC
┌──────▼──────┐
│   Main      │
│  Process    │
└──────┬──────┘
       │
┌──────▼──────┐
│ File System │
│  (Local)    │
└─────────────┘
```

## Development Workflow

### Local Development

1. **Setup:**
   ```bash
   npm install
   npm run dev
   ```

2. **Development:**
   - Hot reload for Next.js
   - TypeScript type checking
   - ESLint for code quality

3. **Testing:**
   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests for critical flows

### Build Process

1. **Type Checking:**
   ```bash
   npm run type-check
   ```

2. **Linting:**
   ```bash
   npm run lint
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Package (Electron):**
   ```bash
   npm run package:win
   ```

## Examples

### Adding a New API Route

```typescript
// packages/dashboard/src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
```

### Adding a New Component

```typescript
// packages/dashboard/src/components/NewComponent/index.tsx
'use client';

interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return (
    <div className="p-4">
      <h2>{title}</h2>
    </div>
  );
}
```

## References

- [API.md](./API.md) - API endpoint documentation
- [SCHEMA.md](./SCHEMA.md) - Data models and schemas
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
- [README.md](../README.md) - Project overview

---

**Last Updated:** 2026-01-14  
**Maintainer:** CodeRef Development Team  
**Version:** 0.1.0

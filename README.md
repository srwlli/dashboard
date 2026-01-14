---
generated_by: coderef-docs
template: readme
date: "2026-01-14T01:30:00Z"
feature_id: foundation-docs-readme
doc_type: readme
workorder_id: WO-FOUNDATION-DOCS-001
task: DOCUMENT
agent: claude-sonnet-4-5
_uds:
  validation_score: 95
  validation_errors: []
  validation_warnings: []
  validated_at: "2026-01-14T01:30:00Z"
  validator: UDSValidator
---

# CodeRef Dashboard

**Version:** 0.1.0  
**Date:** 2026-01-14  
**Maintainer:** CodeRef Development Team

---

## Purpose

CodeRef Dashboard is a modular widget system with PWA and Electron support that aggregates and visualizes CodeRef resources across multiple projects. It provides a unified interface for managing workorders, stubs, documentation, and code analysis without requiring database infrastructure.

## Overview

The CodeRef Dashboard is a comprehensive development tool that:

- **Aggregates Resources** - Collects workorders, stubs, and documentation from multiple CodeRef projects
- **Code Analysis** - Integrates with CodeRef Core for code scanning and analysis
- **File Operations** - Provides secure file read/write operations within registered projects
- **Real-Time Updates** - Streams scan output and status updates via Server-Sent Events
- **Multi-Platform** - Deployable as web PWA or Electron desktop app

**Key Features:**
- File system based (no database required)
- Multi-project support
- Modular widget architecture
- Type-safe TypeScript throughout
- Responsive design with mobile support
- Dark mode and theme customization

## What

### Project Structure

```
coderef-dashboard/
├── packages/
│   ├── core/              # Shared library
│   ├── dashboard/         # Next.js web application
│   ├── coderef-core/      # CodeRef core library
│   └── electron-app/      # Electron wrapper
├── coderef/
│   ├── foundation-docs/   # Foundation documentation
│   ├── resources-sheets/  # Resource documentation
│   └── workorder/         # Workorder tracking
└── README.md
```

### Core Packages

- **`@coderef-dashboard/core`** - Shared types, utilities, and hooks
- **`@coderef-dashboard/dashboard`** - Next.js 16 web application
- **`@coderef/core`** - Code analysis and scanning library
- **`@coderef-dashboard/electron-app`** - Electron desktop wrapper

## Why

The CodeRef Dashboard solves several development workflow challenges:

1. **Resource Discovery** - Easily find workorders and stubs across multiple projects
2. **Code Analysis** - Visualize code structure and dependencies
3. **File Management** - Secure file operations within project boundaries
4. **Workflow Integration** - Integrate with CodeRef MCP Server for AI-assisted development
5. **Zero Setup** - File system based, no database configuration required

## When

Use CodeRef Dashboard when:

- Managing multiple CodeRef projects
- Tracking workorders and stubs across projects
- Performing code analysis and scanning
- Needing a unified interface for development resources
- Integrating with AI-assisted development workflows

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- TypeScript 5.3+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd coderef-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Configuration

Create a `projects.config.json` file (outside the repository) with your project paths:

```json
{
  "projects": [
    {
      "id": "project-1",
      "name": "Project One",
      "path": "C:/path/to/project-1",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:/path/to/stubs"
  }
}
```

Update the API route to point to your config file:

```typescript
// packages/dashboard/src/app/api/workorders/route.ts
const configPath = 'C:/path/to/projects.config.json';
```

## Usage

### Dashboard

Navigate to `http://localhost:3000` to access the main dashboard. The dashboard displays:

- **Workorders** - All workorders from configured projects
- **Stubs** - Centralized stub backlog
- **Projects** - Registered CodeRef projects
- **Statistics** - Aggregated counts and metrics

### Scanner

Access the scanner at `http://localhost:3000/scanner` to:

1. Select projects to scan
2. Choose phases (Directories, Scan, Populate)
3. Execute scan and view real-time output
4. Monitor progress and status

### Explorer

Access the file explorer at `http://localhost:3000/explorer` to:

- Browse project file trees
- Read and edit files
- Navigate CodeRef directories

### API

The dashboard provides REST API endpoints:

- `GET /api/workorders` - List all workorders
- `GET /api/stubs` - List all stubs
- `GET /api/coderef/file?path=...` - Read file
- `POST /api/scanner/scan` - Start scan
- `GET /api/scanner/scan/[scanId]/output` - Stream scan output

See [API.md](./coderef/foundation-docs/API.md) for complete API documentation.

## Development

### Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:electron     # Start Electron in dev mode
npm run dev:all          # Start both web and Electron

# Build
npm run build            # Build all packages
npm run build:dashboard  # Build dashboard only
npm run build:electron   # Build Electron app

# Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm test                 # Run tests

# Package
npm run package:win      # Package Electron app for Windows
```

### Project Structure

- **`packages/core`** - Shared library with types and utilities
- **`packages/dashboard`** - Next.js application
  - `src/app/` - App Router pages and API routes
  - `src/components/` - React components
  - `src/contexts/` - React context providers
  - `src/lib/` - Utility functions
- **`packages/coderef-core`** - CodeRef core library
- **`packages/electron-app`** - Electron main process

### Adding a New Feature

1. **Create API Route** (if needed):
   ```typescript
   // packages/dashboard/src/app/api/new-feature/route.ts
   export async function GET() {
     return NextResponse.json({ success: true });
   }
   ```

2. **Create Component**:
   ```typescript
   // packages/dashboard/src/components/NewFeature/index.tsx
   'use client';
   export function NewFeature() {
     return <div>New Feature</div>;
   }
   ```

3. **Add Page**:
   ```typescript
   // packages/dashboard/src/app/new-feature/page.tsx
   import { NewFeature } from '@/components/NewFeature';
   export default function NewFeaturePage() {
     return <NewFeature />;
   }
   ```

## Architecture

The dashboard uses a modular architecture:

- **File System Data Layer** - Reads directly from project directories
- **Next.js API Routes** - Server-side file operations
- **React Components** - Client-side UI with TypeScript
- **CodeRef Core Integration** - Code analysis and scanning

See [ARCHITECTURE.md](./coderef/foundation-docs/ARCHITECTURE.md) for detailed architecture documentation.

## Documentation

- **[API.md](./coderef/foundation-docs/API.md)** - API endpoint reference
- **[ARCHITECTURE.md](./coderef/foundation-docs/ARCHITECTURE.md)** - System architecture
- **[SCHEMA.md](./coderef/foundation-docs/SCHEMA.md)** - Data models and schemas
- **[COMPONENTS.md](./coderef/foundation-docs/COMPONENTS.md)** - Component library reference

## Troubleshooting

### Common Issues

**1. Projects not appearing**

- Verify `projects.config.json` path is correct
- Check that project paths exist and are accessible
- Ensure API route points to correct config file

**2. Scanner not working**

- Verify projects are registered in ProjectsContext
- Check that CodeRef Core is installed
- Review console for error messages

**3. File operations failing**

- Verify file paths are within registered projects
- Check file extension is in allowlist
- Ensure file is not in protected paths list

**4. Build errors**

- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires 18+)
- Clear `.next` directory and rebuild

### Getting Help

- Check documentation in `coderef/foundation-docs/`
- Review error messages in browser console
- Check API route logs in terminal
- Review workorder documentation in `coderef/workorder/`

## Examples

### Using the API

```typescript
// Fetch all workorders
const response = await fetch('/api/workorders');
const data = await response.json();
console.log(data.data.workorders);

// Read a file
const fileResponse = await fetch(
  `/api/coderef/file?path=${encodeURIComponent(filePath)}`
);
const fileData = await fileResponse.json();
console.log(fileData.data.content);

// Start a scan
const scanResponse = await fetch('/api/scanner/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectIds: ['project-1'],
    selections: { 'project-1': { scan: true } }
  })
});
const scanData = await scanResponse.json();
console.log(scanData.data.scanId);
```

### Using Components

```typescript
import { useProjects } from '@/contexts/ProjectsContext';
import { StatsCard } from '@/components/StatsCard';

function Dashboard() {
  const { projects } = useProjects();
  
  return (
    <StatsCard
      title="Projects"
      items={[
        { label: 'Active', count: projects.length }
      ]}
    />
  );
}
```

## Requirements

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher
- **TypeScript:** 5.3.3 or higher
- **Operating System:** Windows, macOS, or Linux

## References

- [CodeRef Core Documentation](../packages/coderef-core/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Last Updated:** 2026-01-14  
**Version:** 0.1.0  
**Status:** Active Development

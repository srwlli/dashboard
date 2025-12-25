# Architecture

## Current Structure

The coderef-dashboard is a monorepo containing multiple packages:

- **packages/core** - Shared hooks, utilities, and type definitions
- **packages/widgets/@coderef-dashboard/widget-prompting-workflow** - Original widget package (to be removed)
- **packages/dashboard** - Next.js 16.1.1 web application with Turbopack
- **packages/electron-app** - Electron wrapper for desktop distribution

## Key Design Patterns

### TypeScript Global Declarations
Multiple packages declare `Window.CodeRefCore` with different type signatures, causing build conflicts.

### Build System
- Custom widget bundling via `scripts/build-widgets.js` (esbuild-based IIFE bundles)
- Next.js Turbopack for dashboard compilation
- Electron builder for packaging

### Module Resolution
NPM workspaces handle dependency resolution across packages. Type checking happens per-workspace package.

## Current Issues

1. **Type Declaration Conflicts** - Duplicate `CodeRefCore` declarations in core, widget, and dashboard packages
2. **Widget System Overhead** - Custom IIFE bundling adds complexity without proportional benefit
3. **Single Feature** - Only PromptingWorkflow exists, doesn't justify widget infrastructure
4. **Build Coupling** - `npm run build` requires successful widget build before workspace build

## Planned Restructuring

After restructure-monorepo, the architecture will simplify to:

```
packages/
├── core/           # Shared hooks, utilities, types (unchanged)
├── dashboard/      # Next.js app with all components
│   └── src/
│       ├── app/    # App Router pages
│       └── components/
│           └── PromptingWorkflow/  # Direct component (moved from widgets/)
└── electron-app/   # Electron wrapper (unchanged)
```

This removes:
- `packages/widgets/` directory entirely
- Custom `build-widgets.js` script
- Widget loader system in dashboard
- Type declaration conflicts
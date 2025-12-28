# CodeRef Dashboard - Quick Tool Reference

**Version:** 0.1.0
**Last Updated:** 2025-12-28

---

## Development Commands

- `npm run dev` - Start Next.js development server on localhost:3000
- `npm run dev:electron` - Start Electron desktop app in development mode
- `npm run build` - Build all workspace packages for production
- `npm run build:dashboard` - Build Next.js dashboard only
- `npm run build:electron` - Build Electron app only
- `npm run package:win` - Package Windows executable installer
- `npm test` - Run tests across all workspace packages
- `npm run lint` - Run linter across all workspace packages
- `npm run type-check` - Run TypeScript type checking across workspaces

---

## API Endpoints

- `GET /api/workorders` - Fetch all workorders from configured projects
- `GET /api/workorders/:id` - Fetch specific workorder details with tasks
- `GET /api/stubs` - Fetch all stubs from centralized directory

---

## Core Components

- `WorkorderCard` - Display workorder with status, project, and metadata
- `StubCard` - Display stub with category, priority, and status
- `FilterBar` - Multi-faceted filter with search and category filters
- `Sidebar` - Collapsible navigation sidebar with route highlighting
- `Header` - Top navigation with breadcrumbs and user avatar
- `ThemeToggle` - Switch between light and dark themes
- `AccentColorPicker` - Customize accent color from palette

---

## Key Files

- `projects.config.json` - External configuration for project directories
- `packages/core/src/index.ts` - Shared library exports
- `packages/dashboard/src/app/layout.tsx` - Root layout with providers
- `packages/dashboard/src/app/page.tsx` - Dashboard home page
- `packages/dashboard/tailwind.config.ts` - Tailwind design tokens

---

## Configuration

- Update `projects.config.json` with project paths and workorder directories
- Edit API routes to reference correct config file path
- Configure theme colors in `tailwind.config.ts` with `ind-*` tokens
- Set Node version requirement in root `package.json` (>= 18.0.0)

---

## Type Definitions

- `WorkorderObject` - Workorder entity with status and files
- `StubObject` - Stub entity with category and priority
- `WorkorderStatus` - Enum of workorder states (8 values)
- `StubCategory` - Enum of stub types (6 values)
- `ApiError` - Standard error response structure

---

## Common Tasks

- Add new page: Create file in `packages/dashboard/src/app/`
- Add new component: Create folder in `packages/dashboard/src/components/`
- Add new API route: Create route in `packages/dashboard/src/app/api/`
- Add new type: Export from `packages/core/src/types/`
- Add new context: Create in `packages/dashboard/src/contexts/`

---

## Troubleshooting

- Config not found: Update API route file paths to correct `projects.config.json` location
- No workorders showing: Verify project paths and ensure `coderef/workorder/` directories exist
- Type errors: Run `npm run type-check` and ensure matching TypeScript versions
- Electron won't start: Build dashboard first with `npm run build:dashboard`
- Hot reload not working: Check Next.js dev server is running on port 3000

---

## Documentation

- `README.md` - Project overview and quick start guide
- `coderef/foundation-docs/API.md` - REST API reference
- `coderef/foundation-docs/SCHEMA.md` - TypeScript interfaces and schemas
- `coderef/foundation-docs/COMPONENTS.md` - UI component library
- `coderef/foundation-docs/ARCHITECTURE.md` - System design and architecture

---

*This is a quick reference guide. See USER-GUIDE.md for comprehensive tutorials.*

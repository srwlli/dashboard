# CodeRef Dashboard - Quick Reference

**Version:** 0.1.0 | **Type:** Web Application (Next.js + Electron)

---

## At a Glance

- **Multi-Project Workorder Aggregation** - View all active work across 6+ projects in one dashboard
- **Centralized Stub Management** - Track backlog items (ideas, features, bugs) in single location
- **Advanced Filtering** - Filter by status, priority, project, category with real-time updates
- **Responsive Design** - Works on mobile, tablet, desktop with optimized layouts
- **Dual Deployment** - Available as web app (PWA) or desktop app (Electron)

---

## Quick Actions

| Action | Purpose | Time |
|--------|---------|------|
| `npm run dev` | Start development server | 5s |
| `npm run build` | Build production bundle | 60s |
| `npm run dev:electron` | Launch desktop app | 10s |
| Open `localhost:3000` | Access dashboard in browser | instant |
| Click Workorders tab | View all active workorders | <1s |
| Click Stubs tab | View backlog items | <1s |
| Toggle theme | Switch light/dark mode | instant |
| Apply filter | Filter workorders/stubs | instant |

---

## Features by Category

### Data Aggregation

| Feature | What It Does | How to Use |
|---------|--------------|------------|
| Multi-Project Scan | Reads workorders from all configured projects | Configure `projects.config.json` |
| Centralized Stubs | Displays stubs from single directory | Set `centralized.stubs_dir` in config |
| Real-time Metrics | Shows total counts by status/project | View stats cards on home page |

### Filtering & Search

| Feature | What It Does | How to Use |
|---------|--------------|------------|
| Status Filter | Filter by 8 workorder states | Click status pills in filter bar |
| Priority Filter | Filter stubs by priority level | Select priority (low/medium/high/critical) |
| Project Filter | Show workorders from specific projects | Multi-select project names |
| Category Filter | Filter by stub category | Select category (feature/fix/improvement) |
| Text Search | Free-text search across names | Type in search input field |
| Multi-Filter | Combine multiple filters | Click multiple filter pills |

### UI Customization

| Feature | What It Does | How to Use |
|---------|--------------|------------|
| Dark Mode | Toggle between light/dark themes | Click sun/moon icon in header |
| Accent Colors | Customize accent color | Settings → Accent Color Picker |
| Sidebar Collapse | Expand/collapse navigation | Click chevron icon in sidebar |
| Responsive Layout | Adapts to screen size | Automatic based on viewport |

### Navigation

| Page | Route | What's There |
|------|-------|--------------|
| Dashboard | `/` | Stats cards, workorders, stubs tabs |
| Prompts | `/prompts` | Prompting workflow component |
| Assistant | `/assistant` | Coming soon placeholder |
| Sources | `/sources` | Coming soon placeholder |
| Settings | `/settings` | Theme customization panel |

---

## Common Workflows

### Workflow 1: Daily Standup Prep

```
1. Open localhost:3000
2. Click "Workorders" tab
3. Filter by status → "Implementing"
4. Scan cards for your projects
5. Note blockers or updates
```
**Time:** 30 seconds

### Workflow 2: Sprint Planning

```
1. Navigate to "Stubs" tab
2. Filter priority → "High"
3. Filter category → "Feature"
4. Review descriptions and estimates
5. Copy stub IDs for planning tool
```
**Time:** 2 minutes

### Workflow 3: Project Health Check

```
1. View stats cards on home page
2. Check "by_status" breakdown
3. Click project filter for specific project
4. Review pending_plan and blocked workorders
5. Investigate delays
```
**Time:** 3 minutes

### Workflow 4: Filter Combination

```
1. Open filter bar
2. Select status: "Implementing"
3. Select project: "Project Alpha"
4. Select priority: "High"
5. View filtered results (AND logic)
6. Click "Clear Filters" to reset
```
**Time:** 15 seconds

### Workflow 5: Theme Customization

```
1. Click theme toggle icon (sun/moon)
2. Navigate to Settings page
3. Open Accent Color Picker
4. Select color from palette
5. See changes apply instantly
```
**Time:** 30 seconds

---

## API Endpoints

### GET /api/workorders

**Purpose:** Fetch all workorders from configured projects

**Request:**
```bash
curl http://localhost:3000/api/workorders
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workorders": [...],
    "total": 15,
    "by_project": {"project-a": 5},
    "by_status": {"implementing": 8}
  }
}
```

**Time:** 100-500ms

---

### GET /api/workorders/:id

**Purpose:** Get specific workorder details

**Request:**
```bash
curl http://localhost:3000/api/workorders/WO-PROJECT-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workorder": {...},
    "tasks": [...],
    "deliverables": [...],
    "communication_log": [...]
  }
}
```

**Time:** 50-200ms

---

### GET /api/stubs

**Purpose:** Fetch all stubs from centralized directory

**Request:**
```bash
curl http://localhost:3000/api/stubs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stubs": [...],
    "total": 42,
    "location": "C:\\path\\to\\stubs"
  }
}
```

**Time:** 50-200ms

---

## Configuration

### projects.config.json

**Location:** External file (not in repository)

**Structure:**
```json
{
  "projects": [
    {
      "id": "project-alpha",
      "name": "Project Alpha",
      "path": "C:\\absolute\\path\\to\\project",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:\\path\\to\\stubs"
  }
}
```

**Update API Routes:**
Edit `packages/dashboard/src/app/api/workorders/route.ts:23`
```typescript
const configPath = 'YOUR_PATH_TO_projects.config.json';
```

---

## File Locations

| Type | Location | Purpose |
|------|----------|---------|
| Config | External (user-defined path) | Project directory mappings |
| Workorders | `{project}/coderef/workorder/` | Active work per project |
| Stubs | Centralized directory | Backlog items |
| Documentation | `coderef/foundation-docs/` | API, Schema, Architecture |
| User Docs | `coderef/user/` | Guides and references |
| Components | `packages/dashboard/src/components/` | React UI components |
| API Routes | `packages/dashboard/src/app/api/` | Next.js API endpoints |

---

## Key Components

### WorkorderCard

**Purpose:** Display individual workorder

**Props:**
```typescript
{ workorder: WorkorderObject, onClick?: () => void }
```

**Usage:**
```tsx
<WorkorderCard
  workorder={workorderData}
  onClick={() => handleClick(id)}
/>
```

---

### StubCard

**Purpose:** Display individual stub

**Props:**
```typescript
{ stub: StubObject, onClick?: () => void }
```

**Usage:**
```tsx
<StubCard
  stub={stubData}
  onClick={() => handleClick(id)}
/>
```

---

### FilterBar

**Purpose:** Multi-faceted filtering component

**Props:**
```typescript
{
  onFilterChange: (filters: FilterConfig) => void,
  statusOptions?: string[],
  priorityOptions?: string[],
  showSearch?: boolean
}
```

**Usage:**
```tsx
<FilterBar
  onFilterChange={applyFilters}
  statusOptions={['implementing', 'complete']}
  priorityOptions={['high', 'critical']}
  showSearch={true}
/>
```

---

## Type Definitions

### WorkorderStatus (Enum)

```typescript
'pending_plan' | 'plan_submitted' | 'changes_requested' |
'approved' | 'implementing' | 'complete' | 'verified' | 'closed'
```

### StubCategory (Enum)

```typescript
'feature' | 'fix' | 'improvement' | 'idea' | 'refactor' | 'test'
```

### StubPriority (Enum)

```typescript
'low' | 'medium' | 'high' | 'critical'
```

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `CONFIG_MISSING` | 500 | Config file not found |
| `CONFIG_INVALID` | 500 | Invalid JSON in config |
| `PARSE_ERROR` | 500 | Failed to parse JSON file |
| `WORKORDER_NOT_FOUND` | 404 | Workorder ID not found |
| `FOLDER_NOT_FOUND` | 500 | Required directory missing |
| `PERMISSION_DENIED` | 403 | File access denied |
| `INTERNAL_ERROR` | 500 | Unexpected error |

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Config not found | Update API route paths (line 23) |
| No workorders | Verify projects in config, check paths |
| Type errors | Run `npm run type-check` |
| Port 3000 in use | Kill process: `npx kill-port 3000` |
| Slow loading | Reduce project count in config |
| Theme not saving | Clear localStorage, restart browser |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus search |
| `Esc` | Clear filters |
| `T` | Toggle theme |
| `/` | Focus sidebar |

---

## Key Concepts

### File-Based Architecture

The dashboard reads data directly from the file system rather than a database. Workorders are stored as JSON files in `coderef/workorder/` directories within each project. The API scans these directories on request and aggregates the results.

**Implications:**
- No database setup required
- Data is version-controlled with code
- Read-only by design (no write operations)
- Performance scales with number of projects

### Monorepo Structure

The project uses npm workspaces with 3 packages:
- `core` - Shared library (hooks, utils, types)
- `dashboard` - Next.js web application
- `electron-app` - Desktop wrapper

**Benefits:**
- Code sharing between web and desktop
- Consistent dependency versions
- Single build command for all packages

### Client vs Server Components

Next.js 14 App Router uses React Server Components. Components with event handlers or hooks need the `'use client'` directive at the top of the file.

**Rule of thumb:**
- Server component: Static content, no interactivity
- Client component: `onClick`, `useState`, `useEffect`, etc.

---

## Summary

**Total Features:** 7 core capabilities
**Total API Endpoints:** 3 REST endpoints
**Total Components:** 25+ UI components
**Total Pages:** 5 routes
**Total Filters:** 4 filter types (status, priority, project, category)
**Total Themes:** 2 (light, dark) + 6 accent colors

**Documentation:**
- [my-guide.md](my-guide.md) - Concise tool reference (60 lines)
- [USER-GUIDE.md](USER-GUIDE.md) - Comprehensive tutorial (500+ lines)
- [FEATURES.md](FEATURES.md) - Feature overview (300+ lines)
- [quickref.md](quickref.md) - This document (250 lines)

**Foundation Docs:**
- [API.md](../foundation-docs/API.md) - REST API reference
- [SCHEMA.md](../foundation-docs/SCHEMA.md) - TypeScript schemas
- [COMPONENTS.md](../foundation-docs/COMPONENTS.md) - Component library
- [ARCHITECTURE.md](../foundation-docs/ARCHITECTURE.md) - System design

---

*Generated: 2025-12-28 | Version: 0.1.0 | Framework: POWER*

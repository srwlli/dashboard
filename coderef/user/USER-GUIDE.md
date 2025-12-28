# CodeRef Dashboard - User Guide

**Project:** CodeRef Dashboard
**Version:** 0.1.0
**Date:** 2025-12-28
**Author:** CodeRef Team

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [How It Works](#how-it-works)
5. [Getting Started](#getting-started)
6. [Use Cases](#use-cases)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Quick Reference](#quick-reference)
10. [AI Integration Notes](#ai-integration-notes)

---

## Overview

CodeRef Dashboard is a **unified interface** for tracking workorders (active work) and stubs (backlog items) across multiple software projects. Instead of manually checking each project's `coderef/workorder/` directory, the dashboard aggregates all data into a single, filterable view.

**What it does:**
- 📊 Aggregates workorders from multiple projects in real-time
- 📋 Displays centralized stub backlog
- 🔍 Filters by status, priority, project, and category
- 🎨 Customizable dark/light themes
- 📱 Responsive design (works on mobile, tablet, desktop)
- 💻 Available as web app (PWA) or desktop app (Electron)

**What it doesn't do:**
- ❌ Create or modify workorders (read-only)
- ❌ Execute workorder tasks
- ❌ Version control integration
- ❌ Real-time collaboration (single-user)

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Verification Command |
|-------------|---------|---------------------|
| **Node.js** | 18.0.0+ | `node --version` → Expected: `v18.x.x` or higher |
| **npm** | 9.0.0+ | `npm --version` → Expected: `9.x.x` or higher |
| **Operating System** | Windows 10+, macOS 10.15+, Linux | `uname -a` (macOS/Linux) or `ver` (Windows) |
| **Disk Space** | 500 MB | For node_modules and build artifacts |
| **Memory** | 4 GB RAM | Recommended for development |

### Project Structure Requirements

Your projects must follow this structure:

```
project-root/
└── coderef/
    └── workorder/
        ├── feature-1/
        │   ├── communication.json  (required)
        │   ├── plan.json          (optional)
        │   └── DELIVERABLES.md    (optional)
        └── feature-2/
            └── communication.json
```

**Verification:**
```bash
# Check if workorder directory exists
ls -la /path/to/project/coderef/workorder

# Expected: Directory listing with feature folders
```

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/coderef-dashboard.git
cd coderef-dashboard
```

**Expected Output:**
```
Cloning into 'coderef-dashboard'...
remote: Enumerating objects: 1234, done.
remote: Counting objects: 100% (1234/1234), done.
Receiving objects: 100% (1234/1234), 5.67 MiB | 2.34 MiB/s, done.
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 1234 packages in 45s
```

⏱️ **Time Estimate:** 1-2 minutes (depending on internet speed)

### Step 3: Configure Projects

Create `projects.config.json` file:

**Location:** `C:\Users\<username>\Desktop\assistant\projects.config.json`

**Content:**
```json
{
  "projects": [
    {
      "id": "my-project",
      "name": "My Project",
      "path": "C:\\absolute\\path\\to\\project",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:\\Users\\willh\\Desktop\\assistant\\stubs"
  }
}
```

**Verification:**
```bash
# Validate JSON syntax
cat projects.config.json | python -m json.tool

# Expected: Formatted JSON output (no errors)
```

### Step 4: Update API Routes

Edit `packages/dashboard/src/app/api/workorders/route.ts` (line 23):

**Before:**
```typescript
const configPath = 'C:\\Users\\willh\\Desktop\\assistant\\projects.config.json';
```

**After:**
```typescript
const configPath = 'YOUR_ABSOLUTE_PATH_TO_projects.config.json';
```

Repeat for `packages/dashboard/src/app/api/stubs/route.ts` (line 23).

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
> coderef-dashboard@0.1.0 dev
> npm run dev -w packages/dashboard

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 3.2s
```

⏱️ **Time Estimate:** 5-10 seconds

### Step 6: Verify Installation

Open browser to `http://localhost:3000`

**Expected Behavior:**
- ✅ Dashboard loads without errors
- ✅ Sidebar displays navigation items
- ✅ Stats cards show workorder/stub counts
- ✅ Theme toggle switches between light/dark

**If you see errors, proceed to [Troubleshooting](#troubleshooting).**

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           User Browser (localhost:3000)         │
└────────────────┬────────────────────────────────┘
                 │ HTTP Request
                 ▼
┌─────────────────────────────────────────────────┐
│        Next.js API Routes (/api/...)            │
│  - GET /api/workorders  → Aggregate workorders  │
│  - GET /api/stubs       → Read centralized stubs│
└────────────────┬────────────────────────────────┘
                 │ File System Read
                 ▼
┌─────────────────────────────────────────────────┐
│         projects.config.json (External)         │
│  - Maps project IDs → file system paths         │
└────────────────┬────────────────────────────────┘
                 │ Scan Directories
                 ▼
┌──────────────────┬──────────────────┬───────────┐
│   Project A      │   Project B      │  Stubs    │
│  workorder/      │  workorder/      │  stubs/   │
│  ├─ feature-1/   │  ├─ feature-3/   │  ├─ idea-1│
│  └─ feature-2/   │  └─ feature-4/   │  └─ idea-2│
└──────────────────┴──────────────────┴───────────┘
```

### Behind the Scenes

When you request `/api/workorders`:

1. **Config Loading** (50ms)
   - Read `projects.config.json`
   - Parse JSON → ProjectsConfig object

2. **Directory Scanning** (100-300ms per project)
   - For each project: `fs.readdir(project.path + '/coderef/workorder')`
   - List all subdirectories (feature folders)

3. **File Parsing** (50ms per workorder)
   - Read `communication.json` → Parse JSON
   - Read `plan.json` (if exists) → Parse JSON
   - Read `DELIVERABLES.md` (if exists) → Store as string

4. **Aggregation** (10ms)
   - Combine all workorders into single array
   - Calculate totals by project and status

5. **Response** (5ms)
   - Serialize to JSON
   - Send HTTP 200 with response body

**Total Time:** ~500ms for 3 projects with 10 workorders each

---

## Getting Started

### Tutorial 1: View All Workorders

**Objective:** See all active workorders across projects

**Steps:**

1. **Navigate to Dashboard**
   ```
   Open http://localhost:3000
   ```

2. **View Workorders Tab**
   - Click "Workorders" tab at top
   - Observe list of workorder cards

3. **Inspect Workorder Details**
   - Each card shows:
     - Status icon (color-coded)
     - Feature name
     - Project name
     - Workorder ID (e.g., `WO-PROJECT-001`)
     - Last updated date

4. **Filter by Status**
   - Click filter dropdown
   - Select "Implementing"
   - List updates to show only in-progress workorders

**Expected Result:**
```
✅ Workorders displayed in grid layout
✅ Status icons match workorder state
✅ Filters work without page reload
```

⏱️ **Time Estimate:** 2 minutes

---

### Tutorial 2: Filter Workorders by Project

**Objective:** View workorders for a specific project only

**Steps:**

1. **Open Filter Panel**
   - Scroll to filter bar below stats cards
   - Expand "Project" filter section

2. **Select Project**
   - Click project name (e.g., "Project Alpha")
   - Filter pills turn blue when active

3. **View Filtered Results**
   - Workorder list updates automatically
   - Stats cards recalculate for filtered subset

4. **Clear Filters**
   - Click "Clear Filters" button at bottom
   - All workorders reappear

**Expected Result:**
```
✅ Only selected project's workorders shown
✅ Other projects hidden
✅ Clear filters restores full list
```

⏱️ **Time Estimate:** 1 minute

---

### Tutorial 3: Switch to Stubs View

**Objective:** View centralized stub backlog

**Steps:**

1. **Navigate to Stubs Tab**
   - Click "Stubs" tab at top of page
   - Wait for stubs to load (~200ms)

2. **Examine Stub Cards**
   - Each card shows:
     - Category icon (feature, fix, improvement, etc.)
     - Title and description
     - Priority (low, medium, high, critical)
     - Status badge (stub, planned, in_progress, completed)
     - Created date

3. **Filter by Priority**
   - Use priority filter pills
   - Select "High" priority
   - Only high-priority stubs remain

**Expected Result:**
```
✅ Stubs load from centralized directory
✅ Category icons display correctly
✅ Priority filtering works
```

⏱️ **Time Estimate:** 2 minutes

---

## Use Cases

### Use Case 1: Daily Standup Preparation

**Scenario:** You need to quickly review all in-progress work across 5 projects before daily standup.

**Workflow:**

```
1. Open dashboard → localhost:3000
2. Click "Workorders" tab
3. Filter by status: "Implementing"
4. Sort by project (visual scan)
5. Note any blockers from workorder details
```

**Benefits:**
- ⚡ 30 seconds vs 5 minutes manually checking each project
- 📊 Visual overview of all active work
- 🎯 Quickly identify bottlenecks

---

### Use Case 2: Sprint Planning

**Scenario:** Planning next sprint, need to prioritize backlog items.

**Workflow:**

```
1. Navigate to "Stubs" tab
2. Filter by priority: "High"
3. Filter by category: "Feature"
4. Review descriptions for estimation
5. Copy stub IDs for sprint planning tool
```

**Benefits:**
- 🔍 Centralized view of high-priority features
- 📋 No need to search multiple project backlogs
- ⏱️ Faster sprint planning meetings

---

### Use Case 3: Project Health Check

**Scenario:** Weekly review of overall project health.

**Workflow:**

```
1. View stats cards on dashboard home
2. Check "by_status" breakdown
3. Identify projects with many "pending_plan" workorders
4. Drill down into specific projects via filter
5. Investigate why plans are delayed
```

**Benefits:**
- 📈 High-level metrics at a glance
- 🚨 Early warning for process bottlenecks
- 📊 Data-driven decision making

---

## Best Practices

### Do ✅

- **Keep config file outside repository** - Avoid committing local paths to version control
- **Use absolute paths** - Relative paths cause file reading errors
- **Update config when adding projects** - Dashboard won't auto-discover projects
- **Refresh browser after config changes** - API caches config file
- **Use meaningful workorder IDs** - Follow pattern `WO-PROJECT-NNN`

### Don't 🚫

- **Don't hardcode config paths in production** - Use environment variables instead
- **Don't modify workorder files via dashboard** - Dashboard is read-only by design
- **Don't store sensitive data in config** - Keep credentials in `.env` files
- **Don't run multiple dev servers** - Port 3000 conflicts will occur
- **Don't skip TypeScript type checking** - Prevents runtime errors

### Tips 💡

- **Use dark mode for extended viewing** - Reduces eye strain
- **Bookmark filter combinations** - Browser bookmarks preserve URL params
- **Monitor API response times** - Slow responses indicate too many projects
- **Use Electron app for desktop integration** - Better file system performance
- **Enable PWA for offline access** - Service worker caches dashboard shell

---

## Troubleshooting

### Problem: Config File Not Found

**Symptom:**
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_MISSING",
    "message": "projects.config.json not found or invalid"
  }
}
```

**Cause:** API route has incorrect config file path

**Solution:**
1. Verify config file exists at specified path
2. Check file permissions (must be readable)
3. Update `configPath` in API route files (line 23):
   ```typescript
   const configPath = 'C:\\correct\\path\\to\\projects.config.json';
   ```
4. Restart dev server: `Ctrl+C` then `npm run dev`

⏱️ **Time to Fix:** 2 minutes

---

### Problem: No Workorders Displayed

**Symptom:** Dashboard loads, but workorder list is empty

**Possible Causes:**

1. **Projects not configured**
   - Check `projects.config.json` has valid project entries
   - Verify project paths are absolute, not relative

2. **Workorder directories don't exist**
   - Manually check: `ls /path/to/project/coderef/workorder`
   - Create directory if missing: `mkdir -p coderef/workorder`

3. **Missing communication.json files**
   - Each workorder folder needs `communication.json`
   - Check file exists: `cat workorder/feature-name/communication.json`

**Solution:**
```bash
# Verify project structure
cd /path/to/project
ls -R coderef/workorder

# Expected: Subdirectories with JSON files
```

⏱️ **Time to Fix:** 5 minutes

---

### Problem: Type Errors During Build

**Symptom:**
```
Type error: Property 'CodeRefCore' does not exist on type 'Window'
```

**Cause:** TypeScript version mismatch across packages

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules

# Reinstall with consistent versions
npm install

# Verify TypeScript versions match
npm list typescript
```

⏱️ **Time to Fix:** 3 minutes

---

### Problem: Slow API Responses

**Symptom:** Workorders take 5+ seconds to load

**Cause:** Too many projects (10+) or large workorder directories (50+ workorders)

**Solution:**

1. **Reduce project count** - Only include active projects in config
2. **Archive old workorders** - Move completed work to `coderef/archived/`
3. **Add caching** (future enhancement) - Redis or in-memory cache

**Workaround:**
```typescript
// Add pagination to API route
const limit = 50; // Limit workorders returned
const workorders = allWorkorders.slice(0, limit);
```

⏱️ **Time to Fix:** 10 minutes

---

## Quick Reference

### Common Commands

| Command | Purpose | Time |
|---------|---------|------|
| `npm run dev` | Start dev server | 5s |
| `npm run build` | Build for production | 60s |
| `npm test` | Run all tests | 30s |
| `npm run type-check` | Check TypeScript types | 15s |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/workorders` | GET | List all workorders |
| `/api/workorders/:id` | GET | Get workorder details |
| `/api/stubs` | GET | List all stubs |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus search bar |
| `Esc` | Clear filters |
| `T` | Toggle theme |
| `/` | Focus sidebar |

### File Locations

| File | Purpose |
|------|---------|
| `projects.config.json` | Project configuration |
| `packages/dashboard/src/app/page.tsx` | Dashboard home page |
| `packages/core/src/types/` | Shared TypeScript types |

---

## AI Integration Notes

### For AI Agents

When working with this codebase:

**Configuration:**
```typescript
// Always use absolute paths
const configPath = 'C:\\absolute\\path\\to\\projects.config.json';

// Never use relative paths
const configPath = '../../../projects.config.json'; // ❌ WRONG
```

**Error Handling:**
```typescript
// Use predefined error codes
return createErrorResponse(ErrorCodes.WORKORDER_NOT_FOUND, {
  searchedId: workorderId
});
```

**Type Safety:**
```typescript
// Import types from core package
import { WorkorderObject } from '@coderef-dashboard/core';

// Use interfaces for props
interface MyComponentProps {
  workorder: WorkorderObject;
}
```

**Common Pitfalls:**
- Don't forget `'use client'` directive for client components
- Don't circular dependencies between packages
- Don't mutate config files from API routes (read-only)

---

*This guide covers 80% of common workflows. For advanced topics, see [ARCHITECTURE.md](../foundation-docs/ARCHITECTURE.md) and [API.md](../foundation-docs/API.md).*

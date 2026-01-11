# Dashboard Agent - Start Here

**Workorder:** WO-MIGRATION-001-A2
**Feature:** migrate-to-coderef-dashboard
**Your Role:** Agent 2 (Dashboard Agent)

---

## 📋 Quick Start

### Step 1: Read These Files (in order)

1. **communication.json** ← Your assignment, phases, tasks
2. **context.json** ← Requirements and constraints
3. **plan.json** ← Full implementation plan (7 phases, 42 tasks)
4. **analysis.json** ← Technical analysis of migration

### Step 2: Your Phases

You are responsible for:

- ✅ **Phase 1:** Setup & Foundation (shared with Agent 1)
- ✅ **Phase 2:** Core Components (Isolated)
- ✅ **Phase 4:** Next.js API Routes (can run parallel with Agent 1's Phase 3)
- ✅ **Phase 5:** Hybrid Mode Logic
- ✅ **Phase 6:** Widget Integration

### Step 3: First Task

**SETUP-001:** Create directory structure

```bash
cd /c/Users/willh/Desktop/coderef-dashboard

mkdir -p packages/dashboard/src/components/coderef
mkdir -p packages/dashboard/src/lib/coderef
mkdir -p packages/dashboard/src/app/coderef-explorer
mkdir -p packages/dashboard/src/widgets/coderef-explorer
```

After completing, update `communication.json`:
```json
{
  "id": "SETUP-001",
  "status": "complete",
  "completed_at": "2025-12-28T06:00:00Z"
}
```

---

## 🎯 Your Work Locations

### Where You'll Create Files

```
packages/dashboard/src/
├── app/
│   ├── api/coderef/              ← Phase 4: API routes
│   │   ├── projects/route.ts
│   │   ├── projects/[id]/route.ts
│   │   ├── tree/route.ts
│   │   └── file/route.ts
│   └── coderef-explorer/         ← Phase 6: Page route
│       └── page.tsx
│
├── components/coderef/           ← Phase 2: React components
│   ├── ProjectSelector.tsx
│   ├── FileTree.tsx
│   ├── FileTreeNode.tsx
│   ├── FileViewer.tsx
│   └── ProjectManager.tsx
│
├── lib/coderef/                  ← Phase 4, 5: Utilities
│   ├── types.ts
│   ├── indexeddb.ts
│   ├── api-access.ts
│   └── hybrid-router.ts
│
└── widgets/coderef-explorer/     ← Phase 6: Widget wrapper
    ├── index.tsx
    └── CodeRefExplorerWidget.tsx
```

---

## 🤝 Coordination with Agent 1

### What Agent 1 Provides (Phase 3)

After Phase 3 completes, Agent 1 will create:
- `local-api-patterns.md` - File System Access API implementation guide
- Documentation on permission handling
- IndexedDB patterns

Location: `C:\Users\willh\Desktop\assistant\web\coderef\workorder\migrate-to-coderef-dashboard\`

### Parallel Work Opportunity

You can work on **Phase 4** (API routes) while Agent 1 works on **Phase 3** (File System API extraction). These don't depend on each other!

### Synchronization Points

- **Before Phase 5:** Wait for Agent 1 to complete Phase 3
- **Before Phase 7:** Complete Phase 6 so Agent 1 can validate

---

## 📊 Task Tracking

### Update communication.json as you work

**Starting a task:**
```json
{
  "id": "COMP-001",
  "status": "in_progress",
  "completed_at": null
}
```

**Completing a task:**
```json
{
  "id": "COMP-001",
  "status": "complete",
  "completed_at": "2025-12-28T06:15:00Z"
}
```

### Progress Tracking

The `progress` section auto-updates based on task statuses:
```json
"progress": {
  "total_tasks": 42,
  "completed": 5,
  "pending": 37,
  "percent_complete": 12
}
```

---

## 🏗️ Architecture Overview

### What You're Building

**Widget + Components Pattern:**
- **External:** CodeRefExplorerWidget (dashboard sees this)
- **Internal:** Reusable React components

**Hybrid Access (Option D):**
- User clicks "Browse Folder" once
- System stores BOTH:
  1. Handle in IndexedDB (for File System API mode)
  2. Registration with API (for server mode)
- Smart router tries local first, falls back to API

**Technology Stack:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- React (functional components)
- Tailwind CSS (dashboard design system)

---

## 📝 Phase-by-Phase Summary

### Phase 1: Setup & Foundation (Tasks: 1)
Create directory structure

### Phase 2: Core Components (Tasks: 5)
Build React components: ProjectSelector, FileTree, FileTreeNode, FileViewer
Style with Tailwind

### Phase 4: Next.js API Routes (Tasks: 6)
Create 5 API endpoints + fetch wrappers
Can run parallel with Agent 1's Phase 3 ✨

### Phase 5: Hybrid Mode Logic (Tasks: 5)
Implement dual storage + smart routing
Wire components to use hybrid-router

### Phase 6: Widget Integration (Tasks: 5)
Compose components into widget
Add to dashboard navigation
Test responsive layout

---

## ✅ Success Criteria

Your work is complete when:

- ✅ All React components built with TypeScript + Tailwind
- ✅ 5 API routes functional and tested
- ✅ Hybrid mode working (local + API)
- ✅ Widget integrated into dashboard
- ✅ Navigation link added
- ✅ All tasks in communication.json marked "complete"

Agent 1 will then validate (Phase 7) against current CodeRef Explorer app.

---

## 🚀 Ready to Start?

1. Read communication.json (your full task list)
2. Run SETUP-001 (create directories)
3. Move to Phase 2 (build components)
4. Update communication.json after each task

Good luck! 🎯

---

**Questions?** Check:
- plan.json for detailed implementation steps
- analysis.json for technical decisions
- context.json for requirements

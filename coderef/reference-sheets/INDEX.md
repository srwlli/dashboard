# Resource Sheets Index

**Purpose:** Quick reference index for all component/module resource sheets in the CodeRef Dashboard codebase.

**Location:** `coderef/reference-sheets/`

---

## What are Resource Sheets?

Resource sheets are comprehensive documentation files that provide deep technical context for complex components, modules, and services in the codebase. Each sheet includes:

- Executive summary (purpose, responsibilities)
- Architecture overview (component hierarchy, design decisions)
- State management patterns
- Integration points (internal/external)
- Performance considerations
- Testing strategy
- Common pitfalls

---

## Available Resource Sheets

### 1. CodeRefExplorerWidget

**File:** [CODEREF-EXPLORER-WIDGET.md](./CODEREF-EXPLORER-WIDGET.md)
**Component:** `packages/dashboard/src/widgets/coderef-explorer/CodeRefExplorerWidget.tsx`
**Lines of Code:** 398
**Complexity:** Very High

**Topics Covered:**
- View mode state management (Projects/CodeRef/Favorites)
- localStorage persistence with restoration flag pattern
- Cross-tab synchronization via storage events
- Favorites management with per-project groups
- Fail-safe localStorage quota handling

**When to Reference:**
- Working on Explorer widget features
- Debugging localStorage issues
- Understanding favorites system
- Implementing similar state persistence patterns

---

### 2. ScanExecutor

**File:** [SCAN-EXECUTOR.md](./SCAN-EXECUTOR.md)
**Component:** `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts`
**Lines of Code:** 343
**Complexity:** Very High

**Topics Covered:**
- Subprocess orchestration (Python script execution)
- SSE (Server-Sent Events) streaming architecture
- Event emitter pattern for real-time updates
- Sequential vs parallel execution tradeoffs
- Global registry for multi-client access
- Auto-cleanup strategies

**When to Reference:**
- Working on Scanner backend
- Debugging subprocess lifecycle issues
- Implementing SSE streaming features
- Understanding process management patterns

---

### 3. FileTree

**File:** [FILE-TREE.md](./FILE-TREE.md)
**Component:** `packages/dashboard/src/components/coderef/FileTree.tsx`
**Lines of Code:** 358
**Complexity:** High

**Topics Covered:**
- Recursive tree rendering with FileTreeNode
- Folder filtering algorithm (show only subfolder)
- Favorites filtering (preserve parent structure)
- Hybrid local/API access modes
- Empty/loading/error state handling

**When to Reference:**
- Working on FileTree features
- Debugging tree filtering logic
- Understanding recursive component patterns
- Implementing tree virtualization

---

### 4. PromptingWorkflow

**File:** [PROMPTING-WORKFLOW.md](./PROMPTING-WORKFLOW.md)
**Component:** `packages/dashboard/src/components/PromptingWorkflow/components/PromptingWorkflow.tsx`
**Lines of Code:** 304
**Complexity:** High

**Topics Covered:**
- Multi-step workflow orchestration
- Deferred execution queue for modal flows
- Export operations (JSON, Markdown, clipboard)
- Browser file download via Blob URLs
- Special prompt handling (Review Title for prompt 0004)

**When to Reference:**
- Working on Prompts page
- Debugging export workflows
- Understanding modal coordination patterns
- Implementing file download features

---

### 5. API Access

**File:** [API-ACCESS.md](./API-ACCESS.md)
**Module:** `packages/dashboard/src/lib/coderef/api-access.ts`
**Lines of Code:** 157
**Complexity:** Medium

**Topics Covered:**
- Generic fetch wrapper with error handling
- Type-safe API client architecture
- Custom ApiError class with error codes
- Namespaced API modules (ProjectsApi, TreeApi, FileApi)
- Response validation and error normalization

**When to Reference:**
- Adding new API endpoints
- Debugging API errors
- Understanding client-server communication
- Implementing error handling patterns

---

### 6. ProjectSelector

**File:** [ProjectSelector-resource-sheet.md](./ProjectSelector-resource-sheet.md)
**Component:** `packages/dashboard/src/components/coderef/ProjectSelector.tsx`
**Lines of Code:** 541
**Complexity:** Very High

**Topics Covered:**
- Cross-platform project registration (Web + Electron)
- IndexedDB persistence for FileSystemDirectoryHandle objects
- Silent permission restoration and stale handle detection
- Platform abstraction layer (File System Access API vs IPC)
- Batch re-authorization workflows with BatchRestoreUI
- Controlled selection pattern with initialProjectId restoration

**When to Reference:**
- Working on project management features
- Debugging persistence or permission issues
- Understanding Web vs Electron platform differences
- Implementing cross-platform file system access
- Adding directory selection workflows

---

## Index by Category

### State Management
- [CodeRefExplorerWidget](./CODEREF-EXPLORER-WIDGET.md) - Complex state with localStorage persistence
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Cross-platform project state with IndexedDB
- [FileTree](./FILE-TREE.md) - Hybrid tree loading with filtering

### Backend Services
- [ScanExecutor](./SCAN-EXECUTOR.md) - Process orchestration and SSE streaming
- [API Access](./API-ACCESS.md) - HTTP client library

### UI Components
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Platform-aware directory selection
- [FileTree](./FILE-TREE.md) - Recursive tree rendering
- [PromptingWorkflow](./PROMPTING-WORKFLOW.md) - Workflow orchestration

### Integration Patterns
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Web/Electron platform abstraction
- [API Access](./API-ACCESS.md) - Client-server communication
- [ScanExecutor](./SCAN-EXECUTOR.md) - Event-driven architecture

---

## How to Use Resource Sheets

**For New Features:**
1. Find similar component in index
2. Read architecture patterns
3. Follow established conventions
4. Reference integration points

**For Debugging:**
1. Locate component in index
2. Check "Common Pitfalls" section
3. Review state management patterns
4. Verify integration contracts

**For Onboarding:**
1. Read Executive Summary for overview
2. Study Architecture Overview for design rationale
3. Review Integration Points for dependencies
4. Check Testing Strategy for coverage gaps

---

**Generated:** 2026-01-02
**Total Resource Sheets:** 6
**Total Lines Documented:** 2,101 lines of code

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

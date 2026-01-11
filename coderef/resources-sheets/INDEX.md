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

**When to Reference:**
- Working on project management features
- Debugging persistence or permission issues

---

### 7. Electron Wrapper

**File:** [ELECTRON-WRAPPER.md](./ELECTRON-WRAPPER.md)
**Module:** `packages/electron-app/src/main.ts`
**Complexity:** Medium

**Topics Covered:**
- IPC (Inter-Process Communication) Architecture
- Native File System access via Electron bridge
- Production Next.js server spawning
- Security (Context Isolation, Node Integration)

**When to Reference:**
- Implementing native features
- Debugging bridge issues
- Understanding build/packaging logic

---

### 8. Widget System

**File:** [WIDGET-SYSTEM.md](./WIDGET-SYSTEM.md)
**Architecture:** `packages/dashboard/src/lib/WidgetRegistry.ts`
**Complexity:** Medium

**Topics Covered:**
- Widget registration in `coderef-dashboard.config.json`
- Folder/File conventions for new widgets
- Layout inheritance and persistence patterns
- Guidelines for "Industrial" styled widgets

**When to Reference:**
- Creating new dashboard widgets (e.g., File Editor)
- Managing widget discovery and configuration

---

### 10. FileViewer

**File:** [FILE-VIEWER.md](./FILE-VIEWER.md)
**Component:** `packages/dashboard/src/components/coderef/FileViewer.tsx`
**Complexity:** Medium

**Topics Covered:**
- Syntax highlighting and rich media rendering
- Support for Markdown, Mermaid, HTML, and Code
- Integration with Hybrid Router

**When to Reference:**
- Adding support for new file types
- Debugging file display issues

---

### 11. Notes Widget Text Editing

**File:** [NOTES-WIDGET-TEXT-EDITING.md](./NOTES-WIDGET-TEXT-EDITING.md)
**Component:** `packages/dashboard/src/widgets/notes/NotesWidget.tsx`
**Complexity:** Medium-High

**Topics Covered:**
- Text editing functions (textarea and input handlers)
- localStorage persistence for notes
- Multi-card note interface (always 3 cards)
- File system save operations
- State management via useLocalNotes hook

**When to Reference:**
- Working on text editing features
- Understanding note persistence patterns
- Debugging localStorage issues
- Implementing similar text editing functionality

---

### 12. Hybrid Router

**File:** [HYBRID-ROUTER.md](./HYBRID-ROUTER.md)
**Module:** `packages/dashboard/src/lib/coderef/hybrid-router.ts`
**Complexity:** High

**Topics Covered:**
- Dual-mode data fetching (Local FS vs API)
- Fallback strategies for permissions and capabilities
- Unified interface for data access

**When to Reference:**
- Debugging data loading issues
- Understanding offline vs online capabilities

---

## Index by Category

### State Management
- [CodeRefExplorerWidget](./CODEREF-EXPLORER-WIDGET.md) - Complex state with localStorage persistence
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Cross-platform project state with IndexedDB
- [FileTree](./FILE-TREE.md) - Hybrid tree loading with filtering
- [WIDGET-SYSTEM](./WIDGET-SYSTEM.md) - Self-contained widget persistence

### Platform & Shell
- [ELECTRON-WRAPPER](./ELECTRON-WRAPPER.md) - Native integration and IPC bridge
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Web/Electron platform abstraction

### Backend Services
- [ScanExecutor](./SCAN-EXECUTOR.md) - Process orchestration and SSE streaming
- [API Access](./API-ACCESS.md) - HTTP client library
- [Stubs System](./stubs-system.md) - Mock API infrastructure

### UI Components & Workflows
- [ProjectSelector](./ProjectSelector-resource-sheet.md) - Platform-aware directory selection
- [FileTree](./FILE-TREE.md) - Recursive tree rendering
- [PromptingWorkflow](./PROMPTING-WORKFLOW.md) - Workflow orchestration
- [Assistant Page](./assistant-page.md) - AI-powered interface design
- [Notes Widget Text Editing](./NOTES-WIDGET-TEXT-EDITING.md) - Text editing with localStorage persistence

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

**Generated:** 2026-01-04
**Last Updated:** 2026-01-08
**Total Resource Sheets:** 15
**Total Lines Documented:** 3,700+ lines of code

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

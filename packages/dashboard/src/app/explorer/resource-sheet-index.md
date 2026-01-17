# Explorer Resource Sheet Index

Comprehensive documentation for the CodeRef Explorer system and all related components.

**Last Updated:** 2026-01-16
**Total Resource Sheets:** 9

---

## Core Explorer Components

### 1. CodeRef Explorer Widget
**File:** `coderef/resources-sheets/components/CodeRef-Explorer-Widget-RESOURCE-SHEET.md`
**Component:** `packages/dashboard/src/widgets/coderef-explorer/CodeRefExplorerWidget.tsx`
**Lines:** 900+
**Complexity:** Very High

**Coverage:**
- State management (6 state variables: selectedProject, viewMode, selectedFile, favoritesData, isRestoringProject, initialProjectId)
- localStorage persistence (selected project, per-project favorites)
- Favorites management (toggle, groups, CRUD operations)
- View mode management (Projects/CodeRef/Favorites)
- Restoration & initialization flow with restoration flag guard
- Cross-tab synchronization (conservative logging approach)
- Performance considerations and optimization opportunities
- Testing strategy with comprehensive test coverage

**Key Sections:**
- Executive Summary
- Architecture Overview
- State Management (6 variables with restoration flag)
- LocalStorage Persistence (2 storage keys)
- Favorites Management (CRUD operations with groups)
- View Modes (3 modes: Projects/CodeRef/Favorites)
- Restoration & Initialization (mount sequence with flag guard)
- Performance Considerations
- Testing Strategy (6 test files)
- Common Pitfalls (restoration flag, localStorage errors, state mutation)

---

### 2. FileTree Component
**File:** `coderef/resources-sheets/components/FileTree-RESOURCE-SHEET.md`
**Component:** `packages/dashboard/src/components/coderef/FileTree.tsx`
**Lines:** 770+
**Complexity:** High

**Coverage:**
- Hybrid local/API tree loading via hybrid router
- Filtering logic (folder filtering, favorites filtering)
- Recursive composition pattern with FileTreeNode
- Access mode indicator (Local vs API badge)
- Move submenu system (preloaded for performance)
- Empty/error/loading states
- View modes (Projects/CodeRef/Favorites)
- Performance bottlenecks and optimization opportunities

**Key Sections:**
- Executive Summary
- Architecture Overview
- State Management (5 variables: tree, loading, error, accessMode, moveSubmenu)
- Filtering Logic (folder filter, favorites filter, special .coderef filter)
- Integration Points (FileTreeNode, FavoritesList, hybrid router)
- View Modes (3 modes with different tree structures)
- Empty & Error States (4 states)
- Access Mode Indicator (Local vs API visual feedback)
- Move Submenu System (preloaded directory structure)
- Performance Considerations (non-virtualized rendering)

---

### 3. FileViewer Component
**File:** `coderef/resources-sheets/components/FileViewer-RESOURCE-SHEET.md`
**Component:** `packages/dashboard/src/components/coderef/FileViewer.tsx`
**Lines:** 490
**Complexity:** Medium

**Coverage:**
- File content loading and display
- Syntax highlighting for 12+ languages (TypeScript, JavaScript, Python, Java, C, C++, Rust, Go, JSON, CSV, etc.)
- Markdown rendering with GitHub-flavored markdown (GFM)
- Mermaid diagram rendering with metadata extraction
- HTML sandboxed iframe preview
- Image/PDF/binary file handling (base64 encoding)
- Copy content, copy path, share functionality
- Full-page viewer navigation
- Error handling and empty states

**Key Features:**
- **Supported File Types:**
  - Markdown (.md) - Rendered as HTML with syntax-highlighted code blocks
  - Mermaid (.mmd) - Live diagram rendering
  - HTML (.html, .htm) - Sandboxed iframe preview
  - JSON (.json) - Formatted with syntax highlighting
  - Code (.ts, .tsx, .js, .jsx, .py, .java, .c, .cpp, .rs, .go, .csv) - Syntax highlighted
  - Binary - Base64 with "preview not available" message

**Recent Updates:**
- ✅ CSV support added (2026-01-16) - Syntax highlighting, UTF-8 encoding, text/csv MIME type

---

### 4. ProjectSelector Component
**File:** `coderef/resources-sheets/components/ProjectSelector-RESOURCE-SHEET.md`
**Component:** `packages/dashboard/src/components/ProjectSelector/index.tsx`
**Complexity:** Medium

**Coverage:**
- Project selection UI (dropdown interface)
- Cross-platform support (Web + Electron)
- File System Access API integration (Web)
- IndexedDB persistence for `FileSystemDirectoryHandle` objects (Web)
- IPC contracts for native filesystem validation (Electron)
- Batch restore UI for stale projects
- Project restoration with initialProjectId prop

**Important Note:**
- ⚠️ **As of 2026-01-13:** ProjectSelector is now a **read-only consumer** for project selection only
- Project CRUD operations (add/remove) have been **moved to Settings ProjectsPanel**
- ProjectSelector consumes projects from ProjectsContext

**Key Sections:**
- Architecture Overview
- State Ownership (ProjectsContext is source of truth)
- Permission Lifecycle (File System Access API)
- Platform Behavior (Web vs Electron differences)
- IndexedDB Schema (Web-only persistence)
- IPC Contracts (Electron validation)

---

## Supporting Infrastructure

### 5. Hybrid Router
**File:** `coderef/resources-sheets/middleware/Hybrid-Router-RESOURCE-SHEET.md`
**Module:** `packages/dashboard/src/lib/coderef/hybrid-router.ts`
**Lines:** 150
**Complexity:** High

**Coverage:**
- `loadProjectTree()` function - Main tree loading abstraction
- `loadFileContent()` function - File content loading abstraction
- Automatic mode detection (local vs API)
- Electron IPC integration (`window.electron.coderef.*`)
- HTTP API fallback (`/api/coderef/tree`, `/api/coderef/file`)
- Error handling and access mode reporting

**Key Features:**
- **Local Mode (Electron):**
  - Uses `window.electron.coderef.getTree(path)`
  - Instant loading (no network latency)
  - Returns `{ data: TreeNode[], mode: 'local' }`

- **API Mode (Browser):**
  - Uses `GET /api/coderef/tree?projectId={id}`
  - Fallback when Electron unavailable
  - Returns `{ data: TreeNode[], mode: 'api' }`

**Design Rationale:**
- Abstracts platform differences from UI components
- Single API for tree/file loading regardless of environment
- Automatic mode detection (try local first, fall back to API)

---

### 6. Projects Context
**File:** `coderef/resources-sheets/components/Projects-Context-RESOURCE-SHEET.md`
**Context:** `packages/dashboard/src/contexts/ProjectsContext.tsx`
**Complexity:** Medium

**Coverage:**
- Centralized project registry (global state)
- In-memory caching (eliminates redundant API calls)
- Optimistic update patterns (immediate UI updates)
- Automatic rollback on API failures
- API integration (`/api/coderef/projects`)
- Project CRUD operations (add, remove)

**State Interface:**
```typescript
interface ProjectsContextState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}
```

**Key Patterns:**
- **Optimistic Updates:** UI updates immediately, rollback on API failure
- **Error Recovery:** Automatic state restoration on failures
- **Single Source of Truth:** All components consume from this context

---

### 7. Right-Click Context Menu
**File:** `coderef/resources-sheets/components/Right-Click-Context-Menu-RESOURCE-SHEET.md`
**Component:** `packages/dashboard/src/components/ContextMenu/index.tsx`
**Complexity:** Medium

**Coverage:**
- File tree context menu actions (delete, copy, move, add to favorites)
- Favorites tab context menu (remove from favorites, assign to group, rename group, delete group)
- Menu behavior and positioning (follows cursor, prevents overflow)
- Data flow (menu items → actions → state updates)
- Integration points (FileTreeNode, FavoritesList)
- Visual styling (dark theme, hover states)

**Context Menu Actions:**

**File Tree:**
1. **Delete** - Deletes file/directory via API
2. **Copy Path** - Copies full file path to clipboard
3. **Move** - Opens submenu with all projects and directories (up to 5 levels deep)
4. **Add to Favorites** - Adds file to per-project favorites
5. **Remove from Favorites** - Removes file from favorites (if already favorited)

**Favorites Tab:**
1. **Remove from Favorites** - Removes from favorites list
2. **Assign to Group** - Assigns favorite to a group (submenu shows all groups)
3. **Rename Group** - Renames group (updates all favorites in group)
4. **Delete Group** - Deletes group (removes group assignment from all favorites)

---

## Additional Related Sheets

### 8. Electron IPC Analysis
**File:** `coderef/resources-sheets/analysis/Electron-IPC-Analysis-RESOURCE-SHEET.md`
**Type:** Analysis Document

**Coverage:**
- IPC channels used by Explorer (`window.electron.coderef.*`)
- Local filesystem access patterns
- Platform-specific behavior (Windows vs macOS vs Linux)
- Performance characteristics (local vs API)
- Security considerations (preload script, sandboxing)

**IPC Channels:**
- `window.electron.coderef.getTree(path)` - Load directory tree
- `window.electron.coderef.readFile(path)` - Read file content
- `window.electronAPI.fs.validatePath(path)` - Validate project path

---

### 9. Unified Storage
**File:** `coderef/resources-sheets/Unified-Storage-RESOURCE-SHEET.md`
**Type:** System Documentation

**Coverage:**
- localStorage vs IndexedDB comparison
- Cross-platform persistence strategies
- Storage quotas and limits (5MB localStorage, 50MB+ IndexedDB)
- Error handling (QuotaExceededError, DOMException)
- Migration strategies (localStorage → IndexedDB)

**Storage Usage in Explorer:**
- **localStorage:**
  - `coderef-explorer-selected-project` - Global selected project ID
  - `coderef-favorites-{projectId}` - Per-project favorites data

- **IndexedDB (Web only):**
  - `FileSystemDirectoryHandle` objects for project paths
  - Enables permission persistence across sessions

**Quota Handling:**
- Catches `QuotaExceededError` and degrades gracefully
- Continues in-memory operation without persistence
- User not blocked from using the feature

---

## Summary Table

| Resource Sheet              | Category   | Lines | Complexity | Primary Focus                                  |
|-----------------------------|------------|-------|------------|------------------------------------------------|
| CodeRef-Explorer-Widget     | Component  | 900+  | Very High  | State management, persistence, favorites       |
| FileTree                    | Component  | 770+  | High       | Recursive rendering, filtering, hybrid routing |
| FileViewer                  | Component  | 490   | Medium     | File content display, syntax highlighting      |
| ProjectSelector             | Component  | -     | Medium     | Project selection, cross-platform              |
| Hybrid-Router               | Middleware | 150   | High       | Local/API abstraction                          |
| Projects-Context            | Context    | -     | Medium     | Global state, caching                          |
| Right-Click-Context-Menu    | Component  | -     | Medium     | Context menu actions                           |
| Electron-IPC-Analysis       | Analysis   | -     | -          | Platform integration                           |
| Unified-Storage             | System     | -     | -          | Persistence layer                              |

**Total Documentation:** 2,310+ lines of comprehensive technical documentation

---

## Component Dependency Graph

```
CodeRefExplorerWidget (Main Widget)
├── ProjectSelector (Project Selection)
│   └── ProjectsContext (Global State)
├── ViewModeToggle (View Mode Tabs)
├── FileTree (Tree Rendering)
│   ├── Hybrid Router (Data Loading)
│   │   ├── Electron IPC (Local Mode)
│   │   └── File API (API Mode)
│   ├── FileTreeNode (Recursive Rendering)
│   ├── ContextMenu (Right-Click Actions)
│   └── FavoritesList (Favorites View)
└── FileViewer (Content Display)
    └── Hybrid Router (File Content Loading)
```

---

## Quick Reference: Where to Look

**For State Management:** → CodeRef-Explorer-Widget-RESOURCE-SHEET.md (Section: State Management)
**For File Loading:** → Hybrid-Router-RESOURCE-SHEET.md
**For Filtering Logic:** → FileTree-RESOURCE-SHEET.md (Section: Filtering Logic)
**For File Display:** → FileViewer-RESOURCE-SHEET.md
**For Project Selection:** → ProjectSelector-RESOURCE-SHEET.md
**For Context Menus:** → Right-Click-Context-Menu-RESOURCE-SHEET.md
**For Persistence:** → Unified-Storage-RESOURCE-SHEET.md
**For Electron Integration:** → Electron-IPC-Analysis-RESOURCE-SHEET.md
**For Global Projects:** → Projects-Context-RESOURCE-SHEET.md

---

## Recent Updates

### 2026-01-16
- ✅ **CSV Support Added**
  - FileViewer: Added `.csv` to syntax highlighting (line 221, 241)
  - File API: Added `.csv` to TEXT_EXTENSIONS (line 83)
  - File API: Added `.csv` to WRITE_ALLOWED_EXTENSIONS (line 138)
  - File API: Added `text/csv` MIME type (line 104)

### 2026-01-13
- ⚠️ **ProjectSelector Role Change**
  - Now read-only consumer for project selection only
  - Project CRUD moved to Settings ProjectsPanel

### 2026-01-09
- 📝 **FileTree Documentation Update**
  - Added move submenu system documentation
  - Added tree refresh callback documentation
  - Added special `.coderef` filter documentation (hides index.json)

---

## Testing Coverage

**Widget Tests:** 6 test files
- `CodeRefExplorerWidget.state.test.tsx` - State management
- `CodeRefExplorerWidget.refresh.test.tsx` - Refresh functionality
- `persistence-debug.test.tsx` - Persistence debugging
- `issue-1-restoration-flag.test.tsx` - Restoration flag guard
- `issue-2-quota-exceeded.test.tsx` - localStorage quota handling
- `issue-3-cross-tab-sync.test.tsx` - Cross-tab synchronization

**Coverage Gaps:**
- [ ] Favorites group management tests
- [ ] Large tree stress tests (1000+ nodes)
- [ ] Move submenu building tests
- [ ] CSV file rendering tests

---

**Maintained by:** CodeRef Team
**For Questions:** Consult individual resource sheets for detailed implementation guidance

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Directory Overview

**Location:** `packages/dashboard/src/app/explorer/`

**Purpose:** Next.js App Router route for the CodeRef Explorer page - a full-screen file browser for exploring project files with hybrid local/API access.

**Key Files:**
- `page.tsx` - Route page component (renders CodeRefExplorerWidget)
- `layout.tsx` - Custom layout that removes content constraints for full-screen UI
- `.claude/settings.local.json` - Claude Code settings for this directory

---

## Architecture

### Route Structure

This directory implements a **minimal route wrapper** pattern:

```
/explorer (this route)
└── CodeRefExplorerWidget (widget component)
    ├── ProjectSelector
    ├── ViewModeToggle
    ├── FileTree
    └── FileViewer
```

**Design Decision:** The route is intentionally thin - all logic lives in the widget component at `@/widgets/coderef-explorer/`.

**Why separate widget from route?**
- Widget can be reused in other contexts (embedded, modal, etc.)
- Route handles Next.js concerns (metadata, layout, routing)
- Widget handles application logic (state, data loading, user interactions)

### Custom Layout

**Key Feature:** `layout.tsx` bypasses the root layout's content constraints:

```tsx
export default function CodeRefExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      {children}
    </div>
  );
}
```

**Why custom layout?**
- Explorer needs full viewport height/width (no padding, no max-width)
- Root layout's grid gap and content padding interfere with fixed sidebar + flex panel design
- Global sidebar and header still render (from RootClientWrapper)

**What's bypassed:**
- Content padding (p-4, p-6)
- Max-width constraints (max-w-7xl)
- Grid gap spacing (gap-4)

**What's preserved:**
- Sidebar navigation
- Header breadcrumbs
- Theme providers
- Context providers

---

## Component Reference

### CodeRefExplorerWidget

**Location:** `packages/dashboard/src/widgets/coderef-explorer/CodeRefExplorerWidget.tsx`

**Comprehensive Documentation:** See `coderef/resources-sheets/components/CodeRef-Explorer-Widget-RESOURCE-SHEET.md`

**Key Responsibilities:**
- Project selection with localStorage persistence
- View mode management (Projects/CodeRef/Favorites)
- Favorites management with per-project storage
- File tree navigation with hybrid local/API access
- File content viewing

**State Management:**
- `selectedProject` - Current project (persisted to localStorage)
- `viewMode` - View mode ('projects' | 'coderef' | 'favorites')
- `selectedFile` - Active file in FileViewer
- `favoritesData` - Per-project favorites with optional groups
- `isRestoringProject` - Flag to prevent localStorage corruption during restoration

**localStorage Keys:**
- `coderef-explorer-selected-project` - Global selected project ID
- `coderef-favorites-{projectId}` - Per-project favorites data

### FileTree Component

**Location:** `packages/dashboard/src/components/coderef/FileTree.tsx`

**Comprehensive Documentation:** See `coderef/resources-sheets/components/FileTree-RESOURCE-SHEET.md`

**Key Features:**
- Recursive tree rendering with FileTreeNode
- Hybrid local/API access via hybrid router
- Folder filtering (e.g., show only `coderef/` directory)
- Favorites-only view with FavoritesList
- Access mode indicator (Local vs API)
- Move submenu for file operations across projects

**View Modes:**
- **Projects Mode:** Full project tree
- **CodeRef Mode:** Filtered to `coderef/` subdirectory
- **Favorites Mode:** Grouped favorites with drag-and-drop

---

## Common Tasks

### Testing Changes to Explorer Page

**Run tests:**
```bash
# Run all explorer widget tests
npm test -- coderef-explorer

# Run specific test file
npm test -- CodeRefExplorerWidget.state.test.tsx

# Watch mode
npm run test:watch -- coderef-explorer
```

**Test files located at:**
`packages/dashboard/src/widgets/coderef-explorer/__tests__/`

### Modifying Layout Constraints

If you need to adjust the layout wrapper:

1. **Add padding:** Modify `layout.tsx` to include padding classes
2. **Add max-width:** Add `max-w-*` utility classes
3. **Re-enable root constraints:** Remove custom layout entirely (delete `layout.tsx`)

**Warning:** Changing layout affects the 2-column design (320px sidebar + flex panel). Test thoroughly.

### Adding New View Modes

If adding a new view mode beyond Projects/CodeRef/Favorites:

1. Update `ViewMode` type in `@/lib/coderef/types.ts`
2. Add mode to `ViewModeToggle` component
3. Handle mode in `CodeRefExplorerWidget` (filtering logic, state clearing)
4. Update tests in `__tests__/CodeRefExplorerWidget.state.test.tsx`

---

## Important Patterns

### 1. Full-Screen Layout Pattern

This route uses a **custom layout** to achieve full-screen UI:

```tsx
// layout.tsx
<div className="h-full w-full overflow-hidden">
  {children}
</div>
```

**When to use this pattern:**
- Component needs viewport-based sizing (100vh, 100vw)
- Fixed-position sidebars or panels
- Split-pane interfaces
- Dashboard-style layouts

**When NOT to use:**
- Standard content pages (use root layout's constraints)
- Forms or text-heavy pages (benefit from max-width)

### 2. Widget Composition Pattern

This route follows the **thin route, thick widget** pattern:

```tsx
// page.tsx - Thin route
export default function CodeRefExplorerPage() {
  return <CodeRefExplorerWidget />;
}
```

**Benefits:**
- Widget is testable in isolation
- Widget can be reused in other contexts
- Route stays simple (Next.js metadata, layout only)

**Alternative (not used here):** Thick route with business logic inline
- ❌ Harder to test
- ❌ Can't reuse elsewhere
- ❌ Mixes routing concerns with application logic

### 3. State Restoration Pattern

The widget implements a **restoration flag guard** to prevent localStorage corruption:

```tsx
// Load saved project on mount
useEffect(() => {
  const savedProjectId = localStorage.getItem('coderef-explorer-selected-project');
  if (savedProjectId) {
    setInitialProjectId(savedProjectId);
  } else {
    setIsRestoringProject(false);
  }
}, []);

// Save project on change (but NOT during restoration)
useEffect(() => {
  if (selectedProject && !isRestoringProject) {
    localStorage.setItem('coderef-explorer-selected-project', selectedProject.id);
  }
}, [selectedProject?.id, isRestoringProject]);
```

**Why this pattern?**
- Prevents race condition where restoration triggers save
- Ensures localStorage is only written intentionally
- See `__tests__/issue-1-restoration-flag.test.tsx` for detailed explanation

---

## Resource Sheets

**📋 Complete Documentation Index:** See `resource-sheet-index.md` in this directory for all 9 Explorer-related resource sheets (2,310+ lines of documentation).

**Key Resource Sheets:**

1. **CodeRef-Explorer-Widget-RESOURCE-SHEET.md** (900+ lines)
   - State management (6 state variables)
   - localStorage persistence
   - Favorites management (CRUD operations)
   - Restoration & initialization flow
   - Cross-tab synchronization
   - Performance considerations

2. **FileTree-RESOURCE-SHEET.md** (770+ lines)
   - Filtering logic (folder + favorites)
   - Hybrid local/API access
   - Recursive tree rendering
   - Access mode indicator
   - Move submenu system
   - Performance bottlenecks

3. **FileViewer-RESOURCE-SHEET.md** (490 lines)
   - File content display with syntax highlighting
   - Supported file types (Markdown, JSON, CSV, TypeScript, etc.)
   - Copy/share functionality

4. **Additional Sheets:** ProjectSelector, Hybrid-Router, Projects-Context, Right-Click-Context-Menu, Electron-IPC-Analysis, Unified-Storage

**Location:** `coderef/resources-sheets/components/` (core components), `coderef/resources-sheets/middleware/` (hybrid router), `coderef/resources-sheets/analysis/` (analysis docs)

---

## Performance Notes

### Hybrid Access Modes

The explorer supports two access modes (automatically detected):

**Local Mode (Electron):**
- Uses `window.electron.coderef.getTree(path)`
- Instant tree loading (no network latency)
- Requires Electron environment

**API Mode (Browser):**
- Uses `GET /api/coderef/tree?projectId={id}`
- Slower (HTTP round-trip)
- Fallback when Electron unavailable

**Indicator:** Access mode badge shown in FileTree UI

### Known Bottlenecks

1. **Non-virtualized tree rendering** - Slow for projects with 1000+ files
2. **localStorage synchronous API** - Could cause jank for large favorites data
3. **Move submenu building** - Loads all project trees (preloaded once, cached)

**Optimization Opportunities:**
- Add react-window for virtual scrolling
- Memoize filtered tree
- Debounce localStorage writes

---

## Testing

**Test Coverage:**
- ✅ State management (restoration flag, quota exceeded, cross-tab sync)
- ✅ Persistence (localStorage save/load)
- ✅ Refresh functionality
- ⚠️ Missing: Favorites group management tests
- ⚠️ Missing: Large tree stress tests (1000+ nodes)

**Run tests:**
```bash
npm test -- coderef-explorer
```

---

**Version:** 1.0.0
**Last Updated:** 2026-01-16
**Maintained by:** CodeRef Team

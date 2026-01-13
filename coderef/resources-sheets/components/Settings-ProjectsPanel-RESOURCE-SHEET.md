---
agent: claude_sonnet_4_5
date: "2026-01-13"
task: DOCUMENT
subject: Settings ProjectsPanel
parent_project: coderef-dashboard
category: component
version: "1.0.0"
related_files:
  - packages/dashboard/src/components/Settings/ProjectsPanel.tsx
  - packages/dashboard/src/components/Settings/ProjectCard.tsx
  - packages/dashboard/src/components/Settings/EmptyState.tsx
  - packages/dashboard/src/app/settings/page.tsx
  - packages/dashboard/src/contexts/ProjectsContext.tsx
status: APPROVED
---

# Settings ProjectsPanel — Authoritative Documentation

## Executive Summary

ProjectsPanel is the **centralized project management UI** in the Settings page, serving as the single source of truth for adding, removing, and restoring projects across the entire dashboard. It integrates with ProjectsContext to provide a unified project management interface with platform-specific directory pickers (Web File System Access API + IndexedDB for web, IPC for Electron), stale project detection, and batch restoration workflows. This component replaces scattered project management UI across the application (e.g., Scanner's old "Add Path" button) and establishes Settings as the canonical location for project configuration.

## Audience & Intent

- **Markdown (this document):** Defines architectural role, state ownership, UI patterns, and integration contracts
- **TypeScript/Code:** Runtime implementation of project CRUD operations and platform abstraction
- **UI/UX:** Design patterns for empty states, stale project warnings, and confirmation dialogs

## 1. Architecture Overview

### Role in System

ProjectsPanel is the **primary UI for project management**:

1. **Centralized Control** → Settings is the only place users add/remove projects
2. **Global State** → Uses ProjectsContext (shared across entire app)
3. **Platform Abstraction** → Handles Web (IndexedDB + File System API) and Electron (IPC) differences
4. **Consumer Integration** → Scanner, CodeRef Explorer consume projects via useProjects() hook

### Component Hierarchy

```
Settings Page
├── ProjectsPanel (this component)
│   ├── Header (title + Add Project button)
│   ├── Error Banner (API failures)
│   ├── Project List
│   │   ├── ProjectCard (for each project)
│   │   │   ├── Project metadata (name, path, date)
│   │   │   ├── Stale indicator (if invalid)
│   │   │   ├── Restore button (stale only)
│   │   │   └── Remove button
│   │   └── EmptyState (when projects.length === 0)
│   └── Footer (project count + stale warning)
└── ThemePanel
```

### Key Integration Points

**Context Integration:**
- `useProjects()` - Access global project state
- `addProject()` - Register new project (optimistic update + rollback)
- `removeProject()` - Unregister project (optimistic update + rollback)
- `projects`, `isLoading`, `error` - Read-only state

**Platform Abstraction:**
- `fileSystem.selectDirectory()` - Platform-aware directory picker
- `fileSystem.isProjectValid()` - Validate project access
- `platform` - Runtime platform detection (`'web'` | `'electron'`)

**Persistence (Web):**
- `saveDirectoryHandlePersistent()` - Save IndexedDB handle
- `deleteDirectoryHandle()` - Remove IndexedDB handle

**Storage Location:**
- `~/.coderef-dashboard/projects.json` - Unified project storage (used by ALL systems)

## 2. State Ownership & Source of Truth

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| `projects` | ProjectsContext | Domain | `~/.coderef-dashboard/projects.json` | API route `/api/coderef/projects` |
| `isLoading` | ProjectsContext | UI | None (in-memory) | ProjectsContext state |
| `contextError` | ProjectsContext | UI | None (in-memory) | ProjectsContext state |
| `localError` | ProjectsPanel | UI | None (component state) | Component state |
| `adding` | ProjectsPanel | UI | None (component state) | Component state |
| `staleProjects` | ProjectsPanel | Domain | None (computed) | Runtime validation results |
| `staleReasons` | ProjectsPanel | Domain | None (diagnostic) | Runtime validation results |

### State Ownership Rules

1. **Projects Array:** ProjectsContext owns the projects array. ProjectsPanel uses context methods only.
2. **Stale Detection:** Component owns stale validation state, runs on mount and after operations.
3. **Error Handling:** Component combines context errors + local errors for display.
4. **Adding State:** Component owns "adding" flag to disable button during operations.

## 3. Data Persistence

### Storage Architecture

**Unified Storage:**
```
~/.coderef-dashboard/projects.json
{
  "projects": [
    {
      "id": "project-1234567890",
      "name": "my-app",
      "path": "C:/projects/my-app" (Electron) or "[Directory: my-app]" (Web),
      "addedAt": "2026-01-13T00:00:00.000Z"
    }
  ],
  "updatedAt": "2026-01-13T00:00:00.000Z"
}
```

**Platform-Specific Persistence:**

**Web:**
- Project path: `"[Directory: folder-name]"` (placeholder)
- Real handle: Stored in IndexedDB at key `project-{id}`
- Permissions: May reset on browser restart (requires restoration)

**Electron:**
- Project path: Absolute path string (e.g., `"C:/Users/.../"`)
- Validation: IPC call to Node.js filesystem
- Permissions: OS-level, no permission dialogs

### Persistence Flow

**Add Project (Web):**
```
User clicks "Add Project"
→ fileSystem.selectDirectory()
→ showDirectoryPicker() (browser native)
→ User grants permission
→ dirHandle returned
→ Generate ID: project-${timestamp}
→ Extract name from path
→ saveDirectoryHandlePersistent(id, handle) to IndexedDB
→ ProjectsContext.addProject({ id, name, path: "[Directory: name]" })
→ API writes to ~/.coderef-dashboard/projects.json
→ Component shows project in list
```

**Add Project (Electron):**
```
User clicks "Add Project"
→ fileSystem.selectDirectory()
→ window.electronAPI.fs.selectDirectory() (IPC)
→ User selects folder
→ Absolute path returned: "C:/path/to/folder"
→ Generate ID: project-${timestamp}
→ Extract name from path
→ ProjectsContext.addProject({ id, name, path: absolutePath })
→ API writes to ~/.coderef-dashboard/projects.json
→ Component shows project in list
```

**Remove Project:**
```
User clicks Remove → Confirmation dialog
→ User confirms
→ ProjectsContext.removeProject(projectId)
→ [Web] deleteDirectoryHandle(projectId) from IndexedDB
→ [Electron] No cleanup needed
→ API updates ~/.coderef-dashboard/projects.json
→ Project removed from list
```

**Restore Stale Project (Web only):**
```
Project marked stale (permission lost)
→ User clicks Restore button
→ showDirectoryPicker() (browser native)
→ User re-grants permission
→ New dirHandle saved to IndexedDB
→ staleProjects.delete(projectId)
→ Project marked valid
```

## 4. State Lifecycle

### Initialization

```
Component Mount
→ ProjectsContext already initialized (provider at root)
→ useProjects() returns { projects, isLoading, error }
→ useEffect(() => checkForStaleHandles(), [projects])
→ For each project:
  → [Web] getDirectoryHandle(id), verifyHandleValid()
  → [Electron] window.electronAPI.fs.validatePath(path)
  → If invalid: staleProjects.add(id), staleReasons.set(id, reason)
→ Render complete
```

### Add Project Flow

```
handleAddProject()
→ setAdding(true), setLocalError(null)
→ fileSystem.selectDirectory()
→ [Web] showDirectoryPicker() → dirHandle
→ [Web] saveDirectoryHandlePersistent(id, handle)
→ [Electron] Absolute path returned directly
→ ProjectsContext.addProject({ id, name, path })
→ Optimistic update: Project added to state immediately
→ API call in background: /api/coderef/projects
→ Success: loadProjects() refreshes cache
→ Failure: Rollback, setLocalError(), setAdding(false)
→ setAdding(false)
```

### Remove Project Flow

```
handleRemoveProject(projectId)
→ window.confirm("Are you sure?")
→ User cancels: return
→ User confirms:
  → ProjectsContext.removeProject(projectId)
  → Optimistic update: Project removed immediately
  → [Web] deleteDirectoryHandle(projectId) from IndexedDB
  → [Electron] No cleanup
  → API call: DELETE /api/coderef/projects/:id
  → Success: State remains updated
  → Failure: Rollback, setLocalError()
  → staleProjects.delete(projectId)
```

### Restore Project Flow

```
handleRestoreProject(projectId)
→ [Web] showDirectoryPicker()
→ User re-grants permission
→ saveDirectoryHandlePersistent(projectId, newHandle)
→ staleProjects.delete(projectId)
→ [Electron] checkForStaleHandles() (revalidate path)
```

## 5. Behaviors (Events & Side Effects)

### User Behaviors

| User Action | Event Handler | Side Effects |
|-------------|---------------|--------------|
| Click "Add Project" | `handleAddProject` | Platform picker → API registration → IndexedDB save (web) → Project appears in list |
| Click "Remove" on card | `handleRemoveProject` | Confirmation → API removal → IndexedDB cleanup → Project removed |
| Click "Restore" on stale card | `handleRestoreProject` | Platform picker → Save handle → Clear stale flag |

### System Behaviors

| Event | Trigger | Side Effects |
|-------|---------|--------------|
| Component mount | useEffect with projects dependency | Validate all projects → Update stale flags |
| ProjectsContext error | Context state change | Error banner appears |
| Add/remove success | API operation completes | Projects list updates |
| Add/remove failure | API operation fails | Error banner + rollback |

## 6. UI Components

### ProjectsPanel

**Props:** None (uses ProjectsContext directly)

**Rendering:**
- Header: Title + Add button
- Error banner (if error exists)
- Project list (if projects.length > 0)
- EmptyState (if projects.length === 0)
- Footer: Count + stale warning

**Tailwind Classes:**
- `bg-ind-panel border border-ind-border rounded-lg`
- `space-y-3` for project cards
- `p-4` for content padding

### ProjectCard

**Props:**
```typescript
{
  project: CodeRefProject;
  isStale: boolean;
  staleReason?: string;
  onRemove: (projectId: string) => void;
  onRestore: (projectId: string) => void;
}
```

**Rendering:**
- Folder icon (accent or yellow if stale)
- Project name (text-sm font-bold)
- Project path (text-xs font-mono truncate)
- Added date (text-xs text-ind-text-muted)
- Stale indicator (if isStale)
- Restore button (if isStale)
- Remove button

**Border Colors:**
- Normal: `border-ind-border hover:border-ind-accent/50`
- Stale: `border-yellow-500/50 bg-yellow-500/5`

### EmptyState

**Props:**
```typescript
{
  onAddProject: () => void;
  isAdding: boolean;
}
```

**Rendering:**
- Large folder icon (w-16 h-16)
- "No Projects Yet" heading
- Descriptive text
- Large "Add Your First Project" button
- Hint text

## 7. Platform-Specific Behaviors

### Web (File System Access API + IndexedDB)

**Directory Selection:**
- `showDirectoryPicker()` opens browser native picker
- User grants permission
- `FileSystemDirectoryHandle` returned
- Handle saved to IndexedDB with `navigator.storage.persist()` request

**Stale Detection:**
- Read handle from IndexedDB
- Call `handle.queryPermission({ mode: 'read' })`
- If `'prompt'` or `'denied'`: Mark stale

**Restoration:**
- User clicks Restore
- New picker dialog
- Fresh handle saved
- Stale flag cleared

### Electron (IPC-based native filesystem)

**Directory Selection:**
- `window.electronAPI.fs.selectDirectory()` IPC call
- Native OS folder picker
- Absolute path returned: `"C:/path/to/folder"`
- No permission dialogs

**Stale Detection:**
- IPC call: `window.electronAPI.fs.validatePath(path)`
- Response: `{ valid: boolean, reason?: string }`
- If `valid === false`: Mark stale with reason

**Restoration:**
- Electron paths don't need restoration
- If path invalid, user must remove and re-add project

## 8. Integration with Other Systems

### Scanner Integration

**Old Behavior (Removed):**
- Scanner had "Add Path" button
- Scanner had remove buttons on project cards
- Scanner managed its own project list in `~/.coderef-scanner-projects.json`

**New Behavior:**
- Scanner uses `useProjects()` hook
- Scanner displays projects as read-only checkbox list
- Scanner has "Manage in Settings" link
- Scanner uses unified storage `~/.coderef-dashboard/projects.json`

### CodeRef Explorer Integration

**Unchanged:**
- CodeRef Explorer still uses ProjectSelector component
- ProjectSelector continues to work with ProjectsContext
- Both Settings and Explorer share same project list

### Unified Storage Migration

**Before:**
- Scanner: `~/.coderef-scanner-projects.json`
- CodeRef: `~/.coderef-dashboard/projects.json`
- Two separate systems, no synchronization

**After:**
- All systems: `~/.coderef-dashboard/projects.json`
- Settings manages projects
- Scanner, Explorer, other pages consume via useProjects()

## 9. Performance Considerations

### Known Limits

- **10 projects:** Smooth performance
- **50+ projects:** Acceptable, may need virtualization
- **100+ projects:** Not tested, consider pagination

### Bottlenecks

1. **Sequential Validation:** Each project validated serially
   - 50 projects × 50ms = 2.5s on mount
   - **Mitigation:** Parallelize with `Promise.all()`

2. **IndexedDB Operations:** Each add/remove opens DB connection
   - **Impact:** Minimal for typical usage
   - **Mitigation:** Connection pooling (deferred)

## 10. Accessibility

### Current Gaps

| Issue | Severity | Fix |
|-------|----------|-----|
| No ARIA label on Add button | Minor | Add `aria-label="Add project"` |
| Stale status not announced | Major | Add `role="status"` to warning banner |
| Remove confirmation not accessible | Critical | Replace `window.confirm()` with modal dialog |

### Required Tasks

1. Replace `window.confirm()` with accessible dialog component
2. Add ARIA labels to all buttons
3. Add live region for error announcements

## 11. Testing Strategy

### Must-Cover Scenarios

1. ✅ Add project → Project appears in list
2. ✅ Remove project → Confirmation → Project removed
3. ✅ Stale project → Warning shown → Restore works
4. ✅ Empty state → Add button shown → First project added
5. ✅ Error handling → Add fails → Rollback + error shown
6. ⚠️ Web: Browser restart → Permissions lost → Stale detection
7. ⚠️ Electron: Path moved → Validation fails → Stale reason shown

## 12. Non-Goals / Out of Scope

**Explicitly NOT part of ProjectsPanel:**

1. ❌ Project selection (use CodeRef Explorer's ProjectSelector)
2. ❌ Project metadata editing (name, description, tags)
3. ❌ Project ordering/favoriting
4. ❌ Project search/filtering (only needed for 100+ projects)
5. ❌ Export/import project lists
6. ❌ Project duplication detection (future enhancement)

## 13. Common Pitfalls

### Known Issues

1. **Duplicate Projects Allowed:**
   - User can add same folder multiple times
   - Different IDs, same path
   - **Workaround:** Manual removal
   - **Fix needed:** Path deduplication check

2. **Web: Permission Reset on Browser Restart:**
   - Browser may revoke permissions
   - User must restore via UI
   - **No fix:** Browser security policy

3. **Electron: No Validation on Add:**
   - Path accepted without verification
   - Validation runs on mount
   - **Fix needed:** Immediate validation in handleAddProject

### Integration Gotchas

1. **Settings is now required:**
   - Users MUST use Settings to add/remove projects
   - Other pages (Scanner) are read-only consumers
   - Attempting to add projects elsewhere will fail

2. **Storage migration:**
   - Old scanner projects in `~/.coderef-scanner-projects.json` are orphaned
   - Users must manually re-add projects in Settings
   - **Future:** Auto-migration script

## Conclusion

ProjectsPanel is the **centralized project management UI** that establishes Settings as the single source of truth for project configuration. It replaces scattered project management across the application and provides a consistent, platform-aware interface for adding, removing, and restoring projects.

**Maintenance Expectations:**
- This component should remain the ONLY place for project CRUD operations
- Other pages should use useProjects() hook to consume projects (read-only)
- Platform-specific behaviors must be tested on both Web and Electron
- Stale project detection is critical for good UX on Web platform

**Version History:**
- v1.0.0 (2026-01-13): Initial implementation with unified storage

---

**Maintained by:** CodeRef Dashboard Team
**Last Validated:** 2026-01-13
**Next Review:** When File System Access API spec changes or new platforms added

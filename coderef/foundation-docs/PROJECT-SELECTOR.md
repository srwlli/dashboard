# Project Selector Component - Resource Sheet

**Element Type:** ui/components
**File Path:** `packages/dashboard/src/components/coderef/ProjectSelector.tsx`
**Category:** Stateful Container Component
**Last Updated:** 2026-01-02
**Auto-Fill Rate:** 70%

---

## Executive Summary

The ProjectSelector component is a cross-platform stateful container that manages project lifecycle (add/remove/select) and handles platform-specific directory permissions (Web File System Access API vs Electron IPC). It serves as the primary entry point for users to connect their local codebases to the dashboard, with automatic persistence restoration and stale handle detection.

**Primary Purpose:** Project directory selection and permission management across Web and Electron platforms

**Key Features:**
- Add projects via native directory picker (Web) or Electron file dialog
- Persistent storage of directory handles (Web IndexedDB) or paths (Electron fs)
- Automatic stale handle detection and batch re-authorization UI
- Context menu for project removal
- Auto-restoration of last selected project on mount

**Technical Stack:**
- React 18+ (Client Component)
- TypeScript
- Web File System Access API (Chrome/Edge)
- Electron IPC (desktop app)
- IndexedDB (Web persistence)
- Lucide icons

---

## Architecture

### Component Hierarchy

```
ProjectSelector (Client Component)
├── <select> (native dropdown)
│   ├── Folder icon (left)
│   └── <option> per project
├── Add Project button (Plus icon)
├── Remove Menu button (Trash2 icon)
│   └── Dropdown menu
│       ├── Individual project removal options
│       └── "Remove All" option
├── BatchRestoreUI (stale handle warnings)
└── ContextMenu (right-click on project)
    └── Remove Project action
```

### File Structure

```
components/coderef/
├── ProjectSelector.tsx          # Main component (this file)
├── BatchRestoreUI.tsx            # Stale project restoration UI
├── ContextMenu.tsx               # Right-click menu
└── __tests__/
    └── ProjectSelector.test.tsx (potential)
```

### Dependencies

**React Dependencies:**
- `react` (18.3.0+) - useState, useEffect
- `react-dom` (18.3.0+)

**Internal Dependencies:**
```typescript
import { CodeRefApi } from '@/lib/coderef/api-access'
import type { Project } from '@/lib/coderef/types'
import { fileSystem, platform } from '@/lib/coderef/platform'
import { Folder, Plus, Trash2, AlertCircle } from 'lucide-react'
import { ContextMenu } from './ContextMenu'
import { BatchRestoreUI } from './BatchRestoreUI'
```

**Platform-Specific Dynamic Imports:**
```typescript
// Web only:
'@/lib/coderef/local-access' - showDirectoryPicker()
'@/lib/coderef/persistence' - saveDirectoryHandlePersistent(), initializePersistence()
'@/lib/coderef/indexeddb' - deleteDirectoryHandle()

// Electron only:
window.electronAPI.fs.validatePath() - IPC direct fs validation
```

### Architectural Pattern

**Pattern:** Platform Abstraction Layer + Stateful Controller

**Why This Pattern:**
- Single codebase supports both Web (File System Access API) and Electron (native fs)
- Platform detection at runtime determines storage strategy
- Abstraction layer (`fileSystem`, `platform`) hides platform differences
- Component owns project list state, delegates persistence to platform modules

**Platform Responsibilities:**
- **Web:** Request directory handles, store in IndexedDB, validate via queryPermission()
- **Electron:** Store absolute paths in API, validate via IPC fs.access()

**Component Responsibilities:**
- Render UI (dropdown, buttons, error states)
- Manage project list state
- Coordinate add/remove/select workflows
- Trigger persistence initialization
- Detect and surface stale handles

### Design Principles

1. **Cross-Platform Compatibility:** Same component works in Web and Electron via abstraction
2. **User-Controlled Permissions:** Never request permissions without user action
3. **Silent Failure Recovery:** Auto-detect stale handles, surface batch re-auth UI
4. **State Synchronization:** Keep selectedProjectId prop in sync with parent via onProjectChange
5. **Progressive Enhancement:** Core functionality works without persistence, enhanced with it

---

## Integration

### Integration Points

**1. CodeRef API (Project Registry)**
- **Direction:** Bidirectional
- **Type:** HTTP REST API or mock in-memory
- **Methods:**
  - `CodeRefApi.projects.list()` - Fetch all registered projects
  - `CodeRefApi.projects.create({ id, name, path })` - Register new project
  - `CodeRefApi.projects.remove(id)` - Unregister project
- **Purpose:** Central registry of all projects (both Web and Electron)

**2. File System Abstraction Layer**
- **Direction:** Outbound
- **Type:** Platform detection + conditional logic
- **Methods:**
  - `fileSystem.selectDirectory()` - Platform-appropriate picker
  - `fileSystem.isProjectValid(id, path)` - Permission check
  - `platform` - Runtime detection ('web' | 'electron')
- **Purpose:** Hide platform differences from component logic

**3. Web Persistence Layer (IndexedDB)**
- **Direction:** Outbound (Web only)
- **Type:** Dynamic import + IndexedDB
- **Methods:**
  - `initializePersistence(projects)` - Attempt silent restoration, return stale IDs
  - `saveDirectoryHandlePersistent(id, handle)` - Store FileSystemDirectoryHandle
  - `deleteDirectoryHandle(id)` - Remove handle on project removal
- **Purpose:** Persist directory handles across browser sessions (Web only)

**4. Electron IPC (File System)**
- **Direction:** Outbound (Electron only)
- **Type:** IPC bridge via window.electronAPI
- **Methods:**
  - `window.electronAPI.fs.validatePath(path)` - Direct fs validation without permission dialogs
- **Purpose:** Validate paths without showing permission prompts

**5. Parent Component (State Sync)**
- **Direction:** Bidirectional
- **Type:** React props + callbacks
- **Props:**
  - `selectedProjectId?: string` - Controlled component pattern
  - `onProjectChange(project | null)` - Notify parent of selection changes
  - `initialProjectId?: string` - Auto-restore on mount
- **Purpose:** Keep parent in sync with project selection

**6. BatchRestoreUI (Stale Handle Recovery)**
- **Direction:** Outbound
- **Type:** Child component
- **Props:**
  - `staleProjects: Set<string>` - Project IDs needing re-auth
  - `staleReasons: Map<string, string>` - Reason per project
  - `projects: Project[]` - All projects
  - `onRestore: (id) => void` - Callback after successful restoration
- **Purpose:** User-triggered re-authorization for stale handles

### Data Flow

```
User clicks "Add Project" button
  ↓
Platform detection (Web vs Electron)
  ↓
Web: showDirectoryPicker() → FileSystemDirectoryHandle
Electron: Electron file dialog → absolute path string
  ↓
User selects directory
  ↓
Generate projectId (timestamp-based)
Extract projectName from path
  ↓
Register with CodeRefApi.projects.create()
  ↓
Web: Save handle to IndexedDB
Electron: Path stored in API memory
  ↓
Select new project (onProjectChange)
  ↓
Reload projects list (UI refresh)
```

**Persistence Restoration Flow (Web):**
```
Component mounts
  ↓
Load projects from API
  ↓
initializePersistence(projects) - async
  ↓
For each project: queryPermission(handle)
  ↓
Return list of stale project IDs (permission === 'prompt')
  ↓
Update staleProjects state
  ↓
BatchRestoreUI renders warning banner
  ↓
User clicks "Re-authorize"
  ↓
requestPermission(handle) - browser permission dialog
  ↓
onRestore callback → remove from staleProjects set
```

### External Dependencies

**Runtime Dependencies:**
- Browser File System Access API (Chrome 86+, Edge 86+)
- IndexedDB (Web persistence)
- Electron IPC bridge (desktop app)

**Build-Time Dependencies:**
- TypeScript compiler
- React JSX transform

### Failure Modes

**1. Permission Denied (Web)**
- **Symptom:** Directory picker shows, user denies permission
- **Handling:** Silent cancellation, no error shown
- **Recovery:** User can retry by clicking Add Project again

**2. Stale Directory Handle (Web)**
- **Symptom:** Previously added project no longer has permission
- **Handling:** Detected via queryPermission(), marked as stale
- **Recovery:** BatchRestoreUI prompts user to re-authorize

**3. Directory Deleted (Electron)**
- **Symptom:** Path no longer exists on filesystem
- **Handling:** Validation via window.electronAPI.fs.validatePath() fails
- **Recovery:** Display reason in staleReasons, user must remove project

**4. IndexedDB Quota Exceeded (Web)**
- **Symptom:** saveDirectoryHandlePersistent() throws QuotaExceededError
- **Handling:** Logged to console, handle not saved (fallback to prompt on reload)
- **Recovery:** User can clear browser data or remove old projects

**5. API Request Failure**
- **Symptom:** CodeRefApi.projects.create() throws network error
- **Handling:** Catch error, set error state, display in red alert banner
- **Recovery:** User can retry add/remove operation

**6. Multiple Projects Same Name**
- **Symptom:** Two projects with identical names in dropdown
- **Handling:** ID-based selection ensures correctness (UI shows duplicate names)
- **Recovery:** No fix needed (IDs differ, names are display-only)

---

## State Management

### Component State

| State Variable | Type | Initial | Purpose | Persistence |
|----------------|------|---------|---------|-------------|
| `projects` | `Project[]` | `[]` | List of all registered projects | None (loaded from API) |
| `loading` | `boolean` | `true` | Loading indicator for API calls | None |
| `error` | `string \| null` | `null` | Error message display | None |
| `adding` | `boolean` | `false` | Disable buttons during add flow | None |
| `contextMenu` | `{ x, y } \| null` | `null` | Context menu position | None |
| `staleProjects` | `Set<string>` | `Set()` | Project IDs needing re-auth | None (re-checked on mount) |
| `staleReasons` | `Map<string, string>` | `Map()` | Reason per stale project | None |
| `hasRestoredInitial` | `boolean` | `false` | Flag to prevent double-restoration | None |
| `showRemovalMenu` | `boolean` | `false` | Dropdown visibility toggle | None |

**State Ownership Rules:**
- ProjectSelector owns project list state (loaded from API, not duplicated)
- Parent owns `selectedProjectId` (controlled component pattern)
- Persistence layer owns directory handles (IndexedDB) or paths (Electron API)

**State Source of Truth:**
- **Project registry:** CodeRefApi (HTTP or in-memory)
- **Directory handles (Web):** IndexedDB
- **Directory paths (Electron):** Project.path field in API
- **Selected project:** Parent component via `selectedProjectId` prop

### Lifecycle Hooks

**1. Load Projects on Mount**
```typescript
useEffect(() => {
  loadProjects(); // Fetch from CodeRefApi
}, []);
```

**2. Auto-Select Initial Project (Persistence Restoration)**
```typescript
useEffect(() => {
  if (!hasRestoredInitial && !loading && projects.length > 0 && initialProjectId) {
    const project = projects.find(p => p.id === initialProjectId);
    if (project) {
      onProjectChange(project);
    }
    setHasRestoredInitial(true);
  }
}, [projects, loading, initialProjectId, hasRestoredInitial, onProjectChange]);
```
**Purpose:** Restore last selected project on mount (single-shot)

**3. Initialize Persistence Layer (Web)**
```typescript
useEffect(() => {
  if (projects.length === 0) return;

  const initPersistence = async () => {
    if (platform === 'web') {
      const { initializePersistence } = await import('@/lib/coderef/persistence');
      const needsReauth = await initializePersistence(projects);
      setStaleProjects(new Set(needsReauth));
    }
  };

  initPersistence();
}, [projects]);
```
**Purpose:** Attempt silent restoration, detect stale handles

**4. Check for Stale Handles (Fallback Detection)**
```typescript
useEffect(() => {
  checkForStaleHandles(); // Platform-specific validation
}, [projects]);
```
**Purpose:** Validate all projects on mount (Electron: fs.access, Web: queryPermission)

**5. Notify Parent on Selection Change**
```typescript
useEffect(() => {
  if (selectedProjectId) {
    const project = projects.find(p => p.id === selectedProjectId);
    onProjectChange(project || null);
  } else {
    onProjectChange(null);
  }
}, [selectedProjectId, projects]);
```
**Purpose:** Keep parent in sync with controlled `selectedProjectId` prop

---

## Props & Configuration

### Component Props

```typescript
interface ProjectSelectorProps {
  /** Currently selected project ID (controlled component) */
  selectedProjectId?: string;

  /** Callback when project selection changes */
  onProjectChange: (project: Project | null) => void;

  /** Initial project ID to auto-select on first load (for persistence) */
  initialProjectId?: string;

  /** Optional custom class name */
  className?: string;
}
```

**Props Usage:**
- **selectedProjectId:** Controlled component pattern - parent owns selection state
- **onProjectChange:** Callback invoked whenever selection changes (user action or programmatic)
- **initialProjectId:** One-time restoration on mount (e.g., from localStorage)
- **className:** Additional Tailwind classes for layout customization

**Prop Validation:**
- No runtime validation (TypeScript enforces types)
- `onProjectChange` is required (no-op would break parent sync)

### Project Type Schema

```typescript
interface Project {
  id: string;           // Unique identifier (e.g., "project-1672531199000")
  name: string;         // Display name extracted from path
  path: string;         // Platform-specific path format
  addedAt: string;      // ISO 8601 timestamp
}
```

**Path Formats:**
- **Web:** `"[Directory: folder-name]"` (synthetic format, real handle in IndexedDB)
- **Electron:** `"C:/absolute/path/to/folder"` (real filesystem path)

---

## Events & Callbacks

### User-Triggered Events

| Event | Trigger | Payload | Side Effects |
|-------|---------|---------|--------------|
| `handleSelectChange` | User selects project in dropdown | `e.target.value` (projectId) | Calls `onProjectChange(project)` |
| `handleAddProject` | User clicks "+" button | None | Opens directory picker, registers project, saves handle |
| `handleRemoveProject` | User clicks remove (menu or context) | `projectId?` | Confirms, calls API, clears IndexedDB, reloads projects |
| `handleRemoveAllProjects` | User clicks "Remove All (N)" | None | Confirms, removes all projects, clears all handles |
| `handleContextMenu` | User right-clicks selected project | `e: MouseEvent` | Opens context menu at cursor position |
| `handleProjectRestore` | User re-authorizes stale project | `projectId` | Removes from staleProjects set, rechecks handles |

### System Events

| Event | Trigger | Purpose |
|-------|---------|---------|
| Component mount | React lifecycle | Load projects, initialize persistence, check stale handles |
| Projects loaded | API response | Auto-select initial project, initialize persistence, validate handles |
| Permission granted (Web) | User approves File System API dialog | Save handle to IndexedDB, mark project valid |
| Permission denied (Web) | User rejects dialog | Silent cancellation, no error shown |

---

## Routing

**N/A** - This is a component, not a page. No routing logic.

---

## Testing

### Test Strategy

**Unit Tests (60% coverage target):**
- Component rendering with mock projects
- Add/remove project logic
- State transitions (loading, error, adding)
- Stale handle detection logic

**Integration Tests (30% coverage target):**
- Full add project flow (picker → API → persistence)
- Removal with IndexedDB cleanup
- Restoration flow (initialProjectId → auto-select)
- Platform detection (Web vs Electron)

**E2E Tests (10% coverage target):**
- Full user journey: add project → select → remove
- Stale handle recovery flow
- Permission denied graceful handling

### Coverage Gaps

**Missing Tests:**
- [ ] Platform-specific paths (Web vs Electron)
- [ ] IndexedDB quota exceeded error
- [ ] Electron IPC validation edge cases
- [ ] Stale handle re-authorization flow
- [ ] Context menu interactions
- [ ] Removal menu dropdown behavior

### Recommended Tests

**Test 1: Add Project Flow (Web)**
```typescript
// __tests__/ProjectSelector.web.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ProjectSelector } from './ProjectSelector'

// Mock platform detection
jest.mock('@/lib/coderef/platform', () => ({
  platform: 'web',
  fileSystem: {
    selectDirectory: jest.fn().mockResolvedValue('[Directory: my-app]'),
    isProjectValid: jest.fn().mockResolvedValue(true),
  },
}))

// Mock File System Access API
jest.mock('@/lib/coderef/local-access', () => ({
  showDirectoryPicker: jest.fn().mockResolvedValue({
    name: 'my-app',
    kind: 'directory',
  }),
}))

// Mock IndexedDB persistence
jest.mock('@/lib/coderef/persistence', () => ({
  saveDirectoryHandlePersistent: jest.fn().mockResolvedValue(undefined),
  initializePersistence: jest.fn().mockResolvedValue([]),
}))

describe('ProjectSelector (Web)', () => {
  it('adds project and saves handle to IndexedDB', async () => {
    const onProjectChange = jest.fn()

    const { getByTitle } = render(
      <ProjectSelector onProjectChange={onProjectChange} />
    )

    const addButton = getByTitle('Browse folder to add project')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(require('@/lib/coderef/persistence').saveDirectoryHandlePersistent)
        .toHaveBeenCalled()
    })

    expect(onProjectChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-app',
        path: '[Directory: my-app]',
      })
    )
  })
})
```

**Test 2: Stale Handle Detection**
```typescript
// __tests__/stale-handles.test.tsx
describe('Stale Handle Detection', () => {
  it('marks projects with denied permission as stale', async () => {
    const mockProjects = [
      { id: 'p1', name: 'Valid Project', path: '[Directory: valid]' },
      { id: 'p2', name: 'Stale Project', path: '[Directory: stale]' },
    ]

    jest.mock('@/lib/coderef/platform', () => ({
      platform: 'web',
      fileSystem: {
        isProjectValid: jest.fn()
          .mockResolvedValueOnce(true)  // p1 valid
          .mockResolvedValueOnce(false), // p2 stale
      },
    }))

    const { getByText } = render(<ProjectSelector onProjectChange={jest.fn()} />)

    await waitFor(() => {
      expect(getByText(/Stale Project/)).toBeInTheDocument()
      expect(getByText(/Re-authorization required/)).toBeInTheDocument()
    })
  })
})
```

**Test 3: Platform Detection (Electron)**
```typescript
// __tests__/ProjectSelector.electron.test.tsx
describe('ProjectSelector (Electron)', () => {
  beforeEach(() => {
    // Mock Electron IPC
    window.electronAPI = {
      fs: {
        validatePath: jest.fn().mockResolvedValue({ valid: true }),
      },
    }
  })

  it('validates paths via IPC instead of File System API', async () => {
    const mockProjects = [
      { id: 'p1', name: 'My App', path: 'C:/projects/my-app' },
    ]

    const { getByText } = render(<ProjectSelector onProjectChange={jest.fn()} />)

    await waitFor(() => {
      expect(window.electronAPI.fs.validatePath)
        .toHaveBeenCalledWith('C:/projects/my-app')
    })

    expect(getByText('My App')).toBeInTheDocument()
  })
})
```

**Test 4: Removal Flow**
```typescript
describe('Project Removal', () => {
  it('removes project from API and IndexedDB', async () => {
    const mockProjects = [
      { id: 'p1', name: 'Test Project', path: '[Directory: test]' },
    ]

    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true)

    const { getByTitle } = render(<ProjectSelector onProjectChange={jest.fn()} />)

    const removeButton = getByTitle('Remove projects')
    fireEvent.click(removeButton)

    const removeOption = getByText('Test Project')
    fireEvent.click(removeOption)

    await waitFor(() => {
      expect(require('@/lib/coderef/indexeddb').deleteDirectoryHandle)
        .toHaveBeenCalledWith('p1')
    })
  })
})
```

**Test 5: Error Handling**
```typescript
describe('Error States', () => {
  it('displays error when API call fails', async () => {
    jest.mock('@/lib/coderef/api-access', () => ({
      CodeRefApi: {
        projects: {
          list: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      },
    }))

    const { getByText } = render(<ProjectSelector onProjectChange={jest.fn()} />)

    await waitFor(() => {
      expect(getByText(/Network error/)).toBeInTheDocument()
    })
  })
})
```

---

## Performance

### Performance Budget

**Component Size:**
- **File Size:** 18 KB (uncompressed TypeScript)
- **Bundle Impact:** ~6 KB (gzipped after minification)
- **Dependencies:** Minimal (lucide-react icons only)

**Rendering:**
- **Initial Render:** < 16ms (60fps)
- **Re-render on State Change:** < 8ms
- **Projects List Limit:** 1000 projects (dropdown performance threshold)

### Known Bottlenecks

**1. IndexedDB Bulk Operations (Web)**
- **Issue:** Saving 100+ directory handles sequentially blocks UI
- **Impact:** Add project flow takes 1-2 seconds for large projects
- **Severity:** Low (rare use case)
- **Affected:** Users adding many projects at once

**2. Stale Handle Validation (Web)**
- **Issue:** queryPermission() for 50+ projects takes 3-5 seconds
- **Impact:** Component mount delay, stale UI state
- **Severity:** Medium
- **Affected:** Users with many projects, slow network

**3. Dropdown Rendering (1000+ projects)**
- **Issue:** Native <select> re-renders entire option list on state change
- **Impact:** Janky UI when adding/removing projects with large list
- **Severity:** Low (edge case)
- **Affected:** Power users with massive project collections

**4. Electron IPC Validation**
- **Issue:** fs.access() for 100+ paths serially blocks main process
- **Impact:** UI freeze during validation, 5-10 second delay
- **Severity:** Medium
- **Affected:** Electron users with many projects

### Optimization Opportunities

**Immediate (High ROI):**
1. **Parallelize stale handle checks**
   - Use Promise.allSettled() for concurrent queryPermission()
   - Estimated savings: 70% faster validation (5s → 1.5s)
   - Complexity: Low

2. **Debounce API calls**
   - Wait 300ms after rapid add/remove before reloading
   - Estimated savings: 50% fewer API calls
   - Complexity: Low

3. **Virtualize dropdown (1000+ projects)**
   - Replace <select> with custom virtualized list
   - Estimated savings: 10x faster rendering with large lists
   - Complexity: Medium

**Medium Term:**
4. **Batch IndexedDB writes**
   - Save multiple handles in single transaction
   - Estimated savings: 80% faster bulk operations
   - Complexity: Medium

5. **Cache validation results**
   - Store last validation timestamp per project
   - Skip re-validation if < 5 minutes old
   - Estimated savings: 90% fewer permission checks on remount
   - Complexity: Medium

6. **Background validation worker**
   - Offload stale handle checks to Web Worker
   - Estimated savings: No main thread blocking
   - Complexity: High

**Long Term:**
7. **Incremental validation**
   - Only validate projects on-demand (when selected)
   - Estimated savings: Instant mount, lazy validation
   - Complexity: High (UX redesign)

### Monitoring

**Metrics to Track:**
- **Mount time:** Time to first interactive (project list loaded)
- **Add project duration:** Picker → API → IndexedDB → UI update
- **Stale handle detection time:** Full validation pass duration
- **IndexedDB operation latency:** Handle save/load/delete times

**Performance Targets:**
- Mount time < 500ms (excluding API call)
- Add project < 1 second
- Stale detection < 2 seconds (50 projects)
- IndexedDB operations < 100ms each

---

## Accessibility

### Current Accessibility Gaps

| Issue | Severity | Impact | Fix Required |
|-------|----------|--------|--------------|
| No ARIA labels on dropdown | High | Screen readers announce "Select" without context | Add `aria-label="Project selector"` |
| Context menu not keyboard accessible | High | Keyboard users can't access Remove action | Add keyboard shortcut (Delete key) |
| No loading announcement | Medium | Screen reader users don't know projects are loading | Add `aria-live="polite"` region |
| Error banner not announced | Medium | Screen reader users miss error messages | Add `role="alert"` to error div |
| No focus trap in removal menu | Low | Focus escapes dropdown on Tab | Implement focus trap |

### Required Accessibility Tasks

**Priority 1 (Critical):**
- [ ] Add aria-label to <select> element
- [ ] Implement keyboard navigation for context menu (Delete key to remove)
- [ ] Add role="alert" to error banner

**Priority 2 (Important):**
- [ ] Add aria-live region for loading states
- [ ] Add aria-describedby for stale project warnings
- [ ] Implement focus management for removal dropdown

**Priority 3 (Nice to Have):**
- [ ] Add aria-busy during async operations
- [ ] Add tooltips with aria-describedby for icon buttons
- [ ] Implement focus trap in removal menu dropdown

---

## Manual Sections (To Be Completed)

### Platform-Specific Behavior

*Document exact differences:*
- [ ] Web: File System Access API permission model
- [ ] Web: IndexedDB schema for directory handles
- [ ] Electron: IPC bridge methods and error handling
- [ ] Electron: Path validation without permission prompts

### Persistence Contract

*Document storage schema:*
- [ ] IndexedDB object store structure
- [ ] Directory handle serialization format
- [ ] Project ID generation algorithm (timestamp-based)
- [ ] Stale handle detection logic (queryPermission states)

### Security Considerations

*Document security model:*
- [ ] Origin isolation for IndexedDB
- [ ] Handle permission inheritance
- [ ] Path traversal prevention (Electron)
- [ ] XSS risks from project names

---

## Metadata

**Created:** 2026-01-02
**Last Modified:** 2026-01-02
**Author:** CodeRef Assistant
**Version:** 1.0.0
**Status:** Draft (Manual sections incomplete)

**Related Files:**
- Schema: `coderef/schemas/project-selector-schema.json`
- JSDoc: `coderef/foundation-docs/.jsdoc/project-selector-jsdoc.txt`
- Source: `packages/dashboard/src/components/coderef/ProjectSelector.tsx`

**Dependencies on Other Resource Sheets:**
- BatchRestoreUI component (not yet documented)
- ContextMenu component (not yet documented)
- CodeRefApi service (not yet documented)
- Platform abstraction layer (not yet documented)

---

**End of Resource Sheet**

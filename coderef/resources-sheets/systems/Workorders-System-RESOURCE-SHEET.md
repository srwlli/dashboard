---
agent: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
date: "2026-01-02"
task: DOCUMENT
subject: Workorders System
parent_project: coderef-dashboard
category: other
version: 1.0.0
related_files:
  - packages/dashboard/src/lib/workorders-system.ts
status: APPROVED
---

# Workorders System — Authoritative Documentation

## Executive Summary

The Workorders System manages active work items across all projects in the CodeRef Dashboard. Workorders represent in-progress implementations stored in project-specific `coderef/workorder/` directories, distinct from pending stubs. The system provides multi-project aggregation, status tracking through an 8-stage workflow, file parsing (communication.json, plan.json, DELIVERABLES.md), and client-side filtering capabilities. This document defines the complete workorder lifecycle, data contracts, status progression rules, and component integration patterns.

## Audience & Intent

- **Markdown (this document):** Architectural truth for workorder data model, status workflow, file structure, and component behavior
- **TypeScript (`types/workorders.ts`):** Compile-time contracts for workorder objects and API responses
- **API Route (`/api/workorders`):** Source of truth for workorder aggregation logic and file parsing
- **Component Code:** Runtime behavior for display, filtering, and interactions
- **File System:** Physical storage of workorder data (communication.json, plan.json, DELIVERABLES.md)

---

## 1. Architecture Overview

### Role in System
The Workorders System is an **active work tracking layer** that:
- Aggregates workorder data from all configured projects
- Tracks 8-stage workflow status (pending_plan → closed)
- Parses structured files (communication.json, plan.json, DELIVERABLES.md)
- Provides multi-project visibility with per-project and per-status counts
- Enables client-side filtering by search, status, and project

### Component Hierarchy
```
Workorders System
├── Data Layer
│   ├── useWorkorders Hook (src/hooks/useWorkorders.ts)
│   │   ├── Fetches GET /api/workorders
│   │   ├── Manages loading/error states
│   │   ├── Computes aggregates (by_project, by_status)
│   │   └── Listens for refetch-workorders events
│   └── API Route (GET /api/workorders)
│       ├── Scans coderef/workorder/ in all projects
│       ├── Parses communication.json, plan.json, DELIVERABLES.md
│       └── Returns WorkorderListResponse
├── Display Layer
│   ├── WorkorderList (src/components/WorkorderList/index.tsx)
│   │   ├── Client-side filtering logic
│   │   ├── Loading/error/empty states
│   │   └── Renders WorkorderCard[] array
│   └── WorkorderCard (src/components/WorkorderCard/index.tsx)
│       ├── Uses UnifiedCard with workorder-specific data
│       ├── Maps status → icon + color
│       └── Formats dates and status labels
└── Type Contracts
    └── types/workorders.ts (WorkorderObject, WorkorderFiles, API responses)
```

### Key Integration Points

| Integration | Direction | Contract |
|-------------|-----------|----------|
| API → Hook | Data IN | `GET /api/workorders` returns `WorkorderListResponse` |
| Hook → Component | Data OUT | Hook provides `workorders[]`, `byProject`, `byStatus`, `total`, `isLoading`, `error` |
| FilterBar → List | Filter IN | `FilterConfig` object (search, status, project) |
| Card → Parent | Event OUT | `onWorkorderClick(workorder.id)` callback |
| Window Events | Trigger | `refetch-workorders` event triggers refetch |
| File System | Data Source | Reads from `{project_path}/coderef/workorder/{feature_name}/` |

---

## 2. State Ownership & Source of Truth

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| `workorders` array | useWorkorders hook | Domain Data | None (fetch) | API `/api/workorders` |
| `byProject` counts | useWorkorders hook | Computed | None | Aggregated from API response |
| `byStatus` counts | useWorkorders hook | Computed | None | Aggregated from API response |
| `total` count | useWorkorders hook | Computed | None | Derived from `workorders.length` |
| `isLoading` | useWorkorders hook | UI State | None | Hook internal state |
| `error` | useWorkorders hook | UI State | None | Hook internal state |
| Filtered workorders | WorkorderList component | UI State | None | Computed from `workorders` + `filters` |
| Filter config | Parent component | UI State | Varies | Depends on parent (FilterBar) |
| Workorder files | File System | Persistent | File System | `communication.json`, `plan.json`, `DELIVERABLES.md` |

### Precedence Rules

1. **Data Authority:** File system is canonical - API reads and parses on each request
2. **Status Authority:** `communication.json` contains authoritative status value
3. **Aggregation:** API computes `by_project` and `by_status` - hook accepts as-is
4. **Filtering:** Client-side only - API returns unfiltered results
5. **File Parsing:** Optional - missing files don't cause errors, just null values

---

## 3. Workorder Data Model

### WorkorderObject Contract (Canonical)
```typescript
interface WorkorderObject {
  id: string;                        // Workorder ID (e.g., WO-PROJECT-001)
  project_id: string;                // Project ID from projects.config.json
  project_name: string;              // Human-readable project name
  feature_name: string;              // Feature name (folder name)
  status: WorkorderStatus;           // Current workflow status
  path: string;                      // File system path to workorder directory
  files: WorkorderFiles;             // Parsed file contents
  created: string;                   // ISO 8601 timestamp
  updated: string;                   // ISO 8601 timestamp
  last_status_update: string;        // ISO 8601 timestamp of status change
}
```

### WorkorderFiles Contract
```typescript
interface WorkorderFiles {
  communication_json?: Record<string, any> | null;  // Parsed communication.json
  plan_json?: Record<string, any> | null;           // Parsed plan.json
  deliverables_md?: string | null;                  // Raw DELIVERABLES.md content
}
```

### WorkorderStatus Enum (8-Stage Workflow)
```typescript
type WorkorderStatus =
  | 'pending_plan'       // 1. Awaiting implementation plan
  | 'plan_submitted'     // 2. Plan submitted for review
  | 'changes_requested'  // 3. Plan requires revisions
  | 'approved'           // 4. Plan approved, ready for implementation
  | 'implementing'       // 5. Active development in progress
  | 'complete'           // 6. Implementation finished
  | 'verified'           // 7. Work verified and tested
  | 'closed';            // 8. Workorder archived
```

### Status Progression (Expected Flow)
```
pending_plan → plan_submitted → (changes_requested →)* approved
    → implementing → complete → verified → closed
```

**Notes:**
- `changes_requested` can loop back to `plan_submitted`
- Statuses can skip forward (e.g., `pending_plan` → `implementing`)
- No enforcement - status can move in any direction (relies on human workflow)

---

## 4. Status → Visual Mapping

### Status → Icon Mapping
| Status | Icon | Lucide Component |
|--------|------|------------------|
| `pending_plan` | Clock | `Clock` |
| `plan_submitted` | CheckCircle | `CheckCircle` |
| `changes_requested` | RefreshCw | `RefreshCw` |
| `approved` | CheckCircle | `CheckCircle` |
| `implementing` | Zap | `Zap` |
| `complete` | Sparkles | `Sparkles` |
| `verified` | CheckCircle | `CheckCircle` |
| `closed` | Lock | `Lock` |

### Status → Color Mapping
| Status | Color Class | Visual Intent |
|--------|-------------|---------------|
| `pending_plan` | `text-ind-text-muted` | Inactive, awaiting action |
| `plan_submitted` | `text-ind-text` | Neutral, under review |
| `changes_requested` | `text-ind-warning` | Attention needed |
| `approved` | `text-ind-accent` | Positive, ready |
| `implementing` | `text-ind-accent` | Active, in progress |
| `complete` | `text-ind-success` | Success, finished |
| `verified` | `text-ind-success` | Success, validated |
| `closed` | `text-ind-text-muted` | Inactive, archived |

---

## 5. Filtering Contracts

### FilterConfig Interface
```typescript
interface FilterConfig {
  search?: string;      // Matches feature_name, project_name, or id (case-insensitive)
  status?: string[];    // Array of WorkorderStatus values
  project?: string[];   // Array of project_name values
}
```

### Filter Logic (Client-Side)
```typescript
// Search filter (OR across fields)
if (filters.search) {
  const query = filters.search.toLowerCase();
  const matchesSearch =
    workorder.feature_name.toLowerCase().includes(query) ||
    workorder.project_name.toLowerCase().includes(query) ||
    workorder.id.toLowerCase().includes(query);
  if (!matchesSearch) return false;
}

// Status filter (IN array)
if (filters.status && filters.status.length > 0) {
  if (!filters.status.includes(workorder.status)) return false;
}

// Project filter (IN array)
if (filters.project && filters.project.length > 0) {
  if (!filters.project.includes(workorder.project_name)) return false;
}
```

**Filter Combination:** All filters are AND-ed together (workorder must match all active filters).

---

## 6. Data Persistence

### File System Structure
```
{project_path}/coderef/workorder/{feature_name}/
├── communication.json  (REQUIRED) - Status, logs, metadata
├── plan.json          (OPTIONAL) - Implementation plan with tasks
└── DELIVERABLES.md    (OPTIONAL) - Progress tracking checklist
```

### Communication.json Schema (Canonical Status Source)
```json
{
  "workorder_id": "WO-PROJECT-001",
  "status": "implementing",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-02T00:00:00Z",
  "last_status_update": "2026-01-02T00:00:00Z",
  "assigned_agent": "Agent 1",
  "logs": [
    {
      "timestamp": "2026-01-01T00:00:00Z",
      "message": "Workorder created",
      "author": "System"
    }
  ]
}
```

### Plan.json Schema (Implementation Tasks)
```json
{
  "workorder_id": "WO-PROJECT-001",
  "phases": [
    {
      "id": "phase_1",
      "name": "Setup",
      "tasks": [
        {
          "id": "SETUP-001",
          "description": "Initialize project",
          "status": "completed"
        }
      ]
    }
  ]
}
```

### DELIVERABLES.md Schema (Free-form Markdown)
```markdown
# Deliverables

## Phase 1
- [x] Task 1
- [ ] Task 2
```

### Failure Modes
1. **Missing communication.json:** Workorder skipped (not included in results)
2. **Malformed JSON:** API logs error, workorder skipped
3. **Missing plan.json/DELIVERABLES.md:** Parsed as null (not error)
4. **Invalid status value:** Defaults to 'pending_plan' or shows as-is (no validation)

### Recovery
- User clicks Refresh → triggers refetch → reparses all files
- Fix malformed JSON in file system → next fetch succeeds

---

## 7. State Lifecycle

### 1. Initialization
```typescript
const [workorders, setWorkorders] = useState<WorkorderObject[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [byProject, setByProject] = useState<Record<string, number>>({});
const [byStatus, setByStatus] = useState<Record<string, number>>({});
const [total, setTotal] = useState(0);
```

### 2. Hydration
```typescript
useEffect(() => {
  fetchWorkorders(); // Runs on mount
}, []);
```

### 3. Validation
**None.** API response assumed to match `WorkorderListResponse` schema. No runtime validation.

### 4. Runtime Updates
```typescript
useEffect(() => {
  const handleRefetch = () => fetchWorkorders();
  window.addEventListener('refetch-workorders', handleRefetch);
  return () => window.removeEventListener('refetch-workorders', handleRefetch);
}, []);
```

### 5. Persistence Triggers
**None at UI layer.** File modifications handled externally (CLI, agents, manual edits).

---

## 8. Event & Callback Contracts

| Event/Callback | Trigger | Payload | Side Effects |
|----------------|---------|---------|--------------|
| `onWorkorderClick(id)` | WorkorderCard click | `string` (workorder.id) | Parent handles click (e.g., console log, navigation) |
| `refetch` method | Hook consumer | None | Triggers `fetchWorkorders()` → API call |
| `refetch-workorders` window event | External (e.g., Refresh button) | None | Hook listens, triggers refetch |

---

## 9. Performance Considerations

### Tested Thresholds
- **Not yet tested** with > 50 workorders or > 10 projects

### Known Bottlenecks
1. **File system I/O:** API reads multiple files per workorder (communication.json, plan.json, DELIVERABLES.md)
2. **Client-side filtering:** Runs on every render when filters change
3. **No virtualization:** All workorder cards render simultaneously
4. **No caching:** Every API call rescans directories and reparses files

### Optimization Opportunities
1. **API caching:** Cache parsed workorders, invalidate on file change
2. **Memoize filtered array:** Use `useMemo` for filter computation
3. **Virtualized scrolling:** For > 50 workorders
4. **Debounced search:** Delay search filter application
5. **Parallel file reads:** Read all workorder files concurrently
6. **API-side filtering:** Move filter logic to backend

### Deferred Optimizations
- **Caching:** Deferred - data freshness prioritized
- **Virtualization:** Deferred until > 50 workorders reported
- **API filtering:** Deferred - prioritizing simplicity

---

## 10. Accessibility

### Current Gaps

| Issue | Severity | Component | Fix Required |
|-------|----------|-----------|--------------|
| Card click regions | Low | WorkorderCard | Verify entire card is clickable |
| Loading state announcements | High | WorkorderList | Add sr-only "Loading workorders" text |
| Empty state clarity | Medium | WorkorderList | Improve empty state messaging |
| Keyboard navigation | High | WorkorderCard | Ensure cards are focusable and Enter/Space work |
| Status icon meaning | Medium | WorkorderCard | Add aria-label to status icons |

### Required Tasks
1. **HIGH:** Add screen reader announcements for loading/error states
2. **HIGH:** Test keyboard navigation through workorder cards
3. **MEDIUM:** Add aria-labels to status icons (explain meaning)
4. **LOW:** Audit color contrast for status colors

---

## 11. Testing Strategy

### Must-Cover Scenarios
1. **Multi-project aggregation:** Workorders from different projects display correctly
2. **Status filtering:** Filter by status shows correct subset
3. **Project filtering:** Filter by project name shows correct subset
4. **Search filtering:** Search across feature_name, project_name, id works
5. **File parsing:** Missing plan.json/DELIVERABLES.md doesn't break display
6. **Loading state:** Skeleton loaders display during fetch
7. **Error state:** API failure shows error message
8. **Card click:** `onWorkorderClick` receives correct workorder ID
9. **Refetch:** Window event triggers data reload
10. **Empty workorder directory:** No workorders shows "No workorders found"

### Explicitly Not Tested
- **Concurrent filters:** User expected to apply filters sequentially
- **Invalid filter values:** Not validated - assumes parent provides correct types
- **API schema drift:** No runtime validation of response structure
- **File system race conditions:** Assumes files don't change during API read

---

## 12. Non-Goals / Out of Scope

- **Inline editing:** Workorders cannot be modified from UI
- **Status progression enforcement:** No validation of status transitions
- **File creation:** Cannot create workorders from UI
- **Batch operations:** No multi-select or bulk status updates
- **Sorting controls:** Workorders display in API response order (by project, then feature_name)
- **Pagination:** All workorders loaded client-side
- **Detail modal:** Card click currently logs only (future feature)
- **Real-time sync:** No file system watching or polling
- **Task breakdown view:** Plan.json tasks not displayed in list
- **Deliverables tracking:** DELIVERABLES.md content not parsed/displayed

---

## 13. Common Pitfalls & Sharp Edges

### Known Issues
1. **Duplicate IDs:** If multiple projects have same workorder ID, React key warnings may occur
2. **Date formatting:** Assumes valid ISO 8601 strings - invalid dates show "Invalid Date"
3. **Long feature names:** No truncation - may overflow card width on narrow screens
4. **Status label spacing:** Underscores replaced with spaces (e.g., "pending_plan" → "pending plan")

### Integration Gotchas
1. **Filter state location:** List component doesn't own filter state - parent must provide
2. **API dependency:** Requires `projects.config.json` with valid project paths
3. **File permissions:** API must have read access to all project workorder directories
4. **Missing projects:** If project path invalid, workorders from that project silently excluded

### Configuration Mistakes
1. **Missing API route:** If `/api/workorders` doesn't exist, permanent error state
2. **Invalid project paths:** Workorders not found, no error shown
3. **Malformed communication.json:** Workorder silently skipped

### Edge Cases
- **Empty feature_name:** Card title shows empty string (no fallback)
- **Missing timestamps:** Defaults to current date (API should provide)
- **Invalid status value:** Displays as-is with default icon (Clock) and color (muted)
- **Nested workorder directories:** Not supported - only scans `{project}/coderef/workorder/*`

---

## 14. API Contract Dependencies

### GET /api/workorders
**Expected Response:**
```typescript
{
  success: boolean;
  data: {
    workorders: WorkorderObject[];
    total: number;
    by_project: Record<string, number>;  // { "Project A": 5, "Project B": 3 }
    by_status: Record<string, number>;   // { "implementing": 4, "complete": 2 }
  };
  timestamp: string;  // ISO 8601
}
```

**Error Response:**
```typescript
{
  success: false;
  error: {
    message: string;
    code?: string;
  };
  timestamp: string;
}
```

### GET /api/workorders/:workorderId (Future)
**Expected Response:**
```typescript
{
  success: boolean;
  data: {
    workorder: WorkorderObject;
    tasks?: Array<{ id: string; description: string; status: string }>;
    deliverables?: Array<{ name: string; status: string }>;
    communication_log?: Array<{ timestamp: string; message: string; author?: string }>;
  };
  timestamp: string;
}
```

**Breaking Change Handling:**
If API schema changes:
1. Update `types/workorders.ts` type definitions
2. Update `useWorkorders` hook parsing logic
3. Update `WorkorderCard` to handle new/removed fields
4. Update `WorkorderList` filtering logic if new filterable fields added
5. Update status icon/color mappings if new statuses added

---

## Conclusion

The Workorders System is a **multi-project work tracking layer** with file-based persistence and no UI-level state management. It aggregates workorders from all projects, parses structured files, and provides an 8-stage workflow status tracking system. The system uses the UnifiedCard component for consistent card styling and integrates with the dashboard's industrial design system.

**Maintenance Expectations:**
- Update when API schema or file structure evolves
- Add accessibility improvements (screen reader support, keyboard navigation)
- Consider performance optimizations if workorder count > 50 or project count > 10
- Implement detail view when card click behavior is defined
- Add status progression validation if workflow enforcement is required

**Refactor Safety:**
- Filtering logic is self-contained - can be extracted to custom hook
- WorkorderCard is a thin wrapper around UnifiedCard - easy to modify
- Hook is isolated - can be replaced with different data source
- Status mappings are in lookup tables - easy to extend
- No hidden dependencies or global state

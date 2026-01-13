---
agent: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
date: "2026-01-02"
task: DOCUMENT
subject: Stubs System
parent_project: coderef-dashboard
category: other
version: 1.0.0
related_files:
  - packages/dashboard/src/lib/stubs-system.ts
status: APPROVED
---

# Stubs System — Authoritative Documentation

## Executive Summary

The Stubs System manages pending ideas and features that haven't been started yet in the CodeRef Dashboard. Stubs represent backlog items stored in a centralized orchestrator directory, distinct from active workorders. The system provides data fetching via hooks, visual display via cards, client-side filtering, and supports categorization, prioritization, and status tracking. This document defines the complete stub lifecycle, data contracts, and component integration patterns.

## Audience & Intent

- **Markdown (this document):** Architectural truth for stub data model, state management, filtering contracts, and component behavior
- **TypeScript (`types/stubs.ts`):** Compile-time contracts for stub objects and API responses
- **API Route (`/api/stubs`):** Source of truth for stub data location and aggregation logic
- **Component Code:** Runtime behavior for display, filtering, and interactions

---

## 1. Architecture Overview

### Role in System
The Stubs System is a **backlog management layer** that:
- Aggregates stub data from centralized orchestrator directory
- Provides categorization (feature, fix, improvement, idea, refactor, test)
- Tracks priority (low, medium, high, critical)
- Tracks status (stub, planned, in_progress, completed)
- Enables client-side filtering by search, status, priority, and category

### Component Hierarchy
```
Stubs System
├── Data Layer
│   ├── useStubs Hook (src/hooks/useStubs.ts)
│   │   ├── Fetches GET /api/stubs
│   │   ├── Manages loading/error states
│   │   └── Listens for refetch-stubs events
│   └── API Route (GET /api/stubs)
│       └── Scans orchestrator stubs directory
│           └── Returns StubListResponse
├── Display Layer
│   ├── StubList (src/components/StubList/index.tsx)
│   │   ├── Client-side filtering logic
│   │   ├── Loading/error/empty states
│   │   └── Renders StubCard[] array
│   └── StubCard (src/components/StubCard/index.tsx)
│       └── Uses UnifiedCard with stub-specific data
└── Type Contracts
    └── types/stubs.ts (StubObject, API responses)
```

### Key Integration Points

| Integration | Direction | Contract |
|-------------|-----------|----------|
| API → Hook | Data IN | `GET /api/stubs` returns `StubListResponse` |
| Hook → Component | Data OUT | Hook provides `stubs[]`, `isLoading`, `error`, `total` |
| FilterBar → List | Filter IN | `FilterConfig` object (search, status, priority, category) |
| Card → Parent | Event OUT | `onStubClick(feature_name)` callback |
| Window Events | Trigger | `refetch-stubs` event triggers refetch |

---

## 2. State Ownership & Source of Truth

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| `stubs` array | useStubs hook | Domain Data | None (fetch) | API `/api/stubs` |
| `isLoading` | useStubs hook | UI State | None | Hook internal state |
| `error` | useStubs hook | UI State | None | Hook internal state |
| `total` | useStubs hook | Computed | None | Derived from `stubs.length` |
| Filtered stubs | StubList component | UI State | None | Computed from `stubs` + `filters` |
| Filter config | Parent component | UI State | Varies | Depends on parent (FilterBar) |

### Precedence Rules

1. **Data Authority:** API response is canonical - hook never modifies stub data
2. **Filtering:** Client-side only - API returns unfiltered results
3. **Status Progression:** No enforcement - status can move in any direction
4. **Priority/Category:** No validation - accepts any values in type unions

---

## 3. Data Persistence

**None at component level.** Stub data persistence handled by:
- **File System:** Stubs stored as JSON files in orchestrator directory
- **API Layer:** Reads from file system on each request
- **No Caching:** Hook refetches on every mount and manual refresh

**Failure Modes:**
1. **API Unavailable:** Hook sets error state, list shows error message
2. **Malformed JSON:** API returns error, hook propagates to UI
3. **Missing Directory:** API returns empty array (not error)

**Recovery:**
- User clicks Refresh button → triggers refetch
- Page remount → automatic refetch

---

## 4. State Lifecycle

### 1. Initialization
```typescript
const [stubs, setStubs] = useState<StubObject[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [total, setTotal] = useState(0);
```

### 2. Hydration
```typescript
useEffect(() => {
  fetchStubs(); // Runs on mount
}, []);
```

### 3. Validation
**None.** API response assumed to match `StubListResponse` schema. No runtime validation.

### 4. Runtime Updates
```typescript
useEffect(() => {
  const handleRefetch = () => fetchStubs();
  window.addEventListener('refetch-stubs', handleRefetch);
  return () => window.removeEventListener('refetch-stubs', handleRefetch);
}, []);
```

### 5. Persistence Triggers
**None.** Read-only system at UI layer.

---

## 5. Stub Data Model

### StubObject Contract (Canonical)
```typescript
interface StubObject {
  id: string;                    // Unique identifier (usually feature-name)
  feature_name: string;          // Matches folder name
  title: string;                 // Display title
  description: string;           // Stub description
  category: StubCategory;        // 'feature' | 'fix' | 'improvement' | 'idea' | 'refactor' | 'test'
  priority: StubPriority;        // 'low' | 'medium' | 'high' | 'critical'
  status: StubStatus;            // 'stub' | 'planned' | 'in_progress' | 'completed'
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  path: string;                  // File system path to stub.json
  target_project?: string;       // Optional - intended project assignment
}
```

### Type Enumerations
```typescript
type StubCategory = 'feature' | 'fix' | 'improvement' | 'idea' | 'refactor' | 'test';
type StubPriority = 'low' | 'medium' | 'high' | 'critical';
type StubStatus = 'stub' | 'planned' | 'in_progress' | 'completed';
```

### Category → Icon Mapping
| Category | Icon | Meaning |
|----------|------|---------|
| `feature` | Sparkles | New feature development |
| `fix` | Bug | Bug fix or issue resolution |
| `improvement` | TrendingUp | Enhancement to existing feature |
| `idea` | Lightbulb | Conceptual idea not yet scoped |
| `refactor` | Wrench | Code refactoring task |
| `test` | Beaker | Testing-related work |

### Priority → Color Mapping
| Priority | Color | Urgency |
|----------|-------|---------|
| `low` | `text-ind-text-muted` | Can be deferred |
| `medium` | `text-ind-text` | Normal priority |
| `high` | `text-ind-warning` | Should be addressed soon |
| `critical` | `text-ind-error` | Urgent, blocking |

### Status → Background Mapping
| Status | Background | Badge Style |
|--------|------------|-------------|
| `stub` | `bg-ind-bg/30 text-ind-text-muted` | Faded, not yet planned |
| `planned` | `bg-ind-accent/10 text-ind-accent` | Scheduled for work |
| `in_progress` | `bg-ind-accent/20 text-ind-accent` | Actively being worked |
| `completed` | `bg-ind-success/10 text-ind-success` | Finished |

---

## 6. Filtering Contracts

### FilterConfig Interface
```typescript
interface FilterConfig {
  search?: string;          // Matches title or description (case-insensitive)
  status?: string[];        // Array of StubStatus values
  priority?: string[];      // Array of StubPriority values
  category?: string[];      // Array of StubCategory values
}
```

### Filter Logic (Client-Side)
```typescript
// Search filter (OR across fields)
if (filters.search) {
  const query = filters.search.toLowerCase();
  const matchesSearch =
    stub.title.toLowerCase().includes(query) ||
    (stub.description && stub.description.toLowerCase().includes(query));
  if (!matchesSearch) return false;
}

// Status filter (IN array)
if (filters.status && filters.status.length > 0) {
  if (!filters.status.includes(stub.status)) return false;
}

// Priority filter (IN array)
if (filters.priority && filters.priority.length > 0) {
  if (!filters.priority.includes(stub.priority)) return false;
}

// Category filter (IN array)
if (filters.category && filters.category.length > 0) {
  if (!filters.category.includes(stub.category)) return false;
}
```

**Filter Combination:** All filters are AND-ed together (stub must match all active filters).

---

## 7. Event & Callback Contracts

| Event/Callback | Trigger | Payload | Side Effects |
|----------------|---------|---------|--------------|
| `onStubClick(feature_name)` | StubCard click | `string` (stub.feature_name) | Parent handles click (e.g., console log, navigation) |
| `refetch` method | Hook consumer | None | Triggers `fetchStubs()` → API call |
| `refetch-stubs` window event | External (e.g., Refresh button) | None | Hook listens, triggers refetch |

---

## 8. Performance Considerations

### Tested Thresholds
- **Not yet tested** with > 100 stubs

### Known Bottlenecks
1. **Client-side filtering:** Runs on every render when filters change
2. **No virtualization:** All stub cards render simultaneously
3. **Duplicate key warning:** Uses `stub.id || stub.feature_name || idx` fallback

### Optimization Opportunities
1. **Memoize filtered array:** Use `useMemo` for filter computation
2. **Virtualized scrolling:** For > 50 stubs
3. **Debounced search:** Delay search filter application
4. **API-side filtering:** Move filter logic to backend

### Deferred Optimizations
- **Virtualization:** Deferred until > 100 stubs reported
- **API filtering:** Deferred - prioritizing simplicity over performance

---

## 9. Accessibility

### Current Gaps

| Issue | Severity | Component | Fix Required |
|-------|----------|-----------|--------------|
| Card click regions | Low | StubCard | Verify entire card is clickable |
| Loading state announcements | High | StubList | Add sr-only "Loading stubs" text |
| Empty state clarity | Medium | StubList | Improve empty state messaging |
| Keyboard navigation | High | StubCard | Ensure cards are focusable and Enter/Space work |

### Required Tasks
1. **HIGH:** Add screen reader announcements for loading/error states
2. **HIGH:** Test keyboard navigation through stub cards
3. **MEDIUM:** Review focus indicators on cards
4. **LOW:** Audit color contrast for priority/status badges

---

## 10. Testing Strategy

### Must-Cover Scenarios
1. **Filter combinations:** Search + status + priority + category all work together
2. **Empty results:** Filtering returns zero matches shows correct message
3. **Loading state:** Skeleton loaders display during fetch
4. **Error state:** API failure shows error message
5. **Card click:** `onStubClick` receives correct feature_name
6. **Refetch:** Window event triggers data reload

### Explicitly Not Tested
- **Concurrent filters:** User expected to apply filters sequentially
- **Invalid filter values:** Not validated - assumes parent provides correct types
- **API schema drift:** No runtime validation of response structure

---

## 11. Non-Goals / Out of Scope

- **Inline editing:** Stubs cannot be modified from UI
- **Status progression:** No workflow enforcement (stub can jump to completed)
- **Priority reassignment:** No UI for changing priority
- **Batch operations:** No multi-select or bulk actions
- **Sorting controls:** Stubs display in API response order
- **Pagination:** All stubs loaded client-side
- **Detail modal:** Card click currently logs only (future feature)
- **Real-time sync:** No polling or WebSocket updates

---

## 12. Common Pitfalls & Sharp Edges

### Known Issues
1. **Key uniqueness:** Falls back to index if `stub.id` and `stub.feature_name` missing
2. **Description truncation:** No truncation - long descriptions expand card height
3. **Status badge overflow:** Long status text may overflow on narrow screens

### Integration Gotchas
1. **Filter state location:** List component doesn't own filter state - parent must provide
2. **Optional fields:** `target_project` may be undefined - components must handle
3. **Date formatting:** Created date formatted assuming valid ISO 8601 string

### Configuration Mistakes
1. **Missing API route:** If `/api/stubs` doesn't exist, permanent error state
2. **Empty directory:** API returns empty array (not error) - UI shows "No stubs found"
3. **Malformed stub JSON:** API should handle, but may crash if not validated

### Edge Cases
- **Duplicate IDs:** Not validated - may cause React key warnings
- **Invalid dates:** Date parsing fails silently, shows "Invalid Date"
- **Missing required fields:** Component may crash if title/feature_name missing

---

## 13. API Contract Dependencies

### GET /api/stubs
**Expected Response:**
```typescript
{
  success: boolean;
  data: {
    stubs: StubObject[];
    total: number;
    location: string;  // Directory path scanned
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

**Breaking Change Handling:**
If API schema changes:
1. Update `types/stubs.ts` type definitions
2. Update `useStubs` hook parsing logic
3. Update `StubCard` to handle new/removed fields
4. Update `StubList` filtering logic if new filterable fields added

---

## Conclusion

The Stubs System is a **read-only backlog visualization layer** with client-side filtering and no persistence at the UI level. It relies entirely on API data for stub information and provides flexible categorization, prioritization, and status tracking. The system uses the UnifiedCard component for consistent card styling and integrates with the dashboard's industrial design system.

**Maintenance Expectations:**
- Update when API schema evolves
- Add accessibility improvements (screen reader support)
- Consider performance optimizations if stub count > 50
- Implement detail modal when card click behavior is defined

**Refactor Safety:**
- Filtering logic is self-contained - can be extracted to custom hook
- StubCard is a thin wrapper around UnifiedCard - easy to modify
- Hook is isolated - can be replaced with different data source
- No hidden dependencies or global state

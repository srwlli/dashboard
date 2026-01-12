---
agent: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
date: "2026-01-02"
task: DOCUMENT
subject: Assistant Page
parent_project: coderef-dashboard
category: component
version: 1.0.0
related_files:
  - packages/dashboard/src/app/assistant/page.tsx
status: APPROVED
---

# Assistant Page — Authoritative Documentation

## Executive Summary

The Assistant Page is a tabbed interface for viewing and managing workorders and implementation stubs across all projects in the CodeRef Dashboard. It serves as the primary navigation hub for developers to track active work (workorders) and pending ideas (stubs), providing real-time data fetching, client-side filtering, and manual refresh capabilities. This document defines the architectural contracts, state management rules, and component integration patterns.

## Audience & Intent

- **Markdown (this document):** Architectural truth for page structure, state flow, event contracts, and integration patterns
- **TypeScript/Code:** Runtime behavior, component contracts, and API integration
- **API Responses:** Source of truth for workorder and stub data structures
- **PageCard/PageLayout:** UI container contracts inherited from dashboard design system

---

## 1. Architecture Overview

### Role in System
The Assistant Page acts as a **data aggregation and visualization layer** that:
- Displays workorders from `/api/workorders` across all configured projects
- Displays stubs from `/api/stubs` from centralized orchestrator directory
- Provides tab-based navigation between workorders and stubs
- Supports manual data refresh via custom window events

### Component Hierarchy
```
AssistantPage (src/app/assistant/page.tsx)
├── PageLayout (layout wrapper)
└── PageCard (industrial design container with corner accents)
    ├── Header Section
    │   ├── Title + Description
    │   └── Refresh Button (dispatches window events)
    ├── TabNavigation (workorders/stubs tabs)
    └── Conditional Content
        ├── WorkorderList (when activeTab === 'workorders')
        │   └── WorkorderCard[] (via UnifiedCard)
        └── StubList (when activeTab === 'stubs')
            └── StubCard[] (via UnifiedCard)
```

### Key Integration Points

| Integration | Direction | Contract |
|-------------|-----------|----------|
| `useWorkorders` hook | Data IN | Fetches from `/api/workorders`, manages loading/error states |
| `useStubs` hook | Data IN | Fetches from `/api/stubs`, manages loading/error states |
| `window` events | Trigger | Dispatches `refetch-workorders` and `refetch-stubs` events |
| `TabNavigation` | State | Controls which tab content is displayed |
| `PageCard` | Layout | Provides industrial design wrapper with corner accents |

---

## 2. State Ownership & Source of Truth

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| `activeTab` | AssistantPage | UI State | None (component) | Component local state |
| `workorders` | useWorkorders hook | Domain Data | None (fetch) | API `/api/workorders` |
| `stubs` | useStubs hook | Domain Data | None (fetch) | API `/api/stubs` |
| `isLoading` (workorders) | useWorkorders hook | UI State | None | Hook internal state |
| `isLoading` (stubs) | useStubs hook | UI State | None | Hook internal state |
| `error` (workorders) | useWorkorders hook | UI State | None | Hook internal state |
| `error` (stubs) | useStubs hook | UI State | None | Hook internal state |

### Precedence Rules

1. **Tab State:** `activeTab` controls rendering - only one tab content visible at a time
2. **Data Freshness:** Each hook maintains independent data - no cross-contamination
3. **Loading Priority:** Hook loading states override content rendering
4. **Error Handling:** Hook errors displayed in list components, not page level

---

## 3. Data Persistence

**None.** The Assistant Page maintains no persistent state. All data is:
- Fetched on mount via hooks
- Refetched on window events
- Lost on unmount

**Failure Mode:** If API fetch fails, error state is shown in-place with retry available via Refresh button.

---

## 4. State Lifecycle

### 1. Initialization
```typescript
const [activeTab, setActiveTab] = useState<string>('workorders'); // Default to workorders tab
```

### 2. Hydration
- `useWorkorders()` fires on mount → fetches `/api/workorders`
- `useStubs()` fires on mount → fetches `/api/stubs`
- Both hooks listen for respective refetch events immediately

### 3. Validation
No validation layer - API responses assumed correct (see types/workorders.ts and types/stubs.ts)

### 4. Runtime Updates
- User clicks Refresh → dispatches window event
- Hook receives event → calls `refetch()` method
- Hook updates internal state → triggers re-render

### 5. Persistence Triggers
**None.** Page state is ephemeral.

---

## 5. Behaviors (Events & Side Effects)

### User Behaviors

| Action | Trigger | State Change | Side Effects |
|--------|---------|--------------|--------------|
| Click Workorders tab | `onTabChange('workorders')` | `activeTab = 'workorders'` | Conditional render switches to WorkorderList |
| Click Stubs tab | `onTabChange('stubs')` | `activeTab = 'stubs'` | Conditional render switches to StubList |
| Click Refresh (workorders tab) | Button click | None directly | Dispatches `refetch-workorders` event |
| Click Refresh (stubs tab) | Button click | None directly | Dispatches `refetch-stubs` event |
| Click workorder card | `onWorkorderClick(id)` | None | Console log only (STUB) |
| Click stub card | `onStubClick(name)` | None | Console log only (STUB) |

### System Behaviors

| Event | Trigger | Payload | Side Effects |
|-------|---------|---------|--------------|
| `refetch-workorders` | Window event | None | `useWorkorders` hook refetches data |
| `refetch-stubs` | Window event | None | `useStubs` hook refetches data |
| API success | Fetch resolves | `WorkorderListResponse` or `StubListResponse` | Hook updates state, triggers re-render |
| API failure | Fetch rejects | Error object | Hook sets error state, list shows error UI |

---

## 6. Event & Callback Contracts

| Event/Callback | Trigger | Payload | Side Effects |
|----------------|---------|---------|--------------|
| `onTabChange(tabId)` | TabNavigation component | `string` ('workorders' or 'stubs') | Updates `activeTab` state |
| `onWorkorderClick(id)` | WorkorderCard click | `string` (workorder.id) | Console log (future: navigation) |
| `onStubClick(name)` | StubCard click | `string` (stub.feature_name) | Console log (future: navigation) |
| Refresh button click | Button onClick | None | Dispatches window event based on `activeTab` |

---

## 7. Performance Considerations

### Tested Thresholds
- **Not yet tested** with large datasets (> 100 workorders or stubs)

### Known Bottlenecks
- No virtualization - all cards render immediately
- Client-side filtering in list components (WorkorderList, StubList)
- Parallel API fetches on mount (workorders + stubs fetch simultaneously)

### Optimization Opportunities
1. Implement virtualized scrolling for > 50 items
2. Add debounced search filtering
3. Cache API responses in hooks (current: refetch always hits network)
4. Lazy-load tab content (defer inactive tab data fetch)

### Deferred Optimizations
- **Virtualization:** Deferred until user reports list > 100 items
- **Caching:** Deferred - data freshness prioritized over performance

---

## 8. Accessibility

### Current Gaps

| Issue | Severity | Component | Fix Required |
|-------|----------|-----------|--------------|
| Refresh button missing aria-label | Medium | Refresh button | Add descriptive aria-label |
| Tab navigation keyboard support | High | TabNavigation | Verify arrow key navigation works |
| Card click regions | Low | WorkorderCard, StubCard | Review clickable area vs visual area |
| Loading state announcements | High | WorkorderList, StubList | Add sr-only loading text |

### Required Tasks
1. **HIGH:** Add screen reader announcements for loading/error states
2. **HIGH:** Test keyboard navigation through tabs and cards
3. **MEDIUM:** Add aria-labels to Refresh button
4. **LOW:** Audit focus indicators on all interactive elements

---

## 9. Testing Strategy

### Must-Cover Scenarios
1. **Tab switching:** Workorders ↔ Stubs transitions render correct content
2. **Refresh flow:** Clicking Refresh triggers appropriate window event
3. **Loading states:** Both lists show skeleton loaders during fetch
4. **Error states:** API failures display error messages in lists
5. **Empty states:** Zero workorders/stubs show "No items found" message
6. **Card clicks:** Clicks invoke callbacks with correct IDs

### Explicitly Not Tested
- **Network failure recovery:** Assumed handled by fetch retry logic
- **Concurrent tab switches:** User expected to wait for data load
- **Cross-tab synchronization:** Not applicable (no shared state)

---

## 10. Non-Goals / Out of Scope

- **Inline editing:** Workorder/stub modifications not supported
- **Batch operations:** No multi-select or bulk actions
- **Filtering UI:** Filtering logic exists in lists but no UI controls
- **Sorting controls:** Lists render in API response order
- **Detail views:** Card clicks currently log only (future feature)
- **Pagination:** All results rendered client-side
- **Real-time updates:** No WebSocket/polling (manual refresh only)

---

## 11. Common Pitfalls & Sharp Edges

### Known Issues
1. **Double fetch on mount:** Both hooks fetch simultaneously - no coordination
2. **Event listener cleanup:** Hooks manage their own listeners - ensure hooks unmount properly
3. **Console logs:** `onWorkorderClick` and `onStubClick` log to console (no user feedback)

### Integration Gotchas
1. **Tab state reset:** Changing tabs does NOT refetch data - stale data persists
2. **Refresh button scope:** Only refetches active tab - inactive tab data not updated
3. **API dependency:** Page assumes `/api/workorders` and `/api/stubs` exist and follow schema

### Configuration Mistakes
1. **Missing API routes:** If routes don't exist, hooks show error state permanently
2. **CORS issues:** Browser API calls require same-origin or CORS headers

### Edge Cases
- **Rapid tab switching:** May see flicker if data loads slowly
- **Empty projects:** If no projects configured, workorders will be empty array (not error)
- **Malformed API responses:** Hooks assume response schema matches types (no runtime validation)

---

## 12. API Contract Dependencies

### GET /api/workorders
**Expected Response:**
```typescript
{
  success: boolean;
  data: {
    workorders: WorkorderObject[];
    total: number;
    by_project: Record<string, number>;
    by_status: Record<string, number>;
  };
  timestamp: string; // ISO 8601
}
```

### GET /api/stubs
**Expected Response:**
```typescript
{
  success: boolean;
  data: {
    stubs: StubObject[];
    total: number;
    location: string;
  };
  timestamp: string; // ISO 8601
}
```

**Breaking Change Handling:**
If API schema changes, both `types/workorders.ts` and `types/stubs.ts` must be updated, plus hook implementations.

---

## Conclusion

The Assistant Page is a **stateless aggregation UI** with no persistence, relying entirely on API data and custom window events for data refresh. It follows the industrial design system via PageCard and provides tab-based navigation between workorders and stubs. The primary maintenance concern is ensuring API contracts remain stable and adding accessibility improvements for screen readers.

**Maintenance Expectations:**
- Update when API schemas change
- Add tests for tab switching and refresh flows
- Implement accessibility fixes (see section 8)
- Consider virtualization if dataset grows > 100 items

**Refactor Safety:**
- Tab state is self-contained - safe to extract to custom hook
- Hooks are isolated - can be replaced independently
- List components accept generic props - can be reused elsewhere

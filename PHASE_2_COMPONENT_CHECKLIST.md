# Phase 2 Component Checklist

**Status:** Waiting for Phase 1 API completion
**Started:** 2025-12-26

---

## Components to Build

### ✅ Reuse (No Build Needed)
- [x] `PageLayout` - Main page wrapper
- [x] `Sidebar` - Navigation sidebar
- [x] `NavItem` - Sidebar item
- [x] `Header` - Breadcrumb header
- [x] `ComingSoon` - Placeholder (will be replaced)
- [x] `UserAvatar` - Profile icon

### 🆕 Create New

#### 1. TabNavigation Component
**File:** `src/components/TabNavigation/index.tsx`
**Purpose:** Switch between Workorders/Stubs/Documentation tabs
**Props:**
```tsx
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}
```
**Styling:** Industrial theme (border-ind-*, bg-ind-*, text-ind-*)
**Features:**
- Bold active tab
- Gray inactive tabs
- Icon + label for each tab
- Smooth transition between tabs

---

#### 2. WorkorderCard Component
**File:** `src/components/WorkorderCard/index.tsx`
**Purpose:** Display single workorder summary
**Props:**
```tsx
interface WorkorderCardProps {
  workorder: WorkorderObject;
  onClick?: (id: string) => void;
}
```
**Display Fields:**
- Workorder ID (WO-XXXX-XXX)
- Project name
- Feature name
- Status with icon:
  - ⚙️ = in_progress
  - ⏳ = pending
  - ✓ = approved
  - 🔄 = complete
- Last update timestamp
- Optional: Task count, deliverables count

**Styling:** Card with border, hover effect

---

#### 3. StubCard Component
**File:** `src/components/StubCard/index.tsx`
**Purpose:** Display single stub summary
**Props:**
```tsx
interface StubCardProps {
  stub: StubObject;
  onClick?: (id: string) => void;
}
```
**Display Fields:**
- Priority badge (colored):
  - 🔴 = critical (red)
  - 🟠 = high (orange)
  - 🟡 = medium (yellow)
  - 🟢 = low (green)
- Title
- Category
- Status
- Created timestamp

**Styling:** Card with priority color accent

---

#### 4. FilterBar Component
**File:** `src/components/FilterBar/index.tsx`
**Purpose:** Filter workorders/stubs by status, project, priority
**Props:**
```tsx
interface FilterBarProps {
  onStatusChange?: (status: string) => void;
  onProjectChange?: (project: string) => void;
  onPriorityChange?: (priority: string) => void;
  onCategoryChange?: (category: string) => void;
}
```
**Features:**
- Status dropdown (all, pending, in_progress, approved, complete)
- Project dropdown (all, scrapper, gridiron, coderef-dashboard, etc.)
- Priority dropdown (for stubs)
- Category dropdown (for stubs)
- Reset button to clear all filters

**Styling:** Inline horizontal layout

---

#### 5. WorkorderList Component
**File:** `src/components/WorkorderList/index.tsx`
**Purpose:** Display list of workorders with pagination
**Props:**
```tsx
interface WorkorderListProps {
  workorders: WorkorderObject[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  pageSize?: number; // default 10
}
```
**Features:**
- Maps workorders to WorkorderCard components
- Shows loading spinner if isLoading=true
- Shows error message if error is set
- Shows "Load more" button if hasMore=true
- Shows empty state if no workorders

---

#### 6. StubList Component
**File:** `src/components/StubList/index.tsx`
**Purpose:** Display list of stubs with pagination
**Props:**
```tsx
interface StubListProps {
  stubs: StubObject[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  pageSize?: number; // default 10
}
```
**Features:**
- Maps stubs to StubCard components
- Shows loading spinner if isLoading=true
- Shows error message if error is set
- Shows "Load more" button if hasMore=true
- Shows empty state if no stubs

---

## Custom Hooks to Create

### 1. useWorkorders
**File:** `src/hooks/useWorkorders.ts`
**Purpose:** Fetch and cache workorders from API
**Returns:**
```tsx
{
  workorders: WorkorderObject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
**Features:**
- Fetches from `GET /api/workorders`
- Caches data
- Handles errors gracefully
- Provides refetch function

---

### 2. useStubs
**File:** `src/hooks/useStubs.ts`
**Purpose:** Fetch and cache stubs from API
**Returns:**
```tsx
{
  stubs: StubObject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
**Features:**
- Fetches from `GET /api/stubs`
- Caches data
- Handles errors gracefully
- Provides refetch function

---

### 3. useWorkorderDetail
**File:** `src/hooks/useWorkorderDetail.ts`
**Purpose:** Fetch specific workorder details
**Params:**
```tsx
workorderId: string
```
**Returns:**
```tsx
{
  workorder: WorkorderObject | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
**Features:**
- Fetches from `GET /api/workorders/:workorderId`
- Handles not found (404) gracefully
- Refetches when workorderId changes

---

## File Updates Required

### Header Component
**File:** `src/components/Header/index.tsx`
**Change:** Add breadcrumb entries for new routes
```tsx
const breadcrumbMap: Record<string, { label: string; href: string }> = {
  '/': { label: 'Dashboard', href: '/' },
  '/prompts': { label: 'Prompts', href: '/prompts' },
  '/settings': { label: 'Settings', href: '/settings' },
  '/user-settings': { label: 'User Settings', href: '/user-settings' },
  '/assistant': { label: 'Assistant', href: '/assistant' },  // ADD
  '/sources': { label: 'Sources', href: '/sources' },        // ADD
};
```

### Assistant Page
**File:** `src/app/assistant/page.tsx`
**Change:** Replace ComingSoon with real content
**Before:**
```tsx
<PageLayout>
  <ComingSoon
    title="Assistant"
    description="AI-powered assistant dashboard..."
    eta="Q1 2025"
  />
</PageLayout>
```
**After:**
```tsx
<PageLayout>
  <div className="space-y-4 p-6">
    <TabNavigation tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
    <FilterBar onStatusChange={setStatusFilter} />
    {activeTab === 'workorders' && <WorkorderList workorders={workorders} isLoading={loading} />}
    {activeTab === 'stubs' && <StubList stubs={stubs} isLoading={loading} />}
    {activeTab === 'documentation' && <DocumentationViewer />}
  </div>
</PageLayout>
```

---

## Component Dependencies

```
AssistantPage
├── PageLayout (existing)
├── TabNavigation (new)
├── FilterBar (new)
└── Content (based on activeTab):
    ├── WorkorderList (new)
    │   └── WorkorderCard (new)
    │       └── useWorkorderDetail hook
    ├── StubList (new)
    │   └── StubCard (new)
    └── DocumentationViewer (future)

Header (update breadcrumbs)
Sidebar (add new routes)
```

---

## Build Order Recommendation

1. **Create hooks first** (easier, no UI dependencies)
   - useWorkorders
   - useStubs
   - useWorkorderDetail

2. **Create card components** (simpler, reusable)
   - WorkorderCard
   - StubCard

3. **Create list components** (uses cards + hooks)
   - WorkorderList
   - StubList

4. **Create filter bar** (forms, dropdowns)
   - FilterBar

5. **Create tab navigation** (simple switcher)
   - TabNavigation

6. **Update page and header**
   - Header breadcrumbs
   - AssistantPage main content

7. **Wire everything together**
   - Add state management
   - Connect filters to lists
   - Add pagination

8. **Testing and polish**
   - Unit tests for components
   - Integration tests
   - Error state testing
   - Loading state testing
   - Performance optimization

---

## Styling Guidelines

### Color Scheme (Use Existing Classes)
```tsx
// Background colors
bg-ind-panel        // Main panel background
bg-ind-bg           // Secondary background

// Text colors
text-ind-text       // Primary text
text-ind-text-muted // Secondary text
text-ind-accent     // Accent color (highlights)

// Border colors
border-ind-border   // Standard borders
border-ind-accent   // Accent borders (hover, active)

// Status indicators
⚙️  = in_progress (animated)
⏳  = pending (waiting)
✓   = approved (checkmark)
🔄  = complete (done)

// Priority colors
🔴  = critical (red)
🟠  = high (orange)
🟡  = medium (yellow)
🟢  = low (green)
```

### Responsive Behavior
- Desktop: Full layout (sidebar + content)
- Tablet: Sidebar collapses to icons
- Mobile: Hidden sidebar with menu button

### Animation
- Tab switches: Smooth fade/slide
- Loading: Spinner or skeleton
- Hover states: Color transition 200ms
- Status icons: Pulse animation for pending/in_progress

---

## Testing Checklist

- [ ] **Component rendering**
  - Renders without crashing
  - Displays correct data
  - Handles empty states

- [ ] **Data fetching**
  - Hooks fetch from correct endpoints
  - Data loads and displays
  - Loading state shows while fetching

- [ ] **User interaction**
  - Tabs switch correctly
  - Filters change data
  - Load more button works
  - Cards are clickable

- [ ] **Error handling**
  - API errors show error message
  - Network errors handled gracefully
  - 404s show "not found"

- [ ] **Styling**
  - Uses industrial theme colors
  - Responsive on all screen sizes
  - Matches mockup layout
  - Icons display correctly

---

## Key Files Summary

**New files to create:**
```
src/components/TabNavigation/index.tsx
src/components/WorkorderCard/index.tsx
src/components/StubCard/index.tsx
src/components/FilterBar/index.tsx
src/components/WorkorderList/index.tsx
src/components/StubList/index.tsx
src/hooks/useWorkorders.ts
src/hooks/useStubs.ts
src/hooks/useWorkorderDetail.ts
```

**Files to update:**
```
src/components/Header/index.tsx          (add breadcrumbs)
src/app/assistant/page.tsx               (wire up components)
```

**No changes needed:**
```
src/components/PageLayout.tsx            (reuse as-is)
src/components/Sidebar/index.tsx         (reuse as-is)
src/components/Sidebar/NavItem.tsx       (reuse as-is)
```

---

## Getting Started

When Phase 1 API is complete:

1. Read `ASSISTANT_UI_MOCKUP.md` for design reference
2. Review component specs above
3. Start with hook creation
4. Build components bottom-up (hooks → cards → lists → page)
5. Wire up AssistantPage
6. Test against real API data
7. Iterate and polish

---

**Document:** PHASE_2_COMPONENT_CHECKLIST.md
**Status:** Ready for implementation
**Dependencies:** Phase 1 API completion

# CodeRef Explorer Page - Resource Sheet

**Element Type:** ui/pages
**File Path:** `packages/dashboard/src/app/coderef-explorer/page.tsx`
**Category:** Next.js App Router Page Component
**Last Updated:** 2026-01-02
**Auto-Fill Rate:** 65%

---

## Executive Summary

The CodeRef Explorer page is a Next.js App Router page component that provides an interactive interface for browsing and analyzing codebase elements extracted from CodeRef scan data. It serves as the primary visualization layer for the `.coderef/index.json` data structure, enabling developers to explore functions, classes, components, and other code elements through a filterable, searchable UI.

**Primary Purpose:** Interactive codebase exploration and element analysis

**Key Features:**
- Browse code elements from CodeRef index
- Filter by element type (function, class, component, etc.)
- Search across element names and metadata
- View element details and relationships
- Navigate to source files

**Technical Stack:**
- Next.js 14+ (App Router)
- React 18+ (Server Components)
- TypeScript
- Tailwind CSS (assumed)

---

## Architecture

### Component Hierarchy

```
CodeRefExplorerPage (Server Component)
├── ExplorerHeader
│   ├── SearchBar (Client Component)
│   └── ViewToggle (Client Component)
├── ExplorerSidebar (Client Component)
│   ├── FilterPanel
│   │   ├── TypeFilter
│   │   ├── FileFilter
│   │   └── TagFilter
│   └── NavigationTree
└── ExplorerContent
    ├── CodeElementGrid
    │   └── CodeElementCard[] (Client Component)
    │       ├── ElementIcon
    │       ├── ElementMeta
    │       └── ElementActions
    └── DetailView (Client Component)
        ├── ElementHeader
        ├── CodePreview
        ├── RelationshipGraph
        └── MetadataPanel
```

### File Structure

```
packages/dashboard/src/app/coderef-explorer/
├── page.tsx                    # Main page component (this file)
├── layout.tsx                  # Custom layout (if exists)
├── loading.tsx                 # Loading UI skeleton
├── error.tsx                   # Error boundary
└── components/
    ├── explorer-header.tsx
    ├── explorer-sidebar.tsx
    ├── explorer-content.tsx
    ├── code-element-card.tsx
    └── detail-view.tsx
```

### Dependencies

**React Dependencies:**
- `react` (18.3.0+) - Core library
- `react-dom` (18.3.0+) - DOM rendering

**Next.js Dependencies:**
- `next` (14.0.0+) - Framework
- `next/navigation` - useSearchParams, useRouter hooks

**Internal Dependencies:**
```typescript
import { ExplorerSidebar } from '@/components/explorer/sidebar'
import { CodeElementCard } from '@/components/explorer/card'
import { ExplorerHeader } from '@/components/explorer/header'
import { DetailView } from '@/components/explorer/detail-view'
import { loadCodeRefIndex } from '@/lib/coderef-loader'
import { filterElements } from '@/lib/coderef-filters'
```

**External Dependencies:**
- `@radix-ui/react-*` (assumed) - UI primitives
- `lucide-react` (assumed) - Icons
- `tailwindcss` - Styling

### Architectural Pattern

**Pattern:** Server Component + Client Islands

**Why This Pattern:**
- Initial data fetching happens on server (fast, SEO-friendly)
- Interactive components are client-side (search, filters)
- Reduces JavaScript bundle size
- Leverages React Server Components for performance

**Server Responsibilities:**
- Load `.coderef/index.json` data
- Pre-filter based on URL search params
- Generate initial HTML with data

**Client Responsibilities:**
- Search input handling
- Filter state management
- Element selection and detail view
- Interactive navigation

### Design Principles

1. **Performance First:** Server-side data loading, client-side interactivity only where needed
2. **Progressive Enhancement:** Works without JavaScript, enhanced with it
3. **Separation of Concerns:** Server components for data, client components for interaction
4. **Type Safety:** Full TypeScript coverage with CodeRef schema types
5. **Accessibility:** Keyboard navigation, screen reader support, semantic HTML

---

## Integration

### Integration Points

**1. CodeRef Index Data**
- **Direction:** Inbound
- **Type:** File System Read
- **Location:** `.coderef/index.json` in target project
- **Format:** JSON (CodeRef v2 schema)
- **Purpose:** Source data for all visualizations

**2. File System API**
- **Direction:** Outbound (future)
- **Type:** Browser File System Access API
- **Purpose:** Allow users to select and load their own projects
- **Status:** Planned (WO-MIGRATE-TO-CODEREF-DASHBOARD)

**3. Dashboard Shell Layout**
- **Direction:** Wraps this page
- **Type:** Next.js Layout Component
- **Location:** `app/layout.tsx`
- **Provides:** Navigation, header, footer, theme provider

**4. Sidebar Navigation**
- **Direction:** Bidirectional
- **Type:** Component Communication
- **Purpose:** Filter changes trigger content re-render

**5. Search API** (future)
- **Direction:** Outbound
- **Type:** REST API or Server Action
- **Purpose:** Advanced search with fuzzy matching, regex support

### Data Flow

```
User navigates to /coderef-explorer
  ↓
Next.js App Router invokes page.tsx (Server Component)
  ↓
Server loads .coderef/index.json
  ↓
Server applies URL search params filters (if any)
  ↓
Server renders initial HTML with data
  ↓
HTML sent to browser
  ↓
Client components hydrate (ExplorerSidebar, SearchBar, etc.)
  ↓
User interacts (search, filter, click element)
  ↓
Client state updates → re-render filtered results
  ↓
User clicks element → DetailView shows (client-side transition)
```

### External Dependencies

**Runtime Dependencies:**
- Next.js router for navigation
- React context for theme/settings
- Browser localStorage for user preferences (filter state, view mode)

**Build-Time Dependencies:**
- TypeScript compiler
- Next.js build system
- Tailwind CSS processor

### Failure Modes

**1. Missing .coderef/index.json**
- **Symptom:** Empty state or error message
- **Handling:** Show onboarding UI explaining how to generate index
- **Recovery:** Provide link to documentation or CLI command

**2. Malformed JSON in index**
- **Symptom:** Parse error on server
- **Handling:** Error boundary catches, shows user-friendly message
- **Recovery:** Suggest running `coderef validate` command

**3. Large codebase (>10,000 elements)**
- **Symptom:** Slow initial render, high memory usage
- **Handling:** Implement virtualization (react-window or similar)
- **Recovery:** Pagination or lazy loading with infinite scroll

**4. Browser compatibility (File System API)**
- **Symptom:** File picker doesn't work in older browsers
- **Handling:** Feature detection, fallback to manual JSON upload
- **Recovery:** Show browser compatibility notice

**5. Network failure (if API used)**
- **Symptom:** Search or filter requests fail
- **Handling:** Retry with exponential backoff
- **Recovery:** Show error toast, allow manual retry

---

## Routing

### Route Definition

**Path:** `/coderef-explorer`
**Pattern:** Static route (no dynamic segments)
**Type:** Next.js App Router page
**Rendering:** Server-Side Rendering (SSR)

### Route Parameters

**Search Params (optional):**
```typescript
interface CodeRefExplorerSearchParams {
  type?: string;        // Filter by element type: 'function' | 'class' | 'component' | 'hook' | 'type'
  file?: string;        // Filter by file path (partial match)
  search?: string;      // Search term for element names
  view?: 'grid' | 'list'; // View mode preference
  selected?: string;    // Pre-select element by ID
}
```

**Example URLs:**
```
/coderef-explorer
/coderef-explorer?type=function
/coderef-explorer?type=component&file=src/app
/coderef-explorer?search=useCodeRef
/coderef-explorer?selected=func_123&view=list
```

### Navigation Patterns

**From Other Pages:**
```typescript
// From home page
<Link href="/coderef-explorer">Explore Codebase</Link>

// With filters pre-applied
<Link href="/coderef-explorer?type=component">
  View Components
</Link>

// Programmatic navigation
router.push('/coderef-explorer?selected=' + elementId)
```

**Within Page:**
```typescript
// Client-side filter updates
const updateFilters = (newType: string) => {
  const params = new URLSearchParams(searchParams)
  params.set('type', newType)
  router.push(`/coderef-explorer?${params.toString()}`)
}
```

### Nested Routes (future expansion)

**Potential sub-routes:**
```
/coderef-explorer/[elementId]          # Detail view for specific element
/coderef-explorer/compare              # Compare two elements side-by-side
/coderef-explorer/graph                # Dependency graph visualization
/coderef-explorer/export               # Export filtered results
```

### Route Guards

**Authentication:** None (public page in dashboard)
**Authorization:** None (no role-based access control)
**Validation:** URL search params validated on server, invalid values ignored

### Deep Linking

**Shareable URLs:** Yes - full state encoded in URL search params
**Bookmarkable:** Yes - filters and selected element preserved
**Browser History:** Yes - filter changes push to history stack

---

## Testing

### Test Strategy

**Unit Tests (70% coverage target):**
- Component rendering with mock data
- Filter logic (filterElements utility)
- Search functionality
- URL param parsing

**Integration Tests (20% coverage target):**
- Server component data loading
- Client component hydration
- Filter + search interaction
- Navigation and routing

**E2E Tests (10% coverage target):**
- Full user journey: load page → filter → search → view details
- Error state handling (missing index, malformed data)
- Performance (large codebase rendering)

### Coverage Gaps

**Missing Tests:**
- [ ] Server-side data loading with various .coderef/index.json formats
- [ ] Client-side hydration edge cases (rapid filter changes)
- [ ] Accessibility (keyboard navigation, screen reader announcements)
- [ ] Performance (virtualization with 10,000+ elements)
- [ ] Error boundaries (malformed JSON, missing files)

### Recommended Tests

**Test 1: Server Component Data Loading**
```typescript
// __tests__/coderef-explorer-page.test.tsx
import { render } from '@testing-library/react'
import CodeRefExplorerPage from '@/app/coderef-explorer/page'

describe('CodeRefExplorerPage', () => {
  it('loads and displays elements from .coderef/index.json', async () => {
    const mockIndex = {
      elements: [
        { id: '1', name: 'useCodeRef', type: 'hook', file: 'src/hooks.ts' }
      ]
    }

    // Mock file system read
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockIndex))

    const { findByText } = render(await CodeRefExplorerPage())
    expect(await findByText('useCodeRef')).toBeInTheDocument()
  })
})
```

**Test 2: Filter Interaction**
```typescript
// __tests__/explorer-filters.test.tsx
import { render, fireEvent } from '@testing-library/react'
import { ExplorerSidebar } from '@/components/explorer/sidebar'

describe('ExplorerSidebar', () => {
  it('updates URL params when filter changes', () => {
    const mockRouter = { push: jest.fn() }
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter)

    const { getByRole } = render(<ExplorerSidebar />)
    const filterButton = getByRole('button', { name: 'Functions' })

    fireEvent.click(filterButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/coderef-explorer?type=function')
  })
})
```

**Test 3: Search Functionality**
```typescript
// __tests__/search.test.tsx
import { filterElements } from '@/lib/coderef-filters'

describe('filterElements', () => {
  const elements = [
    { id: '1', name: 'useCodeRef', type: 'hook' },
    { id: '2', name: 'CodeRefProvider', type: 'component' },
    { id: '3', name: 'loadCodeRef', type: 'function' }
  ]

  it('filters by search term (case-insensitive)', () => {
    const results = filterElements(elements, { search: 'coderef' })
    expect(results).toHaveLength(3)
  })

  it('filters by type', () => {
    const results = filterElements(elements, { type: 'hook' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('useCodeRef')
  })

  it('combines multiple filters (AND logic)', () => {
    const results = filterElements(elements, { search: 'code', type: 'component' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('CodeRefProvider')
  })
})
```

**Test 4: E2E User Journey**
```typescript
// e2e/coderef-explorer.spec.ts (Playwright)
import { test, expect } from '@playwright/test'

test('user can browse, filter, and view element details', async ({ page }) => {
  await page.goto('/coderef-explorer')

  // Verify initial load
  await expect(page.locator('[data-testid="element-card"]')).toHaveCount.greaterThan(0)

  // Apply filter
  await page.click('button:has-text("Functions")')
  await expect(page.url()).toContain('type=function')

  // Search
  await page.fill('input[placeholder="Search elements"]', 'useCodeRef')
  await page.keyboard.press('Enter')

  // Click element to view details
  await page.click('[data-testid="element-card"]:has-text("useCodeRef")')
  await expect(page.locator('[data-testid="detail-view"]')).toBeVisible()
})
```

**Test 5: Error Handling**
```typescript
// __tests__/error-states.test.tsx
describe('Error States', () => {
  it('shows friendly message when .coderef/index.json is missing', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory')
    })

    const { findByText } = render(await CodeRefExplorerPage())
    expect(await findByText(/no coderef index found/i)).toBeInTheDocument()
    expect(await findByText(/run.*coderef scan/i)).toBeInTheDocument()
  })

  it('shows error boundary when JSON is malformed', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid json{')

    const { findByText } = render(await CodeRefExplorerPage())
    expect(await findByText(/failed to load codebase data/i)).toBeInTheDocument()
  })
})
```

---

## Performance

### Performance Budget

**Bundle Size:**
- **Target:** 150 KB (gzipped, including all dependencies)
- **Maximum:** 200 KB
- **Current:** TBD (measure with `next build` + bundle analyzer)

**Core Web Vitals:**
- **FCP (First Contentful Paint):** < 1.0s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.0s
- **CLS (Cumulative Layout Shift):** < 0.1

### Known Bottlenecks

**1. Large Index File Loading**
- **Issue:** Reading 5 MB+ .coderef/index.json on server blocks initial render
- **Impact:** High TTFB (Time to First Byte)
- **Severity:** Medium
- **Affected:** Projects with 10,000+ code elements

**2. Client-Side Rendering of Grid**
- **Issue:** Rendering 1,000+ CodeElementCard components causes jank
- **Impact:** Poor LCP, high TTI
- **Severity:** High
- **Affected:** Large codebases without virtualization

**3. Search Performance**
- **Issue:** Linear search across all elements (O(n) complexity)
- **Impact:** Noticeable lag when typing in search box (500+ elements)
- **Severity:** Low (mitigated by debouncing)
- **Affected:** Real-time search without indexing

**4. Hydration Cost**
- **Issue:** Client components must hydrate with full element data
- **Impact:** High JavaScript execution time on low-end devices
- **Severity:** Medium
- **Affected:** Mobile users, slow devices

### Optimization Opportunities

**Immediate (High ROI):**
1. **Implement virtualization** (react-window)
   - Only render visible CodeElementCards
   - Estimated savings: 70% reduction in DOM nodes
   - Complexity: Low

2. **Code splitting by route**
   - Lazy load DetailView component
   - Estimated savings: 30 KB bundle reduction
   - Complexity: Low

3. **Optimize .coderef/index.json loading**
   - Stream JSON parsing instead of loading entire file
   - Estimated savings: 50% faster TTFB for large files
   - Complexity: Medium

**Medium Term:**
4. **Add search indexing** (Fuse.js or lunr.js)
   - Pre-build search index on server
   - Estimated savings: 10x faster search (O(1) vs O(n))
   - Complexity: Medium

5. **Server-side pagination**
   - Load elements in chunks (50-100 per page)
   - Estimated savings: 80% reduction in initial data transfer
   - Complexity: Medium

6. **Image optimization** (if screenshots added)
   - Use Next.js Image component with lazy loading
   - Estimated savings: 60% reduction in image bandwidth
   - Complexity: Low

**Long Term:**
7. **Database backend** (replace file-based index)
   - Move to SQLite or PostgreSQL for large codebases
   - Estimated savings: 90% faster queries, pagination, search
   - Complexity: High

8. **Web Worker for search**
   - Offload search computation to separate thread
   - Estimated savings: No main thread blocking during search
   - Complexity: Medium

### Monitoring

**Metrics to Track:**
- **Real User Monitoring (RUM):** Core Web Vitals via Vercel Analytics or similar
- **Synthetic Monitoring:** Lighthouse CI on every PR
- **Bundle Size:** Track with `next-bundle-analyzer` in CI

**Alerts:**
- Bundle size exceeds 200 KB → Block PR
- LCP > 3.0s on Lighthouse → Warning
- Page load time > 5s on 3G network → Warning

---

## Manual Sections (To Be Completed)

### State Management
*Document client-side state:*
- [ ] Filter state (type, file, search term)
- [ ] Selected element ID
- [ ] View mode (grid vs list)
- [ ] User preferences (localStorage)

### Props/Configuration
*Document component props:*
- [ ] searchParams (URL parameters)
- [ ] Any context providers used

### Lifecycle Hooks
*Document React hooks used:*
- [ ] useSearchParams() - for reading URL filters
- [ ] useRouter() - for navigation
- [ ] useState() - for client state
- [ ] useEffect() - for side effects (analytics, etc.)

### Events/Callbacks
*Document user interactions:*
- [ ] onFilterChange
- [ ] onSearchSubmit
- [ ] onElementSelect
- [ ] onViewModeToggle

### Error Handling
*Document error scenarios:*
- [ ] Missing .coderef/index.json
- [ ] Malformed JSON
- [ ] Network errors (if API used)
- [ ] Browser compatibility fallbacks

---

## Metadata

**Created:** 2026-01-02
**Last Modified:** 2026-01-02
**Author:** CodeRef Assistant
**Version:** 1.0.0
**Status:** Draft (Manual sections incomplete)

**Related Files:**
- Schema: `coderef/schemas/coderef-explorer-page-schema.json`
- JSDoc: `coderef/foundation-docs/.jsdoc/coderef-explorer-page-jsdoc.txt`
- Source: `packages/dashboard/src/app/coderef-explorer/page.tsx`

**Dependencies on Other Resource Sheets:**
- ExplorerSidebar component (not yet documented)
- CodeElementCard component (not yet documented)
- loadCodeRefIndex utility (not yet documented)

---

**End of Resource Sheet**

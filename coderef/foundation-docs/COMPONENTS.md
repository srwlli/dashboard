# Component Library Reference

**Framework:** React 19 + Next.js 14 (App Router)
**Date:** 2025-12-28
**Version:** 0.1.0

---

## Overview

This document catalogs all reusable UI components in the CodeRef Dashboard. The component library follows a modular architecture with shared core components and dashboard-specific implementations.

**Key Characteristics:**
- React 19 with TypeScript
- Next.js 14 App Router (`'use client'` directive for client components)
- Tailwind CSS with custom design tokens (`ind-*` prefix)
- Lucide React for icons
- Responsive design (mobile-first)

---

## Component Architecture

### Package Structure

```
packages/
├── core/                    # Shared component library
│   └── src/
│       ├── components/      # Core reusable components
│       │   └── ErrorBoundary.tsx
│       └── types/           # Shared TypeScript interfaces
│
└── dashboard/               # Dashboard-specific components
    └── src/
        └── components/
            ├── WorkorderCard/
            ├── StubCard/
            ├── Sidebar/
            ├── Header/
            ├── FilterBar/
            ├── ThemeToggle/
            └── ... (more)
```

---

## Core Components

### ErrorBoundary

**Source:** `packages/core/src/components/ErrorBoundary.tsx`

Error boundary component for catching React errors.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage:**
```tsx
import { ErrorBoundary } from '@coderef-dashboard/core';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <YourComponent />
</ErrorBoundary>
```

---

## Data Display Components

### WorkorderCard

**Source:** `packages/dashboard/src/components/WorkorderCard/index.tsx`

Displays a workorder with status, project info, and metadata.

**Props:**
```typescript
interface WorkorderCardProps {
  workorder: WorkorderObject;
  onClick?: () => void;
}
```

**Features:**
- Status icons with color coding
- Responsive layout (mobile-first)
- Hover effects (when clickable)
- Date formatting (relative to current year)
- Truncated text with ellipsis

**Status Icons:**
```typescript
const statusIcons = {
  pending_plan: Clock,
  plan_submitted: CheckCircle,
  changes_requested: RefreshCw,
  approved: CheckCircle,
  implementing: Zap,
  complete: Sparkles,
  verified: CheckCircle,
  closed: Lock
};
```

**Status Colors:**
```typescript
const statusColors = {
  pending_plan: 'text-ind-text-muted',
  plan_submitted: 'text-ind-text',
  changes_requested: 'text-ind-warning',
  approved: 'text-ind-accent',
  implementing: 'text-ind-accent',
  complete: 'text-ind-success',
  verified: 'text-ind-success',
  closed: 'text-ind-text-muted'
};
```

**Usage:**
```tsx
import { WorkorderCard } from '@/components/WorkorderCard';

<WorkorderCard
  workorder={workorderObject}
  onClick={() => handleCardClick(workorder.id)}
/>
```

---

### StubCard

**Source:** `packages/dashboard/src/components/StubCard/index.tsx`

Displays a stub (pending feature) with category, priority, and status.

**Props:**
```typescript
interface StubCardProps {
  stub: StubObject;
  onClick?: () => void;
}
```

**Features:**
- Category icons (feature, fix, improvement, etc.)
- Priority-based text coloring
- Status badges with background colors
- Two-line description with `line-clamp-2`
- Responsive layout

**Category Icons:**
```typescript
const categoryIcons = {
  feature: Sparkles,
  fix: Bug,
  improvement: TrendingUp,
  idea: Lightbulb,
  refactor: Wrench,
  test: Beaker
};
```

**Priority Colors:**
```typescript
const priorityColors = {
  low: 'text-ind-text-muted',
  medium: 'text-ind-text',
  high: 'text-ind-warning',
  critical: 'text-ind-error'
};
```

**Status Badge Styles:**
```typescript
const statusBgColors = {
  stub: 'bg-ind-bg/30 text-ind-text-muted',
  planned: 'bg-ind-accent/10 text-ind-accent',
  in_progress: 'bg-ind-accent/20 text-ind-accent',
  completed: 'bg-ind-success/10 text-ind-success'
};
```

**Usage:**
```tsx
import { StubCard } from '@/components/StubCard';

<StubCard
  stub={stubObject}
  onClick={() => handleStubClick(stub.id)}
/>
```

---

### StatsCard

**Source:** `packages/dashboard/src/components/StatsCard/index.tsx`

Displays aggregate statistics with icon and count.

**Props:**
```typescript
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
}
```

**Usage:**
```tsx
import { StatsCard } from '@/components/StatsCard';
import { Zap } from 'lucide-react';

<StatsCard
  icon={<Zap className="w-5 h-5" />}
  label="Active Workorders"
  value={12}
  trend="up"
/>
```

---

## Layout Components

### Sidebar

**Source:** `packages/dashboard/src/components/Sidebar/index.tsx`

Collapsible navigation sidebar with main and bottom nav items.

**Props:**
```typescript
interface SidebarProps {
  className?: string;
}
```

**Features:**
- Collapsible state (managed by `SidebarContext`)
- Active route highlighting
- Icon-only mode when collapsed
- Smooth transitions (300ms)
- Hydration-aware (prevents layout shift)

**Navigation Structure:**
```typescript
const mainNavItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Prompts', href: '/prompts', icon: BookOpen },
  { label: 'Assistant', href: '/assistant', icon: Zap },
  { label: 'Sources', href: '/sources', icon: Archive }
];

const bottomNavItems = [
  { label: 'Settings', href: '/settings', icon: Settings }
];
```

**Usage:**
```tsx
import Sidebar from '@/components/Sidebar';

<Sidebar className="hidden md:flex" />
```

---

### NavItem

**Source:** `packages/dashboard/src/components/Sidebar/NavItem.tsx`

Individual navigation item within sidebar.

**Props:**
```typescript
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}
```

**States:**
- Active: Highlighted with accent color
- Collapsed: Icon-only display
- Hover: Background color change

---

### Header

**Source:** `packages/dashboard/src/components/Header/index.tsx`

Top navigation header with breadcrumbs and user avatar.

**Features:**
- Responsive logo (full on desktop, abbreviated on mobile)
- Breadcrumb navigation
- User avatar (right-aligned)
- Sticky positioning (`sticky top-0`)

**Breadcrumb Map:**
```typescript
const breadcrumbMap = {
  '/': { label: 'Dashboard', href: '/' },
  '/prompts': { label: 'Prompts', href: '/prompts' },
  '/settings': { label: 'Settings', href: '/settings' },
  '/user-settings': { label: 'User Settings', href: '/user-settings' },
  '/assistant': { label: 'Assistant', href: '/assistant' },
  '/sources': { label: 'Sources', href: '/sources' }
};
```

**Usage:**
```tsx
import Header from '@/components/Header';

<Header />
```

---

### PageLayout

**Source:** `packages/dashboard/src/components/PageLayout.tsx`

Wrapper component providing consistent page structure.

**Props:**
```typescript
interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}
```

---

### MobileNav

**Source:** `packages/dashboard/src/components/MobileNav/index.tsx`

Bottom navigation for mobile devices.

**Features:**
- Fixed bottom positioning
- Icon-based navigation
- Active route highlighting
- Only visible on mobile (`md:hidden`)

---

## Filter & Search Components

### FilterBar

**Source:** `packages/dashboard/src/components/FilterBar/index.tsx`

Multi-faceted filter component with search, status, priority, project, and category filters.

**Props:**
```typescript
interface FilterBarProps {
  onFilterChange: (filters: FilterConfig) => void;
  statusOptions?: string[];
  priorityOptions?: string[];
  projectOptions?: string[];
  categoryOptions?: string[];
  showSearch?: boolean;
}

interface FilterConfig {
  status?: string[];
  priority?: string[];
  project?: string[];
  category?: string[];
  search?: string;
}
```

**Features:**
- Multi-select filters (pill buttons)
- Text search input
- Active filter highlighting
- Clear all filters button
- Real-time filter updates via callback

**Usage:**
```tsx
import { FilterBar, FilterConfig } from '@/components/FilterBar';

const handleFilterChange = (filters: FilterConfig) => {
  // Apply filters to data
};

<FilterBar
  onFilterChange={handleFilterChange}
  statusOptions={['implementing', 'complete', 'pending_plan']}
  priorityOptions={['low', 'medium', 'high', 'critical']}
  showSearch={true}
/>
```

---

### TabNavigation

**Source:** `packages/dashboard/src/components/TabNavigation/index.tsx`

Tab switcher component for multi-view pages.

**Props:**
```typescript
interface TabNavigationProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Usage:**
```tsx
import { TabNavigation } from '@/components/TabNavigation';

<TabNavigation
  tabs={[
    { id: 'workorders', label: 'Workorders' },
    { id: 'stubs', label: 'Stubs' }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

---

### ViewModeToggle

**Source:** `packages/dashboard/src/components/coderef/ViewModeToggle.tsx`

Tab toggle for switching between Projects and CodeRef view modes in Explorer.

**Props:**
```typescript
interface ViewModeToggleProps {
  /** Current active view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (mode: ViewMode) => void;
  /** Optional className for styling */
  className?: string;
}

export type ViewMode = 'projects' | 'coderef';
```

**Features:**
- Two-tab toggle (Projects / CodeRef)
- Active state styling with accent color
- Used in CodeRef Explorer for switching between single-project and multi-project views

**Usage:**
```tsx
import { ViewModeToggle, ViewMode } from '@/components/coderef/ViewModeToggle';

const [viewMode, setViewMode] = useState<ViewMode>('projects');

<ViewModeToggle value={viewMode} onChange={setViewMode} />
```

---

### FileTypeFilter

**Source:** `packages/dashboard/src/components/coderef/FileTypeFilter.tsx`

Filter buttons for CodeRef view mode to filter files by type with count badges.

**Props:**
```typescript
interface FileTypeFilterProps {
  /** Current active filter */
  value: FileType;
  /** Callback when filter changes */
  onChange: (type: FileType) => void;
  /** Optional file counts per type */
  counts?: Record<FileType, number>;
  /** Optional className for styling */
  className?: string;
}

export type FileType = 'all' | 'claude' | 'plan' | 'deliverables' | 'architecture' | 'readme';
```

**Features:**
- Button group with file type options
- Icons for each file type (Lucide React)
- Dynamic count badges showing number of files per type
- Active state highlighting
- Supports pattern matching (exact, wildcard `**/`, extension `*.`)

**File Type Options:**
```typescript
const FILE_TYPE_OPTIONS = [
  { id: 'all', label: 'All Files', pattern: '*', icon: FileText },
  { id: 'claude', label: 'CLAUDE.md', pattern: 'CLAUDE.md', icon: Code },
  { id: 'plan', label: 'plan.json', pattern: '**/plan.json', icon: FileCode },
  { id: 'deliverables', label: 'DELIVERABLES.md', pattern: '**/DELIVERABLES.md', icon: CheckSquare },
  { id: 'architecture', label: 'ARCHITECTURE.md', pattern: 'ARCHITECTURE.md', icon: BookOpen },
];
```

**Usage:**
```tsx
import { FileTypeFilter, FileType } from '@/components/coderef/FileTypeFilter';

const [fileType, setFileType] = useState<FileType>('all');
const fileCounts = { all: 42, claude: 5, plan: 8, deliverables: 8, architecture: 3 };

<FileTypeFilter
  value={fileType}
  onChange={setFileType}
  counts={fileCounts}
/>
```

---

## List Components

### WorkorderList

**Source:** `packages/dashboard/src/components/WorkorderList/index.tsx`

Virtualized list of workorder cards with filtering.

**Props:**
```typescript
interface WorkorderListProps {
  workorders: WorkorderObject[];
  onWorkorderClick?: (workorder: WorkorderObject) => void;
  filters?: FilterConfig;
}
```

---

### StubList

**Source:** `packages/dashboard/src/components/StubList/index.tsx`

List of stub cards with optional filtering.

**Props:**
```typescript
interface StubListProps {
  stubs: StubObject[];
  onStubClick?: (stub: StubObject) => void;
  filters?: FilterConfig;
}
```

---

## Theme Components

### ThemeToggle

**Source:** `packages/dashboard/src/components/ThemeToggle.tsx`

Toggle button for switching between light and dark themes.

**Features:**
- Animated icon transition
- Persists to localStorage
- Uses `ThemeContext`

**Usage:**
```tsx
import ThemeToggle from '@/components/ThemeToggle';

<ThemeToggle />
```

---

### ThemePanel

**Source:** `packages/dashboard/src/components/ThemePanel.tsx`

Advanced theme customization panel (color picker, etc.).

---

### AccentColorPicker

**Source:** `packages/dashboard/src/components/AccentColorPicker.tsx`

Color picker for customizing accent color.

**Features:**
- Predefined color palette
- Custom color input
- Persists to localStorage via `AccentColorContext`

---

## Workflow Components

### PromptingWorkflow

**Source:** `packages/dashboard/src/components/PromptingWorkflow/`

Complex workflow component for AI prompt management with attachments.

**Sub-components:**
- `PromptSelector` - Select preloaded prompts
- `AttachmentManager` - Manage file attachments
- `AttachmentDropZone` - Drag-and-drop file upload
- `PasteTextModal` - Paste text content
- `PasteFinalResultModal` - Paste final result
- `ExportMenu` - Export workflow data
- `WorkflowMeta` - Display workflow metadata

**Features:**
- File attachment with drag-and-drop
- Syntax highlighting via language detection
- Export to JSON/Markdown/Clipboard
- Token estimation
- Preloaded prompt templates

---

## Utility Components

### UserAvatar

**Source:** `packages/dashboard/src/components/UserAvatar/index.tsx`

User avatar with initials or profile picture.

**Props:**
```typescript
interface UserAvatarProps {
  username?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

---

### ComingSoon

**Source:** `packages/dashboard/src/components/ComingSoon/index.tsx`

Placeholder component for unimplemented features.

**Props:**
```typescript
interface ComingSoonProps {
  feature: string;
  description?: string;
}
```

---

### PWAInitializer

**Source:** `packages/dashboard/src/components/PWAInitializer.tsx`

Client-side component that initializes PWA service worker.

**Features:**
- Registers service worker
- Handles update prompts
- Only runs on client-side

---

## Design Tokens

### Color Variables

The dashboard uses Tailwind CSS with custom design tokens:

```css
/* Light Theme */
--ind-bg: #ffffff
--ind-panel: #f9fafb
--ind-border: #e5e7eb
--ind-text: #111827
--ind-text-muted: #6b7280
--ind-accent: #3b82f6
--ind-success: #10b981
--ind-warning: #f59e0b
--ind-error: #ef4444

/* Dark Theme */
--ind-bg: #111827
--ind-panel: #1f2937
--ind-border: #374151
--ind-text: #f9fafb
--ind-text-muted: #9ca3af
--ind-accent: #60a5fa
--ind-success: #34d399
--ind-warning: #fbbf24
--ind-error: #f87171
```

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## Context Providers

### ThemeContext

**Source:** `packages/dashboard/src/contexts/ThemeContext.tsx`

Global theme state management.

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**Usage:**
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

---

### AccentColorContext

**Source:** `packages/dashboard/src/contexts/AccentColorContext.tsx`

Global accent color customization.

```typescript
interface AccentColorContextValue {
  accentColor: string;
  setAccentColor: (color: string) => void;
}
```

---

### SidebarContext

**Source:** `packages/dashboard/src/contexts/SidebarContext.tsx`

Sidebar collapse state management.

```typescript
interface SidebarContextValue {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isHydrated: boolean;
}
```

---

## Component Best Practices

### 1. Client vs Server Components

- Use `'use client'` for components with:
  - Event handlers (`onClick`, `onChange`)
  - React hooks (`useState`, `useEffect`)
  - Browser APIs
- Server components by default for:
  - Static content
  - Data fetching pages

### 2. Responsive Design

All components use mobile-first responsive design:
```tsx
className="text-xs sm:text-sm md:text-base"  // Typography
className="p-2 sm:p-4 md:p-6"                // Spacing
className="hidden sm:block"                  // Visibility
```

### 3. Accessibility

- Semantic HTML elements
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus states with `focus:` utilities

### 4. Performance

- Lazy loading for large components
- Memoization with `React.memo()` for expensive renders
- Code splitting via dynamic imports

### 5. Type Safety

All components have full TypeScript interfaces with:
- Required vs optional props
- Union types for variants
- Generic types for reusable components

---

## Component Testing

**Status:** Not implemented

Future testing strategy:
- Unit tests with Jest + React Testing Library
- Component visual regression with Storybook
- E2E tests with Playwright

---

## Future Component Enhancements

- **DataTable:** Generic table component with sorting/pagination
- **Modal:** Reusable modal dialog component
- **Toast:** Notification toast system
- **Dropdown:** Menu dropdown component
- **Tooltip:** Hover tooltip component
- **Skeleton:** Loading skeleton states
- **EmptyState:** Empty state placeholders

---

**AI Integration Notes:**

When working with these components:

1. **Import Paths:** Use `@/` alias for dashboard components, `@coderef-dashboard/core` for shared components
2. **Styling:** Always use Tailwind utilities with `ind-*` design tokens
3. **Icons:** Import from `lucide-react` library
4. **Responsiveness:** Test on mobile breakpoints (use browser DevTools)
5. **State Management:** Use React Context for global state, local `useState` for component state
6. **Type Safety:** Always define prop interfaces, avoid `any` types

**Component Development Workflow:**
1. Create component in `packages/dashboard/src/components/`
2. Define TypeScript interface for props
3. Add `'use client'` if using hooks/events
4. Use Tailwind CSS with design tokens
5. Export from `index.tsx` for clean imports

---

*This document was generated as part of the CodeRef Dashboard foundation documentation suite. See also: [API.md](./API.md), [SCHEMA.md](./SCHEMA.md), [ARCHITECTURE.md](./ARCHITECTURE.md)*

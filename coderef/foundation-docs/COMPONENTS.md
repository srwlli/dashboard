---
generated_by: coderef-docs
template: components
date: "2026-01-14T01:30:00Z"
feature_id: foundation-docs-components
doc_type: components
workorder_id: WO-FOUNDATION-DOCS-001
task: DOCUMENT
agent: claude-sonnet-4-5
_uds:
  validation_score: 95
  validation_errors: []
  validation_warnings: []
  validated_at: "2026-01-14T01:30:00Z"
  validator: UDSValidator
---

# Components Reference

**Project:** coderef-dashboard  
**Framework:** React 18+ with Next.js 14  
**Version:** 0.1.0  
**Date:** 2026-01-14

---

## Purpose

This document provides comprehensive documentation for all reusable React components in the coderef-dashboard project. It serves as the component library reference for developers building UI features, ensuring consistency, proper prop usage, and best practices.

## Overview

The coderef-dashboard component library includes:

- **Layout Components** - Page structure, navigation, headers
- **Card Components** - Reusable card patterns for content display
- **Scanner Components** - Code scanning interface components
- **Context Providers** - React context for global state
- **Form Components** - Input, selection, and workflow components
- **Utility Components** - Shared UI primitives

All components follow React best practices, use TypeScript for type safety, and support responsive design with Tailwind CSS.

## What

### Component Architecture

Components are organized by functionality:

```
packages/dashboard/src/components/
├── Layout/
│   ├── RootClientWrapper.tsx
│   ├── PageLayout.tsx
│   ├── Sidebar/
│   └── Header/
├── Cards/
│   ├── UnifiedCard/
│   ├── StubCard/
│   ├── WorkorderCard/
│   └── StatsCard/
├── Scanner/
│   ├── index.tsx
│   ├── ProjectListCard.tsx
│   ├── ConsoleTabs.tsx
│   └── ActionBar.tsx
├── Contexts/
│   ├── ThemeContext.tsx
│   ├── ProjectsContext.tsx
│   └── ...
└── coderef/
    ├── FileTree.tsx
    └── ContextMenu.tsx
```

### Component Patterns

- **Client Components** - Marked with `'use client'` for interactivity
- **Server Components** - Default for static content
- **Context Providers** - Global state management
- **Composition** - Components compose smaller primitives

## Why

Comprehensive component documentation enables:

- **Reusability** - Discover existing components before creating new ones
- **Consistency** - Follow established patterns and styling
- **Type Safety** - Understand prop requirements and types
- **Best Practices** - Learn from proven component patterns
- **Onboarding** - Quick reference for new developers

## When

Reference this document when:

- Building new UI features
- Looking for reusable components
- Understanding component props and usage
- Learning component patterns
- Integrating components into pages

## Layout Components

### RootClientWrapper

Global layout wrapper providing consistent page structure.

**Location:** `packages/dashboard/src/components/RootClientWrapper.tsx`

**Props:**
```typescript
interface RootClientWrapperProps {
  children: ReactNode;
}
```

**Features:**
- Sidebar navigation (hidden on mobile)
- Sticky header with page title
- Responsive padding and container constraints
- PWA initialization
- Standalone route support

**Usage:**
```tsx
<RootClientWrapper>
  <YourPageContent />
</RootClientWrapper>
```

### PageLayout

Wrapper for consistent page structure and spacing.

**Location:** `packages/dashboard/src/components/PageLayout.tsx`

**Props:**
```typescript
interface PageLayoutProps {
  children: ReactNode;
}
```

**Usage:**
```tsx
<PageLayout>
  <div>Page content</div>
</PageLayout>
```

### Sidebar

Main navigation sidebar with collapsible state.

**Location:** `packages/dashboard/src/components/Sidebar/index.tsx`

**Props:**
```typescript
interface SidebarProps {
  className?: string;
}
```

**Features:**
- Main navigation items (Dashboard, Prompts, Sessions, etc.)
- Bottom navigation (Settings)
- Collapsible with animation
- Active route highlighting
- Responsive (hidden on mobile)

**Usage:**
```tsx
<Sidebar className="custom-class" />
```

### Header

Sticky header with page title and user avatar.

**Location:** `packages/dashboard/src/components/Header/index.tsx`

**Props:**
```typescript
interface HeaderProps {
  onMobileMenuClick?: () => void;
}
```

**Features:**
- Dynamic page title from route
- Breadcrumb navigation
- Theme toggle
- User avatar
- Mobile menu trigger

**Usage:**
```tsx
<Header onMobileMenuClick={handleMenuClick} />
```

### MobileNav

Mobile navigation drawer.

**Location:** `packages/dashboard/src/components/MobileNav/index.tsx`

**Props:**
```typescript
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Usage:**
```tsx
<MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
```

## Card Components

### UnifiedCard

Shared card component for consistent UI across stub and workorder cards.

**Location:** `packages/dashboard/src/components/UnifiedCard/index.tsx`

**Props:**
```typescript
interface UnifiedCardProps {
  icon: LucideIcon;              // Icon to display in header
  iconColor: string;              // Tailwind color class for icon
  title: string;                 // Card title
  subtitle?: string;              // Optional subtitle below title
  description?: string;          // Optional description text (with line clamp)
  headerRight?: ReactNode;        // Optional content for right side of header
  footerLeft: ReactNode;          // Content for left side of footer
  footerRight: ReactNode;         // Content for right side of footer
  onClick?: () => void;          // Optional click handler
}
```

**Usage:**
```tsx
<UnifiedCard
  icon={FileText}
  iconColor="text-blue-500"
  title="Feature Name"
  subtitle="Category: feature"
  description="Brief description of the feature"
  headerRight={<Badge>Active</Badge>}
  footerLeft={<span>Created: 2026-01-14</span>}
  footerRight={<Button>View</Button>}
  onClick={() => navigate('/feature')}
/>
```

### StubCard

Card component for displaying stub information.

**Location:** `packages/dashboard/src/components/StubCard/index.tsx`

**Props:**
```typescript
interface StubCardProps {
  stub: Stub;                     // Stub data object
  onClick?: () => void;           // Optional click handler
}
```

**Usage:**
```tsx
<StubCard stub={stubData} onClick={() => handleStubClick(stub.id)} />
```

### WorkorderCard

Card component for displaying workorder information.

**Location:** `packages/dashboard/src/components/WorkorderCard/index.tsx`

**Props:**
```typescript
interface WorkorderCardProps {
  workorder: Workorder;           // Workorder data object
  onClick?: () => void;           // Optional click handler
}
```

**Usage:**
```tsx
<WorkorderCard workorder={workorderData} onClick={() => handleWorkorderClick(workorder.id)} />
```

### StatsCard

Card component for displaying statistics.

**Location:** `packages/dashboard/src/components/StatsCard/index.tsx`

**Props:**
```typescript
interface StatsItem {
  label: string;
  count: number;
}

interface StatsCardProps {
  title: string;
  items: StatsItem[];
  total?: number;
}
```

**Usage:**
```tsx
<StatsCard
  title="Workorders"
  items={[
    { label: "Pending", count: 5 },
    { label: "Implementing", count: 7 },
    { label: "Complete", count: 3 }
  ]}
  total={15}
/>
```

## Scanner Components

### Scanner

Main scanner interface component.

**Location:** `packages/dashboard/src/components/Scanner/index.tsx`

**Props:**
```typescript
// No props - uses context
```

**Features:**
- 12-column responsive grid (8-4 split on desktop)
- Project selection with phase checkboxes
- Real-time console output streaming
- Scan execution controls
- Confirmation dialogs

**Usage:**
```tsx
<Scanner />
```

### ProjectListCard

Project list with phase selection checkboxes.

**Location:** `packages/dashboard/src/components/Scanner/ProjectListCard.tsx`

**Props:**
```typescript
interface ProjectListCardProps {
  onSelectionChange: (projectId: string, selection: ProjectSelection) => void;
}
```

**Usage:**
```tsx
<ProjectListCard onSelectionChange={handleSelectionChange} />
```

### ConsoleTabs

Console output with SSE streaming and history.

**Location:** `packages/dashboard/src/components/Scanner/ConsoleTabs.tsx`

**Props:**
```typescript
interface ConsoleTabsProps {
  scanId?: string;                // Current scan ID for SSE connection
}
```

**Usage:**
```tsx
<ConsoleTabs scanId={activeScanId} />
```

### ActionBar

Execute button and confirmation dialog.

**Location:** `packages/dashboard/src/components/Scanner/ActionBar.tsx`

**Props:**
```typescript
interface ActionBarProps {
  selections: Map<string, ProjectSelection>;
  onScanStart: (scanId: string) => void;
}
```

**Usage:**
```tsx
<ActionBar selections={selections} onScanStart={handleScanStart} />
```

## Context Providers

### ThemeContext

Global theme management (light/dark mode).

**Location:** `packages/dashboard/src/contexts/ThemeContext.tsx`

**Usage:**
```tsx
const { theme, toggleTheme } = useTheme();
```

### AccentColorContext

Accent color customization.

**Location:** `packages/dashboard/src/contexts/AccentColorContext.tsx`

**Usage:**
```tsx
const { accentColor, setAccentColor } = useAccentColor();
```

### ProjectsContext

Project registry management.

**Location:** `packages/dashboard/src/contexts/ProjectsContext.tsx`

**Usage:**
```tsx
const { projects, addProject, removeProject } = useProjects();
```

### SidebarContext

Sidebar collapse state management.

**Location:** `packages/dashboard/src/contexts/SidebarContext.tsx`

**Usage:**
```tsx
const { isCollapsed, toggleCollapse } = useSidebar();
```

### ExplorerContext

File explorer state management.

**Location:** `packages/dashboard/src/contexts/ExplorerContext.tsx`

**Usage:**
```tsx
const { selectedPath, setSelectedPath } = useExplorer();
```

### SearchContext

Global search state management.

**Location:** `packages/dashboard/src/contexts/SearchContext.tsx`

**Usage:**
```tsx
const { query, setQuery, results } = useSearch();
```

### WorkflowContext

Workflow state persistence.

**Location:** `packages/dashboard/src/contexts/WorkflowContext.tsx`

**Usage:**
```tsx
const { workflow, updateWorkflow } = useWorkflow();
```

## CodeRef Components

### FileTree

File tree navigation component.

**Location:** `packages/dashboard/src/components/coderef/FileTree.tsx`

**Props:**
```typescript
interface FileTreeProps {
  rootPath: string;               // Root directory path
  onFileSelect?: (path: string) => void;
  onDirectorySelect?: (path: string) => void;
  expandedPaths?: string[];        // Array of expanded directory paths
  selectedPath?: string;           // Currently selected file path
}
```

**Usage:**
```tsx
<FileTree
  rootPath="/path/to/project"
  onFileSelect={handleFileSelect}
  expandedPaths={expanded}
  selectedPath={currentPath}
/>
```

### FileViewer

File content viewer with syntax highlighting and markdown rendering.

**Location:** `packages/dashboard/src/components/coderef/FileViewer.tsx`

**Props:**
```typescript
interface FileViewerProps {
  project: Project | null;        // Project containing the file
  filePath: string | null;        // Relative file path to display
  className?: string;              // Optional custom class name
}
```

**Features:**
- Syntax highlighting for code files (TypeScript, JavaScript, Python, etc.)
- Markdown rendering with GitHub Flavored Markdown (tables, autolinks, strikethrough, task lists)
- Mermaid diagram rendering
- HTML preview in sandboxed iframe
- JSON pretty-printing
- File operations: Copy content, Copy path, Share, Expand to full page

**Usage:**
```tsx
<FileViewer
  project={selectedProject}
  filePath="coderef/foundation-docs/API.md"
/>
```

## Session Components

### OutputViewer

Modal component for displaying agent output files with automatic type detection.

**Location:** `packages/dashboard/src/components/SessionsHub/SessionMonitoring/OutputViewer.tsx`

**Props:**
```typescript
interface OutputViewerProps {
  isOpen: boolean;                // Modal open state
  onClose: () => void;             // Close handler
  agentId: string;                 // Agent identifier
  content: string | null;          // File content to display
  fileName?: string;               // Optional filename for type detection
  isLoading?: boolean;             // Loading state
}
```

**Features:**
- Automatic file type detection (JSON, Markdown, Text)
- JSON syntax highlighting with line numbers
- Markdown rendering with GitHub Flavored Markdown support (tables, autolinks, strikethrough, task lists)
- Plain text display with monospace formatting
- File download functionality
- Loading and empty states

**Usage:**
```tsx
<OutputViewer
  isOpen={isViewerOpen}
  onClose={() => setIsViewerOpen(false)}
  agentId="agent-1"
  content={outputContent}
  fileName="output.md"
  isLoading={loading}
/>
```

### ContextMenu

Context menu for file operations.

**Location:** `packages/dashboard/src/components/coderef/ContextMenu.tsx`

**Usage:**
```tsx
<ContextMenu
  items={[
    { label: "Open", action: () => openFile() },
    { label: "Delete", action: () => deleteFile() }
  ]}
/>
```

## Prompting Workflow Components

### PromptingWorkflow

Main prompting workflow interface.

**Location:** `packages/dashboard/src/components/PromptingWorkflow/components/PromptingWorkflow.tsx`

**Features:**
- Prompt selection and editing
- Attachment management
- Export functionality
- Workflow metadata

**Usage:**
```tsx
<PromptingWorkflow />
```

### PromptSelector

Prompt template selector.

**Location:** `packages/dashboard/src/components/PromptingWorkflow/components/PromptSelector.tsx`

**Usage:**
```tsx
<PromptSelector onSelect={handlePromptSelect} />
```

### AttachmentManager

File attachment management.

**Location:** `packages/dashboard/src/components/PromptingWorkflow/components/AttachmentManager.tsx`

**Usage:**
```tsx
<AttachmentManager attachments={files} onRemove={handleRemove} />
```

## Utility Components

### ComingSoon

Placeholder component for features under development.

**Location:** `packages/dashboard/src/components/ComingSoon/index.tsx`

**Props:**
```typescript
interface ComingSoonProps {
  title?: string;
  description?: string;
  eta?: string;
}
```

**Usage:**
```tsx
<ComingSoon
  title="Feature Name"
  description="This feature is coming soon"
  eta="Q2 2026"
/>
```

### PageCard

Page wrapper with corner accents.

**Location:** `packages/dashboard/src/components/PageCard.tsx`

**Props:**
```typescript
interface PageCardProps {
  children: ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
<PageCard className="custom-class">
  <YourContent />
</PageCard>
```

## State Management Patterns

### Context Pattern

Most global state uses React Context:

```tsx
// Context definition
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(...) }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Local State Pattern

Component-specific state uses `useState`:

```tsx
function MyComponent() {
  const [count, setCount] = useState(0);
  // ...
}
```

### Server State Pattern

API data uses fetch with state:

```tsx
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <Loading />;
  return <div>{data}</div>;
}
```

## Styling Guidelines

### Tailwind CSS

All components use Tailwind CSS for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
  <h2 className="text-xl font-semibold">Title</h2>
</div>
```

### Responsive Design

Components use Tailwind responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode

Components support dark mode via Tailwind dark: prefix:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

## Examples

### Complete Page Example

```tsx
'use client';

import { PageCard } from '@/components/PageCard';
import { StatsCard } from '@/components/StatsCard';
import { useProjects } from '@/contexts/ProjectsContext';

export default function DashboardPage() {
  const { projects } = useProjects();
  
  return (
    <PageCard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <StatsCard
          title="Projects"
          items={[
            { label: "Active", count: projects.length },
            { label: "Total", count: projects.length }
          ]}
        />
      </div>
    </PageCard>
  );
}
```

### Component Composition Example

```tsx
function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <UnifiedCard
      icon={FileText}
      iconColor="text-blue-500"
      title={feature.name}
      description={feature.description}
      footerLeft={<span>{feature.status}</span>}
      footerRight={<Button>View</Button>}
      onClick={() => navigate(`/features/${feature.id}`)}
    />
  );
}
```

## References

- [API.md](./API.md) - API endpoint documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SCHEMA.md](./SCHEMA.md) - Data models and types
- [README.md](../README.md) - Project overview

---

**Last Updated:** 2026-01-14  
**Maintainer:** CodeRef Development Team  
**Version:** 0.1.0

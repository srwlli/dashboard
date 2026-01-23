# CodeRef Dashboard - Development Patterns & Best Practices

This skill provides guidance on implementing features in the CodeRef Dashboard following established architectural patterns.

## Project Context

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript 5.3+ + Tailwind CSS
**Architecture:** Monorepo (npm workspaces) with no database (file system-based)
**Design System:** Custom `ind-*` design tokens for industrial theme

---

## Core Patterns

### 1. Universal Target Selector Pattern

**When to Use:**
- Adding "Add to [Target]" functionality for any entity type
- Supporting multiple target types (Board, Session, Prompt, Note, Favorite)
- Replacing nested context menus with modal-based UX

**Implementation:**

```typescript
import UniversalEntityActionModal from '@/components/coderef/UniversalEntityActionModal';

// State
const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
const [modalOpen, setModalOpen] = useState(false);

// Context menu with "Add to Target"
const menuItems: ContextMenuItem[] = [
  { label: 'Copy Path', icon: FolderTree, onClick: handleCopyPath },
  { label: 'Share', icon: Share2, onClick: handleShare },
  {
    label: 'Add to Target',
    icon: LayoutGrid,
    onClick: () => {
      setContextMenu(null);  // Close menu first
      setModalOpen(true);     // Open modal
    },
  },
];

// Modal rendering
{modalOpen && (
  <UniversalEntityActionModal
    isOpen={modalOpen}
    entity={entity}
    entityType="EntityType"  // "Stub" | "Workorder" | "File"
    availableTargets={['board', 'session', 'note']}  // Relevant targets
    onClose={() => setModalOpen(false)}
    onSuccess={(targetType, action, result) => {
      console.log(`Added to ${targetType}:`, result);
      toast.success(`Added to ${targetType}!`);
    }}
    onError={(error) => {
      console.error('Error:', error);
      toast.error(error.message);
    }}
  />
)}
```

**Key Principles:**
1. **Always close context menu before opening modal** - Prevents overlay conflicts
2. **Use toast notifications** - Provide immediate user feedback
3. **Choose appropriate targets** - Only include targets that make sense for the entity
4. **Handle both success and error** - Log for debugging, toast for UX

---

### 2. Target Adapter Pattern

**When to Use:**
- Performing CRUD operations on targets (boards, sessions, prompts, etc.)
- Need consistent API for different target types
- Want pluggable, testable target integrations

**Available Adapters:**
- `BoardTargetAdapter` - Board operations (4 action types)
- `SessionTargetAdapter` - Session operations (2 action types)
- `PromptTargetAdapter` - Prompt library operations
- `NoteTargetAdapter` - Note operations with tags
- `FavoriteTargetAdapter` - Favorites operations

**Implementation:**

```typescript
import { BoardTargetAdapter } from '@/lib/boards/target-adapters';
import { stubToBoard } from '@/lib/boards/entity-converters';

// Fetch targets
const boards = await BoardTargetAdapter.fetchTargets();

// Fetch nested items (lists for boards)
const lists = await BoardTargetAdapter.fetchItems(boardId);

// Add to target
const boardData = stubToBoard.convert(stub, 'board');
await BoardTargetAdapter.addToTarget({} as any, boardData, { action: 'as_board' });
```

**Key Principles:**
1. **Always use adapters** - Never call APIs directly for target operations
2. **Use entity converters** - Transform entities type-safely
3. **Provide action context** - Include `{ action: 'as_board' }` for adapter logic
4. **Handle async properly** - All adapter methods return Promises

---

### 3. Entity Converter Pattern

**When to Use:**
- Converting entities to different target formats
- Need type-safe transformations
- Supporting multiple target types from single entity

**Available Converters:**
- `fileToBoard` - File → Board/List/Card/Attachment
- `fileToPrompt` - File → Prompt context
- `stubToBoard` - Stub → Board/List/Card
- `stubToSession` - Stub → Session metadata
- `workorderToBoard` - Workorder → Board/List/Card
- `workorderToSession` - Workorder → Session metadata

**Implementation:**

```typescript
import { stubToBoard } from '@/lib/boards/entity-converters';

// Convert to different formats
const boardData = stubToBoard.convert(stub, 'board');
const listData = stubToBoard.convert(stub, 'list');
const cardData = stubToBoard.convert(stub, 'card');
```

**Key Principles:**
1. **Use converters for all transformations** - Don't manually map fields
2. **Pass target type explicitly** - 'board' | 'list' | 'card' | 'attachment'
3. **Converters return partial data** - Adapters complete the object
4. **Type-safe transformations** - Leverage TypeScript generics

---

### 4. Context Menu Pattern

**When to Use:**
- Right-click actions on cards, files, or tree nodes
- Quick actions that don't require complex input
- Actions that may open modals or execute immediately

**Implementation:**

```typescript
import { ContextMenu, ContextMenuItem } from '@/components/coderef/ContextMenu';

// State
const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

// Menu items (simple, static)
const menuItems: ContextMenuItem[] = [
  {
    label: copiedPath ? 'Path Copied' : 'Copy Path',
    icon: copiedPath ? Check : FolderTree,
    onClick: handleCopyPath,
    iconClassName: copiedPath ? 'text-green-500' : '',
  },
  {
    label: 'Add to Target',
    icon: LayoutGrid,
    onClick: () => {
      setContextMenu(null);
      setModalOpen(true);
    },
  },
];

// Trigger on right-click
const handleRightClick = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({ x: e.clientX, y: e.clientY });
};

// Render menu
{contextMenu && (
  <ContextMenu
    items={menuItems}
    position={contextMenu}
    onClose={() => setContextMenu(null)}
  />
)}
```

**Key Principles:**
1. **Keep menu items static** - Avoid async building in useEffect
2. **Close menu before opening modal** - Prevents overlay conflicts
3. **Use conditional rendering** - Show different labels based on state
4. **Prevent default on right-click** - Use `e.preventDefault()`

---

### 5. Toast Notification Pattern

**When to Use:**
- All async operations (API calls, file operations)
- User feedback for success/error states
- Optimistic UI updates

**Implementation:**

```typescript
import { toast } from 'sonner';

// Loading toast
const toastId = toast.loading('Creating board...');

try {
  await BoardTargetAdapter.addToTarget(board, data, { action: 'as_board' });

  // Success toast (updates loading toast)
  toast.success(`Created board "${boardName}"`, { id: toastId });
} catch (error) {
  const message = error instanceof Error ? error.message : 'Failed to create board';

  // Error toast (updates loading toast)
  toast.error(message, { id: toastId });
}
```

**Key Principles:**
1. **Always show loading state** - Use `toast.loading()` for async ops
2. **Update same toast** - Pass `{ id: toastId }` to replace loading toast
3. **Descriptive messages** - Include entity names in success messages
4. **Handle unknown errors** - Fallback to generic message

---

### 6. Design System (Tailwind)

**Custom Design Tokens:**

```typescript
// Backgrounds
'bg-ind-bg'           // #0c0c0e - Main background
'bg-ind-panel'        // #141416 - Panel/card background

// Borders
'border-ind-border'   // #3f3f46 - Border color

// Text
'text-ind-text'       // #f4f4f5 - Primary text
'text-ind-text-muted' // #71717a - Muted text
'text-ind-accent'     // Dynamic - Accent color
'text-ind-success'    // Green - Success state
'text-ind-error'      // Red - Error state
'text-ind-warning'    // Yellow - Warning state

// Interactive
'hover:bg-ind-bg'     // Hover state for panels
'bg-ind-accent/20'    // Accent background (20% opacity)
```

**Responsive Patterns:**

```typescript
// Mobile-first approach
<div className="p-2 sm:p-4 lg:p-6">           // Padding
<span className="text-sm sm:text-base">       // Font size
<div className="grid-cols-1 sm:grid-cols-2">  // Grid columns
```

**Key Principles:**
1. **Always use ind- tokens** - Never use raw Tailwind colors
2. **Mobile-first responsive** - Start with mobile, add `sm:`, `md:`, `lg:`
3. **Consistent spacing** - Use 2/4/6/8 scale (p-2, p-4, p-6, p-8)
4. **Accent for primary actions** - Use `bg-ind-accent` for CTAs

---

### 7. UnifiedCard Component Pattern

**When to Use:**
- Displaying cards for Stubs, Workorders, or other entities
- Need consistent card layout across the app
- Want hover effects and click handling

**Implementation:**

```typescript
import { UnifiedCard } from '@/components/UnifiedCard';

<UnifiedCard
  icon={CategoryIcon}
  iconColor="text-ind-accent"
  title={entity.title || entity.name}
  subtitle={entity.project || entity.category}
  description={entity.description}
  headerRight={
    <button onClick={handleMenuClick}>
      <MoreVertical className="w-4 h-4" />
    </button>
  }
  footerLeft={<StatusBadge status={entity.status} />}
  footerRight={<DateDisplay date={entity.created} />}
  onClick={onClick}
/>
```

**Key Principles:**
1. **Use headerRight for actions** - Context menu button goes here
2. **footerLeft for status** - Badges, tags, priority
3. **footerRight for metadata** - Dates, counts, stats
4. **Truncate long text** - Use `truncate` classes for descriptions

---

### 8. Modal Component Pattern

**When to Use:**
- Complex forms or multi-step workflows
- Operations requiring user confirmation
- Selecting from large datasets

**Implementation:**

```typescript
// Modal structure
<div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
  <div
    className="bg-ind-panel border border-ind-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-ind-border">
      <h2 className="text-lg font-semibold text-ind-text">Title</h2>
      <button onClick={onClose}><X /></button>
    </div>

    {/* Content (scrollable) */}
    <div className="flex-1 overflow-y-auto p-4">
      {/* Content */}
    </div>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-ind-border flex justify-end gap-2">
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleSubmit} className="bg-ind-accent">Confirm</button>
    </div>
  </div>
</div>
```

**Key Principles:**
1. **Backdrop + modal structure** - Two-layer approach
2. **Stop propagation** - Prevent modal clicks from closing
3. **Scrollable content** - Use `flex-1 overflow-y-auto` for content
4. **Fixed header/footer** - Keep actions visible
5. **Max height constraint** - Prevent modals taller than viewport

---

### 9. File System Operations

**When to Use:**
- Reading/writing files (notes, stubs, workorders)
- Scanning directories for projects
- File system-based data (no database)

**Implementation:**

```typescript
// API route for file operations
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  // Validate path
  if (!filePath || filePath.includes('..')) {
    return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
  }

  // Extension allowlist
  const allowedExtensions = ['.md', '.txt', '.json', '.ts', '.tsx'];
  const ext = path.extname(filePath);
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
  }

  // Read file
  const content = await fs.readFile(filePath, 'utf-8');

  return NextResponse.json({ success: true, data: { content } });
}
```

**Key Principles:**
1. **Always validate paths** - Check for directory traversal (`..`)
2. **Extension allowlist** - Only allow safe file types
3. **Size limits** - Prevent reading huge files
4. **Registered project boundaries** - Only access registered projects

---

### 10. TypeScript Best Practices

**Type Imports:**

```typescript
// Use type imports for types only
import type { StubObject } from '@/types/stubs';
import type { WorkorderObject } from '@/types/workorders';

// Regular imports for values
import { toast } from 'sonner';
```

**Generic Components:**

```typescript
// Generic interface with default
interface ComponentProps<TEntity = any> {
  entity: TEntity;
  converter: EntityConverter<TEntity, any>;
}

// Generic function
function processEntity<TEntity>(entity: TEntity): void {
  // Type-safe processing
}
```

**Error Handling:**

```typescript
// Always type-guard error objects
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Operation failed:', error);
}
```

**Key Principles:**
1. **Use type imports** - Separate type imports from value imports
2. **Leverage generics** - Make components reusable with type parameters
3. **Type-guard errors** - Don't assume error is Error type
4. **Strict null checks** - Handle null/undefined explicitly

---

### 11. Unified Action Modal Pattern

**When to Use:**
- Consolidating ALL entity actions into a single modal
- Replacing context menus for cards (StubCard, WorkorderCard)
- Providing consistent UX for file operations
- Supporting both immediate actions (Copy, Share) and flow actions (Add to Target)

**Why This Pattern:**
- **100% Consistent UX**: Same modal experience for all entities
- **Mobile-Friendly**: Click-based interaction works better on touch devices
- **Complete Discoverability**: All actions visible in one place
- **Better Accessibility**: Keyboard navigation and screen reader support

**Implementation:**

```typescript
import UniversalEntityActionModal, { type ActionMenuItem } from '@/components/coderef/UniversalEntityActionModal';

// State
const [modalOpen, setModalOpen] = useState(false);
const [copiedPath, setCopiedPath] = useState(false);
const [shared, setShared] = useState(false);

// Define action menu items
const actionMenuItems: ActionMenuItem[] = [
  {
    id: 'copy_path',
    label: copiedPath ? 'Path Copied ✓' : 'Copy Path',
    icon: copiedPath ? Check : FolderTree,
    type: 'immediate',  // Executes immediately and closes modal
    onClick: handleCopyPath,
    iconClassName: copiedPath ? 'text-green-500' : '',
  },
  {
    id: 'copy_content',
    label: 'Copy Content',
    icon: Copy,
    type: 'immediate',
    onClick: handleCopyContent,
  },
  {
    id: 'share',
    label: shared ? 'Shared ✓' : 'Share',
    icon: shared ? Check : Share2,
    type: 'immediate',
    onClick: handleShare,
  },
  {
    id: 'add_to_target',
    label: 'Add to Target',
    icon: LayoutGrid,
    type: 'flow',  // Transitions to multi-step target selection
    // No onClick - handled by modal internally
  },
];

// Open modal on right-click or button click
const handleMenuClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  setModalOpen(true);
};

// Modal rendering with actionMenuItems
{modalOpen && (
  <UniversalEntityActionModal
    isOpen={modalOpen}
    entity={entity}
    entityType="Stub"  // "Stub" | "Workorder" | "File"
    availableTargets={['board', 'session', 'note']}
    actionMenuItems={actionMenuItems}  // NEW: Enables main menu
    onClose={() => setModalOpen(false)}
    onSuccess={(targetType, _action, result) => {
      console.log(`✅ Added to ${targetType}:`, result);
      toast.success(`Added to ${targetType}!`);
    }}
    onError={(error) => {
      console.error('❌ Failed:', error);
      toast.error(error.message);
    }}
  />
)}
```

**ActionMenuItem Interface:**

```typescript
interface ActionMenuItem {
  id: string;                          // Unique action identifier
  label: string;                       // Display text (can be dynamic)
  icon: React.ComponentType<any>;      // Lucide icon component
  type: 'immediate' | 'flow';          // Action type
  onClick?: () => void | Promise<void>; // Handler for immediate actions
  iconClassName?: string;              // Optional icon styling (e.g., success state)
}
```

**Modal Flow:**

```
Right-click → Modal Opens → Main Menu (Step 1)
  ├─ Immediate Action (Copy Path)    → Execute → Close modal (200ms delay)
  ├─ Immediate Action (Copy Content) → Execute → Close modal (200ms delay)
  ├─ Immediate Action (Share)        → Execute → Close modal (200ms delay)
  └─ Flow Action (Add to Target)     → Target Type (Step 2) → Action (Step 3) → Target Selection (Step 4)
```

**Back Button Navigation:**

The modal automatically adds a back button to Steps 2-4 when `actionMenuItems` is provided, allowing users to return to the main menu.

**Key Principles:**

1. **Distinguish immediate vs flow actions**
   - `type: 'immediate'`: Execute `onClick`, show success state, close modal after 200ms
   - `type: 'flow'`: Transition to target selection flow (no `onClick` needed)

2. **Dynamic labels for feedback**
   - Use state variables to show success states: `'Path Copied ✓'`
   - Apply `iconClassName: 'text-green-500'` for visual confirmation

3. **Stop propagation on click**
   - Use `e.stopPropagation()` to prevent card/file click events

4. **One modal per component**
   - Replace context menu entirely, don't mix both approaches

5. **Mobile-first design**
   - Modals work better on touch devices than hover-based context menus
   - All actions equally accessible regardless of input method

**Migration from Context Menu:**

```typescript
// OLD Pattern (context menu + modal)
const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
const [modalOpen, setModalOpen] = useState(false);

const menuItems: ContextMenuItem[] = [
  { label: 'Copy Path', onClick: handleCopyPath },
  { label: 'Add to Target', onClick: () => { setContextMenu(null); setModalOpen(true); } },
];

// NEW Pattern (modal only)
const [modalOpen, setModalOpen] = useState(false);

const actionMenuItems: ActionMenuItem[] = [
  { id: 'copy_path', label: 'Copy Path', icon: FolderTree, type: 'immediate', onClick: handleCopyPath },
  { id: 'add_to_target', label: 'Add to Target', icon: LayoutGrid, type: 'flow' },
];
```

**Examples:**

- **StubCard**: Copy Path, Copy Content, Share, Add to Target
- **WorkorderCard**: Copy Path, Copy Content, Share, Add to Target
- **FileTreeNode (files only)**: Copy Path, Add to Favorites, Add to Prompt, Add to Target
  - *Note: Directories still use context menu for Rename/Move/Delete*

**Workorder Reference:**

- **WO-UNIFIED-ACTION-MODAL-001**: Complete implementation details
- Location: `coderef/workorder/WO-UNIFIED-ACTION-MODAL-001/`

---

## Anti-Patterns (Avoid These)

### ❌ Manual Menu Building in useEffect

```typescript
// BAD: Async menu building on every render
useEffect(() => {
  const buildMenu = async () => {
    const boards = await fetchBoards();
    const items = boards.map(board => ({
      label: board.name,
      submenu: await buildSubmenu(board)  // Nested async!
    }));
    setMenuItems(items);
  };
  if (contextMenu) buildMenu();
}, [contextMenu]);
```

```typescript
// GOOD: Static menu items, modal for complex selection
const menuItems = [
  { label: 'Copy', onClick: handleCopy },
  { label: 'Add to Target', onClick: () => setModalOpen(true) }
];
```

### ❌ Direct API Calls Instead of Adapters

```typescript
// BAD: Direct fetch in component
const response = await fetch('/api/boards');
const boards = await response.json();
```

```typescript
// GOOD: Use adapter
const boards = await BoardTargetAdapter.fetchTargets();
```

### ❌ Manual Entity Transformation

```typescript
// BAD: Manual field mapping
const boardData = {
  name: stub.title || stub.feature_name,
  createdAt: new Date().toISOString(),
  // ... 20 more lines
};
```

```typescript
// GOOD: Use converter
const boardData = stubToBoard.convert(stub, 'board');
```

### ❌ Nested Hover Menus

```typescript
// BAD: 4-level nested hover menus
<ContextMenu>
  <MenuItem submenu={
    <MenuItem submenu={
      <MenuItem submenu={...} />
    }>
  }>
</ContextMenu>
```

```typescript
// GOOD: Modal with clear steps
<UniversalEntityActionModal
  // Handles all nesting internally
/>
```

---

## Quick Reference Checklist

### Adding "Add to Target" to a New Component

- [ ] Import `UniversalEntityActionModal`
- [ ] Add `modalOpen` state
- [ ] Add "Add to Target" to context menu
- [ ] Close context menu before opening modal
- [ ] Set `availableTargets` appropriate for entity
- [ ] Handle `onSuccess` with toast notification
- [ ] Handle `onError` with toast notification
- [ ] Log results to console for debugging

### Creating a New Target Adapter

- [ ] Implement `TargetAdapter<TTarget>` interface
- [ ] Implement `fetchTargets()` method
- [ ] Implement `fetchItems(targetId)` method
- [ ] Implement `getMenuStructure()` method
- [ ] Implement `addToTarget()` method with all actions
- [ ] Define `loadingStates` and `emptyStates`
- [ ] Export singleton instance
- [ ] Add to `UniversalEntityActionModal` targetConfigs

### Creating a New Entity Converter

- [ ] Implement `EntityConverter<TEntity, TTarget>` interface
- [ ] Implement `convert(entity, targetType)` method
- [ ] Support all target types ('board', 'list', 'card', etc.)
- [ ] Return partial data (adapter completes it)
- [ ] Export singleton instance
- [ ] Add to modal's `getConverter()` logic

---

## Testing Guidelines

### Manual Testing Flow

1. **Right-click entity** → Context menu appears
2. **Click "Add to Target"** → Modal opens
3. **Select target type** → Actions appear
4. **Select action** → Target picker appears (if needed)
5. **Select target** → Enable "Add" button
6. **Click "Add"** → Loading toast appears
7. **Operation completes** → Success toast appears
8. **Modal closes** → Back to normal view

### Common Issues

**Modal doesn't open:**
- Check `modalOpen` state updates correctly
- Verify context menu closes before modal opens
- Check z-index conflicts

**Targets don't load:**
- Check adapter `fetchTargets()` returns array
- Verify API endpoint returns correct format
- Check console for errors

**Toast doesn't appear:**
- Ensure `toast.success()` called with message
- Check Sonner provider in layout
- Verify toast ID for updates

---

**Last Updated:** 2026-01-23
**Version:** 1.1.0
**Maintained by:** CodeRef Team

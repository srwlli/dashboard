---
agent: claude_sonnet_4_5
date: "2026-01-19"
task: DOCUMENT
subject: ProjectBoards
parent_project: coderef-dashboard
category: component
version: "1.3.0"
related_files:
  - packages/dashboard/src/types/boards.ts
  - packages/dashboard/src/components/boards/BoardCanvas.tsx
  - packages/dashboard/src/components/boards/BoardList.tsx
  - packages/dashboard/src/components/boards/BoardCard.tsx
  - packages/dashboard/src/components/boards/BoardPicker.tsx
  - packages/dashboard/src/components/boards/CardEditor.tsx
  - packages/dashboard/src/components/boards/AttachmentPicker.tsx
  - packages/dashboard/src/components/boards/BoardCreationModal.tsx
  - packages/dashboard/src/app/api/boards/route.ts
  - packages/dashboard/src/app/api/boards/[id]/lists/[listId]/reorder/route.ts
  - packages/dashboard/src/app/boards/page.tsx
  - packages/dashboard/src/app/boards-standalone/page.tsx
  - packages/dashboard/src/app/list-standalone/page.tsx
  - packages/electron-app/src/main.ts
  - packages/electron-app/src/preload.ts
status: APPROVED
---

# Project-Boards — Authoritative Documentation

## Executive Summary

ProjectBoards is a Trello-like kanban board system integrated into the coderef-dashboard application. It provides drag-and-drop task management with boards, lists, and cards, supporting rich content including markdown descriptions, tags, and file/folder/URL attachments. The system uses filesystem-based persistence (`~/.coderef-dashboard/boards/`) and supports both standalone boards and boards linked to projects or directories. This document serves as the authoritative reference for developers maintaining, extending, or integrating with the boards system.

## Audience & Intent

- **Markdown (this document):** Architectural truth for state ownership, data persistence, component hierarchy, API contracts, and integration points. Source of truth for business logic and system behavior.
- **TypeScript/Code:** Runtime implementation and compile-time type contracts. Defines actual data structures and execution flow.
- **JSON (board.json, cards/*.json):** Persistent storage schema. Authoritative for saved board state on disk.
- **API Responses:** Runtime data transfer contracts validated against TypeScript interfaces.

**Hierarchy of Authority:**
1. This document defines WHAT and WHY
2. TypeScript types define HOW (implementation)
3. Filesystem JSON defines CURRENT STATE (runtime data)

---

## 1. Architecture Overview

### 1.1 System Role

ProjectBoards is a feature module within coderef-dashboard that provides visual task management. It operates independently from other dashboard features (notes, sessions, scanner) and maintains its own persistence layer.

### 1.2 Component Hierarchy

```
BoardCanvas (Container)
├── BoardPicker (Header - Board Selection)
├── Create List Modal (Inline)
└── DndContext (Drag & Drop Provider)
    └── BoardList[] (Columns)
        ├── ListHeader (Title, Collapse, Menu)
        ├── DroppableZone
        │   └── BoardCard[] (Draggable Tasks)
        │       ├── CardTitle
        │       ├── CardDescription (truncated)
        │       ├── Tags[]
        │       └── AttachmentCount
        └── Add Card Button
            └── CardEditor Modal
                ├── Title Input
                ├── Description Textarea (markdown)
                ├── TagsInput
                └── AttachmentPicker
                    ├── Type Selector (file/folder/url)
                    ├── Path/URL Input
                    └── Attachment List
```

### 1.3 Data Flow Architecture

```
User Action (UI)
    ↓
Component Handler (React state update)
    ↓
API Route Handler (Next.js /api/boards/*)
    ↓
Filesystem Operations (read/write JSON)
    ↓
~/.coderef-dashboard/boards/
    ├── board-{id}/
    │   ├── board.json (board + lists metadata)
    │   └── cards/
    │       ├── {listId}.json (cards array)
    │       └── ...
    └── ...
    ↓
API Response (success/error)
    ↓
Component Re-fetch (optimistic UI update)
    ↓
UI Render (updated state)
```

### 1.4 Key Integration Points

| Integration | Direction | Contract | Purpose |
|-------------|-----------|----------|---------|
| RootClientWrapper | Inbound | STANDALONE_ROUTES array | Layout exclusion for `/boards-standalone` |
| Electron IPC | Outbound | `window.electronAPI.openBoardWindow()` | New window support |
| Projects Context | Inbound | `useProjects()` hook | Project linking in board creation |
| @dnd-kit | Inbound | DndContext, useDraggable, useDroppable | Drag & drop functionality |
| Next.js API Routes | Bidirectional | REST API (GET/POST/PATCH/DELETE) | CRUD operations |
| Filesystem | Outbound | Node.js fs/promises | Data persistence |

---

## 2. State Ownership & Source of Truth (Canonical)

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| `board` (metadata + lists) | BoardCanvas | Domain | board.json | Filesystem |
| `cards` (Record<listId, BoardCard[]>) | BoardCanvas | Domain | cards/{listId}.json | Filesystem |
| `selectedBoardId` | BoardCanvas / BoardPicker | UI | localStorage (future) | React state |
| `showCardEditor` | BoardList | UI | None | React state |
| `editingCard` | BoardList | UI | None | React state |
| `showCreateListModal` | BoardCanvas | UI | None | React state |
| `newListTitle` | BoardCanvas | UI | None | React state |
| `showMenu` | BoardList | UI | None | React state |
| `isDragging` | BoardCard (via @dnd-kit) | UI | None | @dnd-kit internal |
| `isOver` | BoardList (via @dnd-kit) | UI | None | @dnd-kit internal |
| `attachments` | CardEditor | UI | None (persists on save) | React state |
| `tags` | CardEditor | UI | None (persists on save) | React state |

### 2.1 Precedence Rules

1. **Filesystem JSON is always authoritative** for persisted data (boards, lists, cards).
2. **API responses refresh UI state** after mutations (no optimistic updates).
3. **React state is ephemeral** and rebuilt on component mount from API.
4. **No client-side caching** beyond component lifecycle.

### 2.2 State Synchronization

- **Single Source:** Each board lives in exactly one directory (`board-{id}/`).
- **No distributed state:** Multi-window scenarios do not sync automatically.
- **Refresh on focus:** Future enhancement (not implemented).

---

## 3. Data Persistence

### 3.1 Storage Location

**Base Directory:** `~/.coderef-dashboard/boards/`

**Structure:**
```
~/.coderef-dashboard/boards/
├── board-1234567890-abc/
│   ├── board.json
│   └── cards/
│       ├── list-001.json
│       ├── list-002.json
│       └── ...
└── board-9876543210-xyz/
    ├── board.json
    └── cards/
        └── ...
```

### 3.2 Storage Schemas

#### 3.2.1 board.json
```json
{
  "id": "1234567890-abc",
  "name": "Project Alpha Tasks",
  "projectId": "project-alpha",
  "linkedPath": "/path/to/directory",
  "lists": [
    {
      "id": "list-001",
      "title": "To Do",
      "collapsed": false,
      "order": 0,
      "cardIds": ["card-001", "card-002"],
      "color": "#3b82f6",
      "createdAt": "2026-01-16T12:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-16T12:00:00.000Z",
  "updatedAt": "2026-01-16T14:30:00.000Z"
}
```

**Key Fields:**
- `id`: Board identifier (generated: `${Date.now()}-${randomString}`)
- `projectId`, `linkedPath`: Optional associations (not enforced)
- `lists[]`: Ordered array of list metadata
- `lists[].cardIds`: Array of card IDs in this list (NOT stored in board.json in current impl - see 3.3.1)

#### 3.2.2 cards/{listId}.json
```json
[
  {
    "id": "card-001",
    "listId": "list-001",
    "title": "Implement feature X",
    "description": "## Requirements\n- Bullet 1\n- Bullet 2",
    "order": 0,
    "attachments": [
      {
        "id": "att-001",
        "type": "file",
        "path": "/path/to/file.txt",
        "displayName": "Requirements Doc",
        "addedAt": "2026-01-16T13:00:00.000Z"
      }
    ],
    "tags": ["backend", "urgent"],
    "createdAt": "2026-01-16T12:30:00.000Z",
    "updatedAt": "2026-01-16T13:00:00.000Z"
  }
]
```

**Key Fields:**
- `listId`: Parent list reference
- `attachments`: Array of file/folder/URL references (no file uploads)
- `order`: Position within list (0-indexed)

### 3.3 Persistence Contracts

#### 3.3.1 Known Schema Inconsistency

**CRITICAL:** The `BoardList` interface defines `cardIds: string[]`, but the current implementation **does not populate or use this field**. Cards are organized by filesystem structure (`cards/{listId}.json`) instead.

**Actual Behavior:**
- Lists in `board.json` have `cardIds: []` (always empty)
- Cards are retrieved by reading `cards/{listId}.json`
- `listId` field on card is the source of truth

**Future Refactor:** Consider removing `cardIds` from interface or implementing dual storage.

#### 3.3.2 Versioning Strategy

**Current:** No versioning. Schema changes require manual migration.

**Future:** Add `schemaVersion` field to `board.json` for backwards compatibility.

#### 3.3.3 Failure Modes & Recovery

| Failure | Symptom | Recovery |
|---------|---------|----------|
| Missing board.json | API 404 error | User must recreate board |
| Corrupted board.json | API 500 error | Manual fix or delete directory |
| Missing cards/{listId}.json | Empty list (no error) | Treated as 0 cards |
| Disk full | API 500 on write | User must free space |
| Permission denied | API 500 on read/write | User must fix permissions |

**No automatic recovery:** System assumes filesystem is authoritative and does not attempt repairs.

### 3.4 Cross-Tab / Multi-Client Sync

**Current:** Not supported. Multiple tabs/windows editing the same board can cause data loss (last write wins).

**Mitigation:** Use "New Window" feature to open fresh instances, but avoid concurrent edits.

**Future:** Implement filesystem watchers or polling for change detection.

---

## 4. State Lifecycle

### 4.1 Board Lifecycle

```
1. Creation
   ├── User clicks "Create New Board" in BoardPicker
   ├── BoardCreationModal captures name, projectId, linkedPath
   ├── POST /api/boards
   ├── Backend creates board-{id}/ directory
   ├── Writes board.json with empty lists[]
   └── Returns boardId to frontend

2. Initialization
   ├── User selects board in BoardPicker
   ├── BoardCanvas receives boardId prop
   ├── useEffect triggers fetchBoard()
   ├── GET /api/boards/{id}
   ├── Backend reads board.json + all cards/*.json
   └── Returns { board, cards: Record<listId, BoardCard[]> }

3. Runtime Updates
   ├── User action (create list, edit card, drag card)
   ├── Component calls onUpdate* handler
   ├── Handler sends API request (POST/PATCH/DELETE)
   ├── Backend updates filesystem
   ├── API returns success
   └── Frontend calls fetchBoard() to refresh

4. Deletion
   ├── User clicks "Delete Board" (future feature)
   ├── DELETE /api/boards/{id}
   ├── Backend deletes board-{id}/ directory recursively
   └── Frontend redirects to board selection
```

### 4.2 Card Lifecycle

```
1. Creation
   ├── User clicks "Add card" in BoardList
   ├── CardEditor opens with listId
   ├── User enters title, description, tags, attachments
   ├── onSave calls onCreateCard({ listId, title, ... })
   ├── POST /api/boards/{id}/lists/{listId}/cards
   ├── Backend generates cardId, writes to cards/{listId}.json
   ├── Updates board.updatedAt timestamp
   └── Returns { card }

2. Editing
   ├── User clicks card (BoardCard component)
   ├── CardEditor opens with existing card data
   ├── User modifies fields
   ├── onSave calls onUpdateCard(cardId, updates)
   ├── PATCH /api/boards/{id}/lists/{listId}/cards/{cardId}
   ├── Backend updates card in cards/{listId}.json
   └── Returns { card, updated: true }

3. Moving (Drag & Drop)
   ├── User drags card to different list
   ├── onDragEnd handler detects new listId
   ├── Calls onUpdateCard(cardId, { listId: newListId })
   ├── Backend removes card from old list JSON
   ├── Adds card to new list JSON
   └── Updates both files atomically

4. Deletion
   ├── User clicks X button (hover state)
   ├── Confirmation dialog (native confirm)
   ├── onDelete handler called
   ├── DELETE /api/boards/{id}/lists/{listId}/cards/{cardId}
   ├── Backend removes card from cards/{listId}.json
   └── Returns { deleted: true }
```

### 4.3 Hydration & Validation

**No validation layer:** API trusts input and writes directly to filesystem.

**Future:** Add JSON schema validation via Zod or Ajv before persistence.

---

## 5. API Endpoints

### 5.1 Dynamic Route Patterns

**Note:** Next.js uses `[id]` bracket notation for dynamic routes. The following API endpoints are implemented as:
- `/api/boards/[id]/route.ts` - handles board-specific operations
- `/api/boards/[id]/lists/route.ts` - handles list creation
- `/api/boards/[id]/lists/[listId]/route.ts` - handles list operations
- `/api/boards/[id]/lists/[listId]/cards/route.ts` - handles card creation
- `/api/boards/[id]/lists/[listId]/cards/[cardId]/route.ts` - handles card operations

### 5.2 Board Operations

| Endpoint | Method | Request Body | Response | Description |
|----------|--------|--------------|----------|-------------|
| `/api/boards` | GET | None | `{ success: true, data: { boards: BoardMetadata[] } }` | List all boards with metadata |
| `/api/boards` | POST | `CreateBoardRequest` | `{ success: true, data: { board: Board } }` | Create new board |
| `/api/boards/{id}` | GET | None | `{ success: true, data: BoardDetailResponse }` | Get board with all cards |
| `/api/boards/{id}` | PATCH | `UpdateBoardRequest` | `{ success: true, data: { board: Board } }` | Update board metadata |
| `/api/boards/{id}` | DELETE | None | `{ success: true, data: { deleted: true } }` | Delete board and all data |

### 5.3 List Operations

| Endpoint | Method | Request Body | Response | Description |
|----------|--------|--------------|----------|-------------|
| `/api/boards/{id}/lists` | POST | `CreateListRequest` | `{ success: true, data: { list: BoardList } }` | Create new list |
| `/api/boards/{id}/lists/{listId}` | PATCH | `UpdateListRequest` | `{ success: true, data: { list: BoardList } }` | Update list properties |
| `/api/boards/{id}/lists/{listId}` | DELETE | None | `{ success: true, data: { deleted: true } }` | Delete list and cards file |

### 5.4 Card Operations

| Endpoint | Method | Request Body | Response | Description |
|----------|--------|--------------|----------|-------------|
| `/api/boards/{id}/lists/{listId}/cards` | POST | `CreateCardRequest` | `{ success: true, data: { card: BoardCard } }` | Create new card |
| `/api/boards/{id}/lists/{listId}/cards/{cardId}` | PATCH | `UpdateCardRequest` | `{ success: true, data: { card: BoardCard } }` | Update card or move to new list |
| `/api/boards/{id}/lists/{listId}/cards/{cardId}` | DELETE | None | `{ success: true, data: { deleted: true } }` | Delete card |

### 5.5 API Error Responses

```json
{
  "success": false,
  "error": {
    "code": "BOARD_NOT_FOUND",
    "message": "Board with ID '...' not found"
  },
  "context": {
    "boardId": "..."
  }
}
```

**Common Error Codes:**
- `BOARD_NOT_FOUND` (404)
- `LIST_NOT_FOUND` (404)
- `CARD_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `INTERNAL_ERROR` (500)

### 5.6 Next.js 15+ Breaking Change

**CRITICAL:** All dynamic route handlers must await `params`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST await
  // ...
}
```

**Reason:** Next.js 15+ changed params from object to Promise. Missing `await` causes 404 errors.

---

## 6. Dependencies

### 6.1 Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| next | ^16.0.0 | App framework, API routes |
| @dnd-kit/core | latest | Drag & drop core |
| @dnd-kit/sortable | latest | Sortable items |
| @dnd-kit/utilities | latest | Drag utilities |
| lucide-react | latest | UI icons |

### 6.2 Peer Dependencies

| Package | Purpose |
|---------|---------|
| tailwindcss | Styling system |
| typescript | Type safety |

---

## 7. Usage

### 7.1 Basic Usage

```typescript
// Access boards from dashboard
import { BoardCanvas } from '@/components/boards/BoardCanvas';

export default function AssistantPage() {
  const [selectedBoardId, setSelectedBoardId] = useState('');

  return (
    <div>
      <BoardPicker
        onSelectBoard={setSelectedBoardId}
        selectedBoardId={selectedBoardId}
      />
      {selectedBoardId && (
        <BoardCanvas boardId={selectedBoardId} />
      )}
    </div>
  );
}
```

### 7.2 Standalone Window

```typescript
// Open board in new window
function handleOpenNewWindow(boardId: string) {
  if (
    typeof window !== 'undefined' &&
    (window as any).electronAPI &&
    typeof (window as any).electronAPI.openBoardWindow === 'function'
  ) {
    // Electron mode
    (window as any).electronAPI.openBoardWindow(boardId);
  } else {
    // Web fallback
    window.open(`/boards-standalone?boardId=${boardId}`, '_blank');
  }
}
```

### 7.3 Suspense Wrapper (Hydration Flash Fix)

The `/boards-standalone` route uses a Suspense boundary to prevent hydration mismatches from `useSearchParams()`:

```typescript
import { Suspense } from 'react';

function BoardsStandaloneContent() {
  const searchParams = useSearchParams(); // Client-side hook
  // ... component logic
}

export default function BoardsStandalonePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BoardsStandaloneContent />
    </Suspense>
  );
}
```

**Why**: Without Suspense, `useSearchParams()` causes a brief flash of the global layout (sidebar/header) during hydration. The Suspense boundary ensures the route renders cleanly without layout flicker.

### 7.4 List Standalone View

The `/list-standalone` route provides true isolation for individual lists, enabling focus mode and multi-monitor workflows:

```typescript
// Open list in new window
function handleOpenListWindow(boardId: string, listId: string) {
  if (
    typeof window !== 'undefined' &&
    (window as any).electronAPI &&
    typeof (window as any).electronAPI.openListWindow === 'function'
  ) {
    // Electron mode
    (window as any).electronAPI.openListWindow(boardId, listId);
  } else {
    // Web fallback
    window.open(`/list-standalone?boardId=${boardId}&listId=${listId}`, '_blank');
  }
}
```

**Key Features:**
- **Isolated View**: Only the selected list is visible, no other lists or global nav
- **Card Movement Dropdown**: Since drag & drop between lists isn't available in isolated view, CardEditor includes a "Move to List" dropdown when `boardLists` prop is provided
- **Breadcrumb Header**: Shows "Board Name › List Title" for context
- **Full CRUD Operations**: All card operations (create, edit, delete, move) work normally

**Implementation Details:**
- Route: `/list-standalone?boardId=X&listId=Y`
- Uses same Suspense wrapper pattern as boards-standalone
- Passes `board.lists` to BoardList component to enable card movement dropdown
- Menu item available in BoardList header dropdown (MoreVertical menu)

**Card Movement:**
When `boardLists` is provided to CardEditor, a "Move to List" dropdown appears between tags and attachments sections. When a card is saved with a different `targetListId`, the update includes `listId` in the request.

---

## 8. Testing

### 8.1 Must-Cover Scenarios

**Unit Tests (Not Implemented):**
- Card move between lists updates both JSON files
- Board creation generates unique IDs
- Attachment validation (URL format, path existence)

**Integration Tests (Not Implemented):**
- Full CRUD cycle for board → list → card
- Drag & drop updates filesystem correctly
- Concurrent edits (race condition testing)

**Manual Tests (Completed):**
- ✅ Create/edit/delete boards, lists, cards
- ✅ Drag cards between lists
- ✅ Add attachments (file/folder/URL)
- ✅ Add/remove tags
- ✅ Collapse/expand lists
- ✅ Mobile responsive behavior
- ✅ New window functionality (Electron + web fallback)

### 8.2 Explicitly Not Tested

- **File system failures:** No tests for disk full, permission denied, corrupted JSON
- **Concurrent writes:** No tests for multi-tab editing conflicts
- **Large datasets:** No performance tests for 100+ boards or 500+ cards
- **Browser compatibility:** Only tested on Chrome/Edge (Chromium-based)

---

## 9. Performance Considerations

### 9.1 Known Limits

| Metric | Tested Threshold | Behavior | Mitigation |
|--------|------------------|----------|------------|
| Boards per user | Not tested | Unknown | Future: pagination in BoardPicker |
| Lists per board | 10-20 | Horizontal scroll works well | None needed |
| Cards per list | 50+ | Noticeable lag in drag operations | Future: virtualize card list |
| Attachments per card | 10+ | UI truncates, no perf impact | None needed |
| Tags per card | 5+ | UI wraps, no perf impact | None needed |

### 9.2 Bottlenecks

1. **fetchBoard() after every mutation:** Fetches entire board + all cards. For large boards (50+ cards), this is slow (500ms+).
2. **No caching:** Every tab switch re-fetches from disk.
3. **Synchronous JSON parsing:** Large board.json files (1MB+) block main thread.

---

## 10. Accessibility

### 10.1 Current Gaps

| Issue | Severity | Component | Impact |
|-------|----------|-----------|--------|
| No keyboard navigation for drag & drop | CRITICAL | BoardCard | Keyboard users cannot reorder cards |
| Missing ARIA labels on icon buttons | MAJOR | BoardList, CardEditor | Screen readers announce "button" with no context |
| No focus management in modals | MAJOR | CardEditor, BoardCreationModal | Focus returns to body on open, not trapped |
| Low contrast on muted text | MINOR | All components | `text-ind-text-muted` may fail WCAG AA |
| No skip links | MINOR | BoardCanvas | Keyboard users must tab through all lists |

---

## 11. Non-Goals / Out of Scope

1. **Real-time collaboration:** No operational transforms, CRDTs, or WebSocket sync
2. **File uploads:** Attachments are references only
3. **Rich text editor:** Description uses plain textarea, not WYSIWYG
4. **Board templates:** No predefined structures
5. **Activity history:** No audit log
6. **Permissions:** No access control
7. **Search:** No full-text search across cards
8. **Calendar view:** No date-based visualization
9. **Swimlanes:** No horizontal grouping within lists
10. **Card dependencies:** No linking between cards

---

## 12. Common Pitfalls & Sharp Edges

### 12.1 Integration Gotchas

1. **RootClientWrapper must include `/boards-standalone` and `/list-standalone`** in STANDALONE_ROUTES
2. **Electron IPC methods `openBoardWindow` and `openListWindow` must exist** or fallback fails
3. **BoardPicker re-fetches boards on every open** - no caching
4. **Suspense wrapper required for `/boards-standalone` and `/list-standalone`** to prevent hydration flash
5. **CardEditor requires `boardLists` prop** for card movement dropdown in list-standalone view

### 12.2 Configuration Mistakes

1. **Using relative paths for `linkedPath`:** Must be absolute paths
2. **Assuming `cardIds` is populated:** It's not
3. **Editing board.json manually:** Changes may be overwritten by API

### 12.3 Edge Cases

1. **Empty board name:** API accepts it
2. **Deleting list with cards:** No warning
3. **Attachments with invalid paths:** No validation
4. **Very long board names:** UI truncates
5. **Duplicate tag names:** Allowed

---

## 13. Changelog

### Version 1.3.0 (2026-01-19)

**Card Reordering Fix - Atomic Batch Updates:**
- Fixed critical bug where cards wouldn't stay in position after dragging within a list
- Root cause: Duplicate order values from race conditions in parallel API updates
- Created new batch reorder API endpoint: `POST /api/boards/[id]/lists/[listId]/reorder`
- Single atomic file write prevents race conditions
- Automatic validation and sequential reindexing (0, 1, 2, 3...)
- Updated BoardCanvas.tsx to use batch endpoint instead of individual PATCH calls

**Optimistic Updates - Zero Flash on Card Movement:**
- Implemented optimistic UI updates for card reordering
- Cards update instantly in local state before API call completes
- Eliminated flash/re-render that occurred after drag operations
- Automatic rollback to original state on API failure
- Smooth, native-app-like drag experience

**Board Management UI:**
- Added three-dot menu (⋮) button in board header
- "Rename Board" option with inline editing
  - Click to edit board name directly in header
  - Save with Enter key or Save button
  - Cancel with Escape key or Cancel button
  - Updates via PATCH /api/boards/[id]
- "Delete Board" option with confirmation dialog
  - Confirmation prevents accidental deletion
  - Permanently removes board and all data
  - Redirects to /boards page after deletion
  - Uses DELETE /api/boards/[id]
- Professional inline editing experience with keyboard shortcuts

**Board Selection Persistence:**
- Added localStorage persistence for selected board
- Key: `'coderef-dashboard-selected-board'`
- Last selected board persists across page refreshes
- Last selected board persists when navigating away and returning
- Last selected board persists across browser sessions
- SSR-safe with typeof window check
- Follows existing codebase patterns (ThemeContext, AccentColorContext)

**Enhanced API Routes:**
- All API routes now sort cards by order field for consistent ordering
- Added reindex validation to single-card PATCH route as safety net
- Prevents duplicate order values from any code path

**Migration from useDraggable to useSortable:**
- BoardCard.tsx: Changed to useSortable hook for proper within-list sorting
- BoardList.tsx: Added SortableContext wrapper with verticalListSortingStrategy
- Enables proper vertical reordering with @dnd-kit/sortable

**Files Modified:**
- packages/dashboard/src/components/boards/BoardCanvas.tsx
- packages/dashboard/src/components/boards/BoardCard.tsx
- packages/dashboard/src/components/boards/BoardList.tsx
- packages/dashboard/src/app/api/boards/[id]/lists/[listId]/reorder/route.ts (new)
- packages/dashboard/src/app/api/boards/[id]/lists/[listId]/cards/[cardId]/route.ts
- packages/dashboard/src/app/api/boards/[id]/lists/[listId]/cards/route.ts
- packages/dashboard/src/app/api/boards/[id]/route.ts
- packages/dashboard/src/app/boards/page.tsx

**Breaking Changes:** None

**Performance Improvements:**
- Single batch API call instead of N parallel calls for card reordering
- Zero unnecessary re-renders during drag operations
- Faster perceived performance with optimistic updates

### Version 1.2.0 (2026-01-17)

**List Standalone View (WO-LIST-STANDALONE-VIEW-001):**
- New `/list-standalone` route for opening individual lists in isolated windows
- Enables true focus mode and multi-monitor workflows
- Accepts `boardId` and `listId` query parameters
- Shows breadcrumb header: "Board Name › List Title"
- Excludes global layout (no sidebar/header) via STANDALONE_ROUTES

**Card Movement Dropdown:**
- Added "Move to List" dropdown to CardEditor component
- Appears when `boardLists` prop is provided
- Located between tags and attachments sections
- Enables card movement when drag & drop is not available
- Shows "(current)" indicator next to current list

**Integration Points:**
- Added `boardId` and `boardLists` props to BoardListProps interface
- Added `boardLists` prop to CardEditorProps interface
- list-standalone page passes `board.lists` to BoardList component
- BoardList passes `boardLists` to CardEditor component
- BoardList header dropdown includes "Open in New Window" menu item

**Electron Integration:**
- New IPC handler: `window:openList(boardId, listId)`
- Exposed `openListWindow()` method in preload.ts
- Window dimensions: 800x900 (min: 600x700)

**Files Modified:**
- packages/dashboard/src/app/list-standalone/page.tsx (new)
- packages/dashboard/src/components/RootClientWrapper.tsx
- packages/dashboard/src/components/boards/BoardList.tsx
- packages/dashboard/src/components/boards/CardEditor.tsx
- packages/dashboard/src/types/boards.ts
- packages/electron-app/src/main.ts
- packages/electron-app/src/preload.ts

**Breaking Changes:** None

### Version 1.1.0 (2026-01-17)

**Route Rename: `/assistant` → `/boards`**
- Renamed primary route from `/assistant` to `/boards` for semantic clarity
- Renamed standalone route from `/assistant-standalone` to `/boards-standalone`
- Updated navigation labels in Sidebar, MobileNav, and Header components
- Updated RootClientWrapper STANDALONE_ROUTES array

**Electron IPC Refactor:**
- Renamed IPC handler: `window:openAssistant` → `window:openBoard`
- Renamed API method: `openAssistantWindow()` → `openBoardWindow()`
- Updated TypeScript definitions in preload.ts
- Updated BoardCanvas component to use new method names

**Hydration Flash Fix:**
- Wrapped `/boards-standalone` in React Suspense boundary
- Prevents flash of global layout during `useSearchParams()` hydration
- Added loading spinner fallback for clean initial render

**Backward Compatibility:**
- Created redirect at `/assistant` → `/boards`
- Created redirect at `/assistant-standalone` → `/boards-standalone` (preserves boardId param)
- Old bookmarks and Electron windows continue to work

**Breaking Changes:** None (redirects maintain compatibility)

### Version 1.2.0 (2026-01-19) - WO-FILE-BOARD-CTX-001

**Add from Explorer Feature:**

Users can now add files from Explorer to Project Boards via right-click context menu with 3-5 level nested navigation.

**4 Action Types:**
1. **Add as New Board** - Creates board → initial list ("To Do") → initial card with file attachment
2. **Add as New List** - Creates list in selected board → optional initial card
3. **Add as New Card** - Creates card in selected list with file attachment
4. **Add to Existing Card** - Attaches file to existing card (prevents duplicates)

**Key Features:**
- Lazy-loaded board/list/card pickers (30s cache TTL)
- Automatic file metadata extraction (path → title, extension → tags, file → attachment)
- Smart defaults: Board name = filename, List title = "To Do", Tags = [extension]
- Duplicate detection when attaching to existing cards
- Success/error feedback via alerts

**Implementation Files:**
- AddFileToBoardMenu.tsx (486 lines, 3-5 level nested menu)
- file-to-board-helpers.ts (270 lines)
- useBoards.ts (121 lines, 30s cache)
- useBoardHierarchy.ts (191 lines, lazy-load)
- FileTreeNode.tsx integration (+61 lines)

**Test Coverage:** 46 unit tests (39 helpers + 7 hooks) ✅

**Resource Sheet:** `coderef/resources-sheets/features/Add-File-To-Board-RESOURCE-SHEET.md`

**Breaking Changes:** None

### Version 1.0.0 (2026-01-16)

**Initial Release:**
- Complete Trello-like kanban board system
- Drag & drop with @dnd-kit
- Filesystem-based persistence
- Electron new window support
- Mobile responsive design
- Rich content (markdown, tags, attachments)

---

## Conclusion

This document defines the authoritative specification for the ProjectBoards feature in coderef-dashboard. It covers architectural design, state management, persistence contracts, API endpoints, performance characteristics, and known limitations. Developers must consult this document before making architectural changes to ensure refactor safety and maintain system integrity.

**Maintenance Expectations:**
- Update this document when adding new features or changing behavior
- Mark deprecated sections with `⚠️ DEPRECATED` headers
- Increment version number for breaking changes
- Archive old behavior in appendices if needed

**Last Updated:** 2026-01-19 by Claude Sonnet 4.5

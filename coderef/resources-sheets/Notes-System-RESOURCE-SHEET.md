---
agent: claude_sonnet_4_5
date: "2026-01-14"
task: DOCUMENT
subject: Notes System
parent_project: coderef-dashboard
category: system
version: "1.0.0"
related_files:
  - packages/dashboard/src/app/api/coderef/notes/route.ts
  - packages/dashboard/src/app/api/coderef/file/route.ts
  - packages/dashboard/src/widgets/notes/NotesWidget.tsx
  - packages/dashboard/src/widgets/notes/hooks/useNotepadTabs.ts
  - packages/dashboard/src/widgets/notes/components/MenuBar.tsx
  - packages/dashboard/src/widgets/notes/components/TabBar.tsx
  - packages/dashboard/src/app/notes/page.tsx
status: APPROVED
---

# Notes System — Authoritative Documentation

## Executive Summary

The Notes System is a **production-ready multi-tab text editor** integrated into CodeRef Dashboard, providing Microsoft Notepad-style functionality for creating, editing, and managing text files within project directories. The system consists of two API routes (`/api/coderef/notes` for listing, `/api/coderef/file` for read/write operations), a comprehensive NotesWidget component with full keyboard shortcut support, and per-project file storage in `coderef/notes/` directories. The system supports 30+ file extensions, cross-platform operation (Electron + Web), syntax highlighting, edit/preview modes, and robust security validation.

## Audience & Intent

- **Markdown (this document):** Defines system architecture, API contracts, component hierarchy, and integration patterns
- **TypeScript/Code:** Runtime implementation of API routes, React components, and state management hooks
- **Developers:** Authoritative reference for understanding notes functionality and extending the system

## 1. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   /notes Page                       │
│                  (Route Handler)                    │
│            packages/dashboard/src/app/              │
│                notes/page.tsx                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              NotesWidget Component                  │
│         (Multi-tab Notepad Clone Editor)           │
│  ┌─────────────────────────────────────────────┐  │
│  │ MenuBar (File/Edit menus)                   │  │
│  ├─────────────────────────────────────────────┤  │
│  │ TabBar (Multi-tab interface)                │  │
│  ├─────────────────────────────────────────────┤  │
│  │ Preview Toggle (Edit/Preview mode)          │  │
│  ├─────────────────────────────────────────────┤  │
│  │ Editor Area                                 │  │
│  │ - Textarea (edit mode)                      │  │
│  │ - SyntaxHighlighter (preview mode)          │  │
│  ├─────────────────────────────────────────────┤  │
│  │ StatusBar (path, unsaved, line/char count)  │  │
│  └─────────────────────────────────────────────┘  │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  GET /api/coderef/   │   │  GET /api/coderef/file   │
│       notes          │   │  PUT /api/coderef/file   │
│  (List notes)        │   │  DELETE /api/coderef/    │
│  172 lines           │   │         file             │
│                      │   │  (Read/Write/Delete)     │
│                      │   │  890 lines               │
└──────────┬───────────┘   └──────────┬───────────────┘
           │                          │
           └──────────┬───────────────┘
                      ▼
           ┌─────────────────────┐
           │   {projectRoot}/    │
           │   coderef/notes/    │
           │   (File Storage)    │
           │  - *.md, *.txt,     │
           │    *.json files     │
           └─────────────────────┘
```

### Component Hierarchy

```
NotesWidget (Main Container)
├── MenuBar
│   ├── File Menu
│   │   ├── New (Ctrl+N)
│   │   ├── Open (Ctrl+O)
│   │   ├── Save (Ctrl+S)
│   │   ├── Save As (Ctrl+Shift+S)
│   │   └── Close Tab (Ctrl+W)
│   └── Edit Menu
│       ├── Undo (Ctrl+Z)
│       ├── Redo (Ctrl+Y)
│       ├── Cut (Ctrl+X)
│       ├── Copy (Ctrl+C)
│       ├── Paste (Ctrl+V)
│       └── Select All (Ctrl+A)
├── TabBar
│   └── Tab[] (one per open file, closeable)
├── Preview Toggle Bar
│   ├── Edit/Preview mode toggle
│   └── New Window button (Electron only)
├── EditorArea
│   ├── Textarea (edit mode, full keyboard support)
│   └── SyntaxHighlighter (preview mode, read-only)
├── StatusBar
│   ├── File path display
│   ├── File extension badge
│   ├── Unsaved indicator (red dot)
│   └── Line/Character count
└── FilePicker (hidden)
    ├── Open file dialog
    └── Save As dialog
```

## 2. API Routes

### 2.1 GET /api/coderef/notes - Notes List API

**File:** `packages/dashboard/src/app/api/coderef/notes/route.ts` (172 lines)

**Purpose:** Lists all notes in a project's `coderef/notes/` directory

**Request:**
```
GET /api/coderef/notes?projectRoot=<absolute-path>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectRoot` | string | ✅ Yes | Absolute path to project root directory |

**Response Schema:**
```typescript
interface NotesListResponse {
  notes: NoteMetadata[];
  total: number;
  timestamp: string;
}

interface NoteMetadata {
  name: string;        // File name (e.g., "my-note.md")
  path: string;        // Relative path from coderef/notes/
  size: number;        // File size in bytes
  modified: string;    // ISO 8601 timestamp
  extension: string;   // File extension (e.g., ".md")
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "name": "meeting-notes.md",
        "path": "meeting-notes.md",
        "size": 2048,
        "modified": "2026-01-14T10:30:00.000Z",
        "extension": ".md"
      }
    ],
    "total": 1,
    "timestamp": "2026-01-14T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing projectRoot parameter |
| 403 | PERMISSION_DENIED | Cannot access notes directory |
| 500 | INTERNAL_ERROR | Server error |

**Behavior:**
- Returns empty array if `coderef/notes/` directory doesn't exist (graceful ENOENT handling)
- Filters files by extension allowlist: `.md`, `.txt`, `.json`
- Skips hidden files (starting with `.`)
- Skips directories
- Sorts by modified date (newest first)

**Security:**
- Path validation (must be within project root)
- Permission checks (EACCES/EPERM handling)
- Extension allowlist enforcement

---

### 2.2 GET/PUT/DELETE /api/coderef/file - File Operations API

**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (890 lines)

**Purpose:** Read, write, and delete file content with metadata

#### GET - Read File

**Request:**
```
GET /api/coderef/file?path=<absolute-file-path>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ Yes | Absolute file path |

**Response Schema:**
```typescript
interface FileData {
  path: string;           // Absolute file path
  name: string;           // File name
  extension: string;      // File extension
  size: number;           // File size in bytes
  content: string;        // File content (UTF-8 or base64)
  encoding: 'utf-8' | 'base64';  // Content encoding
  mimeType: string;       // MIME type
  lastModified: string;   // ISO 8601 timestamp
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": "C:/projects/my-app/coderef/notes/note.md",
    "name": "note.md",
    "extension": ".md",
    "size": 1024,
    "content": "# My Note\n\nContent here...",
    "encoding": "utf-8",
    "mimeType": "text/markdown",
    "lastModified": "2026-01-14T10:30:00.000Z"
  }
}
```

**Supported Text Extensions (30+):**
- Documents: `.txt`, `.md`, `.json`
- Web: `.html`, `.css`, `.scss`, `.xml`
- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`
- Config: `.yml`, `.yaml`, `.toml`, `.ini`, `.conf`, `.env`
- Shell: `.sh`, `.bash`
- Programming: `.py`, `.rb`, `.java`, `.c`, `.cpp`, `.h`, `.hpp`, `.go`, `.rs`, `.php`
- Other: `.sql`, `.graphql`, `.gitignore`, `.dockerignore`, `.editorconfig`, `.mmd`

#### PUT - Write File

**Request:**
```
PUT /api/coderef/file
Content-Type: application/json

{
  "path": "C:/projects/my-app/coderef/notes/note.md",
  "content": "# My Note\n\nNew content...",
  "encoding": "utf-8"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | ✅ Yes | Absolute file path (must be within `coderef/notes/`) |
| `content` | string | ✅ Yes | File content (UTF-8 text) |
| `encoding` | string | ❌ Optional | Content encoding (default: `utf-8`) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": "C:/projects/my-app/coderef/notes/note.md",
    "name": "note.md",
    "extension": ".md",
    "size": 1024,
    "content": "# My Note\n\nNew content...",
    "encoding": "utf-8",
    "mimeType": "text/markdown",
    "lastModified": "2026-01-14T10:35:00.000Z"
  }
}
```

**Security (PUT):**
- **Path Validation:** Must be within `coderef/notes/` directory (prevents directory traversal)
- **Extension Allowlist:** Only `.md`, `.txt`, `.json` allowed for notes
- **Size Limit:** 1MB maximum (1,048,576 bytes)
- **Directory Creation:** Automatically creates `coderef/notes/` if it doesn't exist
- **Atomic Writes:** Uses Node.js `fs.writeFile` for atomic operations

**Error Responses (PUT):**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing path or content |
| 400 | INVALID_PATH | Path outside coderef/notes/ directory |
| 400 | INVALID_EXTENSION | Extension not in allowlist |
| 400 | FILE_TOO_LARGE | Content exceeds 1MB limit |
| 403 | PERMISSION_DENIED | Cannot write to file |
| 500 | INTERNAL_ERROR | Server error |

#### DELETE - Delete File

**Request:**
```
DELETE /api/coderef/file?path=<absolute-file-path>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": "C:/projects/my-app/coderef/notes/note.md",
    "deleted": true
  }
}
```

**Error Responses (DELETE):**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing path parameter |
| 400 | INVALID_PATH | Path outside coderef/notes/ directory |
| 404 | FILE_NOT_FOUND | File doesn't exist |
| 403 | PERMISSION_DENIED | Cannot delete file |
| 500 | INTERNAL_ERROR | Server error |

---

## 3. UI Components

### 3.1 NotesWidget Component

**File:** `packages/dashboard/src/widgets/notes/NotesWidget.tsx`

**Purpose:** Multi-tab text editor with MS Notepad-style functionality

**Features:**
- ✅ Multi-tab interface (open multiple files simultaneously)
- ✅ File menu (New, Open, Save, Save As, Close Tab)
- ✅ Edit menu (Undo, Redo, Cut, Copy, Paste, Select All)
- ✅ Keyboard shortcuts (Ctrl+N, Ctrl+O, Ctrl+S, etc.)
- ✅ Edit/Preview mode toggle
- ✅ Syntax highlighting (30+ languages via react-syntax-highlighter)
- ✅ Unsaved changes tracking (red dot indicator)
- ✅ Status bar (file path, extension, line/char count)
- ✅ Close confirmation dialog (prevents data loss)
- ✅ Cross-platform (Electron + Web)
- ✅ Auto-save support (via useAutoSave hook)

**State Management:**

```typescript
interface NotepadTab {
  id: string;              // Unique tab ID (UUID)
  title: string;           // File name or "Untitled"
  content: string;         // Current editor content
  filePath: string | null; // Absolute file path (null for unsaved)
  isDirty: boolean;        // Has unsaved changes
  extension: string;       // File extension (for syntax highlighting)
}
```

**Keyboard Shortcuts:**

| Shortcut | Action | Menu |
|----------|--------|------|
| Ctrl+N | New file | File |
| Ctrl+O | Open file | File |
| Ctrl+S | Save | File |
| Ctrl+Shift+S | Save As | File |
| Ctrl+W | Close tab | File |
| Ctrl+Z | Undo | Edit |
| Ctrl+Y | Redo | Edit |
| Ctrl+X | Cut | Edit |
| Ctrl+C | Copy | Edit |
| Ctrl+V | Paste | Edit |
| Ctrl+A | Select All | Edit |
| Ctrl+Shift+P | Toggle Preview | N/A |

### 3.2 Supporting Components

**MenuBar Component**
- **File:** `packages/dashboard/src/widgets/notes/components/MenuBar.tsx`
- **Purpose:** Renders File and Edit dropdown menus
- **Props:** File/Edit action callbacks

**TabBar Component**
- **File:** `packages/dashboard/src/widgets/notes/components/TabBar.tsx`
- **Purpose:** Renders tab list with close buttons
- **Props:** Tabs array, active tab, switch/close callbacks

**FilePicker Component**
- **File:** `packages/dashboard/src/widgets/notes/components/FilePicker.tsx`
- **Purpose:** Platform-aware file open/save dialogs
- **Platform Support:**
  - **Electron:** Native OS dialogs via IPC
  - **Web:** File System Access API (showOpenFilePicker, showSaveFilePicker)

### 3.3 Custom Hooks

**useNotepadTabs Hook**
- **File:** `packages/dashboard/src/widgets/notes/hooks/useNotepadTabs.ts`
- **Purpose:** Tab lifecycle management (create, switch, close, update)
- **State:** Manages tabs array and active tab ID
- **Features:**
  - Tab creation with unique IDs
  - Content updates with dirty flag tracking
  - Tab switching logic
  - Close confirmation for unsaved changes

**useLocalNotes Hook**
- **File:** `packages/dashboard/src/widgets/notes/hooks/useLocalNotes.ts`
- **Purpose:** localStorage persistence for drafts
- **Features:**
  - Auto-save to localStorage on content change
  - Load notes from localStorage on mount
  - CRUD operations (create, load, delete)

**useAutoSave Hook**
- **File:** `packages/dashboard/src/widgets/notes/hooks/useAutoSave.ts`
- **Purpose:** Debounced auto-save to file system
- **Features:**
  - 500ms debounce delay
  - localStorage backup on save failure
  - Save status tracking

**useNotes Hook**
- **File:** `packages/dashboard/src/widgets/notes/hooks/useNotes.ts`
- **Purpose:** API integration wrapper
- **Features:**
  - List notes (GET /api/coderef/notes)
  - Load note content (GET /api/coderef/file)
  - Save note (PUT /api/coderef/file)
  - Delete note (DELETE /api/coderef/file)

---

## 4. Data Flow

### 4.1 List Notes Flow

```
User opens /notes page
→ NotesWidget renders
→ useProjects() provides projectRoot
→ useNotes.listNotes(projectRoot)
→ GET /api/coderef/notes?projectRoot={path}
→ API reads {projectRoot}/coderef/notes/ directory
→ Filter by extension allowlist (.md, .txt, .json)
→ Sort by modified date (newest first)
→ Return NoteMetadata[] array
→ Display in FilePicker dropdown
```

### 4.2 Open File Flow

```
User clicks File → Open (or Ctrl+O)
→ FilePicker modal opens
→ User selects file from list or file system
→ [Electron] Native dialog via IPC
→ [Web] showOpenFilePicker() API
→ GET /api/coderef/file?path={filePath}
→ API reads file content
→ Return FileData with content
→ Create new tab with content
→ Editor displays content
→ Status bar shows file path
```

### 4.3 Save File Flow (Existing File)

```
User clicks File → Save (or Ctrl+S)
→ If filePath exists:
  → PUT /api/coderef/file
  → Body: { path, content, encoding }
  → API validates path (must be in coderef/notes/)
  → API validates extension (.md, .txt, .json)
  → API validates size (max 1MB)
  → API writes file atomically
  → Return success + updated FileData
  → Tab marked as not dirty (isDirty = false)
  → Status bar removes unsaved indicator
```

### 4.4 Save As Flow (New File)

```
User clicks File → Save As (or Ctrl+Shift+S)
→ FilePicker save dialog opens
→ User enters file name
→ [Electron] Native save dialog via IPC
→ [Web] showSaveFilePicker() API
→ Generate full path: {projectRoot}/coderef/notes/{filename}
→ PUT /api/coderef/file
→ Body: { path, content, encoding }
→ API creates coderef/notes/ directory if needed
→ API writes file
→ Return success + FileData
→ Update tab filePath
→ Tab marked as not dirty
```

### 4.5 Delete File Flow

```
User clicks Delete button in FilePicker
→ Confirmation dialog
→ User confirms
→ DELETE /api/coderef/file?path={filePath}
→ API validates path
→ API deletes file (fs.unlink)
→ Return success
→ Close tab if file is open
→ Refresh notes list
```

---

## 5. Storage Architecture

### 5.1 File System Storage

**Location:** Per-project storage in `{projectRoot}/coderef/notes/`

**Example:**
```
C:\projects\my-app\
└── coderef\
    └── notes\
        ├── meeting-notes.md
        ├── ideas.txt
        └── config.json
```

**Allowed Extensions:**
- `.md` - Markdown files
- `.txt` - Plain text files
- `.json` - JSON files

**Size Limits:**
- Maximum file size: 1MB (1,048,576 bytes)

**Security:**
- All paths must be within `coderef/notes/` directory
- Directory traversal prevention (e.g., `../../../etc/passwd`)
- Extension allowlist enforcement
- Permission checks (read/write/delete)

### 5.2 localStorage Backup

**Purpose:** Draft persistence when file not yet saved

**Storage Key Pattern:**
```
note-{tabId}
```

**Stored Data:**
```typescript
interface StoredNote {
  id: string;
  title: string;
  content: string;
  filePath: string | null;
  lastModified: string;
}
```

**Lifecycle:**
- Saved on every content change (debounced)
- Loaded on page mount
- Cleared when file saved to disk
- Cleared when tab closed (with confirmation)

---

## 6. Platform-Specific Behaviors

### 6.1 Electron (Desktop)

**File Dialogs:**
- Uses native OS dialogs via IPC
- Full filesystem access
- No permission prompts

**File Operations:**
- Direct Node.js filesystem API
- Absolute paths
- No browser sandbox restrictions

**New Window:**
- "New Window" button available
- Opens file in separate window
- Independent editor instance

### 6.2 Web (Browser)

**File Dialogs:**
- Uses File System Access API
- `showOpenFilePicker()` for Open
- `showSaveFilePicker()` for Save As
- Browser permission prompts

**File Operations:**
- API routes handle filesystem operations
- Browser sandbox restrictions apply
- CORS considerations

**New Window:**
- "New Window" button hidden (not applicable)
- Single-window editing

---

## 7. Integration with Other Systems

### 7.1 ProjectsContext Integration

**Purpose:** Provides project root path for API calls

**Integration:**
```typescript
const { selectedProject } = useProjects();
const projectRoot = selectedProject?.path || '';

// Used in API calls
await CodeRefApi.notes.list(projectRoot);
await CodeRefApi.file.read(filePath, projectRoot);
```

**Dependency:**
- Notes system requires active project selection
- Falls back gracefully if no project selected

### 7.2 Settings Integration

**No direct integration** - Notes system does not use unified storage configuration

**Current State:**
- Notes directory hardcoded as `coderef/notes/`
- Not configurable via Settings UI
- No unified storage integration

**Future Enhancement:**
```json
{
  "projects": [...],
  "stubs_directory": "...",
  "notes_directory": "coderef/notes/",  // Future: Make configurable
  "updatedAt": "..."
}
```

### 7.3 Scanner Integration

**No integration** - Scanner does not scan notes directory

### 7.4 Workorders Integration

**No integration** - Notes are separate from workorders

---

## 8. Security Considerations

### 8.1 Path Traversal Prevention

**Validation:**
```typescript
// API validates all file paths
const notesDir = path.join(projectRoot, 'coderef', 'notes');
const normalizedPath = path.normalize(filePath);

// Reject if path escapes notes directory
if (!normalizedPath.startsWith(notesDir)) {
  throw new Error('INVALID_PATH');
}
```

**Attack Prevention:**
- Blocks `../` sequences
- Blocks absolute paths outside project
- Normalizes paths before validation

### 8.2 Extension Allowlist

**Allowed for Notes API:**
- `.md`, `.txt`, `.json` only

**Allowed for File API (Read):**
- 30+ text file extensions

**Enforcement:**
```typescript
const ALLOWED_NOTE_EXTENSIONS = new Set(['.md', '.txt', '.json']);
const ext = path.extname(fileName).toLowerCase();

if (!ALLOWED_NOTE_EXTENSIONS.has(ext)) {
  throw new Error('INVALID_EXTENSION');
}
```

### 8.3 Size Limits

**Maximum file size:** 1MB (1,048,576 bytes)

**Enforcement:**
```typescript
const MAX_NOTE_SIZE = 1024 * 1024; // 1MB

if (content.length > MAX_NOTE_SIZE) {
  throw new Error('FILE_TOO_LARGE');
}
```

### 8.4 Permission Checks

**File System Errors:**
- `EACCES` - Access denied (403 PERMISSION_DENIED)
- `EPERM` - Operation not permitted (403 PERMISSION_DENIED)
- `ENOENT` - File not found (graceful empty array)

---

## 9. Performance Considerations

### 9.1 File Reading

**Strategy:**
- Lazy loading (files read only when opened)
- No bulk file reads
- Metadata-only list (GET /api/coderef/notes)

**Bottlenecks:**
- Large files (1MB limit mitigates this)
- Many files (sorted client-side, acceptable for < 1000 files)

### 9.2 Auto-Save

**Debouncing:**
- 500ms delay after last edit
- Prevents excessive API calls
- localStorage backup on failure

**Optimization:**
- Only saves if content changed
- Skip save if file path missing

### 9.3 Syntax Highlighting

**Library:** react-syntax-highlighter (Prism)

**Performance:**
- Preview mode only (not while typing)
- Lazy rendering
- Acceptable for files < 1MB

---

## 10. Error Handling

### 10.1 API Errors

**Standard Error Format:**
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  details?: Record<string, any>;
}
```

**Common Error Codes:**

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Missing or invalid parameters |
| INVALID_PATH | 400 | Path outside allowed directory |
| INVALID_EXTENSION | 400 | Extension not in allowlist |
| FILE_TOO_LARGE | 400 | File exceeds size limit |
| PERMISSION_DENIED | 403 | Filesystem permission error |
| FILE_NOT_FOUND | 404 | File doesn't exist |
| INTERNAL_ERROR | 500 | Server error |

### 10.2 UI Error Handling

**Graceful Degradation:**
- Empty notes list if directory doesn't exist
- Error toast notifications for API failures
- Close confirmation prevents data loss
- localStorage backup on save failure

---

## 11. Testing Strategy

### 11.1 API Testing

**Must-Cover Scenarios:**

1. ✅ List notes from existing directory → Returns array
2. ✅ List notes from non-existent directory → Returns empty array
3. ✅ Read file with valid path → Returns content
4. ✅ Read file with invalid extension → 400 error
5. ✅ Write file within notes directory → Success
6. ✅ Write file outside notes directory → 400 INVALID_PATH
7. ✅ Write file exceeding 1MB → 400 FILE_TOO_LARGE
8. ✅ Delete existing file → Success
9. ✅ Delete non-existent file → 404 error
10. ⚠️ Path traversal attack (`../../../etc/passwd`) → 400 INVALID_PATH

### 11.2 UI Testing

**Must-Cover Scenarios:**

1. ✅ Create new tab → Untitled tab appears
2. ✅ Open file → Content loaded in new tab
3. ✅ Edit content → Unsaved indicator appears
4. ✅ Save file → Indicator removed
5. ✅ Close unsaved tab → Confirmation dialog
6. ✅ Keyboard shortcuts → Actions triggered
7. ✅ Switch tabs → Content preserved
8. ⚠️ Preview mode → Syntax highlighting works
9. ⚠️ Multi-tab state → Independent content

---

## 12. Known Issues & Limitations

### 12.1 Current Issues

1. **Two Overlapping Systems:**
   - Old 3-card notes widget (`NotesWidget.old.tsx`) still exists
   - New Notepad Clone (`NotesWidget.tsx`) is primary
   - Should deprecate old widget

2. **No Centralized Configuration:**
   - Notes directory hardcoded as `coderef/notes/`
   - Not configurable via Settings UI
   - Not using unified storage

3. **No Project-Level Aggregation:**
   - Cannot view notes from all projects at once
   - Must switch projects to see different notes

### 12.2 Limitations

1. **File Size Limit:** 1MB maximum (reasonable for text files)
2. **Extension Restrictions:** Only `.md`, `.txt`, `.json` for notes API
3. **No Real-Time Collaboration:** Single-user editing only
4. **No Version History:** No built-in versioning (use git)
5. **No Search:** Cannot search across all notes

---

## 13. Future Enhancements

### 13.1 Configuration Support

**Add to unified storage:**
```json
{
  "projects": [...],
  "notes_directory": "coderef/notes/",
  "notes_max_size": 1048576,
  "notes_allowed_extensions": [".md", ".txt", ".json"],
  "updatedAt": "..."
}
```

### 13.2 Multi-Project Notes View

**Feature:** Aggregate notes from all projects

**UI:**
- Project filter dropdown
- "All Projects" option
- Search across all notes

### 13.3 Rich Text Editor

**Enhancement:** WYSIWYG markdown editor

**Options:**
- TipTap editor
- ProseMirror
- Lexical

### 13.4 Note Templates

**Feature:** Pre-defined note templates

**Examples:**
- Meeting notes template
- Bug report template
- Feature request template

---

## 14. File Inventory

### 14.1 API Routes (2 files, 1,062 lines)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/coderef/notes/route.ts` | 172 | List notes API |
| `src/app/api/coderef/file/route.ts` | 890 | File read/write/delete API |

### 14.2 UI Components (7 files)

| File | Purpose |
|------|---------|
| `src/widgets/notes/NotesWidget.tsx` | Main editor component |
| `src/widgets/notes/components/MenuBar.tsx` | File/Edit menus |
| `src/widgets/notes/components/TabBar.tsx` | Tab management UI |
| `src/widgets/notes/components/FilePicker.tsx` | File open/save dialogs |
| `src/widgets/notes/index.tsx` | Public exports |
| `src/widgets/notes/NotesWidget.old.tsx` | Legacy 3-card widget (deprecated) |
| `src/app/notes/page.tsx` | Notes page route |

### 14.3 Custom Hooks (4 files)

| File | Purpose |
|------|---------|
| `src/widgets/notes/hooks/useNotepadTabs.ts` | Tab lifecycle management |
| `src/widgets/notes/hooks/useLocalNotes.ts` | localStorage persistence |
| `src/widgets/notes/hooks/useAutoSave.ts` | Debounced auto-save |
| `src/widgets/notes/hooks/useNotes.ts` | API integration |

### 14.4 Types (2 files)

| File | Purpose |
|------|---------|
| `src/widgets/notes/types/notepad.ts` | Notepad interfaces |
| `src/widgets/notes/types.ts` | Note interfaces |

### 14.5 Documentation (3 files)

| File | Status |
|------|--------|
| `coderef/resources-sheets/components/Notepad-Clone-RESOURCE-SHEET.md` | APPROVED |
| `coderef/resources-sheets/components/Notes-Widget-Text-Editing-RESOURCE-SHEET.md` | APPROVED |
| `coderef/resources-sheets/api/File-Api-Route-RESOURCE-SHEET.md` | APPROVED |

**Total:** 18 files related to Notes functionality

---

## Conclusion

The Notes System is a **production-ready multi-tab text editor** providing comprehensive text editing functionality within CodeRef Dashboard. The system consists of two well-separated concerns: a read-only listing API (`/api/coderef/notes`) and a full CRUD file operations API (`/api/coderef/file`), with a feature-rich NotesWidget component supporting keyboard shortcuts, syntax highlighting, and cross-platform operation.

**Maintenance Expectations:**
- Notes stored in per-project `coderef/notes/` directories
- API routes enforce strict security (path validation, extension allowlists, size limits)
- NotesWidget is the primary editor (deprecate old 3-card widget)
- All file operations must go through `/api/coderef/file` API

**Version History:**
- v1.0.0 (2026-01-14): Initial documentation of complete notes system

---

**Maintained by:** CodeRef Dashboard Team
**Last Validated:** 2026-01-14
**Next Review:** When adding centralized configuration or rich text editing

# Notes Widget

Production-ready note-taking widget with file persistence to `coderef/notes/` directory.

## Features

- ✅ **File Persistence**: Notes saved to `<projectRoot>/coderef/notes/`
- ✅ **Auto-Save**: 500ms debounced auto-save
- ✅ **Manual Save**: Cmd/Ctrl+S to force immediate save
- ✅ **Edit/Preview Modes**: Toggle between editing and markdown preview
- ✅ **Keyboard Shortcuts**: Cmd/Ctrl+S, Cmd/Ctrl+P, Cmd/Ctrl+N
- ✅ **localStorage Backup**: Automatic fallback on save failure
- ✅ **Industrial Theme**: Consistent with dashboard design system
- ✅ **Responsive Layout**: 2-column on desktop, stacks on mobile

## Architecture

### Data Flow

```
User Input → NotesWidget → useAutoSave → CodeRefApi.notes.save
                                            ↓
                                     PUT /api/coderef/file
                                            ↓
                                    Server validates path
                                            ↓
                                  Writes to coderef/notes/
```

### File Structure

```
widgets/notes/
├── NotesWidget.tsx         # Main container component
├── types.ts                # TypeScript definitions
├── hooks/
│   ├── useNotes.ts        # CRUD operations + state
│   └── useAutoSave.ts     # Auto-save with debouncing
└── index.tsx              # Public exports
```

### Security

All writes are restricted to `<projectRoot>/coderef/notes/` with:
- Path validation (rejects `..` and absolute paths)
- Extension allowlist (`.md`, `.txt`, `.json` only)
- Size limit (1MB max)
- Directory traversal protection

## Usage

### Basic Usage

```tsx
import { NotesWidget } from '@/widgets/notes';

export default function NotesPage() {
  return <NotesWidget />;
}
```

### Hooks

#### useNotes

```tsx
const {
  notes,          // NoteMetadata[]
  currentNote,    // Note | null
  loading,        // boolean
  error,          // string | null
  createNote,     // (request: CreateNoteRequest) => Promise<void>
  loadNote,       // (name: string) => Promise<void>
  deleteNote,     // (name: string) => Promise<void>
  refreshNotes,   // () => Promise<void>
} = useNotes();
```

#### useAutoSave

```tsx
const {
  saveStatus,    // SaveStatus (idle/saving/saved/error)
  triggerSave,   // () => void - Manual save
  resetStatus,   // () => void - Reset to idle
} = useAutoSave({
  content: editorContent,
  noteName: 'example.md',
  onSave: async (content) => { /* save logic */ },
  delay: 500,    // Optional debounce delay
  enabled: true, // Optional enable/disable
});
```

## API Routes

### PUT /api/coderef/file

Write note content to file system.

**Request:**
```json
{
  "projectRoot": "C:\\path\\to\\project",
  "filePath": "note.md",
  "content": "# My Note\\n\\nContent here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "path": "C:\\path\\to\\project\\coderef\\notes\\note.md",
    "size": 28
  }
}
```

### GET /api/coderef/notes

List all notes in project.

**Request:**
```
GET /api/coderef/notes?projectRoot=C:\\path\\to\\project
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "name": "note.md",
        "path": "note.md",
        "size": 1024,
        "modified": "2026-01-04T12:00:00Z",
        "extension": ".md"
      }
    ],
    "total": 1,
    "timestamp": "2026-01-04T12:05:00Z"
  }
}
```

### DELETE /api/coderef/file

Delete a note file.

**Request:**
```json
{
  "projectRoot": "C:\\path\\to\\project",
  "filePath": "note.md"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "deleted": "C:\\path\\to\\project\\coderef\\notes\\note.md"
  }
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+S` | Manual save (bypasses debounce) |
| `Cmd/Ctrl+P` | Toggle Edit/Preview mode |
| `Cmd/Ctrl+N` | Create new note |

## localStorage Backup

If a save fails, content is automatically backed up to:

```
localStorage key: coderef-notes-backup-<filename>
```

Backup is:
- Created on save failure
- Restored on next mount
- Cleared on successful save
- Quota-aware (try/catch for storage limits)

## Future Enhancements

- [ ] Markdown preview with react-markdown
- [ ] Note search/filter
- [ ] Rename functionality (double-click title)
- [ ] Multi-project selector (currently uses first project)
- [ ] Note templates
- [ ] Tags/categories
- [ ] Export to PDF/HTML

## Workorder

**ID:** WO-NOTES-WIDGET-001
**Status:** In Progress
**Progress:** 17/26 tasks (65%)

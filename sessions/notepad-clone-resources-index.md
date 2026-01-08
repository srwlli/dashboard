# Notepad Clone Transformation - Resource Index

**Date:** 2026-01-08
**Workorder:** WO-NOTEPAD-CLONE-001
**Purpose:** Comprehensive index of all resources needed to transform Notes Widget into Notepad clone

---

## Table of Contents

1. [Current Implementation Files](#current-implementation-files)
2. [API Endpoints & Routes](#api-endpoints--routes)
3. [File System Utilities](#file-system-utilities)
4. [UI Components & Patterns](#ui-components--patterns)
5. [State Management & Hooks](#state-management--hooks)
6. [Context & Providers](#context--providers)
7. [Type Definitions](#type-definitions)
8. [Styling & Theme](#styling--theme)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Documentation References](#documentation-references)

---

## Current Implementation Files

### Files to Modify

#### 1. Notes Widget Main Component
**File:** `packages/dashboard/src/widgets/notes/NotesWidget.tsx`
- **Current:** 194 lines, 3-card layout
- **Changes:** Complete rewrite to tab-based interface
- **Dependencies:** useLocalNotes → useNotepadTabs

#### 2. API Access Client
**File:** `packages/dashboard/src/lib/coderef/api-access.ts`
- **Current:** NotesApi.save() restricted to coderef/notes/
- **Changes:** 
  - Add `FileApi.save()` method (project-wide)
  - Add `FileApi.open()` method
  - Extend to support absolute file paths
- **Lines:** ~333 total, modify ~50 lines

#### 3. File API Route
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts`
- **Current:** PUT handler restricted to coderef/notes/ directory
- **Changes:**
  - Modify `validateWritePath()` to allow project-wide writes
  - Update path validation logic (lines 136-171)
  - Keep security: prevent traversal, validate extensions, size limits
- **Lines:** ~822 total, modify ~50 lines

#### 4. Notes Page Route
**File:** `packages/dashboard/src/app/notes/page.tsx`
- **Current:** Simple wrapper with PageCard
- **Changes:** May need layout adjustments for menu bar
- **Lines:** 21 lines, minimal changes

### Files to Deprecate/Replace

#### 5. useLocalNotes Hook
**File:** `packages/dashboard/src/widgets/notes/hooks/useLocalNotes.ts`
- **Current:** 150 lines, localStorage-based note management
- **Status:** Replace with useNotepadTabs hook
- **Keep:** For reference during migration

---

## API Endpoints & Routes

### Existing Endpoints

#### 1. GET /api/coderef/file
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (lines 283-393)
- **Purpose:** Read file content and metadata
- **Query:** `?path=<absolute-file-path>`
- **Returns:** `FileData` (path, name, extension, size, content, encoding, mimeType, lastModified)
- **Status:** ✅ Ready to use (no changes needed)
- **Usage:** For Open file operation

#### 2. PUT /api/coderef/file
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (lines 178-277)
- **Purpose:** Write file content
- **Body:** `{ projectRoot: string, filePath: string, content: string }`
- **Current Restriction:** Only allows writes to `coderef/notes/`
- **Changes Required:** Extend to allow project-wide writes
- **Security:** Path validation, size limits (1MB), extension allowlist

#### 3. DELETE /api/coderef/file
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (lines 426-536)
- **Purpose:** Delete files/directories
- **Body:** `{ filePath: string, recursive?: boolean }`
- **Status:** ✅ Ready to use (no changes needed)
- **Usage:** For future delete file operation

#### 4. PATCH /api/coderef/file
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (lines 563-821)
- **Purpose:** Rename/move files
- **Body:** `{ sourcePath: string, operation: 'rename' | 'move', newName?: string, destinationDir?: string }`
- **Status:** ✅ Ready to use (no changes needed)
- **Usage:** For Save As operation (rename/move)

---

## File System Utilities

### 1. Core File Handlers
**File:** `packages/core/src/utils/fileHandlers.ts`
- **Lines:** 62 lines
- **Exports:** `fileHandlers` object
- **Methods:**
  - `isElectron()` - Detect Electron environment
  - `openFile(options)` - Open file dialog (Electron/Web)
- **Usage:** For Open and Save As file pickers
- **Status:** ✅ Ready to use

### 2. File System Access API
**File:** `packages/dashboard/src/lib/coderef/local-access.ts`
- **Lines:** ~117 lines
- **Exports:**
  - `showDirectoryPicker()` - Directory picker
  - `buildTreeFromHandle()` - Build tree from directory handle
- **Usage:** For Save As directory selection (if needed)
- **Status:** ✅ Ready to use

### 3. Platform Abstraction
**File:** `packages/dashboard/src/lib/coderef/platform.ts`
- **Purpose:** Platform detection and file system adapter
- **Exports:**
  - `platform: 'electron' | 'web'`
  - `fileSystem` - File system adapter singleton
- **Usage:** For platform-specific file operations
- **Status:** ✅ Ready to use

### 4. File System Access Type Definitions
**File:** `packages/dashboard/src/types/file-system-access.d.ts`
- **Purpose:** TypeScript definitions for File System Access API
- **Exports:** Window interface extensions
  - `showDirectoryPicker()`
  - `showOpenFilePicker()` - **Use for Open file**
  - `showSaveFilePicker()` - **Use for Save As**
- **Status:** ✅ Ready to use

### 5. Electron IPC Handlers
**File:** `packages/electron-app/src/main.ts`
- **IPC Handlers:**
  - `fs:selectDirectory` (lines 115-130)
  - `fs:stat` (lines 132-138)
  - `electronAPI.openFileDialog` - Used by fileHandlers
  - `electronAPI.readFile` - Used by fileHandlers
- **Status:** ✅ Ready to use (via fileHandlers abstraction)

---

## UI Components & Patterns

### 1. Context Menu Component
**File:** `packages/dashboard/src/components/coderef/ContextMenu.tsx`
- **Lines:** ~369 lines
- **Purpose:** Reusable context menu with submenu support
- **Features:**
  - Fixed positioning
  - Submenu support
  - Keyboard navigation
  - Click-outside-to-close
- **Usage:** Reference for menu bar dropdown implementation
- **Status:** ✅ Reference pattern

### 2. File Tree Node
**File:** `packages/dashboard/src/components/coderef/FileTreeNode.tsx`
- **Lines:** ~718 lines
- **Purpose:** File tree node with context menu
- **Features:**
  - Right-click context menu
  - Copy path functionality
  - Clipboard operations
- **Usage:** Reference for clipboard operations (lines 278-313)
- **Status:** ✅ Reference pattern

### 3. Page Card Component
**File:** `packages/dashboard/src/components/PageCard.tsx` (referenced in notes/page.tsx)
- **Purpose:** Page layout wrapper
- **Usage:** Current Notes page wrapper
- **Status:** ✅ Ready to use

### 4. Sidebar Component
**File:** `packages/dashboard/src/components/Sidebar/index.tsx`
- **Lines:** ~101 lines
- **Purpose:** Main navigation sidebar
- **Features:** Navigation items, responsive design
- **Usage:** Reference for menu bar styling patterns
- **Status:** ✅ Reference pattern

---

## State Management & Hooks

### 1. useLocalNotes Hook (Current)
**File:** `packages/dashboard/src/widgets/notes/hooks/useLocalNotes.ts`
- **Lines:** 150 lines
- **Current Features:**
  - localStorage persistence
  - CRUD operations
  - 3-card management
- **Status:** ⚠️ To be replaced by useNotepadTabs

### 2. useAutoSave Hook (Existing)
**File:** `packages/dashboard/src/widgets/notes/hooks/useAutoSave.ts`
- **Lines:** 180 lines
- **Features:**
  - Debounced auto-save
  - Save status tracking
  - localStorage backup fallback
- **Status:** ✅ Can be reused/adapted for tab-based system

### 3. useNotes Hook (Existing)
**File:** `packages/dashboard/src/widgets/notes/hooks/useNotes.ts`
- **Purpose:** Alternative notes management
- **Status:** Review for patterns

### 4. useFileHandlers Hook
**File:** `packages/dashboard/src/components/PromptingWorkflow/hooks/useFileHandlers.ts`
- **Lines:** ~108 lines
- **Features:**
  - `selectFiles()` - File picker
  - `selectDirectory()` - Directory picker
  - `isElectron()` - Platform detection
- **Usage:** Reference for file picker implementation
- **Status:** ✅ Reference pattern

---

## Context & Providers

### 1. Projects Context
**File:** `packages/dashboard/src/contexts/ProjectsContext.tsx`
- **Purpose:** Project management and selection
- **Exports:**
  - `useProjects()` hook
  - `projects` array
  - `selectedProject` (first project used currently)
- **Usage:** Get `projectRoot` for file operations
- **Status:** ✅ Ready to use

### 2. Sidebar Context
**File:** `packages/dashboard/src/contexts/SidebarContext.tsx`
- **Purpose:** Sidebar state management
- **Usage:** Not directly needed for Notepad
- **Status:** ✅ Available

---

## Type Definitions

### 1. Notes Types (Current)
**File:** `packages/dashboard/src/widgets/notes/types.ts`
- **Lines:** ~77 lines
- **Exports:**
  - `Note` interface
  - `SaveStatus` enum
  - `EditorMode` enum
  - `CreateNoteRequest` interface
  - `RenameNoteRequest` interface
- **Status:** ⚠️ May need updates for tab system

### 2. API Types
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts`
- **Exports:**
  - `FileData` interface (lines 16-40)
- **Status:** ✅ Ready to use

### 3. Project Types
**File:** `packages/dashboard/src/lib/coderef/types.ts` (referenced in api-access.ts)
- **Exports:** `CodeRefProject`, `TreeNode`, `FileInfo`
- **Status:** ✅ Ready to use

### 4. New Types Needed
**File:** `packages/dashboard/src/widgets/notes/types/notepad.ts` (to be created)
- **Required Types:**
  ```typescript
  interface OpenTab {
    id: string;
    filePath: string | null;  // null = unsaved/new file
    content: string;
    isDirty: boolean;
    lastSaved?: Date;
  }
  
  interface TabState {
    tabs: OpenTab[];
    activeTabId: string | null;
  }
  ```

---

## Styling & Theme

### 1. Industrial Theme Tokens
**File:** `packages/dashboard/src/app/globals.css`
- **Purpose:** CSS variables for industrial theme
- **Tokens:**
  - `--ind-bg` - Background
  - `--ind-panel` - Panel background
  - `--ind-border` - Border color
  - `--ind-text` - Text color
  - `--ind-text-muted` - Muted text
  - `--ind-accent` - Accent color
- **Usage:** Apply to all new components
- **Status:** ✅ Ready to use

### 2. Tailwind Classes
**Current Usage in NotesWidget:**
- `bg-ind-bg`, `bg-ind-panel`
- `border-ind-border`
- `text-ind-text`, `text-ind-text-muted`
- `text-ind-accent`
- `hover:bg-ind-bg`, `hover:text-ind-accent`
- **Status:** ✅ Ready to use

---

## Keyboard Shortcuts

### 1. Current Implementation
**File:** `packages/dashboard/src/widgets/notes/NotesWidget.tsx` (lines 92-105)
- **Current:** Ctrl+N for new note
- **Pattern:** `useEffect` with `keydown` listener
- **Status:** ✅ Reference pattern

### 2. Electron Menu (Reference)
**File:** `packages/electron-app/src/main.ts` (lines 203-242)
- **Menu Items:**
  - File → Exit (Ctrl+Q)
  - Edit → Undo (Ctrl+Z), Redo (Ctrl+Y)
  - Edit → Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V)
- **Status:** ✅ Reference for shortcuts

### 3. Required Shortcuts
- **Ctrl+N** - New file
- **Ctrl+O** - Open file
- **Ctrl+S** - Save
- **Ctrl+Shift+S** - Save As
- **Ctrl+Z** - Undo (browser native)
- **Ctrl+X** - Cut
- **Ctrl+C** - Copy
- **Ctrl+V** - Paste
- **Ctrl+A** - Select All

---

## Documentation References

### 1. Resource Sheet
**File:** `coderef/reference-sheets/NOTES-WIDGET-TEXT-EDITING.md`
- **Purpose:** Current text editing implementation documentation
- **Status:** ✅ Reference for current architecture

### 2. Session Log
**File:** `sessions/notepad-clone-transformation-2026-01-08-session.md`
- **Purpose:** Planning session documentation
- **Status:** ✅ Current session

### 3. Workorder Plan
**File:** `coderef/workorder/text-editor/plan.json`
- **Purpose:** Original text editor workorder
- **Status:** ✅ Reference for original requirements

### 4. API Documentation
**File:** `coderef/reference-sheets/API-ACCESS.md` (if exists)
- **Purpose:** API client patterns
- **Status:** Check if exists

---

## New Files to Create

### 1. MenuBar Component
**File:** `packages/dashboard/src/widgets/notes/components/MenuBar.tsx`
- **Purpose:** File and Edit menu bar
- **Dependencies:** 
  - ContextMenu component (reference pattern)
  - Industrial theme styling
  - Keyboard shortcuts

### 2. TabBar Component
**File:** `packages/dashboard/src/widgets/notes/components/TabBar.tsx`
- **Purpose:** Horizontal tab list
- **Features:**
  - Tab switching
  - Close button
  - Unsaved indicator
  - Active tab highlighting

### 3. FilePicker Component
**File:** `packages/dashboard/src/widgets/notes/components/FilePicker.tsx`
- **Purpose:** File open/save dialogs
- **Dependencies:**
  - `fileHandlers.openFile()` from core
  - File System Access API (`showOpenFilePicker`, `showSaveFilePicker`)
  - Platform detection

### 4. useNotepadTabs Hook
**File:** `packages/dashboard/src/widgets/notes/hooks/useNotepadTabs.ts`
- **Purpose:** Tab state management
- **Features:**
  - Tab CRUD operations
  - Active tab tracking
  - Unsaved changes tracking
  - Optional localStorage persistence

### 5. Notepad Types
**File:** `packages/dashboard/src/widgets/notes/types/notepad.ts`
- **Purpose:** TypeScript definitions for tab system
- **Exports:** `OpenTab`, `TabState`, etc.

---

## External Dependencies

### 1. React Hooks
- `useState`, `useEffect`, `useCallback`, `useRef`
- **Status:** ✅ Built-in

### 2. Lucide React Icons
- **Current Usage:** Save, Trash2
- **Additional Needed:** File, Folder, X, Check, etc.
- **Status:** ✅ Already installed

### 3. Next.js
- `useRouter` (if needed for navigation)
- **Status:** ✅ Available

### 4. Clipboard API
- `navigator.clipboard.writeText()`
- `navigator.clipboard.readText()`
- **Status:** ✅ Browser API

### 5. File System Access API
- `window.showOpenFilePicker()`
- `window.showSaveFilePicker()`
- **Status:** ✅ Type definitions available

---

## Security Considerations

### 1. Path Validation
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (lines 136-171)
- **Current:** Validates coderef/notes/ restriction
- **Changes:** Extend to validate project root boundary
- **Requirements:**
  - Prevent directory traversal (`../`)
  - Ensure path is within project root
  - Validate file extensions
  - Enforce size limits

### 2. File Size Limits
- **Write Limit:** 1MB (line 130)
- **Read Limit:** 10MB (line 334)
- **Status:** ✅ Enforced

### 3. Extension Allowlist
**File:** `packages/dashboard/src/app/api/coderef/file/route.ts` (line 125)
- **Current:** `.md`, `.txt`, `.json`
- **Consider:** Expand for text files (`.js`, `.ts`, `.py`, etc.)
- **Status:** ⚠️ May need expansion

---

## Implementation Checklist

### Phase 1: API Extensions
- [ ] Modify `validateWritePath()` in file/route.ts
- [ ] Add `FileApi.save()` to api-access.ts
- [ ] Add `FileApi.open()` to api-access.ts
- [ ] Test path validation with project-wide paths

### Phase 2: UI Components
- [ ] Create MenuBar component
- [ ] Create TabBar component
- [ ] Create FilePicker component
- [ ] Apply industrial theme styling

### Phase 3: State Management
- [ ] Create useNotepadTabs hook
- [ ] Create notepad types
- [ ] Implement tab CRUD operations
- [ ] Implement unsaved changes tracking

### Phase 4: File Operations
- [ ] Implement New file (Ctrl+N)
- [ ] Implement Open file (Ctrl+O)
- [ ] Implement Save (Ctrl+S)
- [ ] Implement Save As (Ctrl+Shift+S)
- [ ] Integrate file picker

### Phase 5: Edit Operations
- [ ] Implement Cut (Ctrl+X)
- [ ] Implement Copy (Ctrl+C)
- [ ] Implement Paste (Ctrl+V)
- [ ] Implement Select All (Ctrl+A)
- [ ] Undo/Redo (browser native)

### Phase 6: Integration
- [ ] Update NotesWidget to use new components
- [ ] Remove 3-card layout
- [ ] Implement keyboard shortcuts
- [ ] Add unsaved changes warnings
- [ ] Test in Electron and Web

---

## Quick Reference

### File Paths Summary
```
Current Implementation:
- packages/dashboard/src/widgets/notes/NotesWidget.tsx
- packages/dashboard/src/widgets/notes/hooks/useLocalNotes.ts
- packages/dashboard/src/lib/coderef/api-access.ts
- packages/dashboard/src/app/api/coderef/file/route.ts

New Components:
- packages/dashboard/src/widgets/notes/components/MenuBar.tsx
- packages/dashboard/src/widgets/notes/components/TabBar.tsx
- packages/dashboard/src/widgets/notes/components/FilePicker.tsx
- packages/dashboard/src/widgets/notes/hooks/useNotepadTabs.ts
- packages/dashboard/src/widgets/notes/types/notepad.ts

Utilities:
- packages/core/src/utils/fileHandlers.ts
- packages/dashboard/src/lib/coderef/local-access.ts
- packages/dashboard/src/lib/coderef/platform.ts
```

### Key Functions to Reference
- `fileHandlers.openFile()` - File picker
- `FileApi.load()` - Read file
- `FileApi.save()` - Write file (to be created)
- `useProjects()` - Get project root
- `ContextMenu` component - Menu pattern

---

**Last Updated:** 2026-01-08
**Status:** Ready for Implementation
**Next Step:** Begin Phase 1 - API Extensions

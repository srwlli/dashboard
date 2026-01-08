# Notepad Clone Transformation - Session Log

**Date:** 2026-01-08
**Workorder:** WO-NOTEPAD-CLONE-001
**Agent:** Claude (Sonnet 4.5)
**Session Duration:** Planning Phase
**Status:** 📋 PLAN CREATED

---

## Executive Summary

Created comprehensive plan to transform the Notes Widget from a 3-card multi-note interface into a Microsoft Notepad clone with:
- **Multi-tab interface** (multiple files open simultaneously)
- **Menu bar** with File and Edit menus
- **File operations**: New, Open, Save, Save As (anywhere in project)
- **Edit operations**: Undo, Cut, Copy, Paste, Select All
- **Unsaved changes tracking** per tab

**User Requirements:**
- Multi-tab interface (not single document)
- Core features only (File menu + basic Edit menu)
- Allow opening/saving files anywhere in the project (not restricted to coderef/notes/)

---

## Problem Statement

**Current Implementation:**
- Notes Widget uses 3-card layout (always shows 3 cards)
- Files restricted to `coderef/notes/` directory only
- No menu bar or standard Notepad UI
- No file picker for Open/Save As
- No edit operations (Cut/Copy/Paste/Select All)
- Uses localStorage for persistence (not file-based)

**User Goal:**
Transform into a Notepad-style text editor that:
- Supports multiple open files in tabs
- Can open/save files anywhere in the project
- Has standard menu bar (File, Edit)
- Provides core editing operations

---

## Plan Overview

### Architecture Changes

**New Component Structure:**
```
NotepadWidget (new)
├── MenuBar
│   ├── File Menu (New, Open, Save, Save As)
│   └── Edit Menu (Undo, Cut, Copy, Paste, Select All)
├── TabBar (horizontal tabs)
│   └── Tab (per open file, shows unsaved indicator)
└── EditorArea
    └── Textarea (single active tab content)
```

**State Management:**
- New `useNotepadTabs` hook to manage open tabs
- Track `OpenTab` objects with: `id`, `filePath`, `content`, `isDirty`, `lastSaved`
- Replace `useLocalNotes` hook

### Implementation Phases

**Phase 1: API Extensions**
- Extend File API PUT handler to allow writes anywhere in project (not just coderef/notes/)
- Add FileApi.save() and FileApi.open() methods to api-access.ts
- Update path validation to allow project-wide access while maintaining security

**Phase 2: UI Components**
- Create MenuBar component (File/Edit menus)
- Create TabBar component (horizontal tabs with close buttons)
- Create FilePicker component (for Open/Save As dialogs)

**Phase 3: State Management**
- Create useNotepadTabs hook
- Update NotesWidget to use new tab-based architecture
- Remove 3-card layout

**Phase 4: File Operations**
- Implement New, Open, Save, Save As
- Handle unsaved changes tracking
- File picker integration

**Phase 5: Edit Operations**
- Implement Cut, Copy, Paste (Clipboard API)
- Implement Select All
- Undo/Redo (browser native)

**Phase 6: Unsaved Changes Handling**
- Dirty state tracking per tab
- Close tab warning for unsaved changes
- Window close warning

---

## Key Files Identified

### Current Implementation
- `packages/dashboard/src/widgets/notes/NotesWidget.tsx` - 3-card layout (194 lines)
- `packages/dashboard/src/widgets/notes/hooks/useLocalNotes.ts` - State management (150 lines)
- `packages/dashboard/src/lib/coderef/api-access.ts` - NotesApi.save() restricted to coderef/notes/
- `packages/dashboard/src/app/api/coderef/file/route.ts` - PUT handler restricted to coderef/notes/

### New Files to Create
1. `packages/dashboard/src/widgets/notes/components/MenuBar.tsx`
2. `packages/dashboard/src/widgets/notes/components/TabBar.tsx`
3. `packages/dashboard/src/widgets/notes/components/FilePicker.tsx`
4. `packages/dashboard/src/widgets/notes/hooks/useNotepadTabs.ts`
5. `packages/dashboard/src/widgets/notes/types/notepad.ts`

### Files to Modify
1. `packages/dashboard/src/widgets/notes/NotesWidget.tsx` - Complete rewrite
2. `packages/dashboard/src/lib/coderef/api-access.ts` - Add FileApi.save(), FileApi.open()
3. `packages/dashboard/src/app/api/coderef/file/route.ts` - Extend PUT to allow project-wide writes

---

## Technical Decisions

### File Access Strategy
- **Current:** Restricted to `coderef/notes/` directory
- **New:** Allow anywhere in project root
- **Security:** Maintain path validation, prevent directory traversal, enforce size limits

### File Picker Implementation
- Use existing `packages/core/src/utils/fileHandlers.ts` for Electron/Web compatibility
- Or File System Access API for web (already used in ProjectSelector)
- HTML file input as fallback

### Clipboard Operations
- Use Clipboard API (`navigator.clipboard`) for modern browsers
- Fallback to `document.execCommand()` for compatibility
- Select All: `textarea.select()` or `textarea.setSelectionRange()`

### Undo/Redo
- Browser native undo/redo works in textarea
- No custom implementation needed for MVP
- Menu items trigger browser default

---

## Security Considerations

1. **Path Validation:** Ensure all file paths are within project root
2. **Directory Traversal:** Prevent `../` in paths
3. **File Size Limits:** Enforce 1MB write limit, 10MB read limit
4. **Extension Validation:** Allowlist safe text file extensions
5. **Permission Checks:** Verify file system permissions before write

---

## Testing Checklist

- [ ] Create new file (Ctrl+N)
- [ ] Open existing file (Ctrl+O)
- [ ] Save file (Ctrl+S)
- [ ] Save As (Ctrl+Shift+S)
- [ ] Close tab with unsaved changes (prompt)
- [ ] Cut/Copy/Paste operations
- [ ] Select All (Ctrl+A)
- [ ] Multiple tabs open simultaneously
- [ ] Switch between tabs
- [ ] Unsaved indicator shows correctly
- [ ] File picker works in Electron and Web

---

## Migration Notes

- Existing notes in `coderef/notes/` can still be opened via Open menu
- localStorage notes from old widget won't migrate automatically
- Users can manually open old notes if needed
- Old `useLocalNotes` hook can be deprecated after migration

---

## Plan Reference

**Plan File:** `c:\Users\willh\.cursor\plans\notepad_clone_transformation_fac592d1.plan.md`

**Created:** 2026-01-08
**Status:** Awaiting user approval to begin implementation

---

## Next Steps

1. User reviews and approves plan
2. Begin Phase 1: API Extensions
3. Implement UI components (Phase 2)
4. Update state management (Phase 3)
5. Implement file operations (Phase 4)
6. Add edit operations (Phase 5)
7. Handle unsaved changes (Phase 6)
8. Testing and refinement

---

**Session End:** 2026-01-08
**Next Session:** Implementation phase (pending approval)

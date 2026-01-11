# CodeRef Explorer - Right-Click Context Menu Documentation

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Context Menu Architecture](#context-menu-architecture)
3. [Right-Click Actions by Location](#right-click-actions-by-location)
   - [File Tree](#1-file-tree-filetreenodetsx)
   - [Favorites Tab](#2-favorites-tab-favoriteslisttsx)
4. [Context Menu Behavior](#context-menu-behavior)
5. [Data Flow](#data-flow)
6. [Integration Points](#integration-points)
7. [Visual Styling](#visual-styling)
8. [Implementation Details](#implementation-details)
9. [Use Cases](#use-cases)
10. [Technical Notes](#technical-notes)

---

## Quick Reference

### Available Actions

**File Tree (FileTreeNode.tsx):**
1. **Add to Favorites** / **Remove from Favorites** - Star icon
2. **Add to Prompt** - Plus icon (files only)
3. **Copy Path** - FolderTree icon (files and directories)

**Favorites Tab (FavoritesList.tsx):**
1. **Remove from Favorites** - Star icon (yellow filled)
2. **Reassign to Group** - Folder icon with submenu
3. **Copy Path** - FolderTree icon (files and directories)

---

## Context Menu Architecture

**Component:** `ContextMenu.tsx` (packages/dashboard/src/components/coderef/)
- Positioned at cursor location (fixed, z-index 50)
- Supports nested submenus with hover activation
- Closes on outside click, Escape key, or item selection
- Minimum width: 180px

---

## Right-Click Actions by Location

### 1. File Tree (FileTreeNode.tsx)

**Available on Files:**

#### Add to Favorites
- **Icon:** Star
- **Action:** Toggles favorite status
- **Behavior:**
  - If groups exist: Shows submenu with group options
    - "Ungrouped" (default)
    - List of custom groups
  - If no groups: Adds directly to ungrouped favorites

#### Remove from Favorites (if already favorited)
- **Icon:** Star (filled yellow)
- **Action:** Removes file from favorites
- **Icon class:** `fill-yellow-400 text-yellow-400`

#### Add to Prompt (files only, not directories)
- **Icon:** Plus
- **Action:** Loads file content and adds to workflow attachments
- **Creates Attachment object with:**
  - File content
  - Metadata (name, extension, mime type, size)
  - Language detection for syntax highlighting
  - Preview (first 200 chars)
- **Adds to:** `WorkflowContext` via `addAttachments()`
- **Feedback:** Console log - `"Added {filename} to prompt"`

**Not available on Directories:** Context menu appears, but only shows favorite actions (no "Add to Prompt")

#### Copy Path (files and directories)
- **Icon:** FolderTree (switches to Check with green color when copied)
- **Action:** Copies absolute file/directory path to clipboard
- **Path Construction:**
  - Cleans project path (removes `[Directory: ...]` wrapper if present)
  - Constructs full path: `${projectPath}/${node.path}`
- **Visual Feedback:** Icon changes from FolderTree to Check (green) for 2 seconds
- **Error Handling:** Shows alert if clipboard write fails
- **Works for:** Both files AND directories

---

### 2. Favorites Tab (FavoritesList.tsx)

**Available on Favorited Files:**

#### Remove from Favorites
- **Icon:** Star (filled yellow)
- **Action:** Unfavorites the file
- **Icon class:** `fill-yellow-400 text-yellow-400`

#### Reassign to Group
- **Icon:** Folder
- **Submenu options:**
  - "Ungrouped" - Removes group assignment
  - List of existing groups - Moves to selected group
- **Uses:** Submenu pattern (hover to expand)

#### Copy Path (files and directories)
- **Icon:** FolderTree (switches to Check with green color when copied)
- **Action:** Copies absolute file/directory path to clipboard
- **Path Construction:**
  - Cleans project path (removes `[Directory: ...]` wrapper if present)
  - Constructs full path: `${projectPath}/${favoritePath}`
- **Visual Feedback:** Icon changes from FolderTree to Check (green) for 2 seconds
- **Error Handling:** Shows alert if clipboard write fails
- **Works for:** Both files AND directories

---

## Context Menu Behavior

### Trigger
- `onContextMenu` event (right-click or long-press on mobile)
- Prevents default browser context menu
- Stops event propagation

### Position
- Spawns at cursor coordinates (`e.clientX`, `e.clientY`)
- Submenus appear to the right of parent item

### Interaction States
- **Hover:** Background changes to `bg-ind-bg`
- **Active items:** Use accent color for icons/text when appropriate
- **Disabled states:** Not implemented (all items always clickable)

### Closing
- Click outside menu
- Press Escape key
- Click any non-submenu item

---

## Data Flow

```
User right-clicks file/directory
    ↓
handleContextMenu(e) → setContextMenu({ x, y, path })
    ↓
<ContextMenu> renders at coordinates
    ↓
User clicks action
    ↓
Action handler (handleToggleFavorite, handleAddToPrompt, handleCopyPath, etc.)
    ↓
State update (favorites, workflow attachments, clipboard, visual feedback)
    ↓
Menu closes → setContextMenu(null)
```

### Copy Path Flow (Detailed)
```
User clicks "Copy Path"
    ↓
handleCopyPath() executes
    ↓
Clean project.path (remove [Directory: ...] wrapper if present)
    ↓
Construct fullPath = projectPath + "/" + node.path
    ↓
navigator.clipboard.writeText(fullPath)
    ↓
setCopiedPath(true) → Icon changes to green Check
    ↓
setTimeout 2000ms → setCopiedPath(false) → Icon back to FolderTree
    ↓
setContextMenu(null) → Menu closes
```

---

## Integration Points

### Favorites Management
- `onToggleFavorite(path, groupName?)` - FileTreeNode
- `onAssignToGroup(path, groupName?)` - FavoritesList
- Persists to localStorage per project

### Workflow Integration
- `useWorkflow()` hook from WorkflowContext
- `addAttachments([attachment])` - Adds file to prompt
- File content loaded via `loadFileContent(project, path)`

### Clipboard Integration
- Uses Web Clipboard API (`navigator.clipboard.writeText()`)
- Browser permission required (granted on user interaction)
- Fallback: Shows alert if clipboard access fails
- Path cleaning: Removes File System API wrapper format `[Directory: name]`
- Works in both web (browser) and Electron environments

### Project Path Handling
- **Web (File System API):** Path format `[Directory: folder-name]` → Cleaned to `folder-name`
- **Electron (IPC):** Already absolute path → Used directly
- Path construction: `${cleanedProjectPath}/${relativePath}`

---

## Visual Styling

### Menu Container
- Background: `bg-ind-panel`
- Border: `border-ind-border`
- Shadow: `shadow-lg`
- Rounded corners
- Padding: `py-1`

### Menu Items
- Text: `text-ind-text` (or custom via `textClassName`)
- Icons: 16px (`w-4 h-4`)
- Padding: `px-3 py-2`
- Hover: `hover:bg-ind-bg`
- Font size: `text-sm`

### Submenus
- Position: `absolute left-full top-0 ml-1`
- Same styling as parent menu
- Chevron indicator (`ChevronRight`) on parent

---

## Implementation Details

### FileTreeNode.tsx (lines 134-211)

```typescript
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({ x: e.clientX, y: e.clientY });
};

const handleToggleFavorite = (groupName?: string) => {
  if (onToggleFavorite) {
    onToggleFavorite(node.path, groupName);
  }
};

const handleAddToPrompt = async () => {
  if (!project || node.type === 'directory') return;

  try {
    // Load file content
    const result = await loadFileContent(project, node.path);
    const fileData = result.data;

    // Create attachment object
    const attachment: Attachment = {
      id: Math.random().toString(36).substring(2, 11),
      filename: fileData.name,
      type: 'FILE',
      extension: fileData.extension,
      mimeType: fileData.mimeType,
      size: fileData.size,
      content: fileData.content,
      preview: fileData.content.substring(0, 200),
      language: getLanguageFromExtension(fileData.extension),
      isText: fileData.encoding === 'utf-8',
      isBinary: fileData.encoding === 'base64',
      createdAt: new Date(),
    };

    // Add to workflow
    addAttachments([attachment]);
    setContextMenu(null);

    console.log(`Added ${fileData.name} to prompt`);
  } catch (error) {
    console.error('Failed to add file to prompt:', error);
    alert('Failed to add file to prompt');
  }
};

const handleCopyPath = async () => {
  if (!project) return;

  try {
    // Clean project path - remove [Directory: ...] wrapper if present
    let projectPath = project.path;
    if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
      projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
    }

    // Construct full path
    const fullPath = `${projectPath}/${node.path}`;
    await navigator.clipboard.writeText(fullPath);

    // Show feedback
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);

    // Close context menu
    setContextMenu(null);
  } catch (error) {
    console.error('Failed to copy path:', error);
    alert('Failed to copy path to clipboard');
  }
};
```

### FavoritesList.tsx (lines 117-141)

```typescript
const handleCopyPath = async () => {
  if (!contextMenu || !project) return;

  try {
    // Clean project path - remove [Directory: ...] wrapper if present
    let projectPath = project.path;
    if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
      projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
    }

    // Construct full path
    const fullPath = `${projectPath}/${contextMenu.path}`;
    await navigator.clipboard.writeText(fullPath);

    // Show feedback
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);

    // Close context menu
    setContextMenu(null);
  } catch (error) {
    console.error('Failed to copy path:', error);
    alert('Failed to copy path to clipboard');
  }
};
```

### Context Menu Items Structure (FileTreeNode.tsx lines 294-352)

```typescript
{contextMenu && onToggleFavorite && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    items={[
      // If already favorited, show "Remove from Favorites"
      ...(favorited
        ? [
            {
              label: 'Remove from Favorites',
              icon: Star,
              onClick: () => handleToggleFavorite(),
              iconClassName: 'fill-yellow-400 text-yellow-400',
            },
          ]
        : // If not favorited, show "Add to Favorites" with group submenu
          [
            {
              label: 'Add to Favorites',
              icon: Star,
              onClick: availableGroups.length === 0 ? () => handleToggleFavorite() : undefined,
              submenu:
                availableGroups.length > 0
                  ? [
                      {
                        label: 'Ungrouped',
                        icon: Star,
                        onClick: () => handleToggleFavorite(),
                      },
                      ...availableGroups.map((group) => ({
                        label: group.name,
                        icon: Star,
                        onClick: () => handleToggleFavorite(group.name),
                      })),
                    ]
                  : undefined,
            },
          ]),
      // Only show "Add to Prompt" for files (not directories)
      ...(node.type === 'file' && project
        ? [
            {
              label: 'Add to Prompt',
              icon: Plus,
              onClick: handleAddToPrompt,
              iconClassName: '',
            },
          ]
        : []),
      // Copy Path - works for both files and directories
      ...(project
        ? [
            {
              label: 'Copy Path',
              icon: copiedPath ? Check : FolderTree,
              onClick: handleCopyPath,
              iconClassName: copiedPath ? 'text-green-500' : '',
            },
          ]
        : []),
    ]}
    onClose={() => setContextMenu(null)}
  />
)}
```

### Context Menu Items Structure (FavoritesList.tsx lines 327-368)

```typescript
{contextMenu && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    items={[
      {
        label: 'Remove from Favorites',
        icon: Star,
        onClick: handleRemoveFavorite,
        iconClassName: 'fill-yellow-400 text-yellow-400',
      },
      {
        label: 'Reassign to Group',
        icon: Folder,
        submenu: [
          {
            label: 'Ungrouped',
            icon: Star,
            onClick: () => handleReassignToGroup(undefined),
            iconClassName: '',
          },
          ...availableGroups.map((group) => ({
            label: group.name,
            icon: Folder,
            onClick: () => handleReassignToGroup(group.name),
            iconClassName: '',
          })),
        ],
      },
      // Copy Path - works for both files and directories
      ...(project
        ? [
            {
              label: 'Copy Path',
              icon: copiedPath ? Check : FolderTree,
              onClick: handleCopyPath,
              iconClassName: copiedPath ? 'text-green-500' : '',
            },
          ]
        : []),
    ]}
    onClose={() => setContextMenu(null)}
  />
)}
```

---

## Use Cases

### UC-1: Add File to Prompting Workflow
1. User right-clicks a file in File Tree
2. Context menu appears at cursor position
3. User clicks "Add to Prompt"
4. File content is loaded via hybrid router
5. Attachment created with metadata and language detection
6. Added to WorkflowContext attachments array
7. Available in Prompts page for export

### UC-2: Organize Favorites with Groups
1. User right-clicks a file
2. Selects "Add to Favorites"
3. Hovers over submenu showing groups
4. Clicks group name (e.g., "Important Docs")
5. File added to favorites with group assignment
6. Appears in Favorites tab under that group

### UC-3: Reassign Favorite to Different Group
1. User switches to Favorites tab
2. Right-clicks a favorited file
3. Hovers over "Reassign to Group"
4. Clicks new group name
5. File moves to new group in Favorites view

### UC-4: Copy File/Directory Path to Clipboard
1. User right-clicks a file or directory in File Tree or Favorites
2. Context menu appears with "Copy Path" option
3. User clicks "Copy Path"
4. System cleans project path (removes `[Directory: ...]` if present)
5. Full absolute path constructed and copied to clipboard
6. Icon changes from FolderTree to green Check for 2 seconds
7. User can paste the path into terminal, file explorer, or other applications
8. Menu closes automatically

**Example Output:**
- Web (File System API): `my-project/src/components/Button.tsx`
- Electron: `C:\Users\username\projects\my-project\src\components\Button.tsx`

---

## Technical Notes

### General
- **Performance:** Context menu lazy-renders only when triggered (not in DOM by default)
- **Memory:** Menu state includes only `{ x, y, path }` - minimal overhead
- **Accessibility:** Supports keyboard navigation (Escape to close)
- **Mobile:** Touch events trigger context menu (long-press pattern)
- **Cleanup:** Event listeners removed on component unmount

### Copy Path Feature
- **State Management:** Uses local `copiedPath` state for visual feedback (2-second timeout)
- **Path Cleaning Logic:**
  - Detects File System API format: `[Directory: ...]`
  - Uses string slice: `projectPath.slice(12, -1)` to extract folder name
  - Electron paths used directly (already absolute)
- **Clipboard API:**
  - Requires user gesture (satisfied by context menu click)
  - Async operation with try-catch error handling
  - Falls back to alert on permission denial
- **Icon Switching:**
  - Default: `FolderTree` icon
  - Copied state: `Check` icon with `text-green-500` class
  - Auto-revert after 2000ms via `setTimeout`
- **Cross-Platform:**
  - Works identically in web (PWA) and Electron builds
  - Path separator: Always forward slash `/` (works on Windows too)

### Browser Compatibility

**Clipboard API Support:**
- ✅ Chrome/Edge 66+
- ✅ Firefox 63+
- ✅ Safari 13.1+
- ✅ Electron (all versions with Chromium 66+)

**File System API Support (for path cleaning):**
- ✅ Chrome/Edge 86+
- ✅ Electron with polyfill
- ❌ Firefox (not supported - uses fallback)
- ❌ Safari (not supported - uses fallback)

### Keyboard Shortcuts

- **Escape** - Close context menu
- **Right-click / Context menu key** - Open context menu on selected item
- **Long-press (mobile)** - Open context menu on touch devices

---

**Last Updated:** 2026-01-02
**Workorder:** WO-CONTEXT-MENU-COPY-PATH-001
**Features:**
- "Add to Prompt" context menu integration (WO-PROMPTING-WORKFLOW-TAGS-001)
- "Copy Path" context menu integration (WO-CONTEXT-MENU-COPY-PATH-001)

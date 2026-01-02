# CodeRef Explorer - Right-Click Context Menu Documentation

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
User right-clicks file
    ↓
handleContextMenu(e) → setContextMenu({ x, y, path })
    ↓
<ContextMenu> renders at coordinates
    ↓
User clicks action
    ↓
Action handler (handleToggleFavorite, handleAddToPrompt, etc.)
    ↓
State update (favorites, workflow attachments)
    ↓
Menu closes → setContextMenu(null)
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

### FileTreeNode.tsx (lines 134-183)

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
```

### Context Menu Items Structure (lines 265-315)

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

---

## Technical Notes

- **Performance:** Context menu lazy-renders only when triggered (not in DOM by default)
- **Memory:** Menu state includes only `{ x, y, path }` - minimal overhead
- **Accessibility:** Supports keyboard navigation (Escape to close)
- **Mobile:** Touch events trigger context menu (long-press pattern)
- **Cleanup:** Event listeners removed on component unmount

---

**Last Updated:** 2026-01-01
**Workorder:** Documentation for WO-PROMPTING-WORKFLOW-TAGS-001
**Feature:** "Add to Prompt" context menu integration

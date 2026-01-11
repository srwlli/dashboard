# Prompting Workflow Widget - Implementation Briefing

## Overview
The **Prompting Workflow Widget** is a comprehensive LLM-focused tool that manages the complete workflow for working with Large Language Models. It's being ported from the clipboard_companion project to the coderef-dashboard as a modular widget.

---

## What the Prompting Workflow Does

The component manages a 4-section workflow for LLM interactions:

### 1. **Prompt Section**
- **Load Prompt**: Import a prompt from file (llm-prompt.json)
- **Paste Prompt**: Paste prompt text directly from clipboard
- **Preloaded Prompts**: Select from predefined prompt templates
- **Add Prompt**: Save new custom prompts with validation
- **View Prompt**: Preview the formatted prompt text
- **Clear Prompt**: Remove current prompt

**State Tracked**:
- `promptSource` - Where prompt came from (file name, "Clipboard", "Preloaded: X")
- `promptPasteCount` - How many times prompt has been pasted/loaded
- `selectedPromptKey` - Which preloaded prompt is selected
- `preloadedPrompts` - List of available prompt templates

### 2. **Attachments Section**
- **Attach File**: Upload files (code, markdown, JSON, etc.)
- **Paste Attachment**: Add text from clipboard as attachment
- **View Attachments**: See formatted attachments for LLM
- **Clear Attachments**: Remove all attachments

**State Tracked**:
- `attachments` - Array of attached files with line counts
- Shows total lines across all attachments

### 3. **Responses Section**
- **Paste Response**: Add LLM response from clipboard
- **Open All LLMs**: Open all configured LLM URLs in new tabs
- **View Responses**: Export formatted responses
- **Clear Responses**: Remove all responses

**State Tracked**:
- `responseCount` - Number of responses saved
- `totalChars` - Total character count across responses
- `llmUrls` - List of configured LLM URLs (from backend config)

### 4. **Management Section**
- **Summary View**: Shows total counts (prompts, attachments, responses)
- **Clear All**: Bulk clear option

**State Tracked**:
- `promptCount` - Total custom prompts saved
- `attachmentCount` - Total attachments
- `managementResponseCount` - Total responses

---

## Core Components We've Built

The coderef-dashboard already has a **shared core** with all the functionality this widget needs:

### API Methods (17 total in `window.CodeRefCore.api`)

**Prompt Management**:
```typescript
api.getSession()                          // Get current session state
api.setPrompt(content: string)             // Set/upload prompt
api.clearPrompt()                          // Clear current prompt
api.getPreloadedPrompts()                  // List available prompts
api.usePreloadedPrompt(key: string)        // Select a preloaded prompt
api.addPreloadedPrompt(label, text)        // Save new custom prompt
api.exportLlmFriendlyPrompt()               // Format prompt for export
```

**Attachment Management**:
```typescript
api.listAttachments()                      // Get attached files
api.addAttachmentText(content, filename)   // Add text attachment
api.clearAttachments()                     // Remove all attachments
api.exportLlmFriendlyAttachments()         // Format for LLM
```

**Response Management**:
```typescript
api.addResponse(content: string)           // Add LLM response
api.getResponsesSummary()                  // Get response statistics
api.clearResponses()                       // Clear all responses
api.exportLlmFriendlyResponses()           // Format responses
```

**Configuration**:
```typescript
api.getConfig()                            // Get app config (LLM URLs, etc.)
api.exportLlmFriendly()                    // Export all formatted
```

### Hooks

**Session Management**:
```typescript
const { session, loading, error, refresh } = useSession()
// Automatically refreshes on mount and listens for session-refresh events
```

**Session Refresh Listener**:
```typescript
useSessionRefresh(() => {
  // Callback when session data changes
})
// Listens for window 'session-refresh' event
```

### Utilities

**Clipboard Access**:
```typescript
await window.CodeRefCore.utils.clipboard.read()    // Read from clipboard
await window.CodeRefCore.utils.clipboard.write(text)  // Write to clipboard
```

**File Handling** (Dual Electron + Web):
```typescript
window.CodeRefCore.utils.fileHandlers.isElectron()  // Check if in Electron
await fileHandlers.openFile()                       // Open file dialog (Electron or Web)
```

---

## How the Widget Will Use the Core

### In Dev Mode (npm run dev:electron)
1. Widget loads `window.CodeRefCore` from the core.js IIFE bundle
2. Widget calls `api` methods to interact with backend
3. Widget uses `useSession()` hook to manage state
4. Widget uses `utils.clipboard` for clipboard operations
5. Widget detects Electron via `fileHandlers.isElectron()`

### In Production
1. Same as dev - core.js is bundled and loaded before widget
2. All APIs work identically
3. File dialogs use Electron APIs when available

### Session Refresh Pattern
When data changes, dispatch: `window.dispatchEvent(new CustomEvent('session-refresh'))`
This triggers `useSessionRefresh` callbacks and `useSession` auto-refresh.

---

## Implementation Mapping

### PromptingWorkflowStandalone.tsx Components → Core APIs

| Component Feature | Core API | Hook | Utility |
|---|---|---|---|
| Load prompt file | `api.setPrompt()` | `useSession()` | `fileHandlers.openFile()` |
| Paste prompt | `api.setPrompt()` | `useSessionRefresh()` | `clipboard.read()` |
| View prompt | `api.exportLlmFriendlyPrompt()` | - | - |
| Manage preloaded prompts | `api.getPreloadedPrompts()`, `api.usePreloadedPrompt()`, `api.addPreloadedPrompt()` | - | - |
| Attach files | `api.addAttachmentText()` | - | `fileHandlers.openFile()` |
| Paste attachment | `api.addAttachmentText()` | - | `clipboard.read()` |
| View attachments | `api.exportLlmFriendlyAttachments()` | - | - |
| Paste response | `api.addResponse()` | - | `clipboard.read()` |
| Open LLM URLs | - | - | - (built-in window.open) |
| Get config | `api.getConfig()` | - | - |

---

## Key Adaptations for Widget Format

### 1. **Component Structure**
- Original: Single monolithic component (1,017 lines)
- Widget: Can stay mostly the same, but consider splitting into sub-components:
  - `PromptSection.tsx` - Prompt management
  - `AttachmentsSection.tsx` - File attachments
  - `ResponsesSection.tsx` - LLM responses
  - `ManagementSection.tsx` - Counts and bulk actions

### 2. **API Access**
- Original: `import { api } from "@/lib/api"`
- Widget: `window.CodeRefCore.api`

### 3. **Hook Usage**
- Original: `import { useSessionRefresh } from "@/hooks"`
- Widget: `const { useSessionRefresh } = window.CodeRefCore.hooks`

### 4. **Electron Detection**
- Original: `window.electronAPI`
- Widget: `window.CodeRefCore.utils.fileHandlers.isElectron()`

### 5. **File Dialogs**
- Original: `window.electronAPI.openFileDialog()` or native file input
- Widget: `await window.CodeRefCore.utils.fileHandlers.openFile()`

### 6. **Clipboard Access**
- Original: `navigator.clipboard.readText()`
- Widget: `await window.CodeRefCore.utils.clipboard.read()`

### 7. **Toast Notifications**
- Original: `import { toast } from "sonner"`
- Widget: Will need to import sonner OR expose toast through core (optional)
  - **Status**: Not yet in core, but can be added if needed

---

## What's Already Ready

✅ All 17 API methods are built and tested
✅ Session management hooks are built
✅ Clipboard utilities (with permission handling)
✅ File handling (Electron + Web support)
✅ Error handling via ErrorBoundary
✅ Bundle size optimized (50-65KB savings vs standalone)
✅ TypeScript types for all APIs
✅ Window global properly typed

---

## What Needs Development

⏳ Sonner toast notifications - Need to decide:
  - Option A: Import sonner in widget (adds to bundle)
  - Option B: Add toast notification API to core
  - Option C: Use native browser notifications

⏳ Convert component to widget format:
  - Remove internal imports, use window.CodeRefCore
  - Update paths for bundled environment
  - Ensure all icons load properly (Lucide icons)

⏳ Test in Electron environment:
  - File dialogs
  - Clipboard access
  - Navigation between sections

---

## Electron Compatibility Notes

### Current Status
- Electron wrapper at `packages/electron-app/src/main.ts`
- **Issue**: Settings/routes navigation broken (being debugged)
- SPA routing handler not working yet

### For Prompting Workflow Widget
- Widget doesn't do routing itself (stays on same page)
- Widget uses Electron APIs for:
  - File dialogs (✅ core supports)
  - Clipboard (✅ core supports)
  - Window management (✅ through IPC if needed)
- Should work once main routing issue is fixed

---

## File Structure When Built

```
packages/dashboard/public/widgets/
├── core.js (13KB) ..................... Core library
├── prompting-workflow.js (~35KB) ..... The widget bundle
├── coming-soon.js (8KB) .............. Demo widget
└── settings.js (8KB) ................. Settings widget
```

**Size Benefit**: Without core, widget would be ~85KB. With core, it's ~35KB.
**Savings per widget**: 50KB+ per widget due to code reuse.

---

## Next Steps

1. **Create widget package**:
   - `packages/widgets/@coderef-dashboard/widget-prompting-workflow/`
   - Copy PromptingWorkflowStandalone.tsx
   - Update all imports to use `window.CodeRefCore`

2. **Update core if needed**:
   - If toast notifications needed, add to core
   - Verify all APIs have proper TypeScript types
   - Add any missing error handling

3. **Adapt component**:
   - Replace internal API calls with `window.CodeRefCore.api`
   - Replace hook imports with `window.CodeRefCore.hooks`
   - Replace file handlers with `window.CodeRefCore.utils.fileHandlers`
   - Replace clipboard with `window.CodeRefCore.utils.clipboard`

4. **Build and test**:
   - Build widget with `npm run build:widgets`
   - Test in dashboard (`npm run dev`)
   - Test in Electron once routing is fixed (`npm run dev:electron`)

5. **Polish UI/UX** (Optional but mentioned earlier):
   - Improve layout and visual design
   - Add better status indicators
   - Consider component breakdown (Prompt/Attachments/Responses sections)

---

## Current Issues Blocking Development

⚠️ **Electron Navigation Bug**:
- Routes don't navigate properly (/settings shows splash then home)
- Will-navigate handler applied but still needs testing
- **Impact**: Can't test widget in Electron yet, but can test in web mode

---

## Questions to Resolve

1. **Toast notifications**: Import sonner or add to core?
2. **Component organization**: Keep monolithic or split into sections?
3. **UI improvements**: Redesign as requested or keep current design?
4. **Icon library**: Continue with Lucide or switch?
5. **Backend configuration**: How are LLM URLs configured in coderef-dashboard?

---

## Summary

The **Prompting Workflow Widget** has everything it needs in the coderef-dashboard core:
- ✅ All 17 APIs for prompt/attachment/response management
- ✅ Session management and auto-refresh
- ✅ Clipboard and file handling (Electron + Web)
- ✅ Full TypeScript type safety
- ✅ 50-65KB bundle size savings

The widget is ready to be built once:
1. We convert the component to use window.CodeRefCore
2. Decide on toast notifications approach
3. Fix the Electron routing bug (in progress)

**Estimated effort**: 4-6 hours to port component and test in both environments

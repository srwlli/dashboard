# Prompting Workflow - User Flow Description

## High-Level Overview

The Prompting Workflow is a **4-step LLM interaction loop** that guides users through:
1. **Setting up a prompt** (the question/task for the LLM)
2. **Attaching supporting files** (context, code samples, documents)
3. **Pasting LLM responses** (capturing the AI's output)
4. **Exporting formatted content** (for review, storage, or further processing)

---

## Detailed User Flows

### FLOW 1: Create and Load a Prompt

**Scenario**: User wants to ask an LLM a question

**Entry Point**: Click on the **Prompt Section**

**Steps**:
1. User sees "PROMPT" card with three options:
   - **[📁] Load File** - Import llm-prompt.json
   - **[📋] Paste** - Paste from clipboard
   - **[⭐] Preloaded** - Select template

2. **Path A - Load from File**:
   - User clicks "[📁] Load File"
   - File dialog opens (native on desktop, HTML on web)
   - User selects a .json file with prompt text
   - File is read and sent to backend
   - Status updates to show filename: `[filename.json]`
   - "Paste Count" resets

3. **Path B - Paste from Clipboard**:
   - User has copied prompt text to clipboard
   - Clicks "[📋] Paste"
   - System requests clipboard permission
   - Text is pasted and sent to backend
   - Status updates: `Prompt Accepted` (first paste) or `Prompts Accepted: 2` (multiple pastes)

4. **Path C - Use Preloaded Prompt**:
   - User clicks "[⭐] Preloaded"
   - Dropdown shows: "Code Review", "Synthesize", "Research", etc.
   - User selects a template
   - Selected prompt is loaded
   - Status shows: `[Preloaded: Code Review]`

5. **Add Custom Prompt** (related action):
   - User clicks "[➕] Add" button
   - Modal opens with form:
     - Label field (required, max 100 chars)
     - Prompt text field (required, max 10,000 chars)
   - User fills form with validation feedback
   - Clicks "Save"
   - New prompt saved and added to preloaded list

6. **View Current Prompt**:
   - User clicks "[👁️] View"
   - Modal shows formatted prompt exactly as LLM will see it
   - User can copy from modal if needed

7. **Clear Prompt**:
   - User clicks "[🗑️] Clear"
   - Confirmation dialog
   - Prompt is cleared
   - Status resets: `No prompt`

---

### FLOW 2: Add Supporting Files/Attachments

**Scenario**: User has code, documents, or context they want the LLM to consider

**Entry Point**: Click on the **Attachments Section**

**Current State**:
- Shows how many files attached
- Shows total line count
- Example: `main.py, utils.ts (245 lines)`

**Steps**:

1. **Path A - Attach File**:
   - User clicks "[📎] Attach File"
   - File dialog opens (filters for code: .py, .js, .ts, .json, .md, etc.)
   - User selects a file
   - File is read and sent to backend
   - Line count calculated
   - Status updates: `main.py, utils.ts (245 lines)`

2. **Path B - Paste as Attachment**:
   - User has copied code/text to clipboard
   - Clicks "[📋] Paste"
   - Text pasted as new attachment
   - Auto-named: `clipboard-1.txt`, `clipboard-2.txt`, etc.
   - Line count increments

3. **View All Attachments**:
   - User clicks "[👁️] View"
   - Modal shows all attachments formatted for LLM
   - Shows how it will appear in the LLM request
   - User can copy formatted content

4. **Remove Attachments**:
   - User clicks "[🗑️] Clear"
   - Confirmation dialog
   - All attachments cleared
   - Status resets: `No attachments`

**Status Display**:
```
Attachments:
├─ main.py (142 lines)
├─ utils.ts (87 lines)
└─ data.json (16 lines)
Total: 245 lines
```

---

### FLOW 3: Paste and Track LLM Responses

**Scenario**: User has sent prompt+attachments to LLM, got response, now storing it

**Entry Point**: Click on the **Responses Section**

**Current State**:
- Shows count of responses saved
- Shows total character count
- Shows configured LLM URLs (ChatGPT, Claude, etc.)

**Steps**:

1. **Paste Response from LLM**:
   - User copies response from ChatGPT/Claude/other LLM
   - Clicks "[📋] Paste Response"
   - System asks for clipboard permission
   - Response is pasted and sent to backend
   - Toast shows: `Response added (5,247 chars)`
   - Char count updates

2. **Large Content Warning**:
   - If response is > 200,000 characters
   - Modal warning: "Clipboard content is very large (523,401 chars). Add anyway?"
   - User confirms or cancels

3. **Track Multiple Responses**:
   - User can paste multiple LLM responses
   - Each response is counted and stored
   - Status updates: `2 responses (8,492 chars)`

4. **Open All LLMs**:
   - User clicks "[🌐] Open All"
   - All configured LLM URLs open in new tabs
   - Allows side-by-side comparison
   - Config example: ChatGPT, Claude, Gemini, local Ollama, etc.

5. **View Formatted Responses**:
   - User clicks "[👁️] View"
   - Modal shows all responses formatted for export
   - Can copy to clipboard
   - Can save as file

6. **Clear Responses**:
   - User clicks "[🗑️] Clear"
   - Confirmation dialog
   - All responses cleared
   - Status resets: `0 responses`

---

### FLOW 4: Export and Management

**Scenario**: User has prompt, attachments, and responses. Now reviewing and exporting.

**Entry Point**: Click on the **Management Section**

**Current State**:
- Shows total counts:
  - Custom prompts saved: 7
  - Total attachments ever added: 42
  - Total responses captured: 15

**Possible Actions** (in current design):

1. **View All Data**:
   - User clicks "Management" card
   - Shows summary statistics
   - Options to view/clear each section

2. **Export Formatted Content**:
   - User can export prompt + attachments + responses
   - Formatted for LLM: Shows structure and context
   - Can copy to clipboard or download

3. **Clear Everything**:
   - Bulk clear option (with confirmation)
   - Starts fresh session

---

## Complete User Session Example

### A Real-World Scenario: Code Review Task

**Objective**: Ask an LLM to review Python code

**Step-by-step**:

1. **User loads prompt**:
   - Selects preloaded "Code Review" prompt
   - Status: `[Preloaded: Code Review]`
   - Prompt text: "You are a senior Python developer reviewing code for best practices..."

2. **User attaches code files**:
   - Attaches: `main.py` (285 lines)
   - Attaches: `utils.py` (156 lines)
   - Attaches: `tests.py` (420 lines)
   - Status: `main.py, utils.py, tests.py (861 lines)`

3. **User opens ChatGPT**:
   - Clicks "[🌐] Open All"
   - ChatGPT window opens in new tab
   - User pastes prompt + attachments into ChatGPT

4. **User gets response**:
   - LLM provides 5,000+ character code review
   - User copies response

5. **User pastes response**:
   - Returns to dashboard
   - Clicks "[📋] Paste Response"
   - Response saved
   - Status: `1 response (5,247 chars)`

6. **User views formatted export**:
   - Clicks "[👁️] View" in Responses
   - Sees: Prompt + Attachments + Response all formatted nicely
   - Can copy entire exchange for documentation

7. **Session complete**:
   - User can now:
     - Clear everything and start new task
     - Save another response from different LLM
     - Export to file for records

---

## Key UX Patterns

### Status Indicators
- **Color coded**: Green (loaded), Yellow (warning), Red (error)
- **Icon + Text**: Visual + written feedback
- Examples:
  - `✓ Code Review` (prompt loaded)
  - `📎 3 files (1.2MB)` (attachments ready)
  - `📝 2 responses` (responses captured)

### Buttons Pattern
Each section has consistent button layout:
```
[Action] [Action] | [View] [Clear]
```

Examples:
```
PROMPT:
[Load File] [Paste] | [View] [Clear] | [+Add] [⭐Preloaded]

ATTACHMENTS:
[Attach File] [Paste] | [View] [Clear]

RESPONSES:
[Paste] [Open All LLMs] | [View] [Clear]
```

### Modals
- **View modals**: Show formatted content, allow copy
- **Add modal**: Form for saving new prompts
- **Confirm modals**: For destructive actions (Clear)

### Toast Notifications
- Success: "Response added (5,247 chars)"
- Error: "Failed to read clipboard"
- Info: "No attachments to view"
- Warning: "Clipboard content is very large..."

---

## Mobile/Responsive Considerations

**On small screens**:
- Stack sections vertically
- Button groups become smaller or wrap
- Modals are full-screen or modal dialogs
- Status text truncates or wraps

**On medium screens**:
- Two columns possible (Prompt + Attachments top, Responses + Management below)
- Modals are centered

**On desktop (current)**:
- Full width sections
- All buttons visible
- Modals are modal dialogs

---

## Data Flow Architecture

```
User Action (e.g., "Paste Prompt")
    ↓
Widget detects action (click event)
    ↓
Widget calls window.CodeRefCore.api.setPrompt(text)
    ↓
API sends to backend via fetch
    ↓
Backend stores data (session state)
    ↓
Widget refreshes UI via useSessionRefresh hook
    ↓
Status updates in real-time
    ↓
User sees confirmation (toast + status update)
```

---

## State Management Summary

### Local State (in React component)
- UI state: Modal open/closed, form values
- Display state: Selected prompt, view content
- Loading state: isLoading, isSaving

### Server State (via window.CodeRefCore.api)
- Current prompt
- List of attachments
- Response count and text
- Preloaded prompts list
- Configuration (LLM URLs)

### Session State (via useSessionRefresh)
- Auto-refresh when "session-refresh" event fires
- Keeps data in sync across multiple components
- Supports collaborative scenarios

---

## Error Handling Flow

**Common errors**:

1. **Clipboard Access Denied**:
   - User clicks "Paste"
   - Browser asks for permission
   - User denies
   - Toast: "Please click the button again to allow clipboard access"
   - User clicks again, grants permission

2. **File Too Large**:
   - User tries to attach 3MB file
   - Toast: "File too large to attach (max 2MB)"
   - User must choose smaller file

3. **Backend Error**:
   - API call fails
   - Toast shows error message
   - Data rollback (state unchanged)

4. **Large Response Warning**:
   - Response > 200,000 chars
   - Modal asks: "Add anyway?"
   - User confirms or cancels

---

## Summary of All Actions

| Section | Action | Input | Output |
|---------|--------|-------|--------|
| **PROMPT** | Load File | Select .json file | Prompt loaded, status updated |
| | Paste | Clipboard | Prompt loaded, count incremented |
| | Preloaded | Select template | Template loaded, status updated |
| | Add | Form (label + text) | New prompt saved |
| | View | None | Modal shows formatted prompt |
| | Clear | Confirm | Prompt cleared, status reset |
| **ATTACHMENTS** | Attach | Select file | File attached, line count shown |
| | Paste | Clipboard | Content attached, auto-named |
| | View | None | Modal shows formatted files |
| | Clear | Confirm | All attachments cleared |
| **RESPONSES** | Paste | Clipboard | Response saved, char count shown |
| | Open All | Config | New tabs open for each LLM URL |
| | View | None | Modal shows all responses |
| | Clear | Confirm | All responses cleared |
| **MANAGEMENT** | View | None | Shows total counts |
| | Clear All | Confirm | Everything cleared, new session |

---

## Timeline of a Typical Session

```
T=0:00   → User opens dashboard, widget loads
T=0:05   → User clicks "Load File" under PROMPT
T=0:10   → User selects llm-prompt.json, it loads
         → Status shows: [llm-prompt.json]

T=0:15   → User clicks "Attach File" under ATTACHMENTS
T=0:20   → User selects main.py (285 lines)
T=0:30   → User clicks "Attach File" again
T=0:35   → User selects utils.py (156 lines)
         → Status shows: main.py, utils.py (441 lines)

T=0:40   → User clicks "Open All LLMs"
         → ChatGPT tab opens in new window
T=1:00   → User manually copies & pastes prompt into LLM
T=5:00   → LLM response arrives
T=5:05   → User copies LLM response to clipboard

T=5:10   → User returns to dashboard
T=5:15   → User clicks "Paste Response" under RESPONSES
T=5:20   → Response pasted successfully
         → Toast: "Response added (4,892 chars)"
         → Status shows: 1 response (4,892 chars)

T=5:25   → User clicks "View" under RESPONSES
T=5:30   → Modal shows formatted prompt + files + response
T=5:35   → User copies entire content for documentation

T=5:40   → Session complete
         → User can close or start new task
```

---

## For Designer/Mockup Agent

### Key Sections to Visualize

1. **Prompt Card**
   - Status badge showing current prompt
   - 6 buttons in organized layout
   - Preloaded prompt selector (dropdown)
   - "Paste count" indicator

2. **Attachments Card**
   - Status showing files and line counts
   - 4 buttons (Attach, Paste, View, Clear)
   - Visual list of attached files with sizes

3. **Responses Card**
   - Status showing count and total chars
   - 4 buttons (Paste, Open All, View, Clear)
   - List of configured LLM URLs (with icons if possible)

4. **Management Card**
   - Summary statistics (total prompts, files, responses)
   - Counts displayed prominently

5. **Modals**:
   - View modals: Large text area showing content, Copy button
   - Add Prompt modal: Form with validation, Save button
   - Confirm modals: Warning text, Confirm/Cancel buttons

### Visual Hierarchy
- Section titles clear and prominent
- Status information highlighted
- Buttons organized by action type (primary, secondary, danger)
- Toast notifications at bottom right
- Color coding for different states

---

## Key Requirements for Implementation

✅ All data operations via `window.CodeRefCore.api`
✅ Session refresh handling via `useSessionRefresh` hook
✅ Clipboard operations via `window.CodeRefCore.utils.clipboard`
✅ File dialogs via `window.CodeRefCore.utils.fileHandlers`
✅ Electron detection via `window.CodeRefCore.utils.fileHandlers.isElectron()`
✅ Toast notifications for user feedback
✅ Modal system for viewing and editing
✅ Confirmation dialogs for destructive actions
✅ Loading states during API calls
✅ Error handling and recovery

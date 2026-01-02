# Scanner Backend Integration - Agent Request Form

**Workorder:** WO-DASHBOARD-SCANNER-BACKEND-002
**Feature:** scanner-backend-integration
**Requesting Agent:** CodeRef Assistant
**Target Agent:** GUI/Backend Integration Specialist
**Date:** 2026-01-02
**Priority:** High

---

## Executive Summary

The CodeRef Dashboard has a **fully functional UI mockup** for the Scanner page (`/scanner` route), but it currently has **no backend integration**. We have identified a **working Python Tkinter Scanner GUI** (`scanner-gui/src/main.py`) that successfully:

- Manages saved projects (stored in `~/.coderef-scanner-projects.json`)
- Executes batch scanning via `scan-all.py` subprocess calls
- Streams real-time output to a terminal console
- Generates foundation documentation post-scan

**Goal:** Integrate the Python scanner functionality into the Next.js Dashboard Scanner page, replacing the UI mockup with a fully functional scanner.

---

## Current State Analysis

### ✅ What We Have (UI Mockup)

**Location:** `packages/dashboard/src/components/Scanner/`

1. **ProjectListCard.tsx** - Project selection panel (left side)
   - Empty state: "No Projects Configured"
   - "Add Path" button (non-functional)
   - Project list with checkboxes (mockup)

2. **ConsoleTabs.tsx** - Console/History/Config tabs (right side)
   - Console tab: Terminal-style display with placeholder text
   - History tab: Empty state placeholder
   - Config tab: Hardcoded configuration display

3. **ActionBar.tsx** - Bottom action buttons
   - "Scan Projects" button (disabled when no selection)
   - "Clear" button
   - Selection counter

### ✅ What We Have (Python Scanner)

**Location:** `C:\Users\willh\Desktop\projects\coderef-system\scanner-gui\src\main.py`

- Fully functional Tkinter GUI
- Project persistence (`~/.coderef-scanner-projects.json`)
- Batch scanning with `scan-all.py` subprocess execution
- Real-time output streaming
- Success/failure tracking
- Foundation docs generation

### ❌ What We Need (Backend Integration)

**Missing:** API routes, subprocess execution, state management, real-time output streaming

---

## Information Request Form

Please provide detailed answers to the following sections. This information will be used to create the implementation plan.

---

## SECTION 1: Architecture & Technology Stack

### 1.1 Backend Framework Preference

**Question:** Should we use Next.js API routes (Node.js) or create a separate Python FastAPI backend?

- [ ] **Option A:** Next.js API routes (Node.js `child_process` to call `scan-all.py`)
  - **Pros:** Single deployment, no separate backend server, uses existing Next.js infrastructure
  - **Cons:** Node.js calling Python subprocess (cross-language complexity)

- [ ] **Option B:** Separate Python FastAPI backend (dedicated scanner service)
  - **Pros:** Native Python integration, easier to call `scan-all.py`, cleaner separation
  - **Cons:** Requires separate deployment, CORS handling, more infrastructure complexity

- [ ] **Option C:** Hybrid (Node.js API routes that proxy to a local Python service)
  - **Pros:** Best of both worlds
  - **Cons:** Most complex architecture

**Your Recommendation:**
```
[ Fill in your preferred approach and reasoning ]
```

---

### 1.2 Real-Time Communication Method

**Question:** How should we stream real-time scan output from backend to frontend?

- [ ] **Option A:** Server-Sent Events (SSE)
  - Simpler implementation, one-way server → client
  - Good for real-time logs

- [ ] **Option B:** WebSockets
  - Full duplex communication
  - More complex but supports bidirectional messaging

- [ ] **Option C:** Polling (GET /api/scanner/output every 500ms)
  - Simplest implementation
  - Higher latency, more server load

**Your Recommendation:**
```
[ Fill in your preferred approach and reasoning ]
```

---

### 1.3 Project Storage Location

**Question:** Where should we store the saved projects list?

Current Python GUI uses: `~/.coderef-scanner-projects.json`

- [ ] **Option A:** Reuse existing `~/.coderef-dashboard/projects.json` (if it exists)
- [ ] **Option B:** Create new `~/.coderef-scanner-projects.json` (matches Python GUI)
- [ ] **Option C:** Browser localStorage (web-only, no Electron persistence)
- [ ] **Option D:** Database (SQLite or other)

**Your Recommendation:**
```
[ Fill in your preferred approach and reasoning ]
```

---

## SECTION 2: API Endpoint Design

Please specify the exact API endpoints needed and their request/response schemas.

### 2.1 Project Management Endpoints

#### **GET /api/scanner/projects**
**Purpose:** Fetch list of saved projects

**Request:**
```typescript
// No body
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    projects: Array<{
      id: string;           // Unique ID or path hash?
      path: string;         // Absolute path to project
      name?: string;        // Display name (folder name?)
      lastScanned?: string; // ISO timestamp
    }>;
    total: number;
  };
  timestamp: string;
}
```

**Questions:**
1. Should projects have UUIDs or use path as ID?
   ```
   [ Your answer ]
   ```

2. Should we store additional metadata (name, lastScanned, status)?
   ```
   [ Your answer ]
   ```

---

#### **POST /api/scanner/projects**
**Purpose:** Add a new project to the saved list

**Request:**
```typescript
{
  path: string;  // Absolute path to project directory
  name?: string; // Optional display name
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    project: {
      id: string;
      path: string;
      name?: string;
      addedAt: string;
    };
  };
  error?: { code: string; message: string; };
  timestamp: string;
}
```

**Questions:**
1. Should we validate that the path exists before adding?
   ```
   [ Your answer ]
   ```

2. Should we prevent duplicate paths?
   ```
   [ Your answer ]
   ```

---

#### **DELETE /api/scanner/projects/:id**
**Purpose:** Remove a project from the saved list

**Request:**
```typescript
// Path parameter: :id (project ID or path)
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    removed: boolean;
    projectId: string;
  };
  error?: { code: string; message: string; };
  timestamp: string;
}
```

---

### 2.2 Scanning Endpoints

#### **POST /api/scanner/scan**
**Purpose:** Start a batch scan for selected projects

**Request:**
```typescript
{
  projectIds: string[];      // Array of project IDs to scan
  generateDocs?: boolean;    // Optional: Generate foundation docs
  options?: {
    excludePatterns?: string[];  // node_modules, .git, etc.
    fileTypes?: string[];        // *.js, *.ts, *.py
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    scanId: string;           // Unique scan session ID
    projectCount: number;
    status: "started" | "queued";
  };
  error?: { code: string; message: string; };
  timestamp: string;
}
```

**Questions:**
1. Should we support concurrent scans or queue them?
   ```
   [ Your answer ]
   ```

2. Should we return a scanId to track progress?
   ```
   [ Your answer ]
   ```

---

#### **GET /api/scanner/scan/:scanId/status**
**Purpose:** Get current status of a running scan

**Request:**
```typescript
// Path parameter: :scanId
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    scanId: string;
    status: "running" | "completed" | "failed" | "cancelled";
    progress: {
      currentProject: number;
      totalProjects: number;
      currentProjectPath: string;
    };
    results: {
      successful: number;
      failed: number;
      projects: Array<{
        path: string;
        status: "pending" | "scanning" | "success" | "failed";
        exitCode?: number;
      }>;
    };
  };
  timestamp: string;
}
```

**Questions:**
1. Should we store scan history for the History tab?
   ```
   [ Your answer ]
   ```

2. How long should we keep completed scan status in memory?
   ```
   [ Your answer ]
   ```

---

#### **GET /api/scanner/scan/:scanId/output** (SSE or WebSocket)
**Purpose:** Stream real-time output from the scan process

**Response (SSE):**
```typescript
// Server-Sent Events stream
event: log
data: {"type": "stdout", "line": "> System Initialized", "timestamp": "..."}

event: log
data: {"type": "stdout", "line": "[1/3] Scanning: C:\\path\\to\\project", "timestamp": "..."}

event: progress
data: {"current": 1, "total": 3, "project": "C:\\path\\to\\project"}

event: complete
data: {"scanId": "...", "success": 2, "failed": 1}
```

**Questions:**
1. What output format should we use for streaming?
   ```
   [ Your answer ]
   ```

2. Should we include color codes for terminal styling?
   ```
   [ Your answer ]
   ```

---

#### **POST /api/scanner/scan/:scanId/cancel**
**Purpose:** Cancel a running scan

**Request:**
```typescript
// No body
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    scanId: string;
    cancelled: boolean;
  };
  timestamp: string;
}
```

---

### 2.3 Configuration Endpoints (Optional)

#### **GET /api/scanner/config**
**Purpose:** Get scanner configuration (for Config tab)

**Response:**
```typescript
{
  success: boolean;
  data: {
    mode: "Universal Structure";
    filters: string[];          // ["*.js", "*.ts", "*.py"]
    exclude: string[];          // ["node_modules", ".git"]
    generateDocs: boolean;
    scanScript: string;         // Path to scan-all.py
  };
  timestamp: string;
}
```

**Questions:**
1. Should configuration be editable via the UI?
   ```
   [ Your answer ]
   ```

2. Should we support per-project configuration overrides?
   ```
   [ Your answer ]
   ```

---

## SECTION 3: State Management

### 3.1 Frontend State Requirements

**Question:** What state should be managed on the frontend?

Please check all that apply and add any additional state:

- [ ] `projects: Project[]` - List of saved projects
- [ ] `selectedProjectIds: string[]` - Currently selected projects for scanning
- [ ] `scanStatus: ScanStatus` - Current scan state (idle, scanning, complete)
- [ ] `scanProgress: ScanProgress` - Progress tracking
- [ ] `consoleOutput: string[]` - Array of console log lines
- [ ] `scanHistory: ScanHistoryItem[]` - Past scan results
- [ ] `configuration: ScanConfig` - Scanner configuration

**Additional state needed:**
```
[ List any additional state requirements ]
```

---

### 3.2 State Persistence

**Question:** What state should persist across browser sessions?

- [ ] Saved projects list
- [ ] Console output (last scan)
- [ ] Scan history
- [ ] Configuration settings
- [ ] Selected projects (restore selection on reload)

**Additional persistence requirements:**
```
[ List any additional persistence requirements ]
```

---

## SECTION 4: Python Integration

### 4.1 scan-all.py Execution

**Question:** How should we execute `scan-all.py` from the backend?

**Current Python GUI approach:**
```python
subprocess.Popen(
    [python_exe, str(scan_script), project_path],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)
```

**Node.js equivalent:**
```javascript
const { spawn } = require('child_process');
const scanProcess = spawn('python', [scanScriptPath, projectPath], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe']
});
```

**Questions:**
1. Should we assume `python` is in PATH or require explicit Python path?
   ```
   [ Your answer ]
   ```

2. Should we validate that `scan-all.py` exists before starting scan?
   ```
   [ Your answer ]
   ```

3. How should we handle Python environment (venv, conda, system Python)?
   ```
   [ Your answer ]
   ```

---

### 4.2 Foundation Docs Generation

**Question:** Should foundation docs generation be:

- [ ] **Automatic** (always run after scan)
- [ ] **Optional** (checkbox like Python GUI)
- [ ] **Separate button** (user triggers manually)

**Current Python GUI approach:**
```python
if self.generate_docs_var.get():
    subprocess.run(
        [sys.executable, "parse_coderef_data.py"],
        cwd=project_path
    )
```

**Your Recommendation:**
```
[ Fill in your preferred approach and reasoning ]
```

---

## SECTION 5: Error Handling

### 5.1 Error Scenarios

**Question:** How should we handle the following errors?

1. **Project path doesn't exist:**
   ```
   [ Your error handling approach ]
   ```

2. **Python not found / scan-all.py missing:**
   ```
   [ Your error handling approach ]
   ```

3. **Scan process crashes mid-scan:**
   ```
   [ Your error handling approach ]
   ```

4. **Permission denied (can't read project directory):**
   ```
   [ Your error handling approach ]
   ```

5. **Multiple scans attempted simultaneously:**
   ```
   [ Your error handling approach ]
   ```

6. **Browser/tab closed during scan:**
   ```
   [ Your error handling approach ]
   ```

---

### 5.2 User Feedback

**Question:** How should we display errors to the user?

- [ ] Toast notifications (top-right corner)
- [ ] Modal dialogs (blocking)
- [ ] Inline error messages in console
- [ ] Error banner at top of page

**Your Recommendation:**
```
[ Fill in your preferred approach and examples ]
```

---

## SECTION 6: UI/UX Enhancements

### 6.1 Project Selection UX

**Question:** How should the "Add Path" button work in the web UI?

Current Python GUI uses `filedialog.askdirectory()` (native OS dialog).

**Web Options:**
- [ ] **Browser File API** (`<input type="file" webkitdirectory>`) - Works in browser, no native dialog
- [ ] **Electron IPC** (native OS dialog via Electron) - Best UX, Electron-only
- [ ] **Manual text input** (user types/pastes path) - Works everywhere, worse UX

**Your Recommendation:**
```
[ Fill in your preferred approach ]
```

---

### 6.2 Console Output Styling

**Question:** Should the console output match the Python GUI terminal styling?

**Python GUI uses:**
- Green text for success messages (`✅`)
- Blue text for info messages
- Red/pink for errors
- Yellow for warnings
- Monospace font (JetBrains Mono)

**Should we:**
- [ ] **Match exactly** (ANSI color codes or CSS classes)
- [ ] **Simplify** (single color, focus on content)
- [ ] **Enhance** (syntax highlighting, expandable sections)

**Your Recommendation:**
```
[ Fill in your preferred approach ]
```

---

### 6.3 Scan History Tab

**Question:** What should the History tab display?

**Possible features:**
- [ ] List of past scans with timestamps
- [ ] Success/failure counts per scan
- [ ] Ability to view past scan output
- [ ] Filter by date/project
- [ ] Clear history button

**Your Design:**
```
[ Describe the History tab UI/functionality ]
```

---

### 6.4 Config Tab

**Question:** Should the Config tab be:

- [ ] **Read-only** (display current config)
- [ ] **Editable** (allow users to change filters, exclude patterns)
- [ ] **Advanced** (show scan-all.py path, Python version, etc.)

**Your Recommendation:**
```
[ Fill in your preferred approach ]
```

---

## SECTION 7: Testing & Validation

### 7.1 Test Scenarios

**Question:** What scenarios should we test?

Please check all that apply and add any additional tests:

- [ ] Add project with valid path
- [ ] Add project with invalid path
- [ ] Remove project from list
- [ ] Scan single project
- [ ] Scan multiple projects (batch)
- [ ] Cancel scan mid-process
- [ ] Scan with missing Python
- [ ] Scan with missing scan-all.py
- [ ] Multiple tabs open (state sync)
- [ ] Browser refresh during scan
- [ ] Real-time output streaming
- [ ] Foundation docs generation

**Additional test scenarios:**
```
[ List any additional test scenarios ]
```

---

### 7.2 Performance Considerations

**Question:** What are the performance targets?

1. **Project list load time:**
   ```
   [ Target: < X ms ]
   ```

2. **Scan start latency (button click → scan begins):**
   ```
   [ Target: < X ms ]
   ```

3. **Output streaming latency (log appears in console):**
   ```
   [ Target: < X ms ]
   ```

4. **Maximum number of projects in list:**
   ```
   [ Target: X projects ]
   ```

5. **Maximum concurrent scans:**
   ```
   [ Target: X concurrent scans ]
   ```

---

## SECTION 8: Implementation Plan Preferences

### 8.1 Phased Approach

**Question:** Should we implement in phases or all at once?

**Proposed Phases:**

**Phase 1: Project Management**
- Add/remove/list projects
- Persist to JSON file
- Update UI to show real projects

**Phase 2: Basic Scanning**
- Single project scan
- Execute scan-all.py subprocess
- Display basic output (no streaming)

**Phase 3: Real-Time Output**
- Implement SSE/WebSocket streaming
- Update console in real-time
- Progress tracking

**Phase 4: Advanced Features**
- Batch scanning
- Foundation docs generation
- Scan history
- Editable configuration

**Your Preference:**
- [ ] All at once (single implementation)
- [ ] Phased approach (4 separate PRs)
- [ ] Custom phases (specify below)

**Custom phases:**
```
[ If custom, describe your preferred phases ]
```

---

### 8.2 Code Organization

**Question:** How should we organize the backend code?

**Proposed structure:**
```
packages/dashboard/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── scanner/
│   │           ├── projects/route.ts        # GET/POST /api/scanner/projects
│   │           ├── projects/[id]/route.ts   # DELETE /api/scanner/projects/:id
│   │           ├── scan/route.ts            # POST /api/scanner/scan
│   │           ├── scan/[scanId]/
│   │           │   ├── status/route.ts      # GET status
│   │           │   ├── output/route.ts      # SSE stream
│   │           │   └── cancel/route.ts      # POST cancel
│   │           └── config/route.ts          # GET config
│   ├── lib/
│   │   └── scanner/
│   │       ├── projectManager.ts            # Project CRUD operations
│   │       ├── scanExecutor.ts              # Execute scan-all.py
│   │       ├── outputStreamer.ts            # SSE/WebSocket streaming
│   │       └── types.ts                     # TypeScript interfaces
│   └── components/
│       └── Scanner/
│           ├── index.tsx                    # (existing)
│           ├── ProjectListCard.tsx          # (update to use real data)
│           ├── ConsoleTabs.tsx              # (update to stream output)
│           └── ActionBar.tsx                # (update to trigger scans)
```

**Your Recommendation:**
```
[ Approve or suggest alternative structure ]
```

---

## SECTION 9: Additional Questions

### 9.1 Open Questions

**Please list any additional questions or concerns you have:**

1. ```
   [ Your question ]
   ```

2. ```
   [ Your question ]
   ```

3. ```
   [ Your question ]
   ```

---

### 9.2 Assumptions & Constraints

**Please list any assumptions or constraints we should be aware of:**

1. ```
   [ Your assumption/constraint ]
   ```

2. ```
   [ Your assumption/constraint ]
   ```

3. ```
   [ Your assumption/constraint ]
   ```

---

## SECTION 10: Sign-Off

**Agent Name:**
```
[ Your agent identifier ]
```

**Estimated Implementation Time:**
```
[ Your estimate in hours ]
```

**Preferred Start Date:**
```
[ When you can start ]
```

**Blockers/Dependencies:**
```
[ List any blockers or dependencies ]
```

**Additional Notes:**
```
[ Any other relevant information ]
```

---

## Submission Instructions

1. **Fill out all sections** above with your recommendations and answers
2. **Save this file** as `AGENT-REQUEST-FORM-COMPLETED.md` in the same directory
3. **Create a summary** of your key architectural decisions in `ARCHITECTURE-DECISIONS.md`
4. **Notify the requesting agent** that the form is complete
5. **Wait for approval** before beginning implementation

---

**Form Version:** 1.0
**Last Updated:** 2026-01-02
**Created By:** CodeRef Assistant (Orchestrator)

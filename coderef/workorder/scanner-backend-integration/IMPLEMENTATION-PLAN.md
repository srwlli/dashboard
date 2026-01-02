# Scanner Backend Integration - Implementation Plan

**Workorder:** WO-SCANNER-BACKEND-INTEGRATION-001
**Feature:** scanner-backend-integration
**Created:** 2026-01-02
**Status:** Ready for Implementation

---

## Executive Summary

**Mission:** Wire the existing Scanner page UI mockup to a fully functional backend that manages projects and executes Python scans.

**Current State:**
- ✅ UI exists at `/scanner` route (ProjectListCard, ConsoleTabs, ActionBar)
- ✅ Python Scanner GUI reference implementation (`scanner-gui/src/main.py`)
- ✅ `scan-all.py` script available at known location
- ✅ Electron IPC for file dialogs already implemented
- ❌ No backend API routes
- ❌ No subprocess execution
- ❌ No real-time output streaming

**Goal:** Enable full scanner workflow: Add projects → Select projects → Click Scan → View real-time output

---

## Reference Information Gathered

### 1. Project Registry Pattern
**File:** `packages/dashboard/src/app/api/coderef/projects/route.ts`
**Storage:** `~/.coderef-dashboard/projects.json`
**Interface:**
```typescript
interface CodeRefProject {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}
```
**Decision:** Create separate `~/.coderef-scanner-projects.json` to match Python GUI behavior

### 2. API Route Pattern
**File:** `packages/dashboard/src/app/api/workorders/route.ts`
**Error Format:**
```typescript
{
  success: false,
  error: { code: string, message: string, details?: any },
  timestamp: string
}
```
**Success Format:**
```typescript
{
  success: true,
  data: T,
  timestamp: string
}
```
**Utilities:** `createErrorResponse()`, `createSuccessResponse()` from `@/types/api`

### 3. Subprocess Execution
**Status:** No existing implementation - will create new
**Pattern:** Use Node.js `child_process.spawn()` for Python subprocess

### 4. Real-Time Communication
**Status:** No existing SSE/WebSocket - will implement SSE from scratch
**Reason:** SSE is simpler for unidirectional server→client streaming

### 5. File System Access
**Pattern:** Node.js `fs/promises` with `path.join()` for cross-platform paths
**Reference:** `/api/coderef/projects/route.ts` lines 43-95 (storage file handling)

### 6. Frontend State Management
**Current:** Local `useState` in each Scanner component
**Pattern:** No global state/context - components fetch data independently
**Recommendation:** Add shared state for scan progress tracking

### 7. Python Script Location
**Dev:** `C:\Users\willh\Desktop\projects\coderef-system\scripts\scan-all.py`
**Strategy:** Use environment variable `SCAN_SCRIPT_PATH` with fallback

### 8. Electron Integration
**Status:** Using Electron with IPC handlers
**File:** `packages/electron-app/src/main.ts`
**Existing IPC:**
- `fs:selectDirectory` (line 115) - Native folder dialog
- `fs:validatePath` (line 153) - Path validation
**Decision:** Use existing `fs:selectDirectory` for "Add Path" button

### 9. Error Handling
**Pattern:** Inline error messages + console logging
**No toast system found** - will use inline messages in console tab

### 10. Testing
**Framework:** Unknown - will create tests following existing patterns
**Pattern:** Manual testing first, add automated tests later

---

## Implementation Plan

### Phase 1: Project Management API (4-6 hours)

#### SETUP-001: Create API Route Structure
**Files to create:**
```
packages/dashboard/src/app/api/scanner/
├── projects/
│   ├── route.ts          # GET/POST /api/scanner/projects
│   └── [id]/route.ts     # DELETE /api/scanner/projects/:id
└── types.ts              # Shared TypeScript interfaces
```

#### IMPL-001: Project Storage Implementation
**File:** `packages/dashboard/src/app/api/scanner/projects/route.ts`

**Features:**
- Load/save from `~/.coderef-scanner-projects.json`
- Match Python GUI storage format
- Reuse patterns from `/api/coderef/projects/route.ts`

**Code skeleton:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface ScannerProject {
  id: string;
  path: string;
  name?: string;
  addedAt: string;
}

function getStoragePath(): string {
  return path.join(os.homedir(), '.coderef-scanner-projects.json');
}

async function loadProjects(): Promise<ScannerProject[]> {
  // TODO: Implement (copy from coderef/projects pattern)
}

async function saveProjects(projects: ScannerProject[]): Promise<void> {
  // TODO: Implement
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // TODO: Return all projects
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // TODO: Add/update project
  // Validate path exists before adding
}
```

#### IMPL-002: Project Deletion Endpoint
**File:** `packages/dashboard/src/app/api/scanner/projects/[id]/route.ts`

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // TODO: Remove project by ID
}
```

#### UI-001: Update ProjectListCard
**File:** `packages/dashboard/src/components/Scanner/ProjectListCard.tsx`

**Changes:**
- Replace `useState<string[]>([])` with API fetch
- Add `useEffect` to load projects on mount
- Wire "Add Path" button to Electron IPC
- Wire "Remove" button (currently doesn't exist - add it)
- Add checkboxes for multi-select

**Code changes:**
```typescript
'use client';

import { useState, useEffect } from 'react';

interface ScannerProject {
  id: string;
  path: string;
  name?: string;
  addedAt: string;
}

export function ProjectListCard() {
  const [projects, setProjects] = useState<ScannerProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/scanner/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPath() {
    // Call Electron IPC to open folder dialog
    if (window.electron) {
      const selectedPath = await window.electron.fs.selectDirectory();
      if (selectedPath) {
        // Add to backend
        await fetch('/api/scanner/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedPath,  // Use path as ID
            path: selectedPath,
            name: selectedPath.split(/[/\\]/).pop(),
          }),
        });
        // Refresh list
        await fetchProjects();
      }
    }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/scanner/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await fetchProjects();
  }

  // TODO: Render project list with checkboxes
  // TODO: Track selectedIds for scan button
}
```

**Test:** Can add projects via dialog, projects persist, can delete projects

---

### Phase 2: Scan Execution API (6-8 hours)

#### SETUP-002: Create Scan API Routes
**Files to create:**
```
packages/dashboard/src/app/api/scanner/
├── scan/
│   ├── route.ts              # POST /api/scanner/scan
│   └── [scanId]/
│       ├── status/route.ts   # GET /api/scanner/scan/:id/status
│       ├── output/route.ts   # GET /api/scanner/scan/:id/output (SSE)
│       └── cancel/route.ts   # POST /api/scanner/scan/:id/cancel
└── lib/
    └── scanExecutor.ts       # Subprocess execution logic
```

#### IMPL-003: Scan Executor Module
**File:** `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts`

**Features:**
- Execute `scan-all.py` via `child_process.spawn()`
- Track multiple concurrent scans
- Stream stdout/stderr
- Handle process lifecycle

**Code skeleton:**
```typescript
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface ScanProgress {
  scanId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentProject: number;
  totalProjects: number;
  currentProjectPath: string;
  output: string[];
  exitCode?: number;
}

export class ScanExecutor extends EventEmitter {
  private scans: Map<string, ScanProgress> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  async startScan(
    scanId: string,
    projectPaths: string[],
    options?: { generateDocs?: boolean }
  ): Promise<void> {
    const scanProgress: ScanProgress = {
      scanId,
      status: 'pending',
      currentProject: 0,
      totalProjects: projectPaths.length,
      currentProjectPath: '',
      output: [],
    };

    this.scans.set(scanId, scanProgress);

    // Execute scan-all.py for each project sequentially
    for (let i = 0; i < projectPaths.length; i++) {
      const projectPath = projectPaths[i];

      scanProgress.status = 'running';
      scanProgress.currentProject = i + 1;
      scanProgress.currentProjectPath = projectPath;

      await this.runScanForProject(scanId, projectPath);
    }

    scanProgress.status = 'completed';
  }

  private async runScanForProject(
    scanId: string,
    projectPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const scanScriptPath = process.env.SCAN_SCRIPT_PATH ||
        'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\scan-all.py';

      const pythonProcess = spawn('python', [scanScriptPath, projectPath], {
        cwd: projectPath,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.processes.set(scanId, pythonProcess);

      pythonProcess.stdout.on('data', (data) => {
        const line = data.toString();
        this.appendOutput(scanId, line);
        this.emit('output', { scanId, line });
      });

      pythonProcess.stderr.on('data', (data) => {
        const line = data.toString();
        this.appendOutput(scanId, line);
        this.emit('output', { scanId, line });
      });

      pythonProcess.on('close', (code) => {
        const scan = this.scans.get(scanId);
        if (scan) {
          scan.exitCode = code ?? undefined;
        }
        this.processes.delete(scanId);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Scan failed with exit code ${code}`));
        }
      });
    });
  }

  private appendOutput(scanId: string, line: string): void {
    const scan = this.scans.get(scanId);
    if (scan) {
      scan.output.push(line);
    }
  }

  getScanStatus(scanId: string): ScanProgress | null {
    return this.scans.get(scanId) || null;
  }

  cancelScan(scanId: string): boolean {
    const process = this.processes.get(scanId);
    if (process) {
      process.kill('SIGTERM');
      const scan = this.scans.get(scanId);
      if (scan) {
        scan.status = 'cancelled';
      }
      return true;
    }
    return false;
  }
}

// Singleton instance
export const scanExecutor = new ScanExecutor();
```

#### IMPL-004: POST /api/scanner/scan
**File:** `packages/dashboard/src/app/api/scanner/scan/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { scanExecutor } from '../lib/scanExecutor';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectPaths, generateDocs } = body;

    if (!projectPaths || !Array.isArray(projectPaths) || projectPaths.length === 0) {
      return NextResponse.json(
        createErrorResponse(
          { code: 'VALIDATION_ERROR', message: 'projectPaths array required' },
          { received: body }
        ),
        { status: 400 }
      );
    }

    const scanId = randomUUID();

    // Start scan in background (don't await)
    scanExecutor.startScan(scanId, projectPaths, { generateDocs }).catch((error) => {
      console.error(`Scan ${scanId} failed:`, error);
    });

    return NextResponse.json(
      createSuccessResponse({
        scanId,
        projectCount: projectPaths.length,
        status: 'started',
      })
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(
        { code: 'INTERNAL_ERROR', message: (error as Error).message }
      ),
      { status: 500 }
    );
  }
}
```

#### IMPL-005: GET /api/scanner/scan/[scanId]/status
**File:** `packages/dashboard/src/app/api/scanner/scan/[scanId]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/types/api';
import { scanExecutor } from '../../../lib/scanExecutor';

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
): Promise<NextResponse> {
  const { scanId } = params;
  const status = scanExecutor.getScanStatus(scanId);

  if (!status) {
    return NextResponse.json(
      createErrorResponse(
        { code: 'SCAN_NOT_FOUND', message: `Scan ${scanId} not found` }
      ),
      { status: 404 }
    );
  }

  return NextResponse.json(createSuccessResponse(status));
}
```

#### UI-002: Update ActionBar
**File:** `packages/dashboard/src/components/Scanner/ActionBar.tsx`

**Changes:**
- Accept `selectedProjects` prop from parent
- Wire "Scan Projects" button to POST /api/scanner/scan
- Disable button during scan
- Show scan progress

```typescript
'use client';

interface ActionBarProps {
  selectedProjects: string[];  // Array of project paths
  onScanStart?: (scanId: string) => void;
}

export function ActionBar({ selectedProjects, onScanStart }: ActionBarProps) {
  const [scanning, setScanning] = useState(false);

  async function handleScan() {
    if (selectedProjects.length === 0) return;

    setScanning(true);
    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPaths: selectedProjects,
          generateDocs: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onScanStart?.(data.data.scanId);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleScan}
        disabled={selectedProjects.length === 0 || scanning}
      >
        {scanning ? '⏳ SCANNING...' : '🔍 SCAN PROJECTS'}
      </button>
    </div>
  );
}
```

**Test:** Click "Scan Projects" triggers backend, scan executes, can view status

---

### Phase 3: Real-Time Output Streaming (6-8 hours)

#### IMPL-006: SSE Output Endpoint
**File:** `packages/dashboard/src/app/api/scanner/scan/[scanId]/output/route.ts`

**Features:**
- Server-Sent Events stream
- Real-time output from `scanExecutor`
- Auto-reconnect support

```typescript
import { NextRequest } from 'next/server';
import { scanExecutor } from '../../../lib/scanExecutor';

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
): Promise<Response> {
  const { scanId } = params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send existing output
      const scan = scanExecutor.getScanStatus(scanId);
      if (scan) {
        for (const line of scan.output) {
          const data = `data: ${JSON.stringify({ type: 'stdout', line })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      }

      // Listen for new output
      const outputHandler = ({ scanId: sid, line }: any) => {
        if (sid === scanId) {
          const data = `data: ${JSON.stringify({ type: 'stdout', line })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      };

      scanExecutor.on('output', outputHandler);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        scanExecutor.off('output', outputHandler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

#### UI-003: Update ConsoleTabs
**File:** `packages/dashboard/src/components/Scanner/ConsoleTabs.tsx`

**Changes:**
- Accept `scanId` prop
- Connect to SSE endpoint when scanning
- Display real-time output
- Auto-scroll to bottom

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';

interface ConsoleTabsProps {
  scanId?: string;  // When provided, connect to SSE
}

export function ConsoleTabs({ scanId }: ConsoleTabsProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'history' | 'config'>('console');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scanId) return;

    // Connect to SSE endpoint
    const eventSource = new EventSource(`/api/scanner/scan/${scanId}/output`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stdout') {
        setConsoleOutput((prev) => [...prev, data.line]);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scanId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  return (
    <div>
      {/* Tab headers */}
      {/* ... */}

      {/* Console tab content */}
      {activeTab === 'console' && (
        <div ref={consoleRef} className="console-output">
          {consoleOutput.map((line, i) => (
            <div key={i} className="font-mono text-sm text-green-400">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Test:** Start scan, see real-time output, output scrolls automatically

---

### Phase 4: Polish & Edge Cases (4-6 hours)

#### IMPL-007: Scan Cancellation
**File:** `packages/dashboard/src/app/api/scanner/scan/[scanId]/cancel/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { scanId: string } }
): Promise<NextResponse> {
  const { scanId } = params;
  const cancelled = scanExecutor.cancelScan(scanId);

  if (!cancelled) {
    return NextResponse.json(
      createErrorResponse(
        { code: 'SCAN_NOT_RUNNING', message: 'Scan not running or not found' }
      ),
      { status: 404 }
    );
  }

  return NextResponse.json(
    createSuccessResponse({ scanId, cancelled: true })
  );
}
```

#### UI-004: Add Cancel Button
**File:** `packages/dashboard/src/components/Scanner/ActionBar.tsx`

Add "Cancel" button that calls `/api/scanner/scan/${scanId}/cancel`

#### IMPL-008: Error Handling
**Add to all API routes:**
- Path validation before scanning
- Python executable check
- Graceful degradation for failed scans

#### IMPL-009: Scan History
**File:** Store completed scans in `~/.coderef-scanner-history.json`
**UI:** Display in History tab of ConsoleTabs

**Test:** All features work, edge cases handled, error messages clear

---

## File Structure (Final)

```
packages/dashboard/src/
├── app/
│   ├── api/
│   │   └── scanner/
│   │       ├── projects/
│   │       │   ├── route.ts              # GET/POST projects
│   │       │   └── [id]/route.ts         # DELETE project
│   │       ├── scan/
│   │       │   ├── route.ts              # POST start scan
│   │       │   └── [scanId]/
│   │       │       ├── status/route.ts   # GET scan status
│   │       │       ├── output/route.ts   # GET SSE stream
│   │       │       └── cancel/route.ts   # POST cancel scan
│   │       ├── lib/
│   │       │   └── scanExecutor.ts       # Subprocess logic
│   │       └── types.ts                  # TypeScript interfaces
│   └── scanner/
│       └── page.tsx                      # Scanner page (existing)
└── components/
    └── Scanner/
        ├── index.tsx                     # Main container
        ├── ProjectListCard.tsx           # ✏️ UPDATE (add API calls)
        ├── ConsoleTabs.tsx               # ✏️ UPDATE (add SSE)
        └── ActionBar.tsx                 # ✏️ UPDATE (wire scan button)
```

---

## Testing Checklist

### Manual Testing

- [ ] Add project via Electron dialog
- [ ] Project appears in list
- [ ] Project persists after refresh
- [ ] Can remove project
- [ ] Cannot add duplicate project
- [ ] Select single project
- [ ] Select multiple projects
- [ ] "Scan Projects" disabled when no selection
- [ ] Click "Scan Projects" starts scan
- [ ] Console shows real-time output
- [ ] Console auto-scrolls to bottom
- [ ] Scan completes successfully
- [ ] Scan status updates correctly
- [ ] Can cancel running scan
- [ ] Error shown for missing Python
- [ ] Error shown for invalid path
- [ ] Multiple scans don't interfere

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Project Management | SETUP-001, IMPL-001, IMPL-002, UI-001 | 4-6 hours |
| Phase 2: Scan Execution | SETUP-002, IMPL-003, IMPL-004, IMPL-005, UI-002 | 6-8 hours |
| Phase 3: Real-Time Output | IMPL-006, UI-003 | 6-8 hours |
| Phase 4: Polish | IMPL-007, UI-004, IMPL-008, IMPL-009 | 4-6 hours |
| **Total** | | **20-28 hours** |

---

## Next Steps

1. ✅ Plan approved and documented
2. **Begin Phase 1** - Create project management API
3. Test Phase 1 thoroughly
4. Move to Phase 2 - Scan execution
5. Test Phase 2 thoroughly
6. Move to Phase 3 - Real-time streaming
7. Test Phase 3 thoroughly
8. Move to Phase 4 - Polish and edge cases
9. Final testing and documentation
10. Mark workorder complete

---

**Ready to start implementation!** 🚀

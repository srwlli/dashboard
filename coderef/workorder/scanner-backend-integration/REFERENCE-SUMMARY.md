# Scanner Backend Integration - Reference Summary

**Generated:** 2026-01-02
**Workorder:** WO-SCANNER-BACKEND-INTEGRATION-001

---

## Reference Information Gathered

### 1. Project Registry
**File:** `packages/dashboard/src/app/api/coderef/projects/route.ts`
**Interface:**
```typescript
interface CodeRefProject {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}
```
**Storage:** `~/.coderef-dashboard/projects.json`
**Pattern:** Use `fs.promises`, `path.join()`, handle ENOENT gracefully

---

### 2. API Route Patterns
**GET Example:** `packages/dashboard/src/app/api/coderef/projects/route.ts`
**POST Example:** `packages/dashboard/src/app/api/workorders/route.ts`
**Error Format:**
```typescript
{
  success: false,
  error: { code: "ERROR_CODE", message: "Human message", details?: {} },
  timestamp: "2026-01-02T..."
}
```
**Response Types:** `packages/dashboard/src/types/api.ts`
**Utilities:** `createErrorResponse()`, `createSuccessResponse()`

---

### 3. Subprocess Execution
**Existing Implementation:** None
**Pattern To Create:** Use Node.js `child_process.spawn()`
**Reference:** Python GUI `scanner-gui/src/main.py` lines 459-567

---

### 4. Real-Time Communication
**Existing Implementation:** None - will implement SSE from scratch
**Decision:** Server-Sent Events (simpler than WebSocket for unidirectional streaming)

---

### 5. File System Access
**Config Loader:** `packages/dashboard/src/app/api/coderef/projects/route.ts`
**Pattern:**
```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const storagePath = path.join(os.homedir(), '.coderef-dashboard', 'file.json');
await fs.readFile(storagePath, 'utf-8');  // Throws ENOENT if not found
```

---

### 6. Frontend State Management
**Current Scanner State:**
- `ProjectListCard.tsx` line 11: `useState<string[]>([])` (empty mockup)
- `ConsoleTabs.tsx` line 13: `useState<TabType>('console')`
**Pattern:** Local useState, no global context
**Recommendation:** Keep local state, pass scan ID via props

---

### 7. Python Script Location
**Dev Path:** `C:\Users\willh\Desktop\projects\coderef-system\scripts\scan-all.py`
**Deployment Strategy:** Environment variable `SCAN_SCRIPT_PATH` with fallback

**Verification:**
```bash
test -f "C:\Users\willh\Desktop\projects\coderef-system\scripts\scan-all.py"
# Result: exists ✅
```

---

### 8. Electron Integration
**Status:** Using Electron with IPC
**Main Process:** `packages/electron-app/src/main.ts`
**Existing IPC Handlers:**
- `fs:selectDirectory` (line 115) - Opens native folder dialog
- `fs:validatePath` (line 153) - Validates directory path
- `fs:stat`, `fs:readdir`, `fs:readFile` - File system operations

**Decision:** Use existing `fs:selectDirectory` for "Add Path" button

---

### 9. Error Handling
**Toast/Notification System:** None found
**Pattern:** Inline error messages in console + browser console.error()
**Recommendation:** Display errors in ConsoleTabs console output

---

### 10. Testing
**Framework:** Unknown - not found in codebase
**Run Command:** Unknown
**Decision:** Manual testing first, automated tests optional

---

## Architecture Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Backend Technology** | Next.js API routes | Already in use, single deployment |
| **Real-Time Streaming** | Server-Sent Events (SSE) | Simpler than WebSocket, unidirectional is sufficient |
| **Project Storage** | `~/.coderef-scanner-projects.json` | Matches Python GUI behavior |
| **Subprocess Execution** | `child_process.spawn()` | Standard Node.js approach |
| **File Selection** | Electron IPC `fs:selectDirectory` | Already implemented, native OS dialog |
| **Error Display** | Inline in console tab | No toast system exists |
| **State Management** | Local useState + props | Matches existing pattern |

---

## Key Files to Modify

| File | Change Type | Purpose |
|------|-------------|---------|
| `packages/dashboard/src/components/Scanner/ProjectListCard.tsx` | MODIFY | Add API calls, Electron IPC integration |
| `packages/dashboard/src/components/Scanner/ConsoleTabs.tsx` | MODIFY | Add SSE consumption, real-time output display |
| `packages/dashboard/src/components/Scanner/ActionBar.tsx` | MODIFY | Wire scan button to API |

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/dashboard/src/app/api/scanner/projects/route.ts` | GET/POST projects |
| `packages/dashboard/src/app/api/scanner/projects/[id]/route.ts` | DELETE project |
| `packages/dashboard/src/app/api/scanner/scan/route.ts` | POST start scan |
| `packages/dashboard/src/app/api/scanner/scan/[scanId]/status/route.ts` | GET scan status |
| `packages/dashboard/src/app/api/scanner/scan/[scanId]/output/route.ts` | GET SSE stream |
| `packages/dashboard/src/app/api/scanner/scan/[scanId]/cancel/route.ts` | POST cancel scan |
| `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts` | Subprocess execution logic |
| `packages/dashboard/src/app/api/scanner/types.ts` | TypeScript interfaces |

---

## Python GUI Reference

**File:** `C:\Users\willh\Desktop\projects\coderef-system\scanner-gui\src\main.py` (628 lines)

**Key sections to replicate:**
- **Lines 333-351:** Project loading/saving from JSON
- **Lines 407-457:** Scan triggering logic
- **Lines 459-567:** Batch scan with subprocess execution
- **Lines 485-494:** `subprocess.Popen()` pattern

**Storage file:** `~/.coderef-scanner-projects.json` (matches Python GUI)

---

## Implementation Phases

1. **Phase 1:** Project Management API (4-6 hours)
2. **Phase 2:** Scan Execution API (6-8 hours)
3. **Phase 3:** Real-Time Output Streaming (6-8 hours)
4. **Phase 4:** Polish & Edge Cases (4-6 hours)

**Total Estimated Time:** 20-28 hours

---

## Next Actions

1. ✅ References gathered
2. ✅ Implementation plan created
3. **Start Phase 1** - Create project management API endpoints
4. Test Phase 1 before proceeding
5. Continue with Phase 2-4

---

**All references documented and ready for implementation!** 🚀

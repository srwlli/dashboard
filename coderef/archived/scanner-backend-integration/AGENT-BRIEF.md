# Scanner Backend Integration - Agent Brief

**To:** GUI/Backend Integration Agent (AI Coder)
**From:** CodeRef Assistant (Orchestrator)
**Date:** 2026-01-02
**Priority:** High
**Workorder:** WO-DASHBOARD-SCANNER-BACKEND-002

---

## 🎯 Mission

Wire the Scanner page UI to a working backend that replicates the Python Scanner GUI functionality.

**Current State:**
- ✅ UI exists at `/scanner` route (fully styled, all components ready)
- ✅ Working Python reference implementation exists
- ❌ UI buttons don't do anything (no backend)

**Your Task:**
Connect the UI to a backend that manages projects and executes scans.

---

## 📚 Required Reference Information

Please provide the following file references so I can understand how to integrate:

### 1. **Project Registry / Configuration**

**Question:** Where are projects currently stored in the dashboard?

Please provide:
- [ ] Path to existing `projects.config.json` or similar
- [ ] TypeScript interface for project objects
- [ ] Example of how projects are loaded elsewhere in the codebase

**Example response format:**
```
File: packages/dashboard/src/lib/config/projects.ts
Interface: Project { id, name, path, ... }
Used by: CodeRefExplorerWidget, other components
```

---

### 2. **Existing API Route Patterns**

**Question:** What's the current API route structure and conventions?

Please provide references to:
- [ ] An existing GET endpoint (e.g., `/api/workorders/route.ts`)
- [ ] An existing POST endpoint with request validation
- [ ] How errors are formatted and returned
- [ ] TypeScript types/interfaces for API responses

**Example response format:**
```
Reference: packages/dashboard/src/app/api/workorders/route.ts
Error format: { success: false, error: { code, message }, timestamp }
Response types: src/types/api.ts
```

---

### 3. **Subprocess Execution Examples**

**Question:** Is there existing code that executes external processes (Python scripts, CLI tools)?

Please provide:
- [ ] Path to any existing subprocess/child_process usage
- [ ] How output is captured and logged
- [ ] Error handling patterns for process failures

**If none exist, respond:**
```
No existing subprocess execution - will need to create new implementation
```

---

### 4. **Real-Time Communication**

**Question:** Are Server-Sent Events (SSE) or WebSockets used anywhere in the dashboard?

Please provide:
- [ ] Path to any existing SSE/WebSocket implementation
- [ ] How frontend consumes streaming data
- [ ] State management patterns for real-time updates

**If none exist, respond:**
```
No existing real-time features - will implement SSE from scratch
```

---

### 5. **File System Access Patterns**

**Question:** How does the dashboard currently read/write files?

Please provide references to:
- [ ] Reading JSON config files (e.g., loading projects)
- [ ] Writing JSON files (e.g., saving preferences)
- [ ] Path resolution (absolute vs relative, Windows vs Unix)
- [ ] File system utilities or helpers

**Example response format:**
```
Reference: packages/dashboard/src/lib/fs/config.ts
Pattern: Use fs.promises.readFile/writeFile with Path.resolve()
Helper: loadJsonFile(path), saveJsonFile(path, data)
```

---

### 6. **Frontend State Management**

**Question:** How is state managed in the existing Scanner components?

Please provide:
- [ ] Current state in `ProjectListCard.tsx` (line 11: `useState<string[]>([])`)
- [ ] Current state in `ConsoleTabs.tsx` (line 13: `activeTab` state)
- [ ] Any existing context providers or stores used in the dashboard
- [ ] Patterns for fetching data and updating UI

**Example response format:**
```
Current: Local useState in each component
Pattern: Fetch on mount, update with setState
Context: None currently used for Scanner
Recommendation: Add ScannerContext or use existing pattern
```

---

### 7. **Python Script Location**

**Question:** Where is `scan-all.py` located relative to the dashboard?

Please provide:
- [ ] Absolute path to `scan-all.py` script
- [ ] Expected location when dashboard is deployed
- [ ] How to resolve the path dynamically (dev vs production)

**Example response format:**
```
Dev: C:\Users\willh\Desktop\projects\coderef-system\scripts\scan-all.py
Production: Will need to bundle or configure path via env variable
Recommendation: Use SCAN_SCRIPT_PATH environment variable
```

---

### 8. **Electron Integration (if applicable)**

**Question:** Is the dashboard running in Electron? If so, what IPC patterns exist?

Please provide:
- [ ] Path to Electron main process file
- [ ] Existing IPC handlers (for file dialogs, etc.)
- [ ] How to add new IPC channels

**If not using Electron, respond:**
```
Not using Electron - web-only implementation
File selection: Use <input type="file" webkitdirectory> or manual text input
```

---

### 9. **Error Handling & User Feedback**

**Question:** How are errors currently displayed to users?

Please provide references to:
- [ ] Toast notification system (if exists)
- [ ] Modal/dialog components
- [ ] Inline error message patterns
- [ ] Console logging utilities

**Example response format:**
```
Toasts: Using react-hot-toast (see components/Toast.tsx)
Modals: Custom Modal component (see components/Modal.tsx)
Pattern: Show toast for non-blocking errors, modal for critical errors
```

---

### 10. **Testing Infrastructure**

**Question:** What testing setup exists?

Please provide:
- [ ] Test framework (Jest, Vitest, etc.)
- [ ] Example test file for an API route
- [ ] Example test file for a React component
- [ ] How to run tests

**Example response format:**
```
Framework: Jest with React Testing Library
API test: src/app/api/workorders/__tests__/route.test.ts
Component test: src/components/Scanner/__tests__/ProjectListCard.test.tsx
Run: npm test
```

---

## 📋 Response Format

Please respond with a structured document containing:

```markdown
# Scanner Backend Integration - Reference Information

## 1. Project Registry
File: [path]
Interface: [code snippet]
Notes: [relevant details]

## 2. API Route Patterns
GET example: [path]
POST example: [path]
Error format: [code snippet]
Response types: [path]

## 3. Subprocess Execution
Existing implementation: [path or "None"]
Pattern: [code snippet if exists]

## 4. Real-Time Communication
Existing implementation: [path or "None - will implement SSE"]

## 5. File System Access
Config loader: [path]
Pattern: [code snippet]

## 6. Frontend State Management
Current Scanner state: [description]
Pattern: [useState, Context, etc.]
Recommendation: [your suggestion]

## 7. Python Script Location
Path: [absolute path to scan-all.py]
Deployment strategy: [how to handle in production]

## 8. Electron Integration
Status: [Using Electron? Yes/No]
IPC patterns: [path or "N/A"]

## 9. Error Handling
Toast/notification system: [implementation details]
Pattern: [when to use what]

## 10. Testing
Framework: [Jest/Vitest/etc]
Example tests: [paths]
Run command: [npm test, etc.]
```

---

## 🚀 Next Steps

1. **Provide the reference information above**
2. **I will create a detailed implementation plan** based on your references
3. **You implement the backend integration** following the plan
4. **We test and iterate** until fully functional

---

## ⏱️ Expected Timeline

- **Reference gathering:** 30 minutes (you provide file paths and code snippets)
- **Plan creation:** 1 hour (I create implementation plan)
- **Implementation:** 12-16 hours (you code the integration)
- **Testing:** 2-4 hours (we test together)

**Total:** ~20 hours

---

## 📞 Questions?

If you need clarification on any section, ask before providing references.

**Ready to start?** Please provide the 10 reference sections above.

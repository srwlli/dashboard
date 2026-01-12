---
agent: Claude Sonnet 4.5
date: "2026-01-12"
task: UPDATE
subject: Electron IPC Analysis
parent_project: coderef-dashboard
category: other
version: 1.0.0
related_files:
  - packages/dashboard/src/lib/electron-ipc.ts
status: APPROVED
---

# Electron & File System Connection Reference

**Status:** Draft
**Date:** January 4, 2026
**Scope:** `packages/electron-app`, `packages/dashboard`

## Executive Summary

The CodeRef Dashboard employs a **Hybrid Architecture** for file system access. Instead of relying exclusively on Electron's IPC (Inter-Process Communication), the application prioritizes standard Web APIs (File System Access API) and Universal Server APIs (Next.js Routes). This ensures the dashboard remains functional as both a standalone Web PWA and an Electron Desktop App.

Electron IPC is primarily used as a bridge for native dialogs (`showOpenDialog`) and to bootstrap the Next.js server, while heavy lifting (scanning, reading) is delegated to Node.js processes or Browser Native APIs.

---

## 1. Connection Mechanisms

### A. Scanner (Backend Integration)
**Strategy:** **Server-Side Node.js (In-Process)**
The scanner does not run in the Electron Main process, nor does it spawn external Python subprocesses (in the latest V2 implementation). It runs directly within the Next.js Server environment.

*   **Trigger:** `POST /api/scan` endpoint.
*   **Execution:** Next.js API Route (`packages/dashboard/src/app/api/scan/route.ts`).
*   **Library:** Imports `@coderef/core` directly (`scanCurrentElements`).
*   **Electron Role:**
    *   **Minimal.**
    *   Used ONLY for the **Select Directory** dialog via `ipcRenderer.invoke('fs:selectDirectory')`.
    *   Once the path string is obtained, it is sent to the API via HTTP POST.
*   **Data Flow:** `UI Button` -> `IPC (Dialog)` -> `Path String` -> `HTTP POST` -> `Node.js (Server)` -> `FS Access` -> `JSON Response`.

### B. Assistant Route (Stubs & Workorders)
**Strategy:** **Server-Side Node.js (API Routes)**
Stub management is entirely decoupled from the client-side environment, relying on server-side routes to read the centralized directory.

*   **Trigger:** `GET /api/stubs` endpoint.
*   **Execution:** Next.js API Route (`packages/dashboard/src/app/api/stubs/route.ts`).
*   **Logic:** `StubReader` class uses standard Node.js `fs` module.
*   **Configuration:** Reads `projects.config.json` to find the centralized stubs path.
*   **Electron Role:** **None.** The Next.js server (running inside or alongside Electron) handles all IO.
*   **Data Flow:** `useStubs Hook` -> `HTTP GET` -> `Node.js (Server)` -> `FS Access` -> `JSON Response`.

### C. File Explorer (CodeRef Explorer)
**Strategy:** **Hybrid Router (Browser Native + API Fallback)**
The Explorer Widget (`CodeRefExplorerWidget`) uses a sophisticated `HybridRouter` to select the best available access method.

*   **Logic:** `packages/dashboard/src/lib/coderef/hybrid-router.ts`
*   **Mode 1: Local (Web/PWA Preferred)**
    *   **API:** Browser **File System Access API** (`FileSystemDirectoryHandle`).
    *   **Storage:** Handles stored in IndexedDB.
    *   **Behavior:** Direct browser-to-disk access (sandboxed).
*   **Mode 2: API (Electron/Server Fallback)**
    *   **Trigger:** If `File System Access API` is unavailable OR project uses a static path string.
    *   **Endpoints:** `/api/coderef/tree`, `/api/coderef/file`.
    *   **Behavior:** Server-side Node.js `fs` reads the path and returns JSON tree/content.
*   **Electron Role:**
    *   The `electron-app` exposes `fs:readdir` and `fs:readFile` via IPC, but the modern Dashboard implementation largely bypasses these in favor of the isomorphic API Routes.
    *   Electron allows the "API Mode" to work with absolute system paths (e.g., `C:\Users\...`) which standard browsers would block.

### D. Prompting Workflow
**Strategy:** **Client-Side + Native Bridge**
This feature is heavily client-side, managing state in React Context and interacting with the file system primarily for file ingestion and export.

*   **File Ingestion:**
    *   **Web:** HTML `<input type="file">` or Drag & Drop.
    *   **Electron:** Can leverage `fs:selectDirectory` for broader access.
*   **File Export (Save Workflow):**
    *   **Web:** Uses `window.showSaveFilePicker` (if available) or generates a `Blob` URL for download.
    *   **Electron:** Uses `useFileHandlers` hook which checks `isElectron()`.
*   **Data Flow:**
    *   **Ingest:** `User Selects` -> `File Object` -> `Memory (Context)`.
    *   **Export:** `Memory` -> `JSON String` -> `Save Dialog` -> `Disk`.

---

## 2. Compare & Contrast

| Feature | Primary Access Method | Execution Environment | Electron IPC Usage | Isomorphic? |
| :--- | :--- | :--- | :--- | :--- |
| **Scanner** | **HTTP API (`/api/scan`)** | **Node.js (Server)** | 🔴 Low (Dialogs only) | ✅ Yes (Works in Web) |
| **Assistant** | **HTTP API (`/api/stubs`)** | **Node.js (Server)** | ⚪ None | ✅ Yes (Works in Web) |
| **Explorer** | **Hybrid Router** | **Browser OR Node.js** | 🟡 Medium (Fallback) | ✅ Yes (Auto-switches) |
| **Prompting**| **Client Logic** | **Browser (React)** | 🟡 Medium (Dialogs) | ✅ Yes (Works in Web) |

## 3. Detailed IPC Bridge (`preload.ts`)

The following channels are exposed but selectively used by the Dashboard:

*   **`fs:selectDirectory`**: Heavily used by **Scanner** and **Project Selector** to get absolute paths.
*   **`fs:validatePath`**: Used to verify paths before adding them to configuration.
*   **`fs:readFile` / `fs:readdir`**: Exposed but largely superseded by Next.js API Routes (`/api/*`) to maintain codebase consistency between Web and Desktop builds.
*   **`backend:health`**: Stubbed health check.

## 4. Architectural Insight

The decision to move away from heavy IPC usage towards **Next.js API Routes** allows the CodeRef Dashboard to:
1.  **Reuse Logic:** The same `StubReader` and `Scanner` logic works in both Electron and a standalone Docker container/Vercel deployment.
2.  **Simplify Testing:** API routes are easier to unit test than IPC handlers.
3.  **Future Proofing:** Prepares the application for a potential pure-web SaaS release without rewriting the data layer.

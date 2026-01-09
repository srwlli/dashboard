# CodeRef Core - Scanner Implementation

**Package:** @coderef-dashboard/core
**Version:** 0.1.0
**Status:** Scanner Working | Directory Integration Blocked
**Updated:** 2026-01-09

---

## Goal

Implement a complete 3-phase CodeRef scanner in the Dashboard UI without CLI dependencies:
1. **Phase 0: Directories** - Create .coderef/ structure (Python script, CLI works, UI blocked)
2. **Phase 1: Scan** - Analyze code elements (✅ WORKING - TypeScript in-process)
3. **Phase 2: Populate** - Generate 16 output files (Not tested, likely same spawn issue)

---

## Current Status

| Phase | Implementation | Status | Notes |
|-------|---------------|--------|-------|
| Phase 0 | Python script | ⚠️ CLI only | UI blocked: spawn() can't find cmd.exe on Windows |
| Phase 1 | TypeScript | ✅ WORKING | 4761 elements, 335 files, 1185ms |
| Phase 2 | Python script | ⏸️ Untested | Requires Phase 0 fix first |

**Blocker:** Node.js `spawn()` on Windows cannot execute shell commands (`spawn C:\WINDOWS\system32\cmd.exe ENOENT`)

---

## Key Files

**Scanner Engine:**
- `src/scanner/scanner.ts` - AST-based code analysis (TypeScript)
- `src/types/types.ts` - ElementData, ScanOptions interfaces

**UI Integration:**
- `packages/dashboard/src/app/scanner/page.tsx` - Scanner UI page
- `packages/dashboard/src/components/Scanner/` - UI components (ProjectList, ConsoleTabs, ActionBar)
- `packages/dashboard/src/app/api/scanner/scan/route.ts` - POST endpoint, creates ScanExecutor
- `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts` - Orchestrates all 3 phases

**Scripts (Working via CLI):**
- `scripts/setup-coderef-dir/setup_coderef_dirs.py` - Creates directories (✅ all tests passing)
- `scripts/setup-coderef-dir/USAGE.md` - Manual CLI instructions

---

## Architecture

**Phase 1 (Scan):** Pure TypeScript, no subprocess, uses AST parsing
**Phase 0 & 2:** Python scripts called via Node.js `spawn()` (BLOCKED on Windows)

**Problem:** Windows spawn() can't resolve cmd.exe or COMSPEC environment variables.
**Workaround:** Run Phase 0 manually: `py scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\path\to\project"`

---

## Next Steps

1. **Fix spawn() issue** - Options: PowerShell shell, TypeScript port, or `where py` + no shell
2. **Test Phase 2** - Once Phase 0 works, test populate script integration
3. **Port to TypeScript** - Replace Python scripts with Node.js fs operations (long-term)

---

## Recent Fixes (Jan 9)

- ✅ Global singleton pattern fixed SSE 404 errors (executor Map survives HMR)
- ✅ Retry logic with exponential backoff (0ms, 100ms, 300ms, 500ms)
- ✅ Health checks after executor registration
- ✅ Comprehensive debug logging for Map operations
- ✅ Python detection using `py` launcher instead of `python`
- ⚠️ COMSPEC shell path attempt (didn't resolve spawn issue)

**Top Investigation File:** `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts` (lines 188-201, 273-289, 328-340)

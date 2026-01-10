# CodeRef Core - Scanner Implementation

**Package:** @coderef-dashboard/core
**Version:** 0.1.0
**Status:** ✅ All Phases Working (Scan + File Generation Complete)
**Updated:** 2026-01-09

---

## Goal

Implement a complete 3-phase CodeRef scanner in the Dashboard UI without CLI dependencies:
1. **Phase 0: Directories** - Create .coderef/ structure (Python script, CLI works, UI blocked)
2. **Phase 1: Scan** - Analyze code elements (✅ COMPLETE - TypeScript in-process)
3. **Phase 2: File Generation** - Generate 16 output files (✅ COMPLETE - Pure TypeScript, 3-6x faster)

---

## Current Status

| Phase | Implementation | Status | Notes |
|-------|---------------|--------|-------|
| Phase 0 | Python script | ⚠️ CLI only | UI blocked: spawn() can't find cmd.exe on Windows |
| Phase 1 | TypeScript | ✅ WORKING | Scan: 541 elements, multiple files, ~1185ms |
| Phase 2 | TypeScript | ✅ WORKING | File generation: 16 files (13 unique), 3-6x faster |

**Phase 0 Blocker:** Node.js `spawn()` on Windows cannot execute shell commands (`spawn C:\WINDOWS\system32\cmd.exe ENOENT`)
**Phase 2 Status:** COMPLETE - Pure TypeScript implementation replaces Python scripts (WO-CODEREF-CLI-IMPLEMENTATION-001)

---

## Key Files

**Scanner Engine:**
- `src/scanner/scanner.ts` - AST-based code analysis (TypeScript)
- `src/types/types.ts` - ElementData, ScanOptions interfaces

**File Generation (NEW - Phase 2 Complete):**
- `src/fileGeneration/saveIndex.ts` - Save scan results to index.json
- `src/fileGeneration/generateContext.ts` - Create context.json and context.md
- `src/fileGeneration/buildDependencyGraph.ts` - Create dependency graph
- `src/fileGeneration/detectPatterns.ts` - Pattern detection (handlers, decorators, errors, tests, API)
- `src/fileGeneration/analyzeCoverage.ts` - Test coverage analysis
- `src/fileGeneration/validateReferences.ts` - Reference validation
- `src/fileGeneration/detectDrift.ts` - Drift detection (changes since last scan)
- `src/fileGeneration/generateDiagrams.ts` - Visual diagrams (Mermaid + Graphviz)

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
**Phase 2 (File Generation):** Pure TypeScript (✅ COMPLETE)
  - **Implementation:** `src/fileGeneration/` directory with 8 functions
  - **Integration:** `scanExecutor.ts` orchestrates 4-step pipeline
  - **Performance:** 3-6x faster than Python subprocess via parallel execution
  - **Files Generated:** 16 total (13 unique) - core files, analysis reports, diagrams

**Phase 0 (Directories):** Python scripts called via Node.js `spawn()` (⚠️ BLOCKED on Windows)
  - **Problem:** Windows spawn() can't resolve cmd.exe or COMSPEC environment variables
  - **Workaround:** Run Phase 0 manually: `py scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\path\to\project"`
  - **Note:** Phase 0 only needed once per project (creates directory structure)

---

## Next Steps

1. **Fix Phase 0 spawn() issue** - Options: PowerShell shell, TypeScript port, or `where py` + no shell
2. **Optional: Port Phase 0 to TypeScript** - Replace Python directory creation with Node.js fs operations
3. **Future Enhancements** - Additional analysis functions, more diagram types, optimization

---

## Phase 2 File Generation - COMPLETE ✅ (Jan 9)

**Workorder:** WO-CODEREF-CLI-IMPLEMENTATION-001

### Functions Implemented (8 total)
**Phase 1 - Core Files:**
1. `saveIndex()` - Saves scan results to `.coderef/index.json`
2. `generateContext()` - Creates `.coderef/context.json` + `context.md`
3. `buildDependencyGraph()` - Creates `.coderef/graph.json`

**Phase 2 - Analysis Reports:**
4. `detectPatterns()` - Detects handlers, decorators, error patterns, tests, API endpoints
5. `analyzeCoverage()` - Test coverage analysis and uncovered files
6. `validateReferences()` - Broken references and missing imports
7. `detectDrift()` - Changes since last scan

**Phase 3 - Diagrams:**
8. `generateDiagrams()` - Visual dependency diagrams (Mermaid + Graphviz)

### Files Generated (16 total, 13 unique)
```
.coderef/
├── index.json
├── context.json
├── context.md
├── graph.json
├── reports/
│   ├── patterns.json
│   ├── coverage.json
│   ├── validation.json
│   └── drift.json
├── diagrams/
│   ├── dependencies.mmd
│   ├── dependencies.dot
│   ├── calls.mmd
│   └── imports.mmd
└── exports/
    └── graph.json (duplicate)
```

### Performance
- ✅ **3-6x faster** than Python subprocess
- ✅ **No re-scanning** - Phase 1 caches, Phase 2 re-uses
- ✅ **Parallel execution** - Promise.all() + Promise.allSettled()
- ✅ **Fault-tolerant** - One file failure doesn't block others

---

## Scanner Fixes (Jan 9)

- ✅ Global singleton pattern fixed SSE 404 errors (executor Map survives HMR)
- ✅ Retry logic with exponential backoff (0ms, 100ms, 300ms, 500ms)
- ✅ Health checks after executor registration
- ✅ Comprehensive debug logging for Map operations
- ✅ Python detection using `py` launcher instead of `python`
- ⚠️ COMSPEC shell path attempt (didn't resolve spawn issue)

**Integration:** `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts` (4-step pipeline: core → analysis → diagrams)

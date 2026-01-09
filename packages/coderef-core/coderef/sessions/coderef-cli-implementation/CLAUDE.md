# CodeRef CLI Implementation Session

**Session ID:** coderef-cli-implementation
**Workorder:** WO-CODEREF-CLI-IMPLEMENTATION-001
**Type:** Multi-Agent (Orchestrator + Implementor)
**Status:** Planning Complete, Ready for Implementation
**Created:** 2026-01-09

---

## Session Purpose

Implement optimized file generation functions for the CodeRef Dashboard scanner to replace Python subprocess with TypeScript, enabling parallel file generation and eliminating re-scanning.

---

## Problem Statement

**Current State:**
- Dashboard scanner has two phases: Scan + Populate
- Phase 1 (Scan): Collects code elements, shows stats, **discards data**
- Phase 2 (Populate): Spawns Python script that **re-scans entire codebase**, generates 16 files sequentially

**Problems:**
1. Re-scanning is wasteful (Phase 1 data discarded)
2. Python subprocess dependency (spawn issues on Windows)
3. Sequential file generation (slow)
4. External coderef-system dependency

---

## Solution Strategy

**Optimizations:**
1. **Cache scan results** - Phase 1 stores in `scanResults` Map, Phase 2 re-uses
2. **Parallel generation** - Use `Promise.all()` and `Promise.allSettled()`
3. **Replace Python** - Pure TypeScript implementation in `@coderef/core`
4. **Fault-tolerant** - One file failure doesn't kill everything

**Expected Performance:** 3-5x faster than current Python subprocess

---

## Implementation Plan

### Part 1: Add Caching to ScanExecutor
```typescript
// Add property
private scanResults = new Map<string, ElementData[]>();

// Cache in Phase 1
this.scanResults.set(projectPath, elements);
```

### Part 2: Replace runPopulateForProject()
- Delete 68 lines of Python spawn code
- Add 40 lines of TypeScript with parallel generation
- Rename: `runPopulateForProject()` → `runGenerateForProject()`

### Part 3: Implement 8 Functions in @coderef/core
- `saveIndex()` - Save scan results
- `generateContext()` - Create context files
- `buildDependencyGraph()` - Create graph
- `detectPatterns()`, `analyzeCoverage()`, `validateReferences()`, `detectDrift()` (parallel)
- `generateDiagrams()` - Create diagram files

---

## Session Files

1. **communication.json** - Agent roster, status tracking
2. **instructions.json** - Orchestrator + implementor instructions
3. **orchestrator-output.md** - Detailed implementation plan (complete)

---

## Key Decisions

**NOT Building:** CLI tool (docs are reference only)
**Building:** TypeScript functions called by dashboard scanner
**Integration Point:** `packages/dashboard/src/app/api/scanner/lib/scanExecutor.ts`
**Target Output:** 16 files in `.coderef/` directory

---

## Success Criteria

- ✅ No re-scanning (Phase 1 caches, Phase 2 uses cache)
- ✅ Parallel file generation (3-4x faster)
- ✅ All 16 files generated correctly
- ✅ No Python dependency
- ✅ No spawn() errors

---

## Agent Roles

**Orchestrator:** CodeRef Assistant (`C:\Users\willh\Desktop\assistant`)
- Created implementation plan with optimizations
- Status: Complete

**Implementor:** CodeRef Core Agent (`C:\Users\willh\Desktop\coderef-dashboard\packages\coderef-core`)
- Implements functions in `src/fileGeneration/`
- Modifies `scanExecutor.ts` in sibling dashboard package
- Status: Ready to begin

---

**Next Step:** Implementor reads `orchestrator-output.md` and begins Phase 1 implementation

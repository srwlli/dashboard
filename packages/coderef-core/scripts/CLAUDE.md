# CodeRef Core - Scripts Directory

**Package:** @coderef-dashboard/core  
**Directory:** `packages/coderef-core/scripts/`  
**Version:** 2.0.0  
**Status:** ✅ Production-ready  
**Updated:** 2026-01-07

---

## Overview

Command-line utilities for CodeRef operations:

1. **`setup-coderef-dir/`** - Directory structure initializer (Python)
2. **`scan-cli/`** - Code element scanner CLI (JavaScript)

---

## 1. Setup-Coderef-Dir (Python)

**Purpose:** Creates standardized `.coderef/` and `coderef/` directory structures.

**Status:** ✅ CLI Working | ❌ UI Blocked (Windows spawn issue)

**Files:**

- `setup_coderef_dirs.py` (126 lines) - Main script
- `test_setup_coderef_dirs.py` (82 lines) - 3 tests (all passing)
- `USAGE.md`, `RESOURCE-SHEET.md` - Documentation

**Usage:**

```bash
python setup_coderef_dirs.py "C:\path\to\project"
python setup_coderef_dirs.py "C:\path\to\project" --dry-run
```

**Creates:** 10 directories (`.coderef/` + `coderef/` with subdirs)

**Characteristics:** Zero dependencies, idempotent, cross-platform

**Integration:** Called by `scanExecutor.ts` via subprocess (blocked on Windows)

**Future:** TypeScript port planned (`coderef/workorder/fix-windows-spawn-exec/`)

---

## 2. Scan-CLI (JavaScript)

**Purpose:** Command-line wrapper for TypeScript scanner. Reports element statistics.

**Status:** ✅ CLI Working | ✅ UI Integration Working

**Files:**

- `scan.cjs` (83 lines) - Main CLI script
- `test_scan_cli.test.ts` (400+ lines) - 20+ test cases
- `USAGE.md`, `REFERENCE.md`, `plan.json` - Documentation

**Usage:**

```bash
node scan.cjs "C:\path\to\project"
node scan.cjs .  # Current directory
```

**Output:** Elements found, files scanned, duration

**Characteristics:** Requires `@coderef/core`, direct import (no subprocess), no Windows issues

**Why JavaScript?** Scanner is TypeScript/JavaScript. Direct import avoids subprocess complexity.

---

## Comparison

| Aspect              | setup-coderef-dir  | scan-cli           |
|---------------------|--------------------|--------------------|
| Language            | Python             | JavaScript         |
| Dependencies        | None               | `@coderef/core`    |
| Integration         | Subprocess spawn   | Direct import      |
| Windows Issues      | Yes                | No                 |
| CLI Status          | ✅                 | ✅                 |
| UI Status           | ❌                 | ✅                 |

---

## Testing

**setup-coderef-dir:** `python test_setup_coderef_dirs.py` (3 tests)  
**scan-cli:** `npm test scripts/scan-cli` (20+ tests)

---

## Related Docs

- `setup-coderef-dir/RESOURCE-SHEET.md` - Technical reference
- `setup-coderef-dir/USAGE.md` - User guide
- `scan-cli/USAGE.md` - User guide
- `scan-cli/REFERENCE.md` - Quick reference
- `coderef/workorder/fix-windows-spawn-exec/` - Windows fix plan

---

**Last Updated:** 2026-01-07  
**Maintained by:** CodeRef Core Team

# CodeRef Core - AI Context Documentation

**Package:** @coderef-dashboard/core
**Version:** 0.1.0
**Status:** 🚧 Development
**Created:** 2026-01-04

---

## Purpose

CodeRef Core is a pure TypeScript/JavaScript implementation of CodeRef scanning and analysis functionality. It provides code analysis capabilities **without using external CLI commands or subprocess execution**.

## Integration

This package integrates directly into the Dashboard Scanner page at:
```
packages/dashboard/src/app/scanner
```

**Key Principle:** We are **NOT using the CodeRef CLI**. All functionality is written in TypeScript and executed in-process within Next.js.

## Current Structure

```
packages/coderef-core/
├── src/                  # TypeScript source code (to be added)
├── scripts/              # Python scripts (being migrated to TypeScript)
├── package.json
└── CLAUDE.md            # This file
```

---

## Directory Structure Setup

### `scripts/setup_coderef_dirs.py`

**Latest Script (Jan 4 15:12)** - Generates standardized coderef directory structure only (no data generation/analysis).

**Creates:**
- `.coderef/` (hidden, technical)
  - `reports/complexity/`
  - `diagrams/`
  - `exports/`
- `coderef/` (visible, workflow)
  - `workorder/`
  - `archived/`
  - `standards/`
  - `documents/`
  - `reference/`
  - `user/`
  - `notes/`

**Usage:**
```bash
python scripts/setup_coderef_dirs.py [project_path] [--dry-run]
```

**Purpose:** Separates structural setup from data generation/analysis. Use this to initialize the coderef directory structure in any project.

---

**Note:** Documentation will be updated as features are implemented.

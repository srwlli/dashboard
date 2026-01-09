# Directory Creation Script - Usage Instructions

## Overview

This script creates the standardized CodeRef directory structure in any project.

**Script:** `setup_coderef_dirs.py`
**Status:** ✅ Production-ready, all tests passing
**Safe:** Idempotent (can run multiple times without issues)

---

## Quick Start

### Step 1: Open Terminal/Command Prompt
- Press `Win + R`, type `cmd`, press Enter

### Step 2: Navigate to the coderef-dashboard directory
```bash
cd C:\Users\willh\Desktop\coderef-dashboard
```

### Step 3: Run the script for any project

**Basic usage (creates directories):**
```bash
py packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\Users\willh\Desktop\games"
```

**Dry run (preview what will be created, no changes):**
```bash
py packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\Users\willh\Desktop\games" --dry-run
```

### Step 4: Verify directories were created
```bash
dir "C:\Users\willh\Desktop\games\.coderef"
dir "C:\Users\willh\Desktop\games\coderef"
```

---

## What Gets Created

### `.coderef/` (hidden, technical)
- `reports/complexity/` - Complexity analysis reports
- `diagrams/` - Generated architecture diagrams
- `exports/` - Exported coderef data (JSON, Mermaid, etc.)

### `coderef/` (visible, workflow)
- `workorder/` - Active feature implementations
- `archived/` - Completed features
- `standards/` - UI/UX/behavior standards
- `documents/` - Foundation docs (ARCHITECTURE, API, etc.)
- `reference/` - Reference implementations and patterns
- `user/` - User-specific notes and customizations
- `notes/` - General project notes

---

## Examples

### For the dashboard project itself:
```bash
py packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\Users\willh\Desktop\coderef-dashboard"
```

### For games project:
```bash
py packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\Users\willh\Desktop\games"
```

### For any other project:
```bash
py packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\path\to\your\project"
```

---

## Command Line Options

| Option | Description |
|--------|-------------|
| `<project_path>` | **Required.** Absolute path to project directory |
| `--dry-run` | Preview changes without creating directories |

---

## Notes

- **Idempotent:** Safe to run multiple times - won't overwrite or fail on existing directories
- **Cross-platform:** Works on Windows, macOS, Linux
- **No dependencies:** Uses only Python standard library
- **Tested:** All 3 unit tests passing (idempotency, dry-run, directory creation)

---

## Troubleshooting

**"Python not found" error:**
- Try using `python` instead of `py`:
  ```bash
  python packages/coderef-core/scripts/setup-coderef-dir/setup_coderef_dirs.py "C:\path\to\project"
  ```

**"Permission denied" error:**
- Run command prompt as Administrator
- Check that you have write permissions to the target directory

**"Path not found" error:**
- Ensure the project path exists
- Use absolute paths (not relative)
- Use quotes around paths with spaces

---

## Integration Status

| Integration | Status | Notes |
|-------------|--------|-------|
| **CLI (Manual)** | ✅ Working | Use instructions above |
| **Scanner UI** | ❌ Blocked | Node.js spawn() issue (cmd.exe ENOENT) |
| **Automated Workflow** | 🚧 Planned | Will work once UI integration fixed |

For now, use the manual CLI workflow above. UI integration will be fixed in a future update.

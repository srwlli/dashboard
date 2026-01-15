# Create CodeRef Directory Structure

Run this script from your project directory to create the standard CodeRef folder structure.

---

## Usage

**1. Navigate to your project:**
```bash
cd C:\path\to\your\project
```

**2. Run the script (use current directory):**
```bash
py C:\Users\willh\Desktop\coderef-dashboard\packages\coderef-core\scripts\setup-coderef-dir\setup_coderef_dirs.py .
```

**Or specify full path:**
```bash
py C:\Users\willh\Desktop\coderef-dashboard\packages\coderef-core\scripts\setup-coderef-dir\setup_coderef_dirs.py "C:\path\to\your\project"
```

**Preview first (dry run):**
```bash
py C:\Users\willh\Desktop\coderef-dashboard\packages\coderef-core\scripts\setup-coderef-dir\setup_coderef_dirs.py . --dry-run
```

---

## What Gets Created

### `.coderef/` (Hidden, Technical)
- `reports/complexity/` - Complexity analysis reports
- `diagrams/` - Dependency diagrams
- `exports/` - Exported data (JSON-LD, Mermaid, DOT)

### `coderef/` (Visible, Workflow)
- `workorder/` - Active workorders (shared across all coderef projects)
- `archived/` - Completed/cancelled features
- `standards/` - UI/UX/behavior standards
- `foundation-docs/` - Generated documentation (README, ARCHITECTURE, API, SCHEMA, COMPONENTS)
- `documents/` - General documentation
- `resource/` - Resource sheets
- `user/` - User-facing documentation
- `notes/` - Working notes
- `sessions/` - Multi-agent session files
- `reports/` - Project assessment and analysis reports

---

## Notes

- Safe to run multiple times (idempotent)
- No dependencies (Python standard library only)
- Cross-platform (Windows, macOS, Linux)

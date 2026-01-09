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

- **`.coderef/`** - Reports, diagrams, exports (hidden folder)
- **`coderef/`** - Workorders, standards, documents (visible folder)

---

## Notes

- Safe to run multiple times (idempotent)
- No dependencies (Python standard library only)
- Cross-platform (Windows, macOS, Linux)

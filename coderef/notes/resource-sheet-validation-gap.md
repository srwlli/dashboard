# Resource Sheet Validation Gap - Error Context

**Date**: 2026-01-08  
**Issue**: Resource sheets created in wrong directory with incorrect naming convention  
**Severity**: Medium (workflow/process issue)

---

## What Happened

Three resource sheets were created with the following issues:

1. **Wrong Directory**: Files created in `coderef/reference-sheets/` instead of `coderef/resources-sheets/`
2. **Wrong Naming**: Files used ALL-CAPS naming instead of PascalCase-with-hyphens:
   - `FILE-API-ROUTE-RESOURCE-SHEET.md` ❌
   - `NOTEPAD-CLONE-RESOURCE-SHEET.md` ❌
   - `PROJECTS-CONTEXT-RESOURCE-SHEET.md` ❌

**Correct Format:**
- `File-Api-Route-RESOURCE-SHEET.md` ✅
- `Notepad-Clone-RESOURCE-SHEET.md` ✅
- `Projects-Context-RESOURCE-SHEET.md` ✅

---

## Root Cause Analysis

### Why It Happened

1. **No Validation Tool**: No automated tool checked location or naming before/after creation
2. **No Standard Document**: No documented standard defining:
   - Required directory (`coderef/resources-sheets/`)
   - Filename format (PascalCase-with-hyphens)
   - Subject field format (PascalCase with spaces)
3. **Incomplete Validation**: Validation only checked:
   - ✅ RSMS v2.0 frontmatter fields
   - ✅ Required sections
   - ❌ Directory location
   - ❌ Filename format
   - ❌ Naming convention consistency
4. **No Workflow Guidance**: Tools didn't guide the workflow to:
   - Check existing resource sheets for patterns
   - Validate against standards before creation
   - Cross-reference directory structure

### What Should Have Been in Place

1. **Standard Document**: `coderef/standards/RESOURCE-SHEET-STANDARDS.md`
   - Defines location requirements
   - Defines filename convention
   - Defines subject field format
   - Includes validation checklist

2. **Validation Tool**: `scripts/validate-resource-sheet.js`
   - Checks directory location
   - Validates filename format
   - Validates subject field
   - Ensures subject-to-filename consistency

3. **Workflow Integration**: 
   - Pre-creation validation
   - Post-creation validation
   - CI/CD checks (if applicable)

---

## Existing Patterns (What We Should Have Checked)

### Directory Structure
```
coderef/
├── reference-sheets/     ❌ Wrong (deprecated/incorrect)
└── resources-sheets/      ✅ Correct
    ├── Widget-System-RESOURCE-SHEET.md
    ├── Assistant-Page-RESOURCE-SHEET.md
    ├── FileTree-RESOURCE-SHEET.md
    └── ...
```

### Naming Convention Examples
- ✅ `Widget-System-RESOURCE-SHEET.md` (subject: "Widget System")
- ✅ `Assistant-Page-RESOURCE-SHEET.md` (subject: "Assistant Page")
- ✅ `FileTree-RESOURCE-SHEET.md` (subject: "FileTree")
- ✅ `Hybrid-Router-RESOURCE-SHEET.md` (subject: "Hybrid Router")

### Frontmatter Pattern
```yaml
subject: Widget System        # PascalCase with spaces
# Maps to: Widget-System-RESOURCE-SHEET.md
```

---

## What Needs to Be Fixed

### 1. Create Standard Document

**File**: `coderef/standards/RESOURCE-SHEET-STANDARDS.md`

**Content Should Include:**
- Location requirements (`coderef/resources-sheets/`)
- Filename format rules (PascalCase-with-hyphens + `-RESOURCE-SHEET.md`)
- Subject field format (PascalCase with spaces)
- Validation checklist
- Examples of correct/incorrect naming

### 2. Create Validation Tool

**File**: `scripts/validate-resource-sheet.js`

**Functionality:**
- Validate directory location
- Validate filename format (regex: `/^[A-Z][a-zA-Z0-9]*(?:-[A-Z][a-zA-Z0-9]*)*-RESOURCE-SHEET\.md$/`)
- Validate subject field format
- Check subject-to-filename consistency
- Return clear error messages

**Usage:**
```bash
node scripts/validate-resource-sheet.js <file-path>
```

### 3. Update Workflow

**Before Creating Resource Sheets:**
1. Check existing resource sheets for naming patterns
2. Verify correct directory (`coderef/resources-sheets/`)
3. Generate filename from subject field
4. Run validation tool before saving

**After Creating Resource Sheets:**
1. Run validation tool
2. Verify against standard document
3. Check against existing files for consistency

### 4. Fix Index Document

**File**: `coderef/resources-sheets/Index-RESOURCE-SHEET.md`

**Current (Line 18):**
```markdown
**Location:** `coderef/reference-sheets/`
```

**Should Be:**
```markdown
**Location:** `coderef/resources-sheets/`
```

---

## Recommendations

### Immediate Actions

1. ✅ **Create Standard Document** - Define location and naming requirements
2. ✅ **Create Validation Tool** - Automated checks for location/naming
3. ⚠️ **Update Index** - Fix incorrect location reference
4. ⚠️ **Document Workflow** - Add validation step to resource sheet creation process

### Long-term Improvements

1. **Pre-commit Hook**: Run validation tool before commits
2. **CI/CD Integration**: Validate all resource sheets in CI pipeline
3. **IDE Integration**: Linter/validator plugin for real-time feedback
4. **Template Generator**: Tool that generates correctly-named files from subject
5. **Discovery Tool**: Scan and validate all existing resource sheets

### Prevention Strategy

1. **Always Check Existing Files First**: Look at `coderef/resources-sheets/` before creating
2. **Use Validation Tool**: Run before and after creation
3. **Follow Standard Document**: Reference `RESOURCE-SHEET-STANDARDS.md`
4. **Cross-Reference**: Compare against existing resource sheets

---

## Files Affected

### Created (Fixed)
- `coderef/resources-sheets/File-Api-Route-RESOURCE-SHEET.md` ✅
- `coderef/resources-sheets/Notepad-Clone-RESOURCE-SHEET.md` ✅
- `coderef/resources-sheets/Projects-Context-RESOURCE-SHEET.md` ✅

### Deleted (Wrong Location)
- `coderef/reference-sheets/FILE-API-ROUTE-RESOURCE-SHEET.md` ❌
- `coderef/reference-sheets/NOTEPAD-CLONE-RESOURCE-SHEET.md` ❌
- `coderef/reference-sheets/PROJECTS-CONTEXT-RESOURCE-SHEET.md` ❌

### Needs Update
- `coderef/resources-sheets/Index-RESOURCE-SHEET.md` (line 18: wrong location)

---

## Validation Checklist (For Future Use)

Before creating a resource sheet:

- [ ] Checked existing resource sheets in `coderef/resources-sheets/` for naming pattern
- [ ] Verified correct directory: `coderef/resources-sheets/`
- [ ] Generated filename from subject: `{Subject-Name}-RESOURCE-SHEET.md`
- [ ] Used PascalCase with hyphens (not all caps, not lowercase)
- [ ] Subject field uses PascalCase with spaces
- [ ] Ran validation tool: `node scripts/validate-resource-sheet.js <file>`
- [ ] Verified against standard document

---

## Related Files

- Standard Document: `coderef/standards/RESOURCE-SHEET-STANDARDS.md` (to be created)
- Validation Tool: `scripts/validate-resource-sheet.js` (to be created)
- Index: `coderef/resources-sheets/Index-RESOURCE-SHEET.md` (needs update)
- Existing Examples: `coderef/resources-sheets/*.md` (reference for patterns)

---

*This document provides context for fixing the resource sheet validation gap in the project workflow.*

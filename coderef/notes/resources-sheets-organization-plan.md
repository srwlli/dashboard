# Resource Sheets Organization - Implementation Plan

**Date**: 2026-01-08  
**Goal**: Reorganize `coderef/resources-sheets/` into category-based subdirectories  
**Estimated Time**: 30-45 minutes

---

## Overview

Reorganize 22 resource sheets from flat structure to category-based subdirectories, matching the `category` field in frontmatter.

---

## Pre-Implementation Checklist

- [ ] Review category assignments (verify Hybrid-Router category)
- [ ] Backup current directory (git commit or copy)
- [ ] Review Index file structure
- [ ] Identify all references to resource sheets in codebase

---

## Phase 1: Preparation (5 minutes)

### 1.1 Verify Categories

**Action**: Review and fix category inconsistencies

**Files to Check:**
- `Hybrid-Router-RESOURCE-SHEET.md` - Currently `middleware`, verify if should be `component`
- `Electron-IPC-Analysis-RESOURCE-SHEET.md` - Currently `other`, should be `analysis`
- `Notifications-UX-Review-RESOURCE-SHEET.md` - Currently `other`, should be `analysis`

**Decision**: 
- Hybrid-Router → Keep as `middleware` (primary function)
- Analysis docs → Update frontmatter to `analysis` category

### 1.2 Create Directory Structure

**Action**: Create subdirectories

```bash
cd coderef/resources-sheets
mkdir components
mkdir api
mkdir systems
mkdir integration
mkdir middleware
mkdir analysis
```

---

## Phase 2: File Migration (15 minutes)

### 2.1 Move Component Files (11 files)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/components/`

**Files to Move:**
1. `Assistant-Page-RESOURCE-SHEET.md`
2. `CodeRef-Explorer-Widget-RESOURCE-SHEET.md`
3. `FileTree-RESOURCE-SHEET.md`
4. `FileViewer-RESOURCE-SHEET.md`
5. `Notepad-Clone-RESOURCE-SHEET.md`
6. `Notes-Widget-Text-Editing-RESOURCE-SHEET.md`
7. `ProjectSelector-RESOURCE-SHEET.md`
8. `Projects-Context-RESOURCE-SHEET.md`
9. `Right-Click-Context-Menu-RESOURCE-SHEET.md`
10. `Index-RESOURCE-SHEET.md` (stays at root - do not move)

**Command:**
```bash
# Windows PowerShell
Move-Item "Assistant-Page-RESOURCE-SHEET.md" components/
Move-Item "CodeRef-Explorer-Widget-RESOURCE-SHEET.md" components/
Move-Item "FileTree-RESOURCE-SHEET.md" components/
Move-Item "FileViewer-RESOURCE-SHEET.md" components/
Move-Item "Notepad-Clone-RESOURCE-SHEET.md" components/
Move-Item "Notes-Widget-Text-Editing-RESOURCE-SHEET.md" components/
Move-Item "ProjectSelector-RESOURCE-SHEET.md" components/
Move-Item "Projects-Context-RESOURCE-SHEET.md" components/
Move-Item "Right-Click-Context-Menu-RESOURCE-SHEET.md" components/
```

### 2.2 Move API Files (1 file)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/api/`

**Files to Move:**
1. `File-Api-Route-RESOURCE-SHEET.md`

**Command:**
```bash
Move-Item "File-Api-Route-RESOURCE-SHEET.md" api/
```

### 2.3 Move System Files (7 files)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/systems/`

**Files to Move:**
1. `Sessions-Hub-System-RESOURCE-SHEET.md`
2. `Stubs-System-RESOURCE-SHEET.md`
3. `Widget-System-RESOURCE-SHEET.md`
4. `Workorders-System-RESOURCE-SHEET.md`
5. `Prompting-Workflow-RESOURCE-SHEET.md`
6. `Prompting-Workflow-Briefing-RESOURCE-SHEET.md`
7. `Prompting-Workflow-UserFlow-RESOURCE-SHEET.md`

**Command:**
```bash
Move-Item "Sessions-Hub-System-RESOURCE-SHEET.md" systems/
Move-Item "Stubs-System-RESOURCE-SHEET.md" systems/
Move-Item "Widget-System-RESOURCE-SHEET.md" systems/
Move-Item "Workorders-System-RESOURCE-SHEET.md" systems/
Move-Item "Prompting-Workflow-RESOURCE-SHEET.md" systems/
Move-Item "Prompting-Workflow-Briefing-RESOURCE-SHEET.md" systems/
Move-Item "Prompting-Workflow-UserFlow-RESOURCE-SHEET.md" systems/
```

### 2.4 Move Integration Files (1 file)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/integration/`

**Files to Move:**
1. `Electron-Wrapper-RESOURCE-SHEET.md`

**Command:**
```bash
Move-Item "Electron-Wrapper-RESOURCE-SHEET.md" integration/
```

### 2.5 Move Middleware Files (1 file)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/middleware/`

**Files to Move:**
1. `Hybrid-Router-RESOURCE-SHEET.md`

**Command:**
```bash
Move-Item "Hybrid-Router-RESOURCE-SHEET.md" middleware/
```

### 2.6 Move Analysis Files (2 files)

**Source**: `coderef/resources-sheets/`  
**Destination**: `coderef/resources-sheets/analysis/`

**Files to Move:**
1. `Electron-IPC-Analysis-RESOURCE-SHEET.md`
2. `Notifications-UX-Review-RESOURCE-SHEET.md`

**Note**: Update frontmatter `category` field to `analysis` for these files

**Command:**
```bash
Move-Item "Electron-IPC-Analysis-RESOURCE-SHEET.md" analysis/
Move-Item "Notifications-UX-Review-RESOURCE-SHEET.md" analysis/
```

---

## Phase 3: Update Files (10 minutes)

### 3.1 Update Analysis Files Frontmatter

**Files:**
- `analysis/Electron-IPC-Analysis-RESOURCE-SHEET.md`
- `analysis/Notifications-UX-Review-RESOURCE-SHEET.md`

**Change:**
```yaml
# Before
category: other

# After
category: analysis
```

### 3.2 Update Index File

**File**: `coderef/resources-sheets/Index-RESOURCE-SHEET.md`

**Changes Needed:**

1. **Fix Location Reference (Line 18)**
   ```markdown
   # Before
   **Location:** `coderef/reference-sheets/`
   
   # After
   **Location:** `coderef/resources-sheets/`
   ```

2. **Update File Paths**
   - All file references need to include subdirectory
   - Example: `./components/Assistant-Page-RESOURCE-SHEET.md`

3. **Add Category Sections**
   ```markdown
   ## By Category
   
   ### Components
   - [Assistant-Page](./components/Assistant-Page-RESOURCE-SHEET.md)
   - [CodeRef-Explorer-Widget](./components/CodeRef-Explorer-Widget-RESOURCE-SHEET.md)
   ...
   
   ### API Routes
   - [File-Api-Route](./api/File-Api-Route-RESOURCE-SHEET.md)
   
   ### Systems
   - [Sessions-Hub-System](./systems/Sessions-Hub-System-RESOURCE-SHEET.md)
   ...
   ```

---

## Phase 4: Validation (5 minutes)

### 4.1 Verify File Structure

**Check:**
- [ ] All 22 files moved to correct subdirectories
- [ ] Index file remains at root
- [ ] All subdirectories created
- [ ] No files left in root (except Index)

**Expected Structure:**
```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md
├── components/ (9 files)
├── api/ (1 file)
├── systems/ (7 files)
├── integration/ (1 file)
├── middleware/ (1 file)
└── analysis/ (2 files)
```

### 4.2 Update Validation Tool

**File**: `scripts/validate-resource-sheet.js` (if exists)

**Changes:**
- Allow subdirectories in path validation
- Check that file is in correct subdirectory based on category
- Update directory check to allow `coderef/resources-sheets/{category}/`

### 4.3 Search for Broken References

**Action**: Search codebase for references to old paths

**Search Terms:**
- `coderef/reference-sheets/`
- `resources-sheets/` (without subdirectory)
- Direct file references that might break

**Command:**
```bash
# Search for references
grep -r "reference-sheets" .
grep -r "resources-sheets/" . --include="*.md" --include="*.ts" --include="*.tsx"
```

---

## Phase 5: Documentation (5 minutes)

### 5.1 Update Standards Document

**File**: `coderef/standards/RESOURCE-SHEET-STANDARDS.md` (to be created)

**Add Section:**
```markdown
## Directory Organization

Resource sheets are organized by category in subdirectories:

- `components/` - UI components
- `api/` - API routes
- `systems/` - Systems, workflows, hubs
- `integration/` - Integration layers
- `middleware/` - Middleware/routing
- `analysis/` - Analysis and review documents

The `Index-RESOURCE-SHEET.md` file remains at the root level.
```

### 5.2 Update Organization Proposal

**File**: `coderef/notes/resources-sheets-organization-proposal.md`

**Add Section:**
```markdown
## Implementation Status

✅ Completed: [Date]
- Files organized into category subdirectories
- Index file updated
- Validation tool updated
```

---

## Rollback Plan

If issues arise:

1. **Git Rollback** (if using git):
   ```bash
   git checkout HEAD -- coderef/resources-sheets/
   ```

2. **Manual Rollback**:
   - Move all files back to root
   - Remove subdirectories
   - Restore Index file from backup

---

## Success Criteria

- [ ] All 22 files in correct subdirectories
- [ ] Index file updated with new paths
- [ ] No broken references in codebase
- [ ] Validation tool supports subdirectories
- [ ] Documentation updated
- [ ] All file paths verified working

---

## Post-Implementation Tasks

1. **Test File Access**
   - Verify all links in Index work
   - Check any code that references resource sheets

2. **Update CI/CD** (if applicable)
   - Update any scripts that scan resource sheets
   - Update validation checks

3. **Communicate Changes**
   - Update team documentation
   - Notify if any tools depend on flat structure

---

## Automated Migration Script

**Optional**: Create script to automate migration

**File**: `scripts/organize-resource-sheets.js`

**Functionality:**
- Read category from frontmatter
- Move files to appropriate subdirectory
- Update Index file paths
- Update analysis files category
- Generate migration report

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Preparation | 5 min | ⏳ Pending |
| Phase 2: File Migration | 15 min | ⏳ Pending |
| Phase 3: Update Files | 10 min | ⏳ Pending |
| Phase 4: Validation | 5 min | ⏳ Pending |
| Phase 5: Documentation | 5 min | ⏳ Pending |
| **Total** | **~45 min** | |

---

*This plan provides step-by-step instructions for reorganizing the resource sheets folder.*

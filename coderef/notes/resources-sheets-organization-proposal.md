# Resource Sheets Folder Organization Proposal

**Date**: 2026-01-08  
**Current State**: 22 resource sheets in flat directory structure  
**Goal**: Improve discoverability and maintainability

---

## Current State Analysis

### File Count by Category

| Category | Count | Files |
|----------|-------|-------|
| `component` | 11 | Assistant-Page, CodeRef-Explorer-Widget, FileTree, FileViewer, Hybrid-Router, Index, Notepad-Clone, Notes-Widget-Text-Editing, ProjectSelector, Projects-Context, Right-Click-Context-Menu |
| `other` | 7 | Electron-IPC-Analysis, Notifications-UX-Review, Prompting-Workflow, Prompting-Workflow-Briefing, Prompting-Workflow-UserFlow, Sessions-Hub-System, Stubs-System, Widget-System, Workorders-System |
| `api` | 1 | File-Api-Route |
| `integration` | 1 | Electron-Wrapper |
| `middleware` | 1 | Hybrid-Router |

**Note**: Hybrid-Router appears in both component and middleware (needs review)

---

## Organization Options

### Option 1: Category-Based Subdirectories (Recommended)

**Structure:**
```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md          # Master index (stays at root)
├── components/                       # UI components (11 files)
│   ├── Assistant-Page-RESOURCE-SHEET.md
│   ├── CodeRef-Explorer-Widget-RESOURCE-SHEET.md
│   ├── FileTree-RESOURCE-SHEET.md
│   ├── FileViewer-RESOURCE-SHEET.md
│   ├── Notepad-Clone-RESOURCE-SHEET.md
│   ├── Notes-Widget-Text-Editing-RESOURCE-SHEET.md
│   ├── ProjectSelector-RESOURCE-SHEET.md
│   ├── Projects-Context-RESOURCE-SHEET.md
│   ├── Right-Click-Context-Menu-RESOURCE-SHEET.md
│   └── ...
├── api/                             # API routes (1 file)
│   └── File-Api-Route-RESOURCE-SHEET.md
├── systems/                         # Systems & workflows (7 files)
│   ├── Sessions-Hub-System-RESOURCE-SHEET.md
│   ├── Stubs-System-RESOURCE-SHEET.md
│   ├── Widget-System-RESOURCE-SHEET.md
│   ├── Workorders-System-RESOURCE-SHEET.md
│   ├── Prompting-Workflow-RESOURCE-SHEET.md
│   ├── Prompting-Workflow-Briefing-RESOURCE-SHEET.md
│   └── Prompting-Workflow-UserFlow-RESOURCE-SHEET.md
├── integration/                     # Integration layers (1 file)
│   └── Electron-Wrapper-RESOURCE-SHEET.md
├── middleware/                      # Middleware (1 file)
│   └── Hybrid-Router-RESOURCE-SHEET.md
└── analysis/                        # Analysis & reviews (2 files)
    ├── Electron-IPC-Analysis-RESOURCE-SHEET.md
    └── Notifications-UX-Review-RESOURCE-SHEET.md
```

**Pros:**
- ✅ Clear categorization
- ✅ Easy to find by type
- ✅ Scales well as more sheets are added
- ✅ Matches existing category metadata
- ✅ Groups related functionality

**Cons:**
- ⚠️ Requires updating Index file paths
- ⚠️ Some files might fit multiple categories

---

### Option 2: Functional Grouping

**Structure:**
```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md
├── core/                            # Core systems (5 files)
│   ├── Projects-Context-RESOURCE-SHEET.md
│   ├── Widget-System-RESOURCE-SHEET.md
│   ├── Sessions-Hub-System-RESOURCE-SHEET.md
│   ├── Stubs-System-RESOURCE-SHEET.md
│   └── Workorders-System-RESOURCE-SHEET.md
├── ui-components/                   # UI components (8 files)
│   ├── Assistant-Page-RESOURCE-SHEET.md
│   ├── CodeRef-Explorer-Widget-RESOURCE-SHEET.md
│   ├── FileTree-RESOURCE-SHEET.md
│   ├── FileViewer-RESOURCE-SHEET.md
│   ├── Notepad-Clone-RESOURCE-SHEET.md
│   ├── ProjectSelector-RESOURCE-SHEET.md
│   ├── Right-Click-Context-Menu-RESOURCE-SHEET.md
│   └── Notes-Widget-Text-Editing-RESOURCE-SHEET.md
├── workflows/                      # User workflows (3 files)
│   ├── Prompting-Workflow-RESOURCE-SHEET.md
│   ├── Prompting-Workflow-Briefing-RESOURCE-SHEET.md
│   └── Prompting-Workflow-UserFlow-RESOURCE-SHEET.md
├── infrastructure/                  # Infrastructure (3 files)
│   ├── File-Api-Route-RESOURCE-SHEET.md
│   ├── Hybrid-Router-RESOURCE-SHEET.md
│   └── Electron-Wrapper-RESOURCE-SHEET.md
└── analysis/                        # Analysis & reviews (2 files)
    ├── Electron-IPC-Analysis-RESOURCE-SHEET.md
    └── Notifications-UX-Review-RESOURCE-SHEET.md
```

**Pros:**
- ✅ Groups by functional purpose
- ✅ Clear separation of concerns
- ✅ Easy to understand system boundaries

**Cons:**
- ⚠️ Less granular than category-based
- ⚠️ Some judgment calls on placement

---

### Option 3: Hybrid (Category + Special Cases)

**Structure:**
```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md
├── components/                     # UI components
├── api/                            # API routes
├── systems/                        # Systems (workflows, hubs, etc.)
├── integration/                    # Integration layers
└── _special/                       # Special cases (analysis, reviews)
    ├── Electron-IPC-Analysis-RESOURCE-SHEET.md
    └── Notifications-UX-Review-RESOURCE-SHEET.md
```

**Pros:**
- ✅ Combines category-based with special handling
- ✅ Keeps analysis/review docs separate

**Cons:**
- ⚠️ Adds complexity with special folder

---

### Option 4: Keep Flat + Enhanced Index (Minimal Change)

**Structure:**
```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md         # Enhanced with category sections
├── [all 22 files remain flat]
```

**Enhanced Index Structure:**
```markdown
## By Category

### Components
- Assistant-Page
- CodeRef-Explorer-Widget
- ...

### API Routes
- File-Api-Route

### Systems
- Sessions-Hub-System
- ...
```

**Pros:**
- ✅ No file movement required
- ✅ Easy to implement
- ✅ No broken references

**Cons:**
- ⚠️ Still hard to navigate with 22+ files
- ⚠️ Doesn't scale well

---

## Recommendation: Option 1 (Category-Based)

**Rationale:**
1. **Matches Metadata**: Uses existing `category` field from frontmatter
2. **Scalable**: Easy to add new categories as project grows
3. **Discoverable**: Clear where to find specific types of documentation
4. **Maintainable**: Groups related functionality together

### Implementation Steps

1. **Create subdirectories:**
   ```bash
   mkdir coderef/resources-sheets/components
   mkdir coderef/resources-sheets/api
   mkdir coderef/resources-sheets/systems
   mkdir coderef/resources-sheets/integration
   mkdir coderef/resources-sheets/middleware
   mkdir coderef/resources-sheets/analysis
   ```

2. **Move files by category:**
   - Move component files to `components/`
   - Move API files to `api/`
   - Move system files to `systems/`
   - etc.

3. **Update Index file:**
   - Update all file paths to include subdirectory
   - Add category sections
   - Update location reference

4. **Update validation tool:**
   - Allow subdirectories in validation
   - Check category matches directory

---

## Category Mapping

### Current Categories → Proposed Directories

| Category | Directory | Notes |
|----------|-----------|-------|
| `component` | `components/` | UI components |
| `api` | `api/` | API routes |
| `other` | `systems/` | Systems, workflows, hubs |
| `integration` | `integration/` | Integration layers |
| `middleware` | `middleware/` | Middleware/routing |
| `analysis` | `analysis/` | Analysis & review docs |

### Special Cases

- **Hybrid-Router**: Currently `middleware`, but also a component → Place in `middleware/` (primary function)
- **Analysis docs**: `Electron-IPC-Analysis`, `Notifications-UX-Review` → Create `analysis/` category

---

## Alternative: Alphabetical Subdirectories

If category-based becomes too granular, consider:

```
coderef/resources-sheets/
├── Index-RESOURCE-SHEET.md
├── a-f/          # Files A-F
├── g-m/          # Files G-M
├── n-s/          # Files N-S
└── t-z/          # Files T-Z
```

**Not Recommended** - Less meaningful than category-based

---

## Migration Script

```javascript
// scripts/organize-resource-sheets.js
// Moves files to category-based subdirectories
// Updates Index file paths
```

---

## Decision Matrix

| Criteria | Option 1 (Category) | Option 2 (Functional) | Option 3 (Hybrid) | Option 4 (Flat) |
|----------|---------------------|----------------------|-------------------|-----------------|
| Scalability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Discoverability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Implementation Effort | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maintainability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Matches Metadata | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Winner**: Option 1 (Category-Based)

---

## Next Steps

1. **Review proposal** - Confirm category mapping makes sense
2. **Create migration script** - Automate file movement
3. **Update Index** - Reflect new structure
4. **Update validation** - Support subdirectories
5. **Document standard** - Add to RESOURCE-SHEET-STANDARDS.md

---

*This proposal provides a clear path to organizing the resource sheets folder for better maintainability and discoverability.*

# Resources Page - AI Context Documentation

**Component:** Resources Page (Dashboard)
**Version:** 2.0.0
**Status:** ✅ Production
**Created:** 2026-01-16
**Last Updated:** 2026-01-17

---

## Quick Summary

**Resources Page** is the comprehensive catalog and single source of truth for all CodeRef ecosystem resources. It displays tools, commands, scripts, validators, schemas, and other resources across 6 MCP servers and the dashboard project.

**Core Innovation:** Centralized resource inventory with automated scanning, deduplication, and categorization. The `tools-and-commands.csv` file serves as the definitive registry of all 306+ resources ecosystem-wide.

**Latest Update (v2.0.0):**
- ✅ Comprehensive ecosystem scan (9 resource types)
- ✅ Single source of truth CSV (306 resources)
- ✅ 100% data quality (no missing fields, no duplicates)
- ✅ Automated scanning and merge pipeline
- ✅ Resource sheet index with 57 documents

**Key Files:**
- **coderef/tools-and-commands.csv** = Single source of truth (306 resources)
- **coderef/RESOURCE-SHEET-INDEX.md** = Catalog of 57 resource sheets
- **coderef/build-source-of-truth.py** = Automated ecosystem scanner
- **coderef/merge-and-dedupe.py** = Smart merge and deduplication
- **coderef/validate-csv.py** = Data quality validation

---

## Problem & Vision

### The Problem

Managing a large ecosystem with multiple MCP servers, tools, commands, scripts, validators, and documentation becomes chaotic without centralized tracking. Resources get duplicated, descriptions go missing, and it's impossible to know what exists where.

### The Solution

Create a single source of truth CSV that automatically scans the entire ecosystem, categorizes resources, removes duplicates, and provides a comprehensive searchable catalog. The resources page displays this data in an accessible UI with filtering and search capabilities.

### How It Works

1. **Automated Scanning** → `build-source-of-truth.py` scans 9 resource types across all MCP servers and projects
2. **Smart Merging** → `merge-and-dedupe.py` combines scanned data with existing tool definitions, filters duplicates
3. **Validation** → `validate-csv.py` ensures 100% data quality (no missing fields, proper categorization)
4. **CSV Output** → `tools-and-commands.csv` becomes the single source of truth
5. **UI Display** → Resources page reads CSV and displays searchable, filterable catalog

---

## Architecture

### Core Concepts

**1. Single Source of Truth**
All resources tracked in one CSV file:
- Type, Server, Category, Name, Description, Status, Path, Created, LastUpdated
- 306 resources across 9 types (Tool, Command, Script, ResourceSheet, Schema, Validator, Output, Tab, Workflow)
- 7 servers (coderef-workflow, coderef-docs, coderef-testing, coderef-personas, coderef-context, papertrail, coderef-dashboard)

**2. Automated Discovery**
Scanner automatically finds resources by:
- MCP tool definitions in server.py files
- Slash commands in .claude/commands/ directories
- Python scripts in scripts/ directories
- Validators in papertrail/validators/
- JSON schemas in schemas/ directories
- Resource sheets matching *-RESOURCE-SHEET.md pattern
- Workflow documents, output formats, dashboard tabs

**3. Intelligent Deduplication**
Merge process removes duplicates by:
- Filtering assistant alias commands (70 removed)
- Deduplicating by (Type, Server, Name) tuple
- Keeping MCP server versions over user-level duplicates

### Data Flow
```
Ecosystem Sources (MCP servers, scripts, schemas, etc.)
  ↓
coderef/build-source-of-truth.py (automated scan)
  ↓
scanned-resources-temp.csv (217 resources)
  ↓
coderef/merge-and-dedupe.py (combine with existing tools)
  ↓
coderef/tools-and-commands.csv (306 resources - single source of truth)
  ↓
Resources Page UI (display, search, filter)
```

---

## Resource Types

### 1. Tools (93 total)
MCP tools defined in server.py files across 6 servers:
- coderef-workflow (27 tools)
- coderef-docs (29 tools)
- coderef-testing (29 tools)
- coderef-personas (24 tools)
- coderef-context (14 tools)
- papertrail (4 tools)

**Example:** `coderef_scan`, `generate_foundation_docs`, `run_tests`

### 2. Commands (71 total)
Slash commands from .claude/commands/ directories:
- Documentation: /generate-docs, /audit-codebase, /establish-standards
- Personas: /ava, /taylor, /coderef-assistant, /lloyd
- Testing: /run-tests, /test-coverage, /detect-flaky
- Workflow: /create-workorder, /archive-feature, /create-session

**Example:** `/generate-docs`, `/run-tests`, `/create-workorder`

### 3. Scripts (53 total)
Python automation scripts:
- build-source-of-truth.py (comprehensive scanner)
- merge-and-dedupe.py (smart merge)
- validate-csv.py (validation)
- update-resources-csv.py (legacy updater)

**Example:** `build-source-of-truth.py`, `fix-csv.py`

### 4. ResourceSheets (29 total)
Documentation resource sheets following RSMS v2.0:
- Pattern: `*-RESOURCE-SHEET.md`
- Location: `C:\Users\willh\.mcp-servers\coderef\foundation-docs\`
- See **RESOURCE-SHEET-INDEX.md** for complete catalog

**Example:** `Resources-Page-RESOURCE-SHEET.md`, `Personas-MCP-RESOURCE-SHEET.md`

### 5. Schemas (27 total)
JSON validation schemas:
- UDS schemas (Universal Documentation Standards)
- Frontmatter schemas (foundation docs, workorders)
- Tool schemas (MCP tool definitions)

**Example:** `foundation-doc-frontmatter-schema.json`, `stub-schema.json`

### 6. Validators (17 total)
Papertrail validation scripts (Python + PowerShell):
- Document validation (UDS compliance)
- Schema completeness checks
- Resource sheet validation

**Example:** `validate.py`, `validate.ps1`, `validate-resource-sheet.py`

### 7. Workflows (4 total)
Defined workflow documents:
- Planning workflows
- Execution workflows
- Handoff protocols

**Example:** `create-plan-workflow.md`

### 8. Output Formats (6 total)
Export format definitions:
- JSON, JSON-LD, Mermaid, DOT diagrams
- CSV exports, markdown reports

**Example:** `mermaid-diagram.md`, `json-export.md`

### 9. Dashboard Tabs (6 total)
UI navigation tabs:
- Resources, Workflows, Personas, Documentation, Testing, Context

**Example:** `/resources`, `/workflows`, `/personas`

---

## File Structure

```
resources/
├── page.tsx                              # React component (UI)
├── CLAUDE.md                             # This file - AI context
│
├── .claude/
│   └── settings.local.json
│
└── coderef/                              # Data & Scripts folder
    ├── tools-and-commands.csv            # ⭐ Single source of truth (306 resources)
    ├── RESOURCE-SHEET-INDEX.md           # Catalog of 57 resource sheets
    ├── Resources-Page-RESOURCE-SHEET.md  # Resource sheet for this page
    │
    ├── Documentation (historical):
    │   ├── CSV-AUDIT-REPORT.md           # Initial audit findings
    │   ├── CSV-CLEANUP-FINAL.md          # Cleanup report (70 duplicates removed)
    │   ├── CSV-FIX-SUMMARY.md            # Fix summary
    │   └── SOURCE-OF-TRUTH-COMPLETE.md   # Complete documentation
    │
    └── Scripts (automation tools):
        ├── build-source-of-truth.py      # Comprehensive ecosystem scanner
        ├── merge-and-dedupe.py           # Smart merge and deduplication
        └── validate-csv.py               # Data quality validation
```

---

## Key Integration Points

### With RESOURCE-SHEET-INDEX.md
The index tracks 57 resource sheets across the ecosystem:
- 31 scanned and included in coderef/tools-and-commands.csv
- Organized by category (Components, Workflows, Personas, MCP Servers, Testing, Documentation)
- Each entry includes: Subject, Category, Server, Path, Last Updated
- Cross-reference: Resources page displays these in the ResourceSheet type filter

### With MCP Servers
Resources are sourced from 6 MCP servers:
- **coderef-workflow** (63 resources) - Planning, execution, archival tools
- **coderef-docs** (29 resources) - Documentation generation, validation
- **coderef-testing** (29 resources) - Test execution, coverage, reporting
- **coderef-personas** (24 resources) - Persona activation, custom personas
- **coderef-context** (14 resources) - Code analysis, complexity metrics
- **papertrail** (4 resources) - UDS validation, schema checks

### With Dashboard UI
- **page.tsx** reads coderef/tools-and-commands.csv
- Displays resources in searchable table
- Filters by Type, Server, Category
- Links to resource paths for quick access

---

## Essential Commands

### Regenerate CSV
```bash
cd C:\Users\willh\Desktop\coderef-dashboard\packages\dashboard\src\app\resources\coderef

# Step 1: Scan ecosystem
python build-source-of-truth.py

# Step 2: Merge with existing tools
python merge-and-dedupe.py

# Step 3: Validate
python validate-csv.py
```

### Validate Data Quality
```bash
python validate-csv.py
# Output: Total resources, breakdown by type/server, data quality metrics
```

---

## CSV Schema

```csv
Type,Server,Category,Name,Description,Status,Path,Created,LastUpdated
```

**Field Definitions:**
- **Type** - Resource type (Tool, Command, Script, ResourceSheet, Schema, Validator, Output, Tab, Workflow)
- **Server** - MCP server or project owning the resource (coderef-workflow, coderef-docs, etc.)
- **Category** - Functional category (Documentation, Testing, Workflow, Personas, etc.)
- **Name** - Resource identifier (function name, slash command, filename)
- **Description** - What the resource does (concise, actionable)
- **Status** - active, deprecated, experimental
- **Path** - Full absolute path to resource file
- **Created** - Git timestamp of first commit (if available)
- **LastUpdated** - Git timestamp of last commit (if available)

---

## Design Decisions

**1. CSV as Single Source of Truth**
- ✅ Chosen: CSV file with automated scanning
- ❌ Rejected: Manual tracking, database, multiple files
- Reason: CSV is human-readable, version-controlled, easily parseable, and accessible to both AI and UI

**2. Automated Scanning vs Manual Entry**
- ✅ Chosen: Automated scanning with intelligent categorization
- ❌ Rejected: Manual resource registration
- Reason: Ecosystem has 300+ resources across 7 servers - manual tracking unsustainable

**3. Deduplication Strategy**
- ✅ Chosen: Keep MCP server versions, remove assistant aliases
- ❌ Rejected: Mark duplicates as aliases
- Reason: User feedback - resources should be assigned to actual servers, not marked as duplicates

**4. Resource Type Granularity**
- ✅ Chosen: 9 distinct types (Tool, Command, Script, etc.)
- ❌ Rejected: Broad categories (Code, Documentation, etc.)
- Reason: Fine-grained types enable better filtering and discovery in UI

---

## Recent Changes

### v2.0.0 - Single Source of Truth
- ✅ Created comprehensive ecosystem scanner (build-source-of-truth.py)
- ✅ Implemented smart merge and deduplication (merge-and-dedupe.py)
- ✅ Achieved 100% data quality (306 resources, no missing fields)
- ✅ Removed 70 duplicate assistant alias commands
- ✅ Organized documentation in coderef/ folder
- ✅ Created RESOURCE-SHEET-INDEX.md (57 resource sheets)

### v1.0.0 - Initial Resources Page
- ✅ Basic CSV tracking
- ✅ Manual resource entry
- ✅ Simple UI display

---

## Resources

- **[coderef/tools-and-commands.csv](coderef/tools-and-commands.csv)** - Single source of truth (306 resources)
- **[coderef/RESOURCE-SHEET-INDEX.md](coderef/RESOURCE-SHEET-INDEX.md)** - Catalog of 57 resource sheets
- **[coderef/SOURCE-OF-TRUTH-COMPLETE.md](coderef/SOURCE-OF-TRUTH-COMPLETE.md)** - Complete documentation
- **[coderef/CSV-CLEANUP-FINAL.md](coderef/CSV-CLEANUP-FINAL.md)** - Cleanup report
- **[coderef/build-source-of-truth.py](coderef/build-source-of-truth.py)** - Scanner script
- **[coderef/merge-and-dedupe.py](coderef/merge-and-dedupe.py)** - Merge script
- **[coderef/validate-csv.py](coderef/validate-csv.py)** - Validation script

---

**Maintained by:** CodeRef Dashboard Team
**Index Reference:** See coderef/RESOURCE-SHEET-INDEX.md for complete resource sheet catalog

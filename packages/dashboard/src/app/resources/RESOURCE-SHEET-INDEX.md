# Resource Sheet Index

**Purpose:** Comprehensive index of all resource sheets across the coderef-dashboard project
**Total Sheets:** 58
**Last Updated:** 2026-01-17

---

## What are Resource Sheets?

Resource sheets are authoritative technical documentation files following RSMS v2.0 standards. Each sheet provides:

- **Executive Summary** - Component purpose and responsibilities
- **Architecture Overview** - Component hierarchy and design decisions
- **State Management** - State ownership tables and source of truth
- **Integration Points** - Internal/external dependencies
- **Testing Strategy** - Must-cover scenarios and test patterns
- **Common Pitfalls** - Known issues and sharp edges
- **Maintenance Protocol** - How to update and extend

---

## Organization

Resource sheets are organized by location and category:

- **Dashboard UI** (13 sheets) - Pages and components
- **Core Scanner** (17 sheets) - CodeRef scanner engine
- **Systems** (15 sheets) - Infrastructure and workflows
- **Analysis** (2 sheets) - Architecture reviews
- **Root Level** (11 sheets) - Cross-cutting concerns

---

## Dashboard UI Components & Pages

### Pages (2 sheets)

- **[Assistant-Page](../../../../../coderef/resources-sheets/components/Assistant-Page-RESOURCE-SHEET.md)**
  Workorder/stub aggregation page with tab navigation

- **[Resources-Page](./Resources-Page-RESOURCE-SHEET.md)**
  Documentation viewer with 6 tabs (Commands, Tools, Scripts, Workflows, Setup, Output)

- **[Project-Boards](../boards/Project-Boards-RESOURCE-SHEET.md)**
  Kanban board system with drag-and-drop task management

### Components (11 sheets)

- **[CodeRef-Explorer-Widget](../../../../../coderef/resources-sheets/components/CodeRef-Explorer-Widget-RESOURCE-SHEET.md)**
  File browser with localStorage persistence

- **[FileTree](../../../../../coderef/resources-sheets/components/FileTree-RESOURCE-SHEET.md)**
  Recursive tree rendering with filtering

- **[FileViewer](../../../../../coderef/resources-sheets/components/FileViewer-RESOURCE-SHEET.md)**
  Syntax highlighting and rich media rendering

- **[Notepad-Clone](../../../../../coderef/resources-sheets/components/Notepad-Clone-RESOURCE-SHEET.md)**
  Multi-tab text editor widget

- **[Notes-Widget-Text-Editing](../../../../../coderef/resources-sheets/components/Notes-Widget-Text-Editing-RESOURCE-SHEET.md)**
  Text editing with localStorage persistence

- **[OutputViewer](../../../../../coderef/resources-sheets/components/OutputViewer-RESOURCE-SHEET.md)**
  Scanner output display component

- **[Projects-Context](../../../../../coderef/resources-sheets/components/Projects-Context-RESOURCE-SHEET.md)**
  Global React context for project management

- **[ProjectSelector](../../../../../coderef/resources-sheets/components/ProjectSelector-RESOURCE-SHEET.md)**
  Cross-platform project state with IndexedDB

- **[Right-Click-Context-Menu](../../../../../coderef/resources-sheets/components/Right-Click-Context-Menu-RESOURCE-SHEET.md)**
  Context menu component

- **[Settings-ProjectsPanel](../../../../../coderef/resources-sheets/components/Settings-ProjectsPanel-RESOURCE-SHEET.md)**
  Project settings management panel

---

## Core Scanner Engine (packages/coderef-core)

### Scanner Components (7 sheets)

- **[CONSOLIDATED-SCANNER-RESOURCE-SHEET](../../../../../packages/coderef-core/src/scanner/CONSOLIDATED-SCANNER-RESOURCE-SHEET.md)**
  Main scanner orchestration and execution

- **[ScanExecutor-RESOURCE-SHEET](../../../../../packages/coderef-core/coderef/resources-sheets/ScanExecutor-RESOURCE-SHEET.md)**
  Scan execution engine

- **[Scanner-Effectiveness-Improvements](../../../../../packages/coderef-core/coderef/resources-sheets/Scanner-Effectiveness-Improvements-RESOURCE-SHEET.md)**
  Performance and accuracy enhancements

- **[Scanner-UI-System](../../../../../packages/coderef-core/coderef/resources-sheets/systems/Scanner-UI-System-RESOURCE-SHEET.md)**
  Scanner user interface components

- **[Parser](../../../../../packages/coderef-core/src/parser/parser-RESOURCE-SHEET.md)**
  AST parsing and code analysis

- **[Adapter](../../../../../packages/coderef-core/src/adapter/adapter-RESOURCE-SHEET.md)**
  Language-specific adapters

- **[Validator](../../../../../packages/coderef-core/src/validator/validator-RESOURCE-SHEET.md)**
  Code validation rules

### Data Generation (5 sheets)

- **[Context-Generator](../../../../../packages/coderef-core/coderef/resources-sheets/systems/Context-Generator-RESOURCE-SHEET.md)**
  Codebase context generation

- **[Dependency-Graph-Builder](../../../../../packages/coderef-core/coderef/resources-sheets/systems/Dependency-Graph-Builder-RESOURCE-SHEET.md)**
  Build dependency graphs from code

- **[File-Generation-System](../../../../../packages/coderef-core/coderef/resources-sheets/systems/File-Generation-System-RESOURCE-SHEET.md)**
  Generate .coderef/ output files

- **[Pattern-Detection-System](../../../../../packages/coderef-core/coderef/resources-sheets/Pattern-Detection-System-RESOURCE-SHEET.md)**
  Detect code patterns and anti-patterns

- **[Formatter](../../../../../packages/coderef-core/src/formatter/formatter-RESOURCE-SHEET.md)**
  Output formatting and rendering

### Output Files (2 sheets)

- **[index.json-RESOURCE-SHEET](../../../../../packages/coderef-core/src/.coderef/index.json-RESOURCE-SHEET.md)**
  Structure and schema of index.json output

- **[graph.json-RESOURCE-SHEET](../../../../../packages/coderef-core/src/.coderef/graph.json-RESOURCE-SHEET.md)**
  Dependency graph JSON structure

### Scripts & Setup (3 sheets)

- **[SCRIPTS-RESOURCE-SHEET](../../../../../packages/coderef-core/coderef/resource/SCRIPTS-RESOURCE-SHEET.md)**
  Automation scripts documentation

- **[Setup-Coderef-Dir](../../../../../packages/coderef-core/coderef/resource/Setup-Coderef-Dir-RESOURCE-SHEET.md)**
  Directory structure setup

- **[RESOURCE-SHEET](../../../../../packages/coderef-core/scripts/setup-coderef-dir/RESOURCE-SHEET.md)**
  Setup script technical details

---

## Systems & Infrastructure

### Workflow Systems (7 sheets)

- **[Sessions-Hub-System](../../../../../coderef/resources-sheets/systems/Sessions-Hub-System-RESOURCE-SHEET.md)**
  Multi-agent coordination platform

- **[Workorders-System](../../../../../coderef/resources-sheets/systems/Workorders-System-RESOURCE-SHEET.md)**
  Workorder management system

- **[Stubs-System](../../../../../coderef/resources-sheets/systems/Stubs-System-RESOURCE-SHEET.md)**
  Feature stub tracking

- **[Widget-System](../../../../../coderef/resources-sheets/systems/Widget-System-RESOURCE-SHEET.md)**
  Widget registration and management

- **[Prompting-Workflow](../../../../../coderef/resources-sheets/systems/Prompting-Workflow-RESOURCE-SHEET.md)**
  Workflow orchestration

- **[Prompting-Workflow-Briefing](../../../../../coderef/resources-sheets/systems/Prompting-Workflow-Briefing-RESOURCE-SHEET.md)**
  Briefing workflow documentation

- **[Prompting-Workflow-UserFlow](../../../../../coderef/resources-sheets/systems/Prompting-Workflow-UserFlow-RESOURCE-SHEET.md)**
  User flow documentation

### Infrastructure (4 sheets)

- **[Notes-System](../../../../../coderef/resources-sheets/Notes-System-RESOURCE-SHEET.md)**
  Note-taking infrastructure with file persistence

- **[Unified-Storage](../../../../../coderef/resources-sheets/Unified-Storage-RESOURCE-SHEET.md)**
  Storage abstraction layer

- **[Theme-System](../../../../../packages/coderef-core/coderef/resources-sheets/Theme-System-RESOURCE-SHEET.md)**
  Theming infrastructure

- **[Navigation-System](../../../../../packages/coderef-core/coderef/resources-sheets/Navigation-System-RESOURCE-SHEET.md)**
  Routing and navigation

### Integration Layers (3 sheets)

- **[Electron-Wrapper](../../../../../coderef/resources-sheets/integration/Electron-Wrapper-RESOURCE-SHEET.md)**
  Desktop app integration

- **[Hybrid-Router](../../../../../coderef/resources-sheets/middleware/Hybrid-Router-RESOURCE-SHEET.md)**
  Dual-mode data fetching (Local FS vs API)

- **[Api-Routes-System](../../../../../packages/coderef-core/coderef/resources-sheets/Api-Routes-System-RESOURCE-SHEET.md)**
  API route architecture

### API Routes (1 sheet)

- **[File-Api-Route](../../../../../coderef/resources-sheets/api/File-Api-Route-RESOURCE-SHEET.md)**
  Security-critical file system operations API

---

## Analysis & Reviews

- **[Electron-IPC-Analysis](../../../../../coderef/resources-sheets/analysis/Electron-IPC-Analysis-RESOURCE-SHEET.md)**
  Electron IPC architecture analysis

- **[Notifications-UX-Review](../../../../../coderef/resources-sheets/analysis/Notifications-UX-Review-RESOURCE-SHEET.md)**
  UX review and recommendations

---

## Root-Level Sheets

### Core Systems (3 sheets)

- **[Coderef-Core-Scanner](../../../../../coderef/resources-sheets/Coderef-Core-Scanner-RESOURCE-SHEET.md)**
  Core scanner overview

- **[Index-RESOURCE-SHEET](../../../../../coderef/resources-sheets/Index-RESOURCE-SHEET.md)**
  Original resource sheets index (coderef/resources-sheets/)

- **[ProjectBoards-RESOURCE-SHEET](../../../../../coderef/foundation-docs/ProjectBoards-RESOURCE-SHEET.md)**
  Project boards foundation documentation

### Duplicate Sheets (2 sheets)

These appear to be duplicates moved to root from subdirectories:

- **[Electron-IPC-Analysis](../../../../../coderef/resources-sheets/Electron-IPC-Analysis-RESOURCE-SHEET.md)** (also in analysis/)
- **[Notifications-UX-Review](../../../../../coderef/resources-sheets/Notifications-UX-Review-RESOURCE-SHEET.md)** (also in analysis/)

---

## By Category Summary

| Category | Count | Purpose |
|----------|-------|---------|
| **Components** | 11 | UI components and React contexts |
| **Pages** | 3 | Dashboard pages (Assistant, Resources, Boards) |
| **Scanner** | 7 | Core scanning engine |
| **Data Generation** | 5 | Context, graphs, patterns |
| **Systems** | 7 | Workflow orchestration |
| **Infrastructure** | 4 | Storage, theming, navigation |
| **Integration** | 4 | API routes, Electron, routing |
| **Analysis** | 2 | Architecture reviews |
| **Scripts** | 3 | Automation and setup |
| **Output Files** | 2 | JSON schema documentation |
| **Root/Other** | 10 | Cross-cutting concerns |
| **Total** | **58** | |

---

## Usage Guidelines

### Finding a Resource Sheet

**By Component Name:**
1. Check category above (Components, Pages, Systems, etc.)
2. Follow relative link to sheet

**By Feature:**
- Authentication → Look in Components or Systems
- File operations → Look in API Routes
- Multi-agent → Look in Systems (Sessions-Hub)
- Scanning → Look in Scanner category

### Reading a Resource Sheet

All sheets follow RSMS v2.0 structure:
1. **Executive Summary** - Read first for high-level understanding
2. **Architecture Overview** - Component hierarchy
3. **State Ownership** - Canonical state tables
4. **Integration Points** - Dependencies
5. **Common Pitfalls** - Known issues (read before making changes!)

### Creating a New Resource Sheet

Use `/create-resource-sheet` command:
```bash
/create-resource-sheet YourComponent component
```

Validates against RSMS v2.0 with Papertrail:
```bash
mcp__papertrail__validate_resource_sheet path/to/Sheet-RESOURCE-SHEET.md
```

---

## Maintenance

**When to Update:**
- Component architecture changes
- New state management patterns
- Integration contract changes
- Known bugs/pitfalls discovered

**How to Update:**
1. Edit the resource sheet markdown file
2. Update version number in frontmatter
3. Add entry to maintenance log section
4. Validate with Papertrail if available

**Archiving:**
- Deprecated sheets → Move to `.archive/` subdirectory
- Keep in index with ⚠️ DEPRECATED marker

---

## Quick Links

**Most Referenced Sheets:**
- [Resources-Page](./Resources-Page-RESOURCE-SHEET.md) - This page's documentation
- [Sessions-Hub-System](../../../../../coderef/resources-sheets/systems/Sessions-Hub-System-RESOURCE-SHEET.md) - Multi-agent coordination
- [Projects-Context](../../../../../coderef/resources-sheets/components/Projects-Context-RESOURCE-SHEET.md) - Global state
- [CONSOLIDATED-SCANNER](../../../../../packages/coderef-core/src/scanner/CONSOLIDATED-SCANNER-RESOURCE-SHEET.md) - Scanner engine

**Critical Infrastructure:**
- [Electron-Wrapper](../../../../../coderef/resources-sheets/integration/Electron-Wrapper-RESOURCE-SHEET.md) - Desktop integration
- [File-Api-Route](../../../../../coderef/resources-sheets/api/File-Api-Route-RESOURCE-SHEET.md) - File system security
- [Unified-Storage](../../../../../coderef/resources-sheets/Unified-Storage-RESOURCE-SHEET.md) - Storage layer

---

**Maintained by:** CodeRef Dashboard Team
**Template:** RSMS v2.0 (Resource Sheet Metadata Standards)
**Validation:** Papertrail MCP Server

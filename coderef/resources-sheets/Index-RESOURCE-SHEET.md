---
agent: Claude Sonnet 4.5
date: "2026-01-12"
task: UPDATE
subject: Index
parent_project: coderef-dashboard
category: component
version: 1.0.0
related_files:
  - packages/dashboard/src/app/page.tsx
status: APPROVED
---

# Resource Sheets Index

**Purpose:** Quick reference index for all component/module resource sheets in the CodeRef Dashboard codebase.

**Location:** `coderef/resources-sheets/`

---

## What are Resource Sheets?

Resource sheets are comprehensive documentation files that provide deep technical context for complex components, modules, and services in the codebase. Each sheet includes:

- Executive summary (purpose, responsibilities)
- Architecture overview (component hierarchy, design decisions)
- State management patterns
- Integration points (internal/external)
- Performance considerations
- Testing strategy
- Common pitfalls

---

## Organization

Resource sheets are organized by category in subdirectories:

- **`components/`** - UI components (9 files)
- **`api/`** - API routes (1 file)
- **`systems/`** - Systems, workflows, and hubs (7 files)
- **`integration/`** - Integration layers (1 file)
- **`middleware/`** - Middleware and routing (1 file)
- **`analysis/`** - Analysis and review documents (2 files)

---

## By Category

### Components

UI components and React contexts:

- [Assistant-Page](./components/Assistant-Page-RESOURCE-SHEET.md) - AI-powered interface design
- [CodeRef-Explorer-Widget](./components/CodeRef-Explorer-Widget-RESOURCE-SHEET.md) - Complex state with localStorage persistence
- [FileTree](./components/FileTree-RESOURCE-SHEET.md) - Recursive tree rendering with filtering
- [FileViewer](./components/FileViewer-RESOURCE-SHEET.md) - Syntax highlighting and rich media rendering
- [Notepad-Clone](./components/Notepad-Clone-RESOURCE-SHEET.md) - Multi-tab text editor widget
- [Notes-Widget-Text-Editing](./components/Notes-Widget-Text-Editing-RESOURCE-SHEET.md) - Text editing with localStorage persistence
- [ProjectSelector](./components/ProjectSelector-RESOURCE-SHEET.md) - Cross-platform project state with IndexedDB
- [Projects-Context](./components/Projects-Context-RESOURCE-SHEET.md) - Global React context for project management
- [Right-Click-Context-Menu](./components/Right-Click-Context-Menu-RESOURCE-SHEET.md) - Context menu component

### API Routes

API endpoints and routes:

- [File-Api-Route](./api/File-Api-Route-RESOURCE-SHEET.md) - Security-critical file system operations API

### Systems

Systems, workflows, and hubs:

- [Sessions-Hub-System](./systems/Sessions-Hub-System-RESOURCE-SHEET.md) - Multi-agent coordination platform
- [Stubs-System](./systems/Stubs-System-RESOURCE-SHEET.md) - Mock API infrastructure
- [Widget-System](./systems/Widget-System-RESOURCE-SHEET.md) - Widget registration and management
- [Workorders-System](./systems/Workorders-System-RESOURCE-SHEET.md) - Workorder management system
- [Prompting-Workflow](./systems/Prompting-Workflow-RESOURCE-SHEET.md) - Workflow orchestration
- [Prompting-Workflow-Briefing](./systems/Prompting-Workflow-Briefing-RESOURCE-SHEET.md) - Briefing workflow documentation
- [Prompting-Workflow-UserFlow](./systems/Prompting-Workflow-UserFlow-RESOURCE-SHEET.md) - User flow documentation

### Integration

Integration layers and bridges:

- [Electron-Wrapper](./integration/Electron-Wrapper-RESOURCE-SHEET.md) - Native integration and IPC bridge

### Middleware

Middleware and routing:

- [Hybrid-Router](./middleware/Hybrid-Router-RESOURCE-SHEET.md) - Dual-mode data fetching (Local FS vs API)

### Analysis

Analysis and review documents:

- [Electron-IPC-Analysis](./analysis/Electron-IPC-Analysis-RESOURCE-SHEET.md) - Electron IPC architecture analysis
- [Notifications-UX-Review](./analysis/Notifications-UX-Review-RESOURCE-SHEET.md) - Notifications UX review and recommendations

---

## How to Use Resource Sheets

**For New Features:**
1. Find similar component in index
2. Read architecture patterns
3. Follow established conventions
4. Reference integration points

**For Debugging:**
1. Locate component in index
2. Check "Common Pitfalls" section
3. Review state management patterns
4. Verify integration contracts

**For Onboarding:**
1. Read Executive Summary for overview
2. Study Architecture Overview for design rationale
3. Review Integration Points for dependencies
4. Check Testing Strategy for coverage gaps

---

**Generated:** 2026-01-12  
**Last Updated:** 2026-01-08  
**Total Resource Sheets:** 22  
**Organization:** Category-based subdirectories

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

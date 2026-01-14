# CodeRef Dashboard - Quick Reference

**Version:** 0.1.0  
**Type:** Web Application  
**Base URL:** http://localhost:3000

---

## At a Glance

- **Aggregate Resources** - Collect workorders, stubs, and documentation from multiple CodeRef projects
- **Code Analysis** - Scan projects and visualize code structure with real-time output streaming
- **File Operations** - Read, write, delete, and move files within registered projects securely
- **Project Management** - Register, list, and manage multiple CodeRef projects from one interface
- **Workflow Integration** - Track workorders, manage sessions, and integrate with AI-assisted development

---

## Actions / Commands

| Action | Purpose | Time |
|--------|---------|------|
| View Dashboard | See aggregated workorders, stubs, and statistics | Instant |
| Scan Project | Run code analysis on selected projects | 30s - 5min |
| Read File | View file content and metadata | < 100ms |
| Write File | Create or update file content | < 200ms |
| Delete File | Remove file or directory | < 100ms |
| Move File | Rename or relocate file/directory | < 150ms |
| List Workorders | Fetch all workorders from configured projects | 100-500ms |
| Get Workorder | Retrieve detailed workorder information | 50-200ms |
| List Stubs | Fetch all stubs from centralized directory | 50-200ms |
| Stream Scan Output | Real-time scan progress via SSE | Continuous |
| Register Project | Add new CodeRef project to registry | < 50ms |
| Remove Project | Unregister project from dashboard | < 50ms |

---

## Features / Tools

### Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/` | Main overview with statistics and cards |
| Scanner | `/scanner` | Code scanning interface with project selection |
| Explorer | `/explorer` | File tree navigation and editing |
| Sessions Hub | `/sessions` | Development session management |
| Prompts | `/prompts` | Prompting workflow interface |
| Assistant | `/assistant` | AI-assisted development tools |
| Notes | `/notes` | Notes management |
| Metrics | `/metrics` | Project metrics and analytics |
| Resources | `/resources` | Resource documentation browser |
| Settings | `/settings` | Configuration and preferences |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/workorders` | GET | List all workorders |
| `/api/workorders/[id]` | GET | Get workorder details |
| `/api/stubs` | GET | List all stubs |
| `/api/coderef/file` | GET/PUT/DELETE/PATCH | File operations |
| `/api/coderef/tree` | GET | Get directory tree |
| `/api/coderef/projects` | GET/POST | Project management |
| `/api/coderef/projects/[id]` | DELETE | Remove project |
| `/api/scanner/scan` | POST | Start scan |
| `/api/scanner/scan/[id]/output` | GET | Stream scan output (SSE) |
| `/api/scanner/scan/[id]/status` | GET | Get scan status |
| `/api/scanner/scan/[id]/cancel` | POST | Cancel scan |
| `/api/scanner/projects` | GET/POST | Scanner project registry |
| `/api/sessions` | GET | List sessions |
| `/api/sessions/create` | POST | Create session |
| `/api/sessions/output` | GET | Stream session output |

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| UnifiedCard | `components/UnifiedCard/` | Shared card component for content display |
| Scanner | `components/Scanner/` | Main scanner interface |
| ProjectListCard | `components/Scanner/ProjectListCard.tsx` | Project selection with phase checkboxes |
| ConsoleTabs | `components/Scanner/ConsoleTabs.tsx` | Real-time output display |
| FileTree | `components/coderef/FileTree.tsx` | File tree navigation |
| Sidebar | `components/Sidebar/` | Main navigation sidebar |
| Header | `components/Header/` | Sticky header with breadcrumbs |
| StatsCard | `components/StatsCard/` | Statistics display card |

### Context Providers

| Context | Purpose |
|---------|---------|
| ThemeContext | Light/dark mode management |
| AccentColorContext | Accent color customization |
| ProjectsContext | Project registry management |
| SidebarContext | Sidebar collapse state |
| ExplorerContext | File explorer state |
| SearchContext | Global search state |
| WorkflowContext | Workflow state persistence |

---

## Common Workflows

### Workflow 1: Scan a Project

```
1. Navigate to /scanner
2. Select project(s) from list
3. Choose phases (Directories, Scan, Populate)
4. Click "Execute" button
5. View real-time output in Console tab
6. Monitor progress in status display
7. Results written to .coderef/ directories
```

**Time:** 30 seconds - 5 minutes (depends on project size)

### Workflow 2: View Workorders

```
1. Navigate to / (Dashboard)
2. View workorder cards in main grid
3. Filter by status (pending, implementing, complete)
4. Filter by project using project selector
5. Click card to view details
6. Navigate to workorder directory if needed
```

**Time:** < 1 second

### Workflow 3: Read and Edit File

```
1. Navigate to /explorer
2. Browse file tree to find file
3. Click file to open in editor
4. Make edits in editor pane
5. Click "Save" button
6. File written via API route
7. See confirmation message
```

**Time:** 10-30 seconds

### Workflow 4: Register New Project

```
1. Navigate to /settings
2. Open "Projects" panel
3. Click "Add Project" button
4. Enter project name
5. Enter absolute path to project root
6. Click "Save"
7. Project appears in project list
8. Available for scanning and file operations
```

**Time:** 15 seconds

### Workflow 5: Filter Workorders

```
1. Navigate to / (Dashboard)
2. Use filter bar at top
3. Select status filter (e.g., "implementing")
4. Select project filter (e.g., "coderef-dashboard")
5. View filtered results (AND logic)
6. Click "Clear Filters" to reset
```

**Time:** 5 seconds

### Workflow 6: Stream Scan Output

```
1. Start scan via /scanner
2. Scan ID returned in response
3. Open Console tab in Scanner UI
4. EventSource connects to /api/scanner/scan/[id]/output
5. Real-time output displayed as it streams
6. Status updates shown in ActionBar
7. Connection closes when scan completes
```

**Time:** Continuous (duration of scan)

---

## Reference Format

### API Request Examples

```typescript
// Get all workorders
const response = await fetch('/api/workorders');
const data = await response.json();

// Read file
const fileResponse = await fetch(
  `/api/coderef/file?path=${encodeURIComponent(filePath)}`
);
const fileData = await fileResponse.json();

// Start scan
const scanResponse = await fetch('/api/scanner/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectIds: ['project-1'],
    selections: { 'project-1': { scan: true } }
  })
});

// Stream scan output
const eventSource = new EventSource(`/api/scanner/scan/${scanId}/output`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.message);
};
```

### Component Usage Examples

```tsx
// Use ProjectsContext
import { useProjects } from '@/contexts/ProjectsContext';

function MyComponent() {
  const { projects, addProject } = useProjects();
  return <div>{projects.length} projects</div>;
}

// Use UnifiedCard
import { UnifiedCard } from '@/components/UnifiedCard';
import { FileText } from 'lucide-react';

<UnifiedCard
  icon={FileText}
  iconColor="text-blue-500"
  title="Feature Name"
  footerLeft={<span>Status</span>}
  footerRight={<Button>View</Button>}
/>
```

### Configuration Example

```json
// projects.config.json
{
  "projects": [
    {
      "id": "project-1",
      "name": "Project One",
      "path": "C:/path/to/project-1",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:/path/to/stubs"
  }
}
```

---

## Output Locations

| Type | Location | Files |
|------|----------|-------|
| Scan Results | `{project}/.coderef/` | index.json, graph.json, context.json, context.md, reports/*.json, diagrams/*.mmd |
| Workorders | `{project}/coderef/workorder/{feature-name}/` | communication.json, plan.json, DELIVERABLES.md |
| Stubs | `{centralized}/stubs/{feature-name}/` | stub.json |
| Project Registry | `~/.coderef-dashboard/projects.json` | projects.json |
| Dashboard Config | `projects.config.json` (external) | projects.config.json |

---

## Key Concepts

### 1. File System Based Architecture

- No database required - all data read from file system
- Projects managed via `projects.config.json`
- Workorders discovered by folder existence
- Graceful degradation - missing files don't break system

### 2. Multi-Project Aggregation

- Dashboard aggregates resources across unlimited projects
- Each project manages its own `.coderef/` directory
- Centralized stubs directory for backlog management
- Project registry stored in user home directory

### 3. Real-Time Streaming

- Server-Sent Events (SSE) for scan output streaming
- EventSource API in browser for real-time updates
- Status polling for scan progress
- No WebSocket required

### 4. Security Validation

- Path validation prevents directory traversal attacks
- File extension allowlist for write operations
- Protected paths prevent deletion of critical files
- All operations validate project registration

---

## Summary

**Total Pages:** 10  
**Total API Endpoints:** 20+  
**Total Components:** 72+  
**Total Context Providers:** 8  
**Common Workflows:** 6  
**Output Directories:** 5 types

**Quick Links:**
- [API Documentation](../foundation-docs/API.md)
- [Architecture](../foundation-docs/ARCHITECTURE.md)
- [Components](../foundation-docs/COMPONENTS.md)
- [Schema](../foundation-docs/SCHEMA.md)
- [User Guide](./USER-GUIDE.md)
- [Features](./FEATURES.md)

---

**Last Updated:** 2026-01-14  
**Version:** 0.1.0

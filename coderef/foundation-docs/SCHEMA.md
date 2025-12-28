# Schema & Data Model Reference

**Framework:** POWER
**Date:** 2025-12-28
**Schema Version:** 0.1.0

---

## Overview

This document defines the data schemas, TypeScript interfaces, and data models used throughout the CodeRef Dashboard project. The dashboard uses a file-based data architecture reading from multiple project directories rather than a traditional database.

**Key Characteristics:**
- No persistent database - data read from file system on demand
- Strong TypeScript typing throughout
- JSON-based configuration and data files
- React state for in-memory session management

---

## Data Storage Architecture

### File System as Database

The dashboard reads data from:
- **projects.config.json** - Project directory configuration
- **coderef/workorder/** folders - Active workorder data per project
- **centralized stubs/** folder - Pending feature backlog

### No Persistent Database

- All data is file-based (JSON, Markdown)
- No SQL or NoSQL database
- Data aggregation happens at API request time
- Session state managed in React context

---

## Core Data Models

### 1. Workorder Schema

**Source:** `packages/dashboard/src/types/workorders.ts`

#### WorkorderObject

Primary entity representing active work in a project.

```typescript
interface WorkorderObject {
  /** Workorder ID (e.g., "WO-PROJECT-001") */
  id: string;

  /** Project ID from projects.config.json */
  project_id: string;

  /** Human-readable project name */
  project_name: string;

  /** Feature name (usually folder name) */
  feature_name: string;

  /** Current workorder status */
  status: WorkorderStatus;

  /** File system path to workorder directory */
  path: string;

  /** Parsed files from the workorder folder */
  files: WorkorderFiles;

  /** ISO 8601 timestamp when workorder was created */
  created: string;

  /** ISO 8601 timestamp when workorder was last updated */
  updated: string;

  /** ISO 8601 timestamp of last status update */
  last_status_update: string;
}
```

#### WorkorderStatus (Enum)

```typescript
type WorkorderStatus =
  | 'pending_plan'       // Plan not yet created
  | 'plan_submitted'     // Plan created, awaiting review
  | 'changes_requested'  // Reviewer requested changes
  | 'approved'           // Plan approved, ready to implement
  | 'implementing'       // Currently being implemented
  | 'complete'           // Implementation finished
  | 'verified'           // Implementation verified/tested
  | 'closed';            // Workorder archived/closed
```

#### WorkorderFiles

```typescript
interface WorkorderFiles {
  /** Parsed content of communication.json (if present) */
  communication_json?: Record<string, any> | null;

  /** Parsed content of plan.json (if present) */
  plan_json?: Record<string, any> | null;

  /** Raw content of DELIVERABLES.md (if present) */
  deliverables_md?: string | null;
}
```

**File System Mapping:**
- `communication.json` → `files.communication_json`
- `plan.json` → `files.plan_json`
- `DELIVERABLES.md` → `files.deliverables_md`

---

### 2. Stub Schema

**Source:** `packages/dashboard/src/types/stubs.ts`

#### StubObject

Represents pending work items in the centralized backlog.

```typescript
interface StubObject {
  /** Unique stub identifier (usually feature-name) */
  id: string;

  /** Feature name matching folder name */
  feature_name: string;

  /** Display title */
  title: string;

  /** Description of the stub */
  description: string;

  /** Category of work */
  category: StubCategory;

  /** Priority level */
  priority: StubPriority;

  /** Current status */
  status: StubStatus;

  /** ISO 8601 timestamp when stub was created */
  created: string;

  /** ISO 8601 timestamp when stub was last updated */
  updated: string;

  /** File system path to stub.json */
  path: string;
}
```

#### StubCategory (Enum)

```typescript
type StubCategory =
  | 'feature'      // New feature
  | 'fix'          // Bug fix
  | 'improvement'  // Enhancement to existing feature
  | 'idea'         // Exploratory idea
  | 'refactor'     // Code refactoring
  | 'test';        // Testing task
```

#### StubPriority (Enum)

```typescript
type StubPriority =
  | 'low'       // Low priority
  | 'medium'    // Medium priority
  | 'high'      // High priority
  | 'critical'; // Critical/urgent
```

#### StubStatus (Enum)

```typescript
type StubStatus =
  | 'stub'        // Initial stub state
  | 'planned'     // Plan created
  | 'in_progress' // Work started
  | 'completed';  // Work finished
```

---

### 3. API Response Schemas

**Source:** `packages/dashboard/src/types/api.ts`

#### ApiError

Standard error response structure.

```typescript
interface ApiError {
  /** Machine-readable error code (e.g., "WORKORDER_NOT_FOUND") */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Additional error details */
  details?: Record<string, any>;
}
```

#### ApiErrorResponse

Generic error response wrapper.

```typescript
interface ApiErrorResponse {
  /** Always false for error responses */
  success: false;

  /** Error details */
  error: ApiError;

  /** ISO 8601 timestamp of response */
  timestamp: string;
}
```

#### ErrorCodes (Constants)

```typescript
const ErrorCodes = {
  CONFIG_MISSING: {
    code: 'CONFIG_MISSING',
    message: 'projects.config.json not found or invalid'
  },
  CONFIG_INVALID: {
    code: 'CONFIG_INVALID',
    message: 'projects.config.json is invalid JSON'
  },
  PARSE_ERROR: {
    code: 'PARSE_ERROR',
    message: 'Failed to parse JSON file'
  },
  WORKORDER_NOT_FOUND: {
    code: 'WORKORDER_NOT_FOUND',
    message: 'Workorder not found in any project'
  },
  FOLDER_NOT_FOUND: {
    code: 'FOLDER_NOT_FOUND',
    message: 'Required folder not found'
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'Permission denied when accessing file system'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  }
} as const;
```

---

### 4. Prompting Workflow Schema

**Source:** `packages/dashboard/src/components/PromptingWorkflow/types.ts`

#### WorkflowSession

In-memory session for the prompting workflow component.

```typescript
interface WorkflowSession {
  /** Unique session ID */
  id: string;

  /** Selected preloaded prompt */
  prompt: PreloadedPrompt;

  /** Array of file attachments */
  attachments: Attachment[];

  /** Final result text (if completed) */
  finalResult: string | null;

  /** Session creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
```

#### PreloadedPrompt

```typescript
interface PreloadedPrompt {
  /** Prompt identifier */
  id: 'code-review' | 'synthesize' | 'consolidate';

  /** Display name */
  name: string;

  /** Prompt template content */
  content: string;

  /** Description of what the prompt does */
  description: string;
}
```

#### Attachment

```typescript
interface Attachment {
  /** Unique attachment ID */
  id: string;

  /** Original filename */
  filename: string;

  /** File content (text) */
  content: string;

  /** Programming language (for syntax highlighting) */
  language: string;

  /** File size in bytes */
  size: number;

  /** Timestamp when attachment was added */
  addedAt: Date;
}
```

---

### 5. Core Widget Types

**Source:** `packages/core/src/types/widget.ts`

#### WidgetConfig

Configuration for registering dashboard widgets.

```typescript
interface WidgetConfig {
  /** Unique widget ID */
  id: string;

  /** Display name */
  name: string;

  /** Widget description */
  description?: string;

  /** React component to render */
  component: React.ComponentType<any>;

  /** Default props */
  defaultProps?: Record<string, any>;

  /** Icon name or component */
  icon?: string | React.ComponentType;
}
```

---

## Configuration Schemas

### projects.config.json

External configuration file (not in codebase) that maps projects to their workorder directories.

**Expected Structure:**
```json
{
  "projects": [
    {
      "id": "project-alpha",
      "name": "Project Alpha",
      "path": "C:\\path\\to\\project",
      "workorder_dir": "coderef/workorder"
    }
  ],
  "centralized": {
    "stubs_dir": "C:\\Users\\willh\\Desktop\\assistant\\stubs"
  }
}
```

**Schema:**
```typescript
interface ProjectsConfig {
  projects: Array<{
    id: string;
    name: string;
    path: string;
    workorder_dir: string;
  }>;
  centralized: {
    stubs_dir: string;
  };
}
```

---

## Theme & UI State Schemas

### ThemeContextValue

**Source:** `packages/dashboard/src/contexts/ThemeContext.tsx`

```typescript
interface ThemeContextValue {
  /** Current theme ('light' | 'dark') */
  theme: 'light' | 'dark';

  /** Toggle theme function */
  toggleTheme: () => void;
}
```

### AccentColorContextValue

**Source:** `packages/dashboard/src/contexts/AccentColorContext.tsx`

```typescript
interface AccentColorContextValue {
  /** Current accent color (hex or CSS var) */
  accentColor: string;

  /** Update accent color function */
  setAccentColor: (color: string) => void;
}
```

---

## Validation Rules

### Workorder ID Format

**Pattern:** `WO-<PROJECT>-<NUMBER>`
**Example:** `WO-CODEREF-001`

**Validation:**
```typescript
const WORKORDER_ID_PATTERN = /^WO-[A-Z0-9-]+-\d{3}$/;
```

### ISO 8601 Timestamps

All timestamps use ISO 8601 format:
```typescript
const timestamp = new Date().toISOString();
// Example: "2025-12-28T15:30:00.000Z"
```

### File Path Constraints

- Windows paths use backslashes: `C:\Users\...\`
- Stored as strings in JSON
- Must be absolute paths, not relative

---

## Relationships & Dependencies

### Workorder → Project

- **Relationship:** Many-to-One
- **Foreign Key:** `WorkorderObject.project_id` → `ProjectsConfig.projects[].id`
- **Cardinality:** Each workorder belongs to exactly one project

### Workorder → Files

- **Relationship:** One-to-One (optional)
- **Mapped via:** File system directory structure
- **Files:** `communication.json`, `plan.json`, `DELIVERABLES.md`

### Stub → None

- **Relationship:** Independent entities
- **Note:** Stubs exist in centralized directory, not associated with projects until promoted to workorders

---

## Data Flow

### Read Operations

1. **API Request** → `/api/workorders`
2. **Load Config** → `projects.config.json`
3. **Scan Directories** → `coderef/workorder/` in each project
4. **Parse Files** → JSON and Markdown files
5. **Aggregate** → Combine results from all projects
6. **Response** → Return JSON to client

### No Write Operations

The dashboard is currently read-only. All data modifications happen externally via:
- File system operations (manual or via CLI tools)
- CodeRef workflow tools (separate CLI)

---

## Type Safety

### TypeScript Configuration

- **strictNullChecks:** Enabled
- **noImplicitAny:** Enabled
- **Type Definitions:** All data models have explicit TypeScript interfaces

### Runtime Validation

**Status:** Not implemented
Future versions may add runtime schema validation using:
- Zod
- Yup
- JSON Schema validation

---

## Migration Strategy

**Status:** Not applicable (no database)
Schema changes require:
1. Update TypeScript interfaces
2. Update API endpoint logic
3. Ensure backward compatibility with existing JSON files
4. Document breaking changes

---

## Future Schema Enhancements

- **User Model:** Add user authentication and permissions
- **Comment Model:** Support comments on workorders
- **Tag Model:** Tag/label system for workorders and stubs
- **History Model:** Track workorder status change history
- **Notification Model:** User notification preferences
- **Search Index:** Full-text search index for workorders

---

**AI Integration Notes:**

When working with these schemas:

1. **Type Safety:** Always use TypeScript interfaces for type checking
2. **Null Handling:** Most file-based fields are nullable (`| null`)
3. **Timestamps:** Use `new Date().toISOString()` for consistency
4. **Enum Values:** Use string literals, not magic numbers
5. **Error Codes:** Use predefined `ErrorCodes` constants
6. **Validation:** No runtime validation - rely on TypeScript compile-time checks

**Code Generation Tips:**
- Generate API clients from TypeScript interfaces
- Use discriminated unions for status enums
- Leverage type guards for runtime type checking
- Consider generating JSON Schema from TypeScript for validation

---

*This document was generated as part of the CodeRef Dashboard foundation documentation suite. See also: [API.md](./API.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [COMPONENTS.md](./COMPONENTS.md)*

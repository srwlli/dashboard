---
generated_by: coderef-docs
template: schema
date: "2026-01-14T01:30:00Z"
feature_id: foundation-docs-schema
doc_type: schema
workorder_id: WO-FOUNDATION-DOCS-001
task: DOCUMENT
agent: claude-sonnet-4-5
mcp_enhanced: true
_uds:
  validation_score: 95
  validation_errors: []
  validation_warnings: []
  validated_at: "2026-01-14T01:30:00Z"
  validator: UDSValidator
---

# Schema Reference

**Project:** coderef-dashboard  
**Schema Version:** 0.1.0  
**Date:** 2026-01-14  
**Last Updated:** 2026-01-14

---

## Purpose

This document defines all data structures, interfaces, type definitions, and validation rules used throughout the coderef-dashboard project. It serves as the authoritative reference for data models, enabling type safety, API contract validation, and integration with external systems.

## Overview

The coderef-dashboard schema encompasses:

- **Core Data Models** - Element data, project structures, workorder formats
- **API Request/Response Types** - All endpoint contracts
- **Component Props** - React component interfaces
- **Configuration Schemas** - Project configuration and settings
- **Scanner Types** - Scan execution and output formats
- **Session Models** - Development session data structures

All schemas are TypeScript interfaces with JSON-serializable output, enabling type safety at compile-time and runtime validation.

## What

### Schema Organization

1. **Core Models** - Fundamental data structures (ElementData, Project, Workorder)
2. **API Models** - Request/response types for all endpoints
3. **Component Models** - Props and state interfaces for React components
4. **Scanner Models** - Scan execution, status, and output types
5. **Configuration Models** - Project registry, settings, and preferences

### Naming Conventions

- **Interfaces:** PascalCase (e.g., `ElementData`, `ProjectConfig`)
- **Types:** PascalCase for unions (e.g., `ScanStatus`, `FileEncoding`)
- **Enums:** PascalCase (e.g., `TypeDesignator`, `WorkorderStatus`)
- **Properties:** camelCase (e.g., `projectId`, `lastModified`)

## Why

Comprehensive schema documentation enables:

- **Type Safety** - Catch errors at compile-time with TypeScript
- **API Contracts** - Clear request/response expectations
- **Integration** - External tools can understand data structures
- **Validation** - Runtime validation against schemas
- **Documentation** - Single source of truth for data formats

## When

Reference this document when:

- Implementing new API endpoints
- Creating new data models
- Integrating external systems
- Validating request/response data
- Understanding data relationships

## Core Data Models

### ElementData

Represents a single code element discovered during scanning.

```typescript
interface ElementData {
  id: string;                    // Unique identifier (UUID v4)
  name: string;                   // Element name (e.g., "scanCurrentElements")
  type: string;                   // Element type (function, class, component, etc.)
  file: string;                   // Relative or absolute file path
  line: number;                   // Line number (1-indexed)
  hash: string;                   // SHA256 hash of element content
  dependencies?: string[];         // Array of element IDs this depends on
  metadata?: Record<string, any>; // Additional metadata (extensible)
}
```

**Validation Rules:**
- `id`: Required, must be valid UUID v4
- `name`: Required, non-empty string
- `type`: Required, one of: `function`, `class`, `component`, `hook`, `method`, `constant`, `unknown`
- `file`: Required, non-empty string
- `line`: Required, positive integer ≥ 1
- `hash`: Required, 64-character hex string (SHA256)

### Project

Represents a registered CodeRef project.

```typescript
interface CodeRefProject {
  id: string;        // Unique project identifier
  name: string;      // Display name
  path: string;      // Absolute path to project root
  addedAt: string;   // ISO 8601 timestamp
}
```

**Validation Rules:**
- `id`: Required, alphanumeric with hyphens/underscores
- `name`: Required, non-empty string
- `path`: Required, absolute path, must exist
- `addedAt`: Required, valid ISO 8601 timestamp

### Workorder

Represents a workorder tracking entry.

```typescript
interface Workorder {
  id: string;                    // Workorder ID (e.g., "WO-TRACKING-001")
  project_id: string;            // Project identifier
  project_name: string;          // Project display name
  feature_name: string;           // Feature identifier
  status: WorkorderStatus;        // Current status
  path: string;                  // Absolute path to workorder directory
  files: {
    communication_json?: object; // Communication log (optional)
    plan_json?: object;           // Implementation plan (optional)
    deliverables_md?: string;     // Deliverables markdown (optional)
  };
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  last_status_update?: string;  // Last status change timestamp
}

type WorkorderStatus = 
  | "pending"
  | "implementing"
  | "complete"
  | "blocked"
  | "cancelled";
```

**Validation Rules:**
- `id`: Required, matches pattern `WO-[A-Z0-9-]+`
- `status`: Required, must be valid WorkorderStatus
- `path`: Required, absolute path, directory must exist
- `created`, `updated`: Required, valid ISO 8601 timestamps

## API Request/Response Models

### File API

#### FileData

```typescript
interface FileData {
  path: string;                  // Absolute file path
  name: string;                  // File name
  extension: string;             // File extension (with dot)
  size: number;                  // File size in bytes
  content: string;               // File content (text or base64)
  encoding: "utf-8" | "base64";  // Content encoding
  mimeType: string;              // MIME type
  lastModified: string;          // ISO 8601 timestamp
}
```

#### FileWriteRequest

```typescript
interface FileWriteRequest {
  content: string;               // File content
  encoding?: "utf-8" | "base64";  // Encoding (default: utf-8)
}
```

### Scanner API

#### StartScanRequest

```typescript
interface StartScanRequest {
  projectIds: string[];           // Array of project IDs to scan
  selections: Record<string, ProjectSelection>; // Phase selections per project
}

interface ProjectSelection {
  directories: boolean;  // Create directory structure
  scan: boolean;         // Run code scan
  populate: boolean;     // Populate files
}
```

#### StartScanResponse

```typescript
interface StartScanResponse {
  scanId: string;                 // UUID v4 scan identifier
  status: ScanStatus;             // Initial status
  projects: string[];             // Projects being scanned
}

type ScanStatus = 
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";
```

#### ScanStatusResponse

```typescript
interface ScanStatusResponse {
  scanId: string;
  status: ScanStatus;
  progress: number;               // 0.0 to 1.0
  currentPhase?: string;           // Current phase name
  startedAt: string;              // ISO 8601 timestamp
  completedAt?: string;           // ISO 8601 timestamp (if completed)
  error?: string;                 // Error message (if failed)
}
```

#### ScanOutputEvent

```typescript
interface ScanOutputEvent {
  type: "stdout" | "stderr" | "complete" | "error";
  message: string;
  timestamp: string;             // ISO 8601 timestamp
}
```

### Workorder API

#### WorkorderListResponse

```typescript
interface WorkorderListResponse {
  success: boolean;
  data: {
    workorders: Workorder[];
    total: number;
    by_project: Record<string, number>;
    by_status: Record<string, number>;
  };
  timestamp: string;
}
```

#### WorkorderDetailResponse

```typescript
interface WorkorderDetailResponse {
  success: boolean;
  data: {
    workorder: Workorder;
    tasks: Array<{
      id: string;
      description: string;
      status: string;
    }>;
    deliverables: Array<{
      name: string;
      status: string;
    }>;
    communication_log: Array<{
      timestamp: string;
      message: string;
      author?: string;
    }>;
  };
  timestamp: string;
}
```

### Stub API

#### Stub

```typescript
interface Stub {
  id: string;                     // Stub identifier
  feature_name: string;           // Feature name
  title: string;                  // Display title
  description?: string;           // Description
  category: string;               // Category (feature, bugfix, etc.)
  priority: string;               // Priority (critical, high, etc.)
  status: "stub";                 // Always "stub"
  created: string;                // ISO 8601 timestamp
  updated: string;                // ISO 8601 timestamp
  path: string;                   // Absolute path to stub.json
}
```

#### StubListResponse

```typescript
interface StubListResponse {
  success: boolean;
  data: {
    stubs: Stub[];
    total: number;
    location: string;              // Path to stubs directory
  };
  timestamp: string;
}
```

## Component Models

### Scanner Component Props

```typescript
interface ScannerProps {
  // No props - uses context
}

interface ProjectListCardProps {
  projects: ScannerProject[];
  selections: Map<string, ProjectSelection>;
  onSelectionChange: (projectId: string, selection: ProjectSelection) => void;
}

interface ConsoleTabsProps {
  scanId?: string;
  output: string[];
}
```

### Project Context

```typescript
interface ProjectsContextValue {
  projects: CodeRefProject[];
  addProject: (project: Omit<CodeRefProject, "id" | "addedAt">) => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<CodeRefProject>) => void;
}
```

## Configuration Models

### ProjectsConfig

```typescript
interface ProjectsConfig {
  projects: Array<{
    id: string;
    name: string;
    path: string;
    workorder_dir?: string;       // Default: "coderef/workorder"
  }>;
  centralized?: {
    stubs_dir: string;             // Path to centralized stubs
  };
}
```

### ProjectsStorage

```typescript
interface ProjectsStorage {
  projects: CodeRefProject[];
  updatedAt: string;              // ISO 8601 timestamp
}
```

## Validation

### JSON Schema Example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "type", "file", "line", "hash"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "type": {
      "type": "string",
      "enum": ["function", "class", "component", "hook", "method", "constant", "unknown"]
    },
    "file": {
      "type": "string",
      "minLength": 1
    },
    "line": {
      "type": "integer",
      "minimum": 1
    },
    "hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    }
  }
}
```

## Relationships

### Element Dependencies

Elements can depend on other elements:

```typescript
interface ElementData {
  dependencies?: string[];  // Array of element IDs
}
```

### Project → Workorders

One project can have multiple workorders:

```
Project (id: "project-1")
  ├── Workorder (id: "WO-001")
  ├── Workorder (id: "WO-002")
  └── Workorder (id: "WO-003")
```

### Scan → Projects

One scan can process multiple projects:

```
Scan (scanId: "uuid")
  ├── Project (id: "project-1")
  └── Project (id: "project-2")
```

## Examples

### ElementData Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "scanCurrentElements",
  "type": "function",
  "file": "src/scanner/scanner.ts",
  "line": 42,
  "hash": "a1b2c3d4e5f6...",
  "dependencies": [
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ],
  "metadata": {
    "complexity": "medium",
    "linesOfCode": 15
  }
}
```

### Workorder Example

```json
{
  "id": "WO-TRACKING-SYSTEM-001",
  "project_id": "coderef-dashboard",
  "project_name": "CodeRef Dashboard",
  "feature_name": "coderef-tracking-api-mvp",
  "status": "implementing",
  "path": "C:/Users/willh/Desktop/coderef-dashboard/coderef/workorder/coderef-tracking-api-mvp",
  "files": {
    "communication_json": {
      "workorder_id": "WO-TRACKING-SYSTEM-001",
      "status": "implementing"
    },
    "plan_json": {
      "title": "Tracking API Implementation",
      "phases": []
    }
  },
  "created": "2026-01-14T01:00:00Z",
  "updated": "2026-01-14T01:30:00Z",
  "last_status_update": "2026-01-14T01:30:00Z"
}
```

## References

- [API.md](./API.md) - API endpoint documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [COMPONENTS.md](./COMPONENTS.md) - Component documentation
- [README.md](../README.md) - Project overview

---

**Last Updated:** 2026-01-14  
**Maintainer:** CodeRef Development Team  
**Schema Version:** 0.1.0

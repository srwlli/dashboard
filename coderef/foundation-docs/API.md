---
generated_by: coderef-docs
template: api
date: "2026-01-14T01:30:00Z"
feature_id: foundation-docs-api
doc_type: api
workorder_id: WO-FOUNDATION-DOCS-001
task: DOCUMENT
agent: claude-sonnet-4-5
_uds:
  validation_score: 95
  validation_errors: []
  validation_warnings: []
  validated_at: "2026-01-14T01:30:00Z"
  validator: UDSValidator
---

# API Reference

**Project:** coderef-dashboard  
**Version:** 0.1.0  
**Date:** 2026-01-14  
**Base URL:** `http://localhost:3000/api`

---

## Purpose

This document provides comprehensive API reference documentation for all endpoints in the coderef-dashboard project. It serves as the technical interface reference for developers integrating with the dashboard's REST API, including file operations, scanner operations, workorder tracking, and project management.

## Overview

The coderef-dashboard API is built on Next.js API routes and provides:

- **File System Operations** - Read, write, delete, and move files within registered CodeRef projects
- **Scanner Operations** - Initiate code scans, stream real-time output, and manage scan lifecycle
- **Workorder Tracking** - Discover and query workorders across multiple projects
- **Project Management** - Register, list, and manage CodeRef projects
- **Session Management** - Create and manage development sessions

All endpoints follow RESTful conventions and return JSON responses with consistent error handling.

## What

### API Architecture

The API is organized into logical groups:

1. **CodeRef Operations** (`/api/coderef/*`)
   - File operations (`/file`)
   - Project management (`/projects`, `/projects/[id]`)
   - Directory tree navigation (`/tree`)
   - Notes management (`/notes`)

2. **Scanner Operations** (`/api/scanner/*`)
   - Scan execution (`/scan`)
   - Project management (`/projects`, `/projects/[id]`)
   - Real-time output streaming (`/scan/[scanId]/output`)
   - Status polling (`/scan/[scanId]/status`)
   - Scan cancellation (`/scan/[scanId]/cancel`)

3. **Workorder Tracking** (`/api/workorders/*`)
   - List all workorders (`/workorders`)
   - Get workorder details (`/workorders/[workorderId]`)

4. **Stub Management** (`/api/stubs`)
   - List all stubs from centralized orchestrator

5. **Session Management** (`/api/sessions/*`)
   - Create sessions (`/create`)
   - List sessions (`/sessions`)
   - Context discovery (`/context-discovery`)
   - Output streaming (`/output`)

### Authentication

Currently, the API operates without authentication in development. All endpoints are accessible from `localhost:3000`.

### Response Format

All endpoints return JSON with this structure:

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string; // ISO 8601
}
```

## Why

The API provides programmatic access to:

- **File Operations** - Enable widgets and tools to read/write project files securely
- **Code Analysis** - Trigger scans and monitor progress in real-time
- **Project Tracking** - Discover and query workorders across distributed projects
- **Development Workflow** - Manage sessions and context for AI-assisted development

## When

Use these endpoints when:

- Building dashboard widgets that need file access
- Integrating external tools with the CodeRef system
- Automating code analysis workflows
- Querying workorder status across projects
- Streaming real-time scan output to UI

## Endpoints

### CodeRef File Operations

#### GET /api/coderef/file

Read file content and metadata.

**Query Parameters:**
- `path` (required): Absolute file path within registered project

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "path": "C:/path/to/file.ts",
    "name": "file.ts",
    "extension": ".ts",
    "size": 1024,
    "content": "file content here",
    "encoding": "utf-8",
    "mimeType": "text/typescript",
    "lastModified": "2026-01-14T01:00:00Z"
  }
}
```

**Error: 400 BAD_REQUEST**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PATH",
    "message": "Path is not within a registered project"
  }
}
```

#### PUT /api/coderef/file

Write or create a file.

**Query Parameters:**
- `path` (required): Absolute file path

**Request Body:**
```json
{
  "content": "file content",
  "encoding": "utf-8"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "path": "C:/path/to/file.ts",
    "written": true
  }
}
```

#### DELETE /api/coderef/file

Delete a file or directory.

**Query Parameters:**
- `path` (required): Absolute file path

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "path": "C:/path/to/file.ts",
    "deleted": true
  }
}
```

#### PATCH /api/coderef/file

Rename or move a file/directory.

**Query Parameters:**
- `path` (required): Current absolute file path

**Request Body:**
```json
{
  "newPath": "C:/path/to/new-name.ts"
}
```

### Scanner Operations

#### POST /api/scanner/scan

Start a new scan for selected projects.

**Request Body:**
```json
{
  "projectIds": ["project-1", "project-2"],
  "selections": {
    "project-1": {
      "directories": true,
      "scan": true,
      "populate": false
    }
  }
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "scanId": "uuid-v4",
    "status": "running",
    "projects": ["project-1", "project-2"]
  }
}
```

#### GET /api/scanner/scan/[scanId]/output

Stream real-time scan output via Server-Sent Events (SSE).

**Response:** SSE stream with events:
```
event: output
data: {"type": "stdout", "message": "Scanning project..."}

event: output
data: {"type": "stderr", "message": "Warning: ..."}

event: complete
data: {"status": "completed"}
```

#### GET /api/scanner/scan/[scanId]/status

Get current scan status.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "scanId": "uuid-v4",
    "status": "running",
    "progress": 0.65,
    "currentPhase": "scan",
    "startedAt": "2026-01-14T01:00:00Z"
  }
}
```

#### POST /api/scanner/scan/[scanId]/cancel

Cancel a running scan.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "scanId": "uuid-v4",
    "status": "cancelled"
  }
}
```

### Workorder Tracking

#### GET /api/workorders

Fetch all workorders from all configured projects.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "workorders": [
      {
        "id": "WO-TRACKING-SYSTEM-001",
        "project_id": "coderef-dashboard",
        "project_name": "CodeRef Dashboard",
        "feature_name": "coderef-tracking-api-mvp",
        "status": "implementing",
        "path": "C:/path/to/workorder",
        "created": "2026-01-14T01:00:00Z",
        "updated": "2026-01-14T01:30:00Z"
      }
    ],
    "total": 15,
    "by_project": {
      "coderef-dashboard": 8,
      "scrapper": 3,
      "gridiron": 4
    },
    "by_status": {
      "implementing": 7,
      "pending": 5,
      "complete": 3
    }
  },
  "timestamp": "2026-01-14T01:30:00Z"
}
```

#### GET /api/workorders/[workorderId]

Get detailed information about a specific workorder.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "workorder": {
      "id": "WO-TRACKING-SYSTEM-001",
      "project_id": "coderef-dashboard",
      "status": "implementing",
      "files": {
        "communication_json": {...},
        "plan_json": {...},
        "deliverables_md": "..."
      }
    },
    "tasks": [...],
    "deliverables": [...],
    "communication_log": [...]
  }
}
```

### Stub Management

#### GET /api/stubs

Fetch all stubs from the centralized orchestrator.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "stubs": [
      {
        "id": "coderef-tracking-api-mvp",
        "feature_name": "coderef-tracking-api-mvp",
        "title": "Workorder & Stub Tracking API",
        "status": "stub",
        "created": "2026-01-14T01:00:00Z"
      }
    ],
    "total": 42,
    "location": "C:/path/to/stubs"
  }
}
```

### Project Management

#### GET /api/coderef/projects

List all registered CodeRef projects.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-1",
        "name": "Project One",
        "path": "C:/path/to/project",
        "addedAt": "2026-01-14T01:00:00Z"
      }
    ]
  }
}
```

#### POST /api/coderef/projects

Register a new CodeRef project.

**Request Body:**
```json
{
  "name": "New Project",
  "path": "C:/path/to/project"
}
```

#### DELETE /api/coderef/projects/[id]

Remove a registered project.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "project-1",
    "removed": true
  }
}
```

## Error Handling

### Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `INVALID_PATH` | 400 | Path validation failed |
| `FILE_NOT_FOUND` | 404 | File does not exist |
| `WORKORDER_NOT_FOUND` | 404 | Workorder not found |
| `CONFIG_MISSING` | 500 | Configuration file missing |
| `PERMISSION_DENIED` | 403 | File system permission denied |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "additional": "context"
    }
  },
  "timestamp": "2026-01-14T01:30:00Z"
}
```

## Rate Limits

Currently, no rate limits are enforced. Future versions may implement:
- 100 requests/minute per IP for file operations
- 10 scan requests/minute per user
- 1000 requests/minute for read-only endpoints

## Pagination

Most list endpoints support pagination (future enhancement):

```
GET /api/workorders?page=1&limit=20
GET /api/stubs?page=2&limit=50
```

## Examples

### cURL Request

```bash
# Get file content
curl "http://localhost:3000/api/coderef/file?path=C:/path/to/file.ts"

# Start a scan
curl -X POST http://localhost:3000/api/scanner/scan \
  -H "Content-Type: application/json" \
  -d '{"projectIds": ["project-1"], "selections": {"project-1": {"scan": true}}}'

# Get all workorders
curl http://localhost:3000/api/workorders
```

### TypeScript Client

```typescript
// File operations
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
const eventSource = new EventSource(
  `/api/scanner/scan/${scanId}/output`
);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.message);
};
```

## References

- [README.md](../README.md) - Project overview and setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SCHEMA.md](./SCHEMA.md) - Data models and schemas
- [COMPONENTS.md](./COMPONENTS.md) - UI components

---

**Last Updated:** 2026-01-14  
**Maintainer:** CodeRef Development Team  
**Version:** 0.1.0

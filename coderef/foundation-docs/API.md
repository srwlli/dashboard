# API Reference

**Framework:** POWER
**Date:** 2025-12-28
**Version:** 0.1.0

---

## Overview

This document provides comprehensive API reference for the CodeRef Dashboard backend. The dashboard aggregates workorder and stub data from multiple projects using Next.js API Routes.

**Key Architecture:**
- Next.js 14 API Routes (App Router)
- File-based API endpoints in `packages/dashboard/src/app/api/`
- Reads data from multiple project directories via `projects.config.json`
- RESTful JSON responses with standardized error handling

---

## Base URL

Development: `http://localhost:3000/api`

---

## Authentication

**Status:** Not implemented
All endpoints are currently unauthenticated. Future versions may add API key or OAuth2 authentication.

---

## Endpoints

### Workorders

#### GET /api/workorders

Fetch all workorders from all tracked projects. Aggregates workorders from multiple project directories configured in `projects.config.json`.

**Implementation:** `packages/dashboard/src/app/api/workorders/route.ts:18`

**Request:**
```bash
curl http://localhost:3000/api/workorders
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workorders": [
      {
        "id": "WO-PROJECT-001",
        "project_id": "project-alpha",
        "project_name": "Project Alpha",
        "feature_name": "authentication",
        "status": "implementing",
        "path": "C:\\path\\to\\project\\coderef\\workorder\\authentication",
        "files": {
          "communication_json": { /* parsed JSON */ },
          "plan_json": { /* parsed JSON */ },
          "deliverables_md": "# Deliverables..."
        },
        "created": "2025-12-20T10:00:00.000Z",
        "updated": "2025-12-28T14:30:00.000Z",
        "last_status_update": "2025-12-28T14:30:00.000Z"
      }
    ],
    "total": 15,
    "by_project": {
      "project-alpha": 5,
      "project-beta": 10
    },
    "by_status": {
      "implementing": 8,
      "complete": 5,
      "pending_plan": 2
    }
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

**Response Fields:**
- `workorders`: Array of workorder objects
- `total`: Total count of workorders across all projects
- `by_project`: Workorder count grouped by project ID
- `by_status`: Workorder count grouped by status

**Error Responses:**

`500 Internal Server Error` - Config file missing or invalid
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_MISSING",
    "message": "projects.config.json not found or invalid",
    "details": {
      "reason": "ENOENT: no such file or directory"
    }
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

---

#### GET /api/workorders/:workorderId

Fetch a specific workorder with complete details and all files. Searches across all configured projects.

**Implementation:** `packages/dashboard/src/app/api/workorders/[workorderId]/route.ts:18`

**Parameters:**
- `workorderId` (path parameter) - Workorder ID (e.g., "WO-PROJECT-001")

**Request:**
```bash
curl http://localhost:3000/api/workorders/WO-PROJECT-001
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workorder": {
      "id": "WO-PROJECT-001",
      "project_id": "project-alpha",
      "project_name": "Project Alpha",
      "feature_name": "authentication",
      "status": "implementing",
      "path": "C:\\path\\to\\project\\coderef\\workorder\\authentication",
      "files": {
        "communication_json": { /* parsed JSON */ },
        "plan_json": {
          "tasks": [
            {
              "id": "TASK-001",
              "description": "Implement OAuth2 flow",
              "status": "in_progress"
            }
          ]
        },
        "deliverables_md": "# Deliverables..."
      },
      "created": "2025-12-20T10:00:00.000Z",
      "updated": "2025-12-28T14:30:00.000Z",
      "last_status_update": "2025-12-28T14:30:00.000Z"
    },
    "tasks": [
      {
        "id": "TASK-001",
        "description": "Implement OAuth2 flow",
        "status": "in_progress"
      }
    ],
    "deliverables": [
      {
        "name": "Deliverables document exists",
        "status": "active"
      }
    ],
    "communication_log": [
      {
        "timestamp": "2025-12-28T14:30:00.000Z",
        "message": "Started implementation",
        "author": "agent-1"
      }
    ]
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

**Response Fields:**
- `workorder`: Complete workorder object with all parsed files
- `tasks`: Array of tasks extracted from `plan.json` (if present)
- `deliverables`: Array of deliverable items from `DELIVERABLES.md` (if present)
- `communication_log`: Communication history from `communication.json` (if present)

**Error Responses:**

`404 Not Found` - Workorder not found
```json
{
  "success": false,
  "error": {
    "code": "WORKORDER_NOT_FOUND",
    "message": "Workorder not found in any project",
    "details": {
      "searchedId": "WO-PROJECT-999",
      "searchedProjects": ["project-alpha", "project-beta"]
    }
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

---

### Stubs

#### GET /api/stubs

Fetch all stubs from the centralized orchestrator directory. Stubs represent pending work items in the backlog.

**Implementation:** `packages/dashboard/src/app/api/stubs/route.ts:18`

**Request:**
```bash
curl http://localhost:3000/api/stubs
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stubs": [
      {
        "id": "dark-mode",
        "feature_name": "dark-mode",
        "title": "Dark Mode Support",
        "description": "Add dark mode theme toggle to dashboard",
        "category": "feature",
        "priority": "medium",
        "status": "stub",
        "created": "2025-12-15T09:00:00.000Z",
        "updated": "2025-12-15T09:00:00.000Z",
        "path": "C:\\Users\\willh\\Desktop\\assistant\\stubs\\dark-mode\\stub.json"
      }
    ],
    "total": 42,
    "location": "C:\\Users\\willh\\Desktop\\assistant\\stubs"
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

**Response Fields:**
- `stubs`: Array of stub objects
- `total`: Total count of stubs found
- `location`: File system path where stubs were scanned

**Error Responses:**

`500 Internal Server Error` - Config invalid
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_INVALID",
    "message": "projects.config.json is invalid JSON",
    "details": {
      "reason": "centralized.stubs_dir not found in config"
    }
  },
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

---

## Data Models

### WorkorderObject

```typescript
interface WorkorderObject {
  id: string;                    // Workorder ID (e.g., "WO-PROJECT-001")
  project_id: string;            // Project ID from config
  project_name: string;          // Human-readable project name
  feature_name: string;          // Feature name (folder name)
  status: WorkorderStatus;       // Current status
  path: string;                  // File system path
  files: WorkorderFiles;         // Parsed files
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  last_status_update: string;    // ISO 8601 timestamp
}
```

**WorkorderStatus:** `"pending_plan" | "plan_submitted" | "changes_requested" | "approved" | "implementing" | "complete" | "verified" | "closed"`

**Source:** `packages/dashboard/src/types/workorders.ts:39`

---

### StubObject

```typescript
interface StubObject {
  id: string;                    // Unique identifier
  feature_name: string;          // Feature name (folder name)
  title: string;                 // Display title
  description: string;           // Stub description
  category: StubCategory;        // Category of work
  priority: StubPriority;        // Priority level
  status: StubStatus;            // Current status
  created: string;               // ISO 8601 timestamp
  updated: string;               // ISO 8601 timestamp
  path: string;                  // File system path
}
```

**StubCategory:** `"feature" | "fix" | "improvement" | "idea" | "refactor" | "test"`
**StubPriority:** `"low" | "medium" | "high" | "critical"`
**StubStatus:** `"stub" | "planned" | "in_progress" | "completed"`

**Source:** `packages/dashboard/src/types/stubs.ts:16`

---

### ApiError

```typescript
interface ApiError {
  code: string;                  // Machine-readable error code
  message: string;               // Human-readable message
  details?: Record<string, any>; // Additional error details
}
```

**Source:** `packages/dashboard/src/types/api.ts:10`

---

## Error Codes

All error responses follow a consistent schema with predefined error codes:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CONFIG_MISSING` | 500 | projects.config.json not found or inaccessible |
| `CONFIG_INVALID` | 500 | projects.config.json contains invalid JSON |
| `PARSE_ERROR` | 500 | Failed to parse a JSON file (workorder/stub) |
| `WORKORDER_NOT_FOUND` | 404 | Workorder ID not found in any project |
| `FOLDER_NOT_FOUND` | 500 | Required folder not found in file system |
| `PERMISSION_DENIED` | 403 | Permission denied accessing file system |
| `INTERNAL_ERROR` | 500 | Unexpected internal server error |

**Source:** `packages/dashboard/src/types/api.ts:38`

---

## Rate Limiting

**Status:** Not implemented
Future versions may implement rate limiting for production deployments.

---

## Pagination

**Status:** Not implemented
All list endpoints currently return complete datasets. Future versions may add pagination support with `?page=1&limit=50` query parameters.

---

## CORS

**Status:** Default Next.js CORS policy
Currently allows same-origin requests. Configure CORS headers in production as needed.

---

## Versioning

**Status:** Not implemented
API version is `v1` (implicit). Future breaking changes will introduce versioned endpoints (`/api/v2/...`).

---

## Implementation Details

### File Reading Strategy

The API reads workorder and stub data directly from the file system:

1. Load `projects.config.json` to get project paths
2. Scan `coderef/workorder/` directories in each project
3. Parse JSON files (`communication.json`, `plan.json`) and markdown files (`DELIVERABLES.md`)
4. Aggregate results across projects

**Key Classes:**
- `ProjectsConfig` - Manages project configuration (`packages/dashboard/src/lib/api/projects.ts`)
- `WorkorderReader` - Reads workorder data (`packages/dashboard/src/lib/api/workorders.ts`)
- `StubReader` - Reads stub data (`packages/dashboard/src/lib/api/stubs.ts`)

### Error Handling

All endpoints use the `createErrorResponse()` utility to ensure consistent error format:

```typescript
const errorResponse = createErrorResponse(ErrorCodes.WORKORDER_NOT_FOUND, {
  searchedId: workorderId,
  searchedProjects: projectIds
});
return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
```

---

## Future Enhancements

- **Authentication:** API key or OAuth2 support
- **Pagination:** Support for large datasets
- **Filtering:** Query parameters for filtering workorders by status, project
- **Sorting:** Query parameters for sorting results
- **Webhooks:** Real-time notifications for workorder status changes
- **GraphQL:** Alternative GraphQL API for flexible queries
- **Caching:** Redis or in-memory caching for improved performance

---

**AI Integration Notes:**

This API is designed for AI agent consumption. Key design decisions:
- Consistent JSON structure across all endpoints
- Machine-readable error codes for automated error handling
- Complete data objects (no partial responses)
- ISO 8601 timestamps for reliable date parsing
- Descriptive field names that map to domain concepts

When integrating with AI agents:
1. Use error codes to determine retry strategy
2. Parse `by_status` and `by_project` for aggregation insights
3. Extract `tasks` and `communication_log` for workflow context
4. Monitor `last_status_update` for change detection

---

*This document was generated as part of the CodeRef Dashboard foundation documentation suite. See also: [ARCHITECTURE.md](./ARCHITECTURE.md), [SCHEMA.md](./SCHEMA.md), [COMPONENTS.md](./COMPONENTS.md)*

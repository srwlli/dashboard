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

### CodeRef Projects

#### GET /api/coderef/projects

Fetch all registered CodeRef projects. Projects are stored in `~/.coderef-dashboard/projects.json` with absolute file system paths for persistent access across sessions.

**Implementation:** `packages/dashboard/src/app/api/coderef/projects/route.ts:104`

**Request:**
```bash
curl http://localhost:3000/api/coderef/projects
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "coderef-dashboard",
        "name": "CodeRef Dashboard",
        "path": "C:\\Users\\username\\projects\\coderef-dashboard",
        "addedAt": "2025-12-31T08:00:00.000Z"
      },
      {
        "id": "my-app",
        "name": "My Application",
        "path": "C:\\projects\\my-app",
        "addedAt": "2025-12-30T14:30:00.000Z"
      }
    ],
    "total": 2
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

**Query Parameters:**
- `id` (optional): Return single project by ID

**Example - Get single project:**
```bash
curl http://localhost:3000/api/coderef/projects?id=my-app
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "my-app",
      "name": "My Application",
      "path": "C:\\projects\\my-app",
      "addedAt": "2025-12-30T14:30:00.000Z"
    }
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

**Error Responses:**

`404 Not Found` - Project not found
```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project with ID 'invalid-id' not found",
    "details": {
      "projectId": "invalid-id"
    }
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

---

#### POST /api/coderef/projects

Register a new CodeRef project or update an existing one. Stores the **absolute file system path** for persistent access without permission dialogs.

**Implementation:** `packages/dashboard/src/app/api/coderef/projects/route.ts:151`

**Request:**
```bash
curl -X POST http://localhost:3000/api/coderef/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-app",
    "name": "My Application",
    "path": "C:\\projects\\my-app"
  }'
```

**Request Body:**
```typescript
{
  id: string;      // Unique project identifier
  name: string;    // Human-readable project name
  path: string;    // Absolute file system path to project root
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "my-app",
      "name": "My Application",
      "path": "C:\\projects\\my-app",
      "addedAt": "2025-12-31T10:00:00.000Z"
    },
    "updated": false
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` - Missing required fields
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: id, name, path",
    "details": {
      "received": { "id": "my-app" }
    }
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

`404 Not Found` - Path does not exist
```json
{
  "success": false,
  "error": {
    "code": "FOLDER_NOT_FOUND",
    "message": "Folder not found",
    "details": {
      "path": "C:\\invalid\\path"
    }
  },
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

**Important Notes:**
- **Absolute Paths Required:** The `path` field must be an absolute file system path (e.g., `C:\\projects\\my-app` on Windows, `/home/user/projects/my-app` on Linux)
- **Persistent Storage:** Projects are stored in `~/.coderef-dashboard/projects.json` and persist across app restarts
- **No Permission Dialogs:** Once registered, the absolute path can be accessed directly without showing file selection dialogs
- **Update Behavior:** If a project with the same `id` exists, it will be updated with the new `name` and `path`

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

### Context Discovery (Sessions)

#### GET /api/sessions/context-discovery

**NEW in v0.8.0** - Discover relevant context files for a stub description using CodeRef-powered semantic scoring.

**Implementation:** `packages/dashboard/src/app/api/sessions/context-discovery/route.ts`

**Query Parameters:**
- `stubDescription` (required) - Description text from selected stub
- `projectPath` (optional) - Path to target project (defaults to current working directory)

**Request:**
```bash
curl "http://localhost:3000/api/sessions/context-discovery?stubDescription=build%20authentication%20system&projectPath=C:\\project"
```

**Response:** `200 OK`
```json
{
  "files": [
    {
      "id": "code-component-AuthButton",
      "filename": "AuthButton.tsx",
      "path": "C:\\project\\src\\components\\AuthButton.tsx",
      "type": "component",
      "size": 0,
      "relevanceScore": 85,
      "excerpt": "component: AuthButton (line 10)",
      "scoringBreakdown": {
        "patternSimilarity": 35,
        "dependencies": 20,
        "complexity": 20,
        "coverage": 10
      }
    },
    {
      "id": "foundation-ARCHITECTURE.md",
      "filename": "ARCHITECTURE.md",
      "path": "C:\\project\\coderef\\foundation-docs\\ARCHITECTURE.md",
      "type": "foundation",
      "size": 15234,
      "relevanceScore": 75,
      "excerpt": "# Architecture - Authentication system design..."
    }
  ],
  "autoSelected": ["code-component-AuthButton"],
  "keywords": ["build", "authentication", "system"],
  "statsByType": {
    "component": 15,
    "hook": 8,
    "api": 5,
    "util": 12,
    "test": 20,
    "foundation": 4,
    "archived": 2,
    "resource": 3
  },
  "codeRefAvailable": {
    "index": true,
    "graph": true,
    "patterns": false,
    "coverage": false
  },
  "timestamp": "2026-01-11T21:30:00.000Z"
}
```

**Response Fields:**

**File Object:**
- `id` - Unique identifier for the file
- `filename` - File name only
- `path` - Full absolute path to file
- `type` - File category: `component`, `hook`, `api`, `util`, `test`, `foundation`, `archived`, `resource`
- `size` - File size in bytes (0 for code elements from index)
- `relevanceScore` - Semantic relevance score (0-100)
- `excerpt` - Preview text from file
- `scoringBreakdown` (optional) - Breakdown of semantic score by dimension

**Scoring Breakdown Dimensions:**
- `patternSimilarity` (0-40 pts) - Matches from `.coderef/reports/patterns.json`
- `dependencies` (0-30 pts) - Relationship count from `.coderef/graph.json`
- `complexity` (0-20 pts) - Element count from `.coderef/index.json` (sweet spot: 1-49 elements)
- `coverage` (0-10 pts) - Test coverage from `.coderef/reports/coverage.json`

**Top-Level Fields:**
- `files` - Array of discovered context files, sorted by relevanceScore (descending)
- `autoSelected` - Array of file IDs with score >= 90 (pre-selected for user)
- `keywords` - Extracted keywords from stub description
- `statsByType` - Count of files by type
- `codeRefAvailable` - Flags indicating which `.coderef/` data sources are available
- `timestamp` - ISO 8601 timestamp

**Semantic Scoring System:**

The endpoint uses a 4-dimension scoring system powered by CodeRef data:

1. **Pattern Similarity (40 points max)**
   - Matches patterns from `.coderef/reports/patterns.json`
   - Each keyword-pattern match adds 5 points
   - Capped at 40 points maximum

2. **Dependencies (30 points max)**
   - Uses relationship graph from `.coderef/graph.json`
   - Each relationship (import/call) adds 2 points
   - More central files score higher
   - Capped at 30 points maximum

3. **Complexity (20 points max)**
   - Based on element count from `.coderef/index.json`
   - Sweet spot (1-49 elements): 20 points
   - Too complex (50+ elements): 10 points
   - Too simple (0 elements): 5 points

4. **Test Coverage (10 points max)**
   - From `.coderef/reports/coverage.json`
   - High coverage (>80%): 10 points
   - Medium coverage (50-80%): 5 points
   - Low coverage (<50%): 0 points

**File Type Categories:**

**Code Elements** (from `.coderef/index.json`):
- `component` - React/Vue components
- `hook` - React hooks
- `api` - API route handlers
- `util` - Utility functions
- `test` - Test files

**Legacy Sources** (keyword-based):
- `foundation` - Foundation docs from `coderef/foundation-docs/`
- `archived` - Archived features from `coderef/archived/`
- `resource` - Resource sheets from `coderef/resources-sheets/`

**Error Responses:**

`400 Bad Request` - Missing required parameter
```json
{
  "error": "stubDescription parameter is required"
}
```

`500 Internal Server Error` - Failed to discover context
```json
{
  "error": "Failed to discover context files",
  "details": "Error reading .coderef/index.json"
}
```

**Prerequisites:**

For semantic scoring to work, run CodeRef scan before using this endpoint:
```bash
coderef scan /path/to/project
```

This generates:
- `.coderef/index.json` (required for code element discovery)
- `.coderef/graph.json` (required for dependency scoring)
- `.coderef/reports/patterns.json` (optional for pattern matching)
- `.coderef/reports/coverage.json` (optional for coverage scoring)

**Fallback Behavior:**

If `.coderef/` data is unavailable, the endpoint falls back to keyword-based scoring for foundation docs, archived features, and resource sheets only.

**Workorder:** WO-FILE-ID-ENHANCEMENTS-001

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

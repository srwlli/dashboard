# Tracking API Documentation

**Status:** MVP (File System Based)
**Version:** 1.0.0
**Created:** 2025-12-26

---

## Overview

The Tracking API provides live access to workorders and stubs across all orchestrator projects. It's the data foundation for the `/coderef-assistant` and `/coderef-sources` dashboard routes.

**Base URL:** `http://localhost:3000/api`

---

## Architecture

### File System MVP

The API is file system-based:
- Reads from `projects.config.json` for project registry
- Scans `assistant/coderef/working/` for stubs
- Scans `{project}/coderef/workorder/` for workorders
- Discovers workorders by folder existence (files optional)
- Implements graceful degradation (missing files → partial data)

### Design Principles

1. **Graceful Degradation** - Missing files don't break the system
2. **Distributed Discovery** - Folder existence = workorder exists
3. **Folder-Based** - Not file-based (more flexible)
4. **Optional Files** - communication.json, plan.json, DELIVERABLES.md all optional
5. **Fallback Timestamps** - Uses folder stats when JSON files missing

---

## Endpoints

### 1. GET /api/stubs

Fetch all stubs from the centralized orchestrator.

**Request:**
```
GET /api/stubs
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "stubs": [
      {
        "id": "coderef-tracking-api-mvp",
        "feature_name": "coderef-tracking-api-mvp",
        "title": "Workorder & Stub Tracking API - File System MVP",
        "description": "Create Next.js API routes to track workorders and stubs...",
        "category": "feature",
        "priority": "critical",
        "status": "stub",
        "created": "2025-12-26T11:00:00Z",
        "updated": "2025-12-26T11:00:00Z",
        "path": "C:\\Users\\willh\\Desktop\\assistant\\coderef\\working\\coderef-tracking-api-mvp\\stub.json"
      }
    ],
    "total": 42,
    "location": "C:\\Users\\willh\\Desktop\\assistant\\coderef\\working"
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Error: 500 CONFIG_MISSING**
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_MISSING",
    "message": "projects.config.json not found or invalid",
    "details": { "reason": "..." }
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Usage:**
```typescript
const response = await fetch('/api/stubs');
const data: StubListResponse = await response.json();
```

---

### 2. GET /api/workorders

Fetch all workorders from all 6 tracked projects.

**Request:**
```
GET /api/workorders
```

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
        "path": "C:\\Users\\willh\\Desktop\\coderef-dashboard\\coderef\\workorder\\coderef-tracking-api-mvp",
        "files": {
          "communication_json": { "workorder_id": "WO-TRACKING-SYSTEM-001", "status": "implementing" },
          "plan_json": { "title": "Tracking API Implementation", "phases": [...] },
          "deliverables_md": "# Deliverables\n..."
        },
        "created": "2025-12-26T11:00:00Z",
        "updated": "2025-12-26T13:30:00Z",
        "last_status_update": "2025-12-26T13:30:00Z"
      }
    ],
    "total": 15,
    "by_project": {
      "scrapper": 3,
      "gridiron": 4,
      "coderef-dashboard": 8
    },
    "by_status": {
      "implementing": 7,
      "pending": 5,
      "complete": 3
    }
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Error: 500 CONFIG_MISSING**
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_MISSING",
    "message": "projects.config.json not found or invalid"
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Usage:**
```typescript
const response = await fetch('/api/workorders');
const data: WorkorderListResponse = await response.json();

// Access aggregates
console.log(data.data.by_project);  // { "coderef-dashboard": 8, ... }
console.log(data.data.by_status);   // { "implementing": 7, ... }
```

---

### 3. GET /api/workorders/:workorderId

Fetch a specific workorder with complete details.

**Request:**
```
GET /api/workorders/WO-TRACKING-SYSTEM-001
GET /api/workorders/coderef-tracking-api-mvp  (searches by folder name too)
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "workorder": {
      "id": "WO-TRACKING-SYSTEM-001",
      "project_id": "coderef-dashboard",
      "project_name": "CodeRef Dashboard",
      "feature_name": "coderef-tracking-api-mvp",
      "status": "implementing",
      "path": "C:\\Users\\willh\\Desktop\\coderef-dashboard\\coderef\\workorder\\coderef-tracking-api-mvp",
      "files": {
        "communication_json": { "workorder_id": "WO-TRACKING-SYSTEM-001", ... },
        "plan_json": { "title": "...", "phases": [...] },
        "deliverables_md": "# Deliverables\n..."
      },
      "created": "2025-12-26T11:00:00Z",
      "updated": "2025-12-26T13:30:00Z",
      "last_status_update": "2025-12-26T13:30:00Z"
    },
    "tasks": [
      { "id": "WO-TRACKING-SETUP-001", "description": "Create directories", "status": "pending" },
      { "id": "WO-TRACKING-IMPL-001", "description": "Implement endpoints", "status": "in_progress" }
    ],
    "deliverables": [
      { "name": "Deliverables document exists", "status": "active" }
    ],
    "communication_log": [
      { "timestamp": "2025-12-26T11:00:00Z", "message": "Workorder created", "author": "Lloyd" }
    ]
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Error: 404 WORKORDER_NOT_FOUND**
```json
{
  "success": false,
  "error": {
    "code": "WORKORDER_NOT_FOUND",
    "message": "Workorder not found in any project",
    "details": {
      "searchedId": "WO-INVALID-001",
      "searchedProjects": ["scrapper", "gridiron", "coderef-dashboard", ...]
    }
  },
  "timestamp": "2025-12-26T13:30:00Z"
}
```

**Usage:**
```typescript
const response = await fetch('/api/workorders/WO-TRACKING-SYSTEM-001');

if (!response.ok) {
  const error = await response.json();
  console.error(`Workorder not found: ${error.error.message}`);
  return;
}

const data: WorkorderDetailResponse = await response.json();
console.log(data.data.workorder);
console.log(data.data.tasks);
console.log(data.data.deliverables);
```

---

## Response Schemas

### StubListResponse
```typescript
{
  success: boolean;
  data: {
    stubs: StubObject[];
    total: number;
    location: string;
  };
  timestamp: string;  // ISO 8601
}
```

### WorkorderListResponse
```typescript
{
  success: boolean;
  data: {
    workorders: WorkorderObject[];
    total: number;
    by_project: Record<string, number>;
    by_status: Record<string, number>;
  };
  timestamp: string;  // ISO 8601
}
```

### WorkorderDetailResponse
```typescript
{
  success: boolean;
  data: {
    workorder: WorkorderObject;
    tasks: Array<{ id: string; description: string; status: string }>;
    deliverables: Array<{ name: string; status: string }>;
    communication_log: Array<{ timestamp: string; message: string; author?: string }>;
  };
  timestamp: string;  // ISO 8601
}
```

### Error Response (All Endpoints)
```typescript
{
  success: false;
  error: {
    code: string;      // e.g., "CONFIG_MISSING", "WORKORDER_NOT_FOUND"
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;   // ISO 8601
}
```

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `CONFIG_MISSING` | 500 | projects.config.json not found or invalid |
| `CONFIG_INVALID` | 500 | projects.config.json has invalid structure |
| `PARSE_ERROR` | 500 | JSON file parse error (workorder file corrupted) |
| `WORKORDER_NOT_FOUND` | 404 | Workorder not found in any project |
| `FOLDER_NOT_FOUND` | 404 | Required folder not found |
| `PERMISSION_DENIED` | 403 | Permission denied when accessing file system |
| `INTERNAL_ERROR` | 500 | Unexpected internal error |

---

## Graceful Degradation

The API returns 200 OK (not errors) when optional files are missing:

```typescript
// Workorder with missing communication.json
{
  "success": true,
  "data": {
    "workorder": {
      "id": "coderef-feature-name",  // Defaults to folder name
      "status": "pending",           // Default status
      "files": {
        "communication_json": null,  // File was missing
        "plan_json": { ... },        // This file existed
        "deliverables_md": null      // File was missing
      },
      "created": "2025-12-26T08:00:00Z",  // Folder creation time
      "updated": "2025-12-26T08:00:00Z"   // Folder modification time
    }
  }
}
```

**Rationale:** Agents create workorder folders immediately. They add files as work progresses. Missing files shouldn't block discovery.

---

## Usage Examples

### Get all workorders with filtering
```typescript
async function getWorkordersByProject(projectId: string) {
  const response = await fetch('/api/workorders');
  const data: WorkorderListResponse = await response.json();

  return data.data.workorders.filter(
    wo => wo.project_id === projectId
  );
}
```

### Get workorder status summary
```typescript
async function getStatusSummary() {
  const response = await fetch('/api/workorders');
  const data: WorkorderListResponse = await response.json();

  return {
    total: data.data.total,
    byStatus: data.data.by_status,
    byProject: data.data.by_project,
  };
}
```

### Poll for workorder updates
```typescript
async function pollWorkorder(workorderId: string, interval = 5000) {
  setInterval(async () => {
    const response = await fetch(`/api/workorders/${workorderId}`);
    if (response.ok) {
      const data: WorkorderDetailResponse = await response.json();
      console.log(`Status: ${data.data.workorder.status}`);
      console.log(`Updated: ${data.data.workorder.last_status_update}`);
    }
  }, interval);
}
```

---

## Future Enhancements

1. **Caching** - Add Redis caching for large workorder lists
2. **WebSocket** - Real-time updates via `/ws/workorders`
3. **Filtering** - `?status=implementing&project=dashboard`
4. **Pagination** - `?page=1&limit=20`
5. **Sorting** - `?sort=created&order=desc`
6. **Full-Text Search** - Search across all workorder fields
7. **Database** - Migrate from file system to database

---

## Testing

All 21 test scenarios are documented in `__tests__/api/routes.test.ts`:
- 6 core functionality tests
- 7 graceful degradation tests
- 4 error handling tests
- 4 edge case tests

Run tests:
```bash
npm test
```

Manual testing with curl:
```bash
# Test stubs endpoint
curl http://localhost:3000/api/stubs | jq

# Test workorders endpoint
curl http://localhost:3000/api/workorders | jq

# Test specific workorder
curl http://localhost:3000/api/workorders/WO-TRACKING-SYSTEM-001 | jq
```

---

## Related Documentation

- **[AGENT-HANDOFF-TRACKING-SYSTEM.md](../../AGENT-HANDOFF-TRACKING-SYSTEM.md)** - Implementation handoff brief
- **[ORCHESTRATOR-ROADMAP.md](../../ORCHESTRATOR-ROADMAP.md)** - System architecture
- **[plan.json](../../coderef/workorder/coderef-tracking-api-mvp/plan.json)** - Implementation plan
- **[projects.config.json](../../projects.config.json)** - Project registry

---

**Version:** 1.0.0 MVP
**Last Updated:** 2025-12-26
**Status:** Ready for Frontend Integration

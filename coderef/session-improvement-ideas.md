# Session-Workorder Integration Ideas

**Date:** 2026-01-14
**Status:** Proposal
**Context:** Sessions Hub creates multi-agent execution sessions from stubs. These sessions eventually result in workorders for implementation tracking. We need a way to track workorders created from sessions.

---

## Current State Analysis

### Session System

**Location:** `/sessions` route with SessionsHub component

**Architecture:**
- **Session Creation** - 4-step wizard that creates multi-agent execution sessions from stubs
- **Session Monitoring** - Real-time tracking with 10-second SWR polling

**Data Model (communication.json):**
```json
{
  "workorder_id": "WO-CORE-DASHBOARD-INTEGRATION-001",  // ✅ Already exists
  "feature_name": "coderef-core-dashboard-integration",
  "created": "2026-01-04",
  "status": "in_progress",
  "description": "...",
  "orchestrator": { /* ... */ },
  "agents": [ /* ... */ ],
  "aggregation": { /* ... */ }
}
```

**Key Finding:** Sessions **already store** `workorder_id` in communication.json

**Storage Location:**
- `C:\Users\willh\.mcp-servers\coderef\sessions\{sessionId}/`
- Contains: `communication.json`, `instructions.json`, `context-backbone.md`, `agent-prompts/`

**UI Components:**
- `SessionsList.tsx` - Grid view with Active/Completed tabs
- `SessionDetail.tsx` - Detailed view with orchestrator panel and agent cards
- `AgentCard.tsx` - Individual agent status cards
- `OutputViewer.tsx` - Modal for agent output

---

### Workorder System

**Location:** `/api/workorders` route with WorkorderReader utility

**Architecture:**
- File-based scanning from `coderef/workorder/` folders across all tracked projects
- Uses unified storage (`~/.coderef-dashboard/projects.json`)

**Data Model (communication.json):**
```json
{
  "id": "WO-001",
  "project_id": "project-123",
  "project_name": "My Project",
  "feature_name": "auth-system",
  "status": "implementing",
  "path": "C:/projects/my-app/coderef/workorder/auth-system/",
  "files": {
    "communication": "communication.json",
    "plan": "plan.json",
    "deliverables": "DELIVERABLES.md"
  },
  "created": "2026-01-14",
  "updated": "2026-01-14"
}
```

**Key Finding:** Workorders do **NOT** have `session_id` field - no way to navigate back to originating session

**Storage Location:**
- Multiple projects: `{projectPath}/coderef/workorder/{feature-name}/`
- Files: `communication.json`, `plan.json`, `DELIVERABLES.md`

**UI Components:**
- `WorkorderCard.tsx` - Card using UnifiedCard
- Main dashboard - Shows workorder stats and grid

---

## Existing Connections

### Found Connections

1. **Session → Workorder** ✅ EXISTS
   - Sessions have `workorder_id` field in communication.json
   - Displayed in SessionsList and SessionDetail header
   - Example: `"workorder_id": "WO-CORE-DASHBOARD-INTEGRATION-001"`

2. **Workorder → Session** ❌ DOES NOT EXIST
   - No `session_id` field in workorder communication.json
   - No way to navigate from workorder back to session
   - No UI link from workorder to originating session

3. **Naming Pattern Connection:**
   - Both use `feature_name` as directory name
   - Could potentially match by feature_name (but unreliable - no uniqueness guarantee)

---

## Integration Ideas

### Idea 1: Bidirectional Reference Fields ⭐

**Description:** Add `session_id` to workorder communication.json and make existing `workorder_id` in sessions clickable

**Implementation:**
- **Workorder side:** Add `session_id?: string` and `created_from_session?: boolean` fields
- **Session side:** Make existing `workorder_id` field clickable (links to workorder detail)
- **API updates:**
  - `POST /api/sessions/create` - Accept optional `workorder_id` parameter
  - Update WorkorderReader to parse new fields

**Example Enhanced Workorder:**
```json
{
  "id": "WO-CORE-DASHBOARD-001",
  "session_id": "coderef-core-dashboard-integration",
  "created_from_session": true,
  // ... other fields
}
```

**Pros:**
- ✅ Simple data model change (add 2 fields)
- ✅ Minimal UI updates required
- ✅ Works with existing file-based storage
- ✅ Preserves data even if either system removed
- ✅ Low implementation complexity

**Cons:**
- ❌ Manual synchronization (no automatic updates)
- ❌ Risk of data inconsistency if files edited manually
- ❌ Requires updating both files when linking

**Implementation Complexity:** **LOW** (2-4 hours)

**Tasks:**
1. Add `session_id` and `created_from_session` to WorkorderObject type
2. Update WorkorderReader to parse these fields
3. Make workorder_id in SessionDetail clickable
4. Add validation for workorder_id format
5. Update type definitions

---

### Idea 2: "Create Workorder" Button in SessionDetail ⭐⭐

**Description:** Add prominent action button in SessionDetail when session is complete - opens modal to create workorder with pre-filled data

**User Flow:**
```
Session Complete → Click "Create Workorder"
→ Modal opens (select project, confirm workorder_id, set status)
→ Creates workorder folder in project
→ Generates communication.json with session_id reference
→ Copies plan.json from session orchestrator output
→ Generates DELIVERABLES.md from agent tasks
→ Links session_id ↔ workorder_id
→ Success: Shows link to new workorder
```

**Implementation:**
- **SessionDetail UI:** Add "Create Workorder" button in header (conditional: status='complete' && no workorder exists)
- **Modal Components:**
  - Project selector (from unified storage projects list)
  - Workorder ID input (auto-generated from feature_name, editable)
  - Initial status selector (default: 'implementing')
  - Confirmation button
- **API Endpoint:** `POST /api/workorders/from-session`
  - Accepts: `{ sessionId, projectId, workorderId, initialStatus }`
  - Creates workorder directory structure
  - Generates all files with session context
  - Returns: `{ workorderId, workorderPath, files: [] }`

**Generated Files:**

**communication.json:**
```json
{
  "id": "WO-CORE-DASHBOARD-001",
  "workorder_id": "WO-CORE-DASHBOARD-001",
  "feature_name": "coderef-core-dashboard-integration",
  "session_id": "coderef-core-dashboard-integration",
  "created_from_session": true,
  "status": "implementing",
  "created": "2026-01-14T10:00:00.000Z",
  "description": "Copied from session description"
}
```

**plan.json** (copied from session orchestrator output if exists)

**DELIVERABLES.md:**
```markdown
# Deliverables - {Feature Name}

**Workorder:** {workorder_id}
**Created from Session:** {session_id}
**Status:** Implementing

## Tasks

### Agent 1: {agent_role}
- [ ] Task 1 from agent instructions
- [ ] Task 2 from agent instructions

### Agent 2: {agent_role}
- [ ] Task 1 from agent instructions
- [ ] Task 2 from agent instructions

## Completion Criteria
- All agent tasks complete
- All deliverables validated
```

**Pros:**
- ✅ Clear UX workflow (guided process)
- ✅ Auto-generates complete workorder structure
- ✅ Preserves session context in workorder files
- ✅ Reduces manual work (no copy/paste)
- ✅ Ensures proper linking (session_id ↔ workorder_id)

**Cons:**
- ❌ Requires modal UI implementation
- ❌ Only supports one direction (session → workorder)
- ❌ Doesn't help if workorder created manually first
- ❌ Need to handle edge cases (workorder already exists)

**Implementation Complexity:** **MEDIUM** (6-8 hours)

**Tasks:**
1. Design and build WorkorderCreationModal component
2. Implement POST /api/workorders/from-session endpoint
3. Add file generation logic (communication.json, plan.json, DELIVERABLES.md)
4. Update SessionDetail with conditional button
5. Handle success/error states
6. Add navigation to newly created workorder

---

### Idea 3: "Related Sessions" Tab in Workorder Detail View

**Description:** Create full workorder detail page (`/workorders/[id]`) with tab navigation - one tab shows all sessions with matching workorder_id

**Implementation:**
- **New Route:** `app/workorders/[id]/page.tsx` - Full workorder detail view
- **Tab Layout:**
  - **Overview** - Workorder metadata, description, status
  - **Tasks** - Implementation checklist from plan.json
  - **Sessions** - All sessions with matching workorder_id
  - **Files** - Communication.json, plan.json, DELIVERABLES.md
- **Sessions Tab:**
  - Query: `GET /api/sessions?workorder_id={id}`
  - Displays SessionsList component filtered by workorder_id
  - Shows: session status, agent progress, created date
  - Click session → navigates to full SessionDetail view

**Pros:**
- ✅ Natural UX pattern (tabs for related data)
- ✅ No data structure changes needed (uses existing workorder_id)
- ✅ Read-only view (low risk of data corruption)
- ✅ Scalable (supports multiple sessions per workorder)

**Cons:**
- ❌ HIGH complexity - requires building entire workorder detail page
- ❌ One-way visibility (workorder → sessions only)
- ❌ Doesn't help with session → workorder navigation
- ❌ Significant scope increase

**Implementation Complexity:** **HIGH** (12-16 hours)

**Tasks:**
1. Build workorder detail page with full layout
2. Implement tab navigation component
3. Create API endpoint to filter sessions by workorder_id
4. Design sessions grid in workorder context
5. Add routing and navigation links
6. Build Overview, Tasks, and Files tabs
7. Handle loading/error states

---

### Idea 4: Inline Session Badge in WorkorderCard

**Description:** Display session status badge directly in WorkorderCard component if workorder was created from a session

**Implementation:**
- **WorkorderCard Enhancement:**
  - Check if `session_id` exists in workorder data
  - Query session API for current status
  - Display small badge: "From Session: {session_name}" with status color
  - Badge is clickable → navigates to `/sessions?feature={session_id}`
- **Data Flow:**
  - WorkorderList fetches workorders
  - For workorders with session_id, batch-query sessions API
  - Pass session data to WorkorderCard as optional prop
- **API:** `GET /api/sessions/bulk?feature_names[]=name1&feature_names[]=name2`

**Badge Design:**
```
┌─────────────────────────────────────┐
│ Workorder: WO-CORE-DASHBOARD-001   │
│ Status: Implementing                │
│                                     │
│ [🔗 From Session: coderef-core... ] │ ← Badge (green if complete)
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- ✅ Visible at-a-glance in dashboard view
- ✅ No extra clicks needed to see connection
- ✅ Lightweight UI change
- ✅ Works with existing card layout

**Cons:**
- ❌ Requires additional API call on every workorder list load (performance impact)
- ❌ Card can get visually crowded with extra badge
- ❌ Only works if session_id is added to workorder data first

**Implementation Complexity:** **MEDIUM** (5-7 hours)

**Tasks:**
1. Add session_id field to workorder schema
2. Implement bulk sessions query endpoint
3. Update WorkorderCard with conditional badge
4. Handle loading/error states for session data
5. Add click navigation to session
6. Optimize API calls (debounce, cache)

---

### Idea 5: Unified Timeline View

**Description:** Create new `/timeline` route showing chronological visualization of all sessions and workorders with visual connection lines

**Implementation:**
- **New Page:** Timeline component with D3.js or similar visualization library
- **Data Aggregation:**
  - Fetch all sessions: `GET /api/sessions`
  - Fetch all workorders: `GET /api/workorders`
  - Merge into single array sorted by created date
  - Build connection graph (session → workorder links)
- **Visual Design:**
  - Horizontal timeline (like GitHub commits)
  - Sessions shown as circles
  - Workorders shown as squares
  - Lines connecting session → workorder when IDs match
  - Color-coded by status (green=complete, blue=in-progress, gray=not-started)
- **Filters:**
  - Date range picker
  - Project filter
  - Status filter
  - Search by name

**Pros:**
- ✅ Holistic view of project evolution
- ✅ Visual representation of relationships
- ✅ Great for project management overview
- ✅ Supports filtering and searching across both systems

**Cons:**
- ❌ VERY HIGH implementation complexity
- ❌ Complex data aggregation and graph logic
- ❌ Doesn't improve navigation in existing views
- ❌ High maintenance burden as systems evolve
- ❌ Difficult to make mobile-responsive

**Implementation Complexity:** **VERY HIGH** (20-30 hours)

**Tasks:**
1. Design timeline component with visualization library
2. Implement data merging and sorting logic
3. Build connection line rendering algorithm
4. Add date range picker and filters
5. Optimize for large datasets (pagination, virtualization)
6. Create mobile responsive design
7. Handle edge cases (orphaned sessions/workorders)
8. Add tooltips and detail popovers
9. Implement zoom/pan functionality

---

## Recommended Approach

### Best Option: **Combination of Idea 1 + Idea 2** (Phased Implementation)

**Rationale:**
1. **Phase 1 (Idea 1)** establishes the data foundation with minimal changes
2. **Phase 2 (Idea 2)** provides the UX workflow for creating workorders from sessions
3. Together they provide complete bidirectional linking with guided workflow

**Why this combination?**
- ✅ Minimal data structure changes (add 2 fields to workorder schema)
- ✅ Natural workflow (complete session → create workorder)
- ✅ Low implementation complexity (10-12 hours total)
- ✅ Works with existing file-based architecture
- ✅ Preserves data integrity
- ✅ Extensible (can add Idea 3 or 4 later if needed)

---

## Implementation Roadmap

### Phase 1: Data Foundation (4 hours)

**Goal:** Establish bidirectional references between sessions and workorders

**Tasks:**
1. **Update Type Definitions**
   - Add `session_id?: string` to WorkorderObject interface
   - Add `created_from_session?: boolean` to WorkorderObject interface
   - Update WorkorderReader to parse these fields from communication.json

2. **Enhance Session Creation**
   - Update `POST /api/sessions/create` to accept optional `workorder_id` parameter
   - Include workorder_id in generated communication.json
   - Add validation for workorder_id format

3. **Add UI Links**
   - Make workorder_id in SessionDetail header clickable
   - Link format: `/workorders?id={workorder_id}` (when workorder detail page exists)
   - Add hover tooltip showing "View workorder details"

4. **Validation**
   - Add format validation for workorder_id (e.g., `WO-{name}-{number}`)
   - Ensure session_id matches feature_name convention

**Deliverables:**
- Updated type definitions in `@/types/workorders.ts`
- Enhanced WorkorderReader with session_id parsing
- Clickable workorder_id in SessionDetail UI
- Validation logic for ID formats

---

### Phase 2: Workorder Creation Workflow (6-8 hours)

**Goal:** Provide guided workflow for creating workorders from completed sessions

**Tasks:**

**1. UI Components (3-4 hours)**
- **WorkorderCreationModal.tsx:**
  - Project selector (dropdown from unified storage)
  - Workorder ID input (auto-generated, editable)
  - Initial status selector (radio buttons: pending_plan, implementing, blocked)
  - Description preview (from session)
  - Cancel/Create buttons

- **SessionDetail Enhancement:**
  - Add "Create Workorder" button in header
  - Conditional rendering: `status === 'complete' && !hasWorkorder`
  - Button styling: green with folder icon
  - Opens WorkorderCreationModal on click

**2. API Endpoint (2-3 hours)**
- **POST /api/workorders/from-session**
  - **Input:**
    ```typescript
    {
      sessionId: string;
      projectId: string;
      workorderId: string;
      initialStatus: WorkorderStatus;
    }
    ```
  - **Process:**
    1. Validate session exists and is complete
    2. Validate project exists in unified storage
    3. Check if workorder already exists (prevent duplicates)
    4. Create workorder directory: `{projectPath}/coderef/workorder/{feature}/`
    5. Generate communication.json with session_id reference
    6. Copy plan.json from session orchestrator output (if exists)
    7. Generate DELIVERABLES.md from agent tasks
    8. Return workorder metadata
  - **Output:**
    ```typescript
    {
      success: boolean;
      workorderId: string;
      workorderPath: string;
      files: string[];
    }
    ```

**3. File Generation Logic (1-2 hours)**
- **communication.json Generator:**
  - Copy fields from session: feature_name, description, created
  - Add: session_id, created_from_session: true
  - Set initial status
  - Add workorder_id

- **DELIVERABLES.md Generator:**
  - Parse agent tasks from session instructions.json
  - Group by agent role
  - Generate markdown checklist format
  - Include completion criteria

**4. Success/Error Handling (1 hour)**
- Success state: Show toast notification with link to workorder
- Error states:
  - Session not found → "Session not found"
  - Session not complete → "Cannot create workorder from incomplete session"
  - Workorder already exists → "Workorder already exists for this session"
  - Project not found → "Project not found"
  - File write error → "Failed to create workorder files"

**Deliverables:**
- WorkorderCreationModal component
- Enhanced SessionDetail with conditional button
- POST /api/workorders/from-session endpoint
- File generation utilities
- Error handling and user feedback

---

### Phase 3: Enhanced Navigation (2 hours - Optional)

**Goal:** Improve discoverability of session-workorder connections

**Tasks:**
1. **SessionsList Enhancement:**
   - Add small workorder badge if workorder_id exists
   - Format: "[WO-001]" in muted color
   - Clickable → navigate to workorder

2. **Future WorkorderCard Enhancement** (when workorder detail exists):
   - Add "View Session" button if created_from_session is true
   - Navigate to `/sessions?feature={session_id}`

3. **Status Synchronization Indicator:**
   - Show if session complete but workorder still in progress
   - Visual indicator: "Session complete, workorder in progress"

**Deliverables:**
- Badge component in SessionsList
- Navigation links in both directions
- Status mismatch indicators

---

## Implementation Complexity Summary

| Integration Idea | Complexity | Hours | Risk | Value | Priority |
|------------------|------------|-------|------|-------|----------|
| **Idea 1: Bidirectional References** | LOW | 2-4 | Low | Medium | **High** |
| **Idea 2: Workorder Creation Button** | MEDIUM | 6-8 | Medium | High | **High** |
| **Idea 3: Related Sessions Tab** | HIGH | 12-16 | Medium | Medium | Low |
| **Idea 4: Inline Session Badge** | MEDIUM | 5-7 | Low | Low | Low |
| **Idea 5: Unified Timeline** | VERY HIGH | 20-30 | High | Low | Very Low |
| **RECOMMENDED (Phases 1+2)** | **LOW-MEDIUM** | **10-12** | **Low** | **High** | **Highest** |

---

## Risk Assessment

### Data Consistency Risk: **LOW**
- File-based storage (no database sync issues)
- Each file is source of truth for its own data
- Manual linking reduces complexity
- Validation prevents bad references

### Performance Risk: **LOW**
- No additional queries in existing views
- Workorder creation is infrequent operation (doesn't impact main flow)
- Modal-based UI keeps main views fast
- SWR caching handles repeated reads

### UX Risk: **LOW**
- Natural workflow (session complete → create workorder)
- Clear action buttons with good affordance
- Modal provides confirmation step (prevents accidents)
- Error messages guide user to resolution

### Maintenance Risk: **LOW**
- Minimal new code (reuses existing patterns)
- File generation is well-defined (templates)
- No complex state synchronization
- Leverages existing WorkorderReader/SessionsReader utilities

---

## Key Technical Constraints

1. **File-Based Storage:**
   - No database joins or foreign keys
   - References are string-based (workorder_id, session_id)
   - Manual validation required

2. **Multiple Storage Locations:**
   - Sessions: `C:\Users\willh\.mcp-servers\coderef\sessions\`
   - Workorders: `{projectPath}/coderef/workorder/`
   - Must handle path resolution carefully

3. **Multi-Project Workorders:**
   - Workorders can be in different projects
   - Need project selector in creation flow
   - Project must exist in unified storage

4. **No Real-Time Sync:**
   - Changes to files don't automatically propagate
   - SWR polling every 10 seconds
   - Manual refresh available

---

## Success Criteria

### Phase 1 Success Metrics:
- ✅ Workorder objects include session_id and created_from_session fields
- ✅ Sessions can include optional workorder_id during creation
- ✅ Workorder_id in SessionDetail is clickable (when workorder detail exists)
- ✅ No breaking changes to existing functionality

### Phase 2 Success Metrics:
- ✅ "Create Workorder" button appears in SessionDetail when appropriate
- ✅ Modal opens with correct pre-filled data
- ✅ Workorder creation succeeds with all files generated
- ✅ Generated files include correct references (session_id ↔ workorder_id)
- ✅ User receives clear feedback on success/error
- ✅ Navigation to newly created workorder works

### Overall Success:
- ✅ Users can easily create workorders from completed sessions
- ✅ Bidirectional navigation between sessions and workorders
- ✅ No data loss or corruption
- ✅ Implementation completed within 12 hours
- ✅ Code is maintainable and follows existing patterns

---

## Future Enhancements (Beyond Initial Implementation)

1. **Batch Operations:**
   - Create workorders for multiple sessions at once
   - Useful when completing many sessions simultaneously

2. **Workorder Detail Page:**
   - Full workorder detail view (`/workorders/[id]`)
   - Implement Idea 3 (Related Sessions tab)
   - Show plan.json tasks as interactive checklist

3. **Status Synchronization:**
   - Auto-update session status when workorder completes
   - Notifications when linked items change status

4. **Template System:**
   - Customizable workorder templates
   - Different DELIVERABLES.md formats per project
   - Project-specific workorder ID formats

5. **Audit Trail:**
   - Log when workorders are created from sessions
   - Track who created the link
   - Show creation history in UI

---

## Conclusion

The recommended **phased approach (Ideas 1 + 2)** provides the best balance of:
- **Value:** Complete bidirectional linking with guided workflow
- **Complexity:** Low-medium (10-12 hours total)
- **Risk:** Low (minimal breaking changes, well-tested patterns)
- **Extensibility:** Easy to add more features later (Ideas 3, 4, 5)

**Next Steps:**
1. Review and approve this proposal
2. Clarify any implementation details
3. Begin Phase 1 (Data Foundation) - 4 hours
4. Test and validate Phase 1
5. Begin Phase 2 (Workorder Creation) - 6-8 hours
6. Test end-to-end workflow
7. Document new features in resource sheets

---

**Author:** CodeRef Assistant
**Date:** 2026-01-14
**Status:** Proposal for Review

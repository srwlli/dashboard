# Dashboard Setup: Complete Overview

**Project:** coderef-dashboard
**Status:** Phase 1 API in progress, Phase 2 UI ready to plan
**Last Updated:** 2025-12-26

---

## Quick Navigation

| Document | Purpose | For Whom |
|----------|---------|----------|
| **ASSISTANT_UI_MOCKUP.md** | Terminal mockup showing target design | UI designers, all team members |
| **IMPLEMENTATION_SUMMARY.md** | Complete overview of phases, components, timeline | Technical leads, product managers |
| **PHASE_2_COMPONENT_CHECKLIST.md** | Step-by-step checklist for building UI | Frontend developers (after Phase 1) |
| **HANDOFF-DASHBOARD-TRACKING-API.md** | API implementation handoff brief | Backend/API developers |
| **ORCHESTRATOR-ROADMAP.md** | System architecture and critical path | Architects, project leads |
| **projects.config.json** | Registry of 6 tracked projects | API routes, all developers |

---

## Current Status

### ✅ Complete
- Architectural design (all phases)
- Project registry with 6 tracked projects
- API specifications (3 endpoints)
- UI mockup (layout, data flow, components)
- Component reuse strategy (identified 6 existing, 6 new needed)
- TypeScript types defined
- Error handling strategy documented
- Testing scenarios (21 defined)

### 🔄 In Progress
- **Phase 1: API Implementation**
  - Dashboard Agent implementing 3 endpoints
  - Creating utility classes
  - Writing tests
  - **Expected completion:** This week

### ⏳ Blocked (Waiting for Phase 1)
- **Phase 2: UI Components**
  - Can't start until API endpoints exist
  - Will begin immediately after Phase 1 ready
  - Estimated 1 week once started

---

## Project Registry (projects.config.json)

**6 Projects Being Tracked:**

1. **mcp-coderef-context** - Context analysis MCP server
2. **mcp-coderef-workflow** - Workflow/planning MCP server
3. **mcp-coderef-docs** - Documentation MCP server
4. **mcp-coderef-personas** - Persona management MCP server
5. **mcp-servers** - MCP servers root/umbrella
6. **coderef-dashboard** - This project (dashboard + routes)

**Centralized Stubs Directory:**
```
C:\Users\willh\Desktop\assistant\coderef\working\
```

**Per-Project Workorders:**
```
{project_path}/coderef/workorder/
```

---

## API Design (Phase 1)

### Three Endpoints

```
GET /api/stubs
  └─ Returns: All stubs from assistant/coderef/working/
  └─ Response: { success, data: { stubs, total, location }, timestamp }

GET /api/workorders
  └─ Returns: All workorders from all 6 tracked projects
  └─ Response: { success, data: { workorders, total, by_project, by_status }, timestamp }

GET /api/workorders/:workorderId
  └─ Returns: Complete workorder with all files
  └─ Response: { success, data: { workorder, tasks, deliverables, communication_log }, timestamp }
```

### Key Design Principles

- **Folder-based discovery:** Folder existence = workorder exists (files optional)
- **Graceful degradation:** Missing files don't break system (partial data OK)
- **Distributed agents:** Each agent creates workorders autonomously
- **File system MVP:** Scans folders, future migration to database

---

## UI Design (Phase 2)

### Target Routes

- **`/assistant`** - Workorder & stub tracking dashboard
- **`/sources`** (future) - Knowledge base

### Main Components

**Tabs:**
- 📋 Workorders tab (list of active workorders)
- 🔧 Stubs tab (list of pending stubs)
- 📚 Documentation tab (viewer for docs)

**Features:**
- Filter by status, project, priority
- Pagination with "load more"
- Real-time data from API
- Industrial theme styling
- Responsive layout

---

## Component Map

### Existing (Reuse)
```
✅ PageLayout        → Main page wrapper
✅ Sidebar           → Left navigation
✅ NavItem           → Sidebar item
✅ Header            → Top breadcrumb bar
✅ ComingSoon        → Placeholder (will be replaced)
✅ UserAvatar        → Profile icon
✅ ThemeToggle       → Theme switcher
```

### New to Create (Phase 2)
```
🆕 TabNavigation     → Switch tabs
🆕 WorkorderCard     → Single workorder display
🆕 StubCard          → Single stub display
🆕 FilterBar         → Filter controls
🆕 WorkorderList     → List of workorders
🆕 StubList          → List of stubs
```

### Custom Hooks (Phase 2)
```
🆕 useWorkorders()        → Fetch/cache workorders
🆕 useStubs()              → Fetch/cache stubs
🆕 useWorkorderDetail()    → Fetch single workorder
```

---

## Timeline & Dependencies

```
PHASE 1 (API) ─────────┐
  Week 1               │
  - Implement routes   │
  - Create utilities   │
  - Write tests        │
  - Deploy             │
                       │
                    ┌──┴────────────────────┐
                    │ Phase 1 Complete      │
                    │ APIs ready to consume │
                    └──────────────────────┘
                                │
        ┌───────────────────────┘
        │
PHASE 2 (UI) ────────────────┐
  Week 2-3                    │
  - Create components         │
  - Create hooks              │
  - Wire up page              │
  - Test with real API        │
  - Deploy                    │
                              │
                   ┌──────────┴──────────┐
                   │ Phase 2 Complete    │
                   │ Dashboard functional│
                   └────────────────────┘
```

---

## File Structure Created

### Documentation Files
```
C:\Users\willh\Desktop\coderef-dashboard\
├── ASSISTANT_UI_MOCKUP.md               [UI Layout mockup]
├── IMPLEMENTATION_SUMMARY.md            [Complete overview]
├── PHASE_2_COMPONENT_CHECKLIST.md       [Build checklist]
└── README_DASHBOARD_SETUP.md            [This file]

C:\Users\willh\Desktop\assistant\
├── HANDOFF-DASHBOARD-TRACKING-API.md    [API handoff brief]
├── ORCHESTRATOR-ROADMAP.md              [System architecture]
└── projects.config.json                 [Project registry]
```

### To Be Created (Phase 1)
```
packages/dashboard/src/

app/api/
├── stubs/
│   └── route.ts                         [GET /api/stubs]
└── workorders/
    ├── route.ts                         [GET /api/workorders]
    └── [workorderId]/
        └── route.ts                     [GET /api/workorders/:id]

lib/api/
├── stubs.ts                             [StubReader utility]
├── workorders.ts                        [WorkorderReader utility]
└── projects.ts                          [ProjectsConfig loader]

types/
├── stubs.ts                             [Stub type definitions]
├── workorders.ts                        [Workorder type definitions]
└── api.ts                               [Response schemas]
```

### To Be Created (Phase 2)
```
packages/dashboard/src/

components/
├── TabNavigation/index.tsx
├── WorkorderCard/index.tsx
├── StubCard/index.tsx
├── FilterBar/index.tsx
├── WorkorderList/index.tsx
└── StubList/index.tsx

hooks/
├── useWorkorders.ts
├── useStubs.ts
└── useWorkorderDetail.ts
```

---

## Success Criteria

### Phase 1 (API)
- ✅ All 3 endpoints deployed and tested
- ✅ Responses match defined schemas
- ✅ Graceful degradation works
- ✅ Error handling comprehensive
- ✅ 21 test scenarios pass

### Phase 2 (UI)
- ✅ All 6 components built
- ✅ All 3 hooks working
- ✅ AssistantPage displays live data
- ✅ Filters functional
- ✅ Loading/error states handled
- ✅ Responsive design

### End State
- ✅ Dashboard fully operational
- ✅ Workorders visible in real-time
- ✅ Team can track progress
- ✅ API ready for future upgrades (WebSocket, caching, etc.)

---

## Key Decisions Made

### Architecture
✅ **File system MVP** - Scans folders, scalable to database later
✅ **Folder-based discovery** - More flexible than file-based
✅ **Distributed agents** - Each agent creates workorders autonomously
✅ **Graceful degradation** - Missing files don't break system

### UI/UX
✅ **Reuse existing components** - Minimize new code
✅ **Tab navigation** - Clean separation of concerns
✅ **Filter controls** - Easy filtering by status/project
✅ **Industrial theme** - Consistent with existing design

### Development
✅ **Phase separation** - API independent of UI
✅ **Parallel work** - Other teams can start features while API builds
✅ **Minimal new components** - 6 existing + 6 new only
✅ **Custom hooks** - React best practices for data fetching

---

## Known Unknowns

### To Clarify
1. **Route naming:** `/assistant` vs `/coderef-assistant`?
2. **Scout route:** `/coderef-scout` implementation needed?
3. **Pagination:** Upfront or infinite scroll?
4. **Detail view:** Modal or separate page for workorder details?
5. **Real-time:** Need WebSocket updates or polling OK?

### Future Enhancements (Out of Scope)
- WebSocket real-time updates
- Workorder status updates via API (POST endpoint)
- Database migration from file system
- Advanced filtering and search
- Export/reporting features
- Workorder creation from dashboard

---

## Getting Started

### For API Implementation Team (Phase 1)
1. Read `HANDOFF-DASHBOARD-TRACKING-API.md`
2. Review `projects.config.json` (already created)
3. Follow 6-step implementation path
4. Run 21 test scenarios
5. Deploy when ready

### For UI Implementation Team (Phase 2 - After Phase 1)
1. Read `ASSISTANT_UI_MOCKUP.md` for design reference
2. Review `IMPLEMENTATION_SUMMARY.md` for component overview
3. Use `PHASE_2_COMPONENT_CHECKLIST.md` as daily checklist
4. Build components in recommended order
5. Wire up AssistantPage
6. Test with real API data

### For Project Managers
1. Review `IMPLEMENTATION_SUMMARY.md` timeline section
2. Use this README for stakeholder updates
3. Track Phase 1 completion date
4. Plan Phase 2 kick-off

---

## Quick Reference: What's Where

| Need | File | Section |
|------|------|---------|
| **Design mockup** | ASSISTANT_UI_MOCKUP.md | Top of file |
| **API specs** | HANDOFF-DASHBOARD-TRACKING-API.md | Steps 1-6 |
| **Component list** | IMPLEMENTATION_SUMMARY.md | "Component Inventory" |
| **Building checklist** | PHASE_2_COMPONENT_CHECKLIST.md | "Components to Build" |
| **Architecture** | ORCHESTRATOR-ROADMAP.md | "System Architecture" |
| **Projects** | projects.config.json | "projects" array |
| **Response schemas** | HANDOFF-DASHBOARD-TRACKING-API.md | "Step 2: Implement API Routes" |

---

## Support & Questions

### For API Questions
→ Review `HANDOFF-DASHBOARD-TRACKING-API.md` sections 1-6

### For Component Questions
→ Review `PHASE_2_COMPONENT_CHECKLIST.md`

### For Architecture Questions
→ Review `ORCHESTRATOR-ROADMAP.md` and `IMPLEMENTATION_SUMMARY.md`

### For Design Questions
→ Review `ASSISTANT_UI_MOCKUP.md`

---

## Document Maintenance

**All documents created:** 2025-12-26
**Status:** All specifications complete and ready for implementation
**Next review:** After Phase 1 API completion

---

**Dashboard Setup Complete**
**Ready to begin Phase 1: API Implementation**

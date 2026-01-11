# Sessions Hub Integration Ideas

**Status:** 💭 Exploratory - Nothing set in stone
**Date:** 2026-01-10
**Context:** Brainstorming integration between assistant route, sessions hub, and workorder tracking

---

## 🎯 Core Idea: Stub → Session → Workorder Flow

### The Natural Progression
```
Assistant Route (Entry Point)
  ↓
View Stubs → Select Stub → "Start Session" button
  ↓
Sessions Hub (Coordination Layer)
  ↓
Phase 1 (Inventory) → Phase 2 (Gap Analysis) → Phase 3 (Implementation)
  ↓
Agents Create Workorders
  ↓
Workorders Execute → Track Progress → Complete
```

### Why This Could Work

**1. Natural Workflow Progression:**
- **Idea** (stub) → **Planning** (session) → **Execution** (workorder)
- UI becomes the orchestration interface
- Users visualize the entire lifecycle

**2. Leverages Existing Work:**
- Assistant route already has stub tracking (`/assistant`)
- Stub data structure already exists
- Just needs a "promote to session" action

**3. Multiple Entry Points (Good Design):**
- ✅ **UI-driven:** Assistant route → "Start Session" button
- ✅ **CLI-driven:** `/create-session` command (current workflow)
- ✅ **Agent-driven:** Agents create sessions programmatically
- **Not exclusive** - all paths remain valid

**4. Sessions Hub as Central Coordination:**
- Stubs live in assistant route (idea capture)
- Sessions live in sessions hub (multi-agent coordination)
- Workorders live in project directories (execution)
- Dashboard connects them all

---

## 🛠️ Potential Technical Implementation

### Stub → Session Promotion Workflow

**Trigger:** User clicks "Start Session" on a stub in assistant route

**Process:**
```typescript
promoteStubToSession(featureName) {
  1. Read stub.json from assistant/coderef/working/{feature-name}/
  2. Parse stub metadata (agents_involved, scope, phases)
  3. Create session directory: .coderef/sessions/{feature-name}-phase1/
  4. Auto-generate communication.json:
     - Orchestrator: assistant
     - Agents: from stub.agents_involved array
     - Output files: standard pattern
  5. Auto-generate instructions.json:
     - Phase 1 tasks for each agent
     - Based on stub.scope
  6. Navigate to /session/{feature-name}
  7. Display one-liner instructions for agents
}
```

**Data Flow:**
```
stub.json (assistant/coderef/working/)
  ↓ [promote via UI]
communication.json + instructions.json (.coderef/sessions/)
  ↓ [agents execute Phase 1]
agent outputs (inventory.json)
  ↓ [orchestrator aggregates]
Phase 2 session created
  ↓ [agents execute Phase 2]
workorder specifications
  ↓ [agents create workorders]
plan.json + workorder files (agent coderef/workorder/)
  ↓ [track in Sessions Hub]
Progress visualization
```

### API/Server Action Needed

```typescript
// Server action or API route
async function createSessionFromStub(stubPath: string) {
  const stub = readStubJson(stubPath);

  const communicationJson = {
    workorder_id: generateWorkorderId(stub.feature_name),
    feature_name: `${stub.feature_name}-phase1`,
    created: new Date().toISOString(),
    status: "not_started",
    description: stub.description,
    orchestrator: {
      agent_id: "assistant-orchestrator",
      role: "Coordinate Phase 1, aggregate findings",
      status: "not_started"
    },
    agents: stub.agents_involved.map(agentId => ({
      agent_id: agentId,
      agent_path: resolveAgentPath(agentId),
      output_file: generateOutputPath(agentId),
      status: "not_started"
    }))
  };

  const instructionsJson = generatePhase1Instructions(stub);

  writeSessionFiles(communicationJson, instructionsJson);
  return { sessionId: stub.feature_name };
}
```

---

## 🎨 UI Flow Examples

### On `/assistant` Route

**Current:**
```
Stubs
├── plan-json-creation-stall-fix
├── coderef-ecosystem-docs-uds-compliance
└── coderef-ecosystem-naming-standardization
```

**Proposed Enhancement:**
```
Stubs
├── plan-json-creation-stall-fix
│   └── [Start Session] button
│   └── Status: stub
├── coderef-ecosystem-docs-uds-compliance
│   └── [Start Session] button
│   └── Agents: 7 (coderef-workflow, coderef-docs, ...)
│   └── Status: stub
└── coderef-ecosystem-naming-standardization
    └── [Start Session] button
    └── ⚠️ Breaking changes
    └── Status: stub
```

### After Clicking "Start Session"

**Navigate to `/session/{feature-name}`:**
```
Session: coderef-ecosystem-docs-uds-compliance
Status: Phase 1 - Not Started

Phase 1 Created ✅
- communication.json generated
- instructions.json generated
- 7 agents assigned

One-Liner Instructions (Ready to Paste):
┌─────────────────────────────────────────────────┐
│ ## SESSION: WO-DOCS-UDS-001 - Phase 1 Inventory│
│                                                  │
│ **Location:** `.coderef/sessions/...`          │
│ **Your Task:** Audit your documentation files  │
│ ...                                             │
│                                                  │
│ [Copy to Clipboard] button                      │
└─────────────────────────────────────────────────┘

Agents (0/7 complete):
- coderef-workflow: Not started
- coderef-docs: Not started
- ... (all listed)

[View communication.json] [View instructions.json]
```

---

## 📋 Integration Points to Research

**For coderef-dashboard Phase 1 audit:**

1. **Assistant Route Discovery:**
   - How is `/assistant` currently implemented?
   - What components render stubs?
   - Is there a stub list API/query?

2. **Session Creation Workflow:**
   - Where should `createSessionFromStub` logic live?
   - Server action vs API route?
   - Filesystem operations on server or client?

3. **Navigation Pattern:**
   - Next.js app router navigation
   - Pass session context via URL params or state?
   - Should `/session` be dynamic route `/session/[id]`?

4. **One-Liner Display:**
   - Generate one-liner on session creation?
   - Store in communication.json or generate on-demand?
   - Copy-to-clipboard UX pattern?

5. **Status Tracking:**
   - How to detect when agents update communication.json?
   - Filesystem watcher vs polling vs manual refresh?
   - Real-time updates needed?

---

## 🤔 Open Questions

1. **Stub → Session Mapping:**
   - Should stub.json include agent assignments explicitly?
   - Or infer agents from stub.scope?
   - How to handle ambiguous cases?

2. **Phase Management:**
   - Auto-create Phase 1 only, or all phases upfront?
   - When to create Phase 2? After Phase 1 complete?
   - Should orchestrator trigger Phase 2 creation automatically?

3. **Multi-Session Support:**
   - Can one stub spawn multiple sessions (Phase 1, 2, 3)?
   - How to link phases in UI?
   - Timeline view showing phase progression?

4. **Rollback/Cleanup:**
   - If session fails, clean up files?
   - Allow "archive session" action?
   - Keep session history for learning?

5. **Alternative Entry Points:**
   - Should `/session` also allow ad-hoc session creation (without stub)?
   - Import existing sessions from filesystem?
   - Discover orphaned sessions?

---

## 🚧 Implementation Phases (If We Build This)

**Phase 1: Foundation (Current)**
- Audit existing `/assistant` route
- Audit existing `/session` route
- Document current architecture
- Identify integration gaps

**Phase 2: Prototype (Future)**
- Add "Start Session" button to stub card (UI only)
- Implement `createSessionFromStub` server action
- Test stub → communication.json generation
- Manual navigation to `/session/{id}`

**Phase 3: Integration (Future)**
- Auto-navigation after session creation
- One-liner generation + display
- Copy-to-clipboard functionality
- Basic agent status display

**Phase 4: Polish (Future)**
- Real-time status updates
- Phase 2/3 auto-creation
- Timeline visualization
- Error handling + rollback

---

## 💡 Alternative Approaches

**Option A: CLI-First (Current)**
- Keep `/create-session` command as primary
- Dashboard is read-only visualization
- Simpler, less integration complexity

**Option B: UI-First (Proposed)**
- Dashboard drives session creation
- CLI as fallback for power users
- More user-friendly, higher complexity

**Option C: Hybrid (Recommended?)**
- Both CLI and UI can create sessions
- UI leverages same logic as CLI
- Best of both worlds, moderate complexity

---

## 📌 Next Steps (Not Committed)

1. Complete Phase 1 audit (coderef-dashboard agent)
2. Review ideas.md with user
3. Decide: MVP scope for Sessions Hub
4. Prioritize: UI integration vs read-only dashboard
5. Prototype: Start with simplest useful feature

---

**Remember:** This is exploratory thinking. Nothing here is set in stone. The goal is to capture ideas for future reference, not commit to implementation.

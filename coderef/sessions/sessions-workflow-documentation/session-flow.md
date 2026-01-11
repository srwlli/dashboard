# Multi-Agent Session Workflow Pattern

**Pattern Used:** Papertrail UDS Alignment (Phase 1 → Phase 2 → Phase 3)
**Outcome:** 30 gaps identified, 60.5 hours estimated, 3 workorders created, 12% → 100% validation coverage

---

## Replicable Session Flow

### Phase 1: Inventory

1. **Create Phase 1 session directory** (in .mcp-servers/coderef/sessions/{session-name}/)
   - Example: `papertrail-uds-alignment/`

2. **Create communication.json** with agent roster:
   - Define orchestrator role (aggregate and synthesize)
   - Define agent roles (each agent inventories THEIR OWN outputs)
   - Include output file paths for each agent

3. **Create instructions.json** with self-audit tasks:
   - Orchestrator: "Wait for agents, then aggregate"
   - Agent 1: "Inventory YOUR tools and outputs"
   - Agent 2: "Inventory YOUR tools and outputs"
   - Agent N: "Inventory YOUR tools and outputs"

4. **Generate one-liner instruction for agents:**
   - Create concise, paste-ready instruction for each agent
   - Include: session location, task summary, instructions.json reference, output files
   - Format template:
   ```
   ## SESSION: {WORKORDER-ID} - Phase 1 {Task Name}

   **Location:** `{session-directory-path}`

   **Your Task:** {One-sentence task description}

   **Instructions:**
   1. Read `instructions.json` in session directory for detailed tasks
   2. {Key step 1}
   3. {Key step 2}
   4. Create `{output-filename}` with findings
   5. Update `communication.json` status to complete when done

   **Reference:** {Links to relevant documents or examples}

   **Output:** {Expected deliverable description}
   ```

5. **User pastes one-liner into each agent chat** (in their project directories)

6. **Agents complete inventory** and save output files (JSON format recommended)

7. **Orchestrator aggregates results:**
   - Read all agent output files
   - Create master inventory report (markdown)
   - Calculate totals, identify patterns
   - Update communication.json status to "complete"

### Phase 2: Gap Analysis

8. **Create Phase 2 session directory** (parallel to Phase 1)
   - Example: `papertrail-uds-alignment-phase2/`

9. **Create communication.json** referencing Phase 1:
   - Same agent roster
   - Add `phase_1_reference` field pointing to orchestrator's Phase 1 report

10. **Create instructions.json** with gap analysis tasks:
    - Orchestrator: "Wait for agents, then create master alignment plan"
    - Agent 1: "Analyze YOUR gaps, estimate effort, prioritize P0/P1/P2/P3"
    - Agent 2: "Analyze YOUR gaps, estimate effort, prioritize P0/P1/P2/P3"
    - Agent N: "Analyze YOUR gaps, estimate effort, prioritize P0/P1/P2/P3"

10b. **Generate one-liner instruction for agents:**
    - Use same template as Phase 1 (step 4)
    - Update task description to reflect gap analysis focus
    - Reference Phase 1 outputs as context

11. **User pastes one-liner into each agent chat**

12. **Agents complete gap analysis:**
    - Identify integration gaps
    - Estimate effort in hours
    - Prioritize by P0 (critical) / P1 (high) / P2 (medium) / P3 (low)
    - Document blockers and dependencies
    - Save gap analysis reports (JSON format)

13. **Orchestrator creates master alignment plan:**
    - Read all agent gap analysis reports
    - Aggregate totals (gaps, effort, timeline)
    - Create phased rollout strategy (Week 1: P0, Week 2: P1, etc.)
    - Generate workorder specifications (one per agent)
    - Calculate validation coverage projections (current → target)
    - Save alignment plan (markdown with embedded workorder specs)
    - Update communication.json status to "complete"

### Phase 3: Implementation

14. **Agents read orchestrator's alignment plan**

15. **Generate one-liner instruction for agents:**
    - Use same template format
    - Include workorder spec from alignment plan
    - Specify execution commands (/create-workorder, /execute-plan)

16. **User pastes instruction into each agent chat**

17. **Agents run /create-workorder** (or equivalent) to create their OWN workorders:
    - Use workorder spec from alignment plan
    - Create workorder in their project's coderef/workorder/ folder
    - Agents OWN their workorders (not orchestrator)

18. **Agents run /execute-plan** to implement:
    - Execute P0 tasks first
    - Update status after each phase
    - Validate outputs as they complete
    - Run /update-deliverables to record metrics

19. **Track progress to target:**
    - Monitor validation coverage increase
    - Verify all P0/P1 gaps closed
    - Achieve 100% validation coverage (or stated target)

---

## Key Patterns

### Session Structure
- **Multi-phase:** Inventory → Analysis → Implementation
- **Agent autonomy:** Each agent inventories/analyzes THEIR OWN codebase
- **Orchestrator role:** Aggregate, synthesize, create master plan

### Communication Pattern
- **communication.json:** Agent roster + status tracking
- **instructions.json:** Task definitions for orchestrator + agents
- **One-liner:** Simple coordination command for agents

### Prioritization System
- **P0:** Critical gaps (must fix immediately)
- **P1:** High-priority gaps (next phase)
- **P2:** Medium-priority gaps (can defer)
- **P3:** Low-priority gaps (optional)

### Validation Coverage Tracking
- **Baseline:** Calculate current validation rate (validated / total outputs)
- **Target:** Define goal (e.g., 100% validation coverage)
- **Projections:** Show coverage increase after each phase (P0 → P1 → P2 → P3)

### Workorder Delegation
- **Agents create their own workorders** (not orchestrator)
- **Workorder specs in alignment plan** provide requirements
- **Agents use /create-workorder** to formalize

---

## Example Application: Papertrail UDS Alignment

**Goal:** Align coderef-docs and coderef-workflow with Papertrail UDS standards

**Phase 1 Results:**
- 37 tools inventoried across 3 agents
- 50 outputs identified
- 12% validation rate (6/50 outputs validated)

**Phase 2 Results:**
- 30 gaps identified (6 P0, 10 P1, 10 P2, 4 P3)
- 60.5 hours total effort estimated
- 3 workorder specifications created
- 3-4 week timeline with phased rollout

**Phase 3 Target:**
- 100% validation coverage (50/50 outputs)
- Week 1: P0 (12% → 36%)
- Week 2: P1 (36% → 58%)
- Week 3: P2 (58% → 74%)
- Week 4: P3 (74% → 100%)

---

## Integration with /session Route

This workflow pattern can be visualized in the coderef-dashboard /session route as a **Sessions Hub** where:

1. Users see all active sessions
2. Agents coordinate via communication.json
3. Progress tracked in real-time
4. Outputs displayed inline
5. Metrics dashboard shows validation coverage trends

**Next:** Implement Sessions Hub UI to support this workflow pattern.

# CODEREF_ECOSYSTEM_REVIEW Workflow Guide

**Pattern:** Multi-agent coordination via common folder
**Output:** JSON responses from each agent
**Coordination:** No communication.json needed - agents save independently

---

## Workflow Overview

```
User creates review
  ↓
Dashboard exports prompt with review title
  ↓
User copies prompt to each agent
  ↓
Each agent analyzes and saves JSON to common folder
  ↓
Orchestrator aggregates all responses
  ↓
Dashboard displays consolidated results
```

---

## Step-by-Step Process

### Step 1: User Creates Review (Dashboard)

**Location:** `/prompts` page with CODEREF_ECOSYSTEM_REVIEW prompt selected

**User Actions:**
1. Enter review title (e.g., "Q1-2026-Documentation-Review")
2. Select improvement tags (e.g., Documentation, Workflows, Integration)
3. Attach files from CodeRef Explorer
4. Click "Export as JSON"

**Dashboard Generates:**
```json
{
  "session_id": "abc123",
  "review_title": "Q1-2026-Documentation-Review",
  "generated_at": "2026-01-01T14:00:00Z",
  "prompt": {
    "text": "[Full prompt text with {{REVIEW_TITLE}} and {{TAG_SECTION}} interpolated]",
    "selected_tags": ["documentation", "workflows", "integration"],
    "attachments": [...]
  },
  "metadata": {
    "save_location": "coderef/reviews/Q1-2026-Documentation-Review/responses/",
    "agent_instruction": "Save your response as {agent-id}.json in the location above"
  }
}
```

---

### Step 2: User Distributes to Agents

**Method:** Copy/paste prompt to each agent's chat

**Target Agents:**
- coderef-context (analyzes code analysis tools)
- coderef-docs (analyzes documentation generation)
- coderef-workflow (analyzes workflow orchestration)
- coderef-personas (analyzes persona system)
- Any project-specific agents

**Prompt includes:**
- Review title
- Selected tags
- Attached files
- Save location instructions
- JSON schema

---

### Step 3: Each Agent Analyzes Independently

**Agent receives:**
- Prompt with review title: "Q1-2026-Documentation-Review"
- Selected tags: ["documentation", "workflows", "integration"]
- Attached files (via JSON export)

**Agent performs:**
1. Read attached files
2. Analyze based on selected tags only
3. Fill JSON schema with structured analysis
4. Save to: `coderef/reviews/Q1-2026-Documentation-Review/responses/{agent-id}.json`

**Example saves:**
- `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-context.json`
- `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-docs.json`
- `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-workflow.json`

**Key Point:** Each agent saves independently - no coordination needed!

---

### Step 4: Orchestrator Aggregates (Optional)

**Location:** Orchestrator CLI or dashboard aggregation tool

**Aggregation Steps:**
1. Read all JSON files from `coderef/reviews/{review-title}/responses/`
2. Combine agent_metadata from all responses
3. Merge ecosystem_analysis by tag category
4. Generate summary report

**Aggregated Output:**
```json
{
  "review_metadata": {
    "review_title": "Q1-2026-Documentation-Review",
    "created_at": "2026-01-01T14:00:00Z",
    "agent_count": 3,
    "agents": ["coderef-context", "coderef-docs", "coderef-workflow"]
  },
  "consolidated_analysis": {
    "documentation": {
      "agents_reviewed": 3,
      "common_strengths": ["Clear structure", "Comprehensive coverage"],
      "common_weaknesses": ["No staleness detection", "Manual updates"],
      "top_suggestions": [
        "ADD: Timestamp metadata (mentioned by 3/3 agents)",
        "REFACTOR: Split large CLAUDE.md (mentioned by 2/3 agents)"
      ]
    }
  }
}
```

---

### Step 5: Dashboard Displays Results

**Location:** `/reviews/{review-title}` route (future feature)

**Display:**
- Review metadata (title, date, tags, agents)
- Tabbed view by tag category
- Agent responses side-by-side
- Common themes highlighted
- Download aggregated report

---

## File Structure

```
coderef/
└── reviews/
    └── Q1-2026-Documentation-Review/
        ├── prompt.json              # Original exported prompt
        └── responses/
            ├── coderef-context.json
            ├── coderef-docs.json
            ├── coderef-workflow.json
            └── coderef-personas.json
```

**No communication.json needed** - agents save independently without coordination!

---

## Advantages of This Pattern

### 1. **Simple for Agents**
- Agent just saves one JSON file
- No need to update communication.json
- No status tracking
- No polling

### 2. **Parallel Execution**
- All agents work simultaneously
- No blocking or dependencies
- Faster completion

### 3. **Easy Aggregation**
- Orchestrator reads all files in folder
- Simple JSON merge logic
- No complex state management

### 4. **Flexible**
- Add more agents anytime
- Agents can work at different speeds
- No coordination overhead

### 5. **Version Control Friendly**
- Each response is a separate file
- Easy to diff changes
- Clear authorship per file

---

## Agent ID Mapping

| Agent Working Directory | Agent ID | Filename |
|------------------------|----------|----------|
| `C:\Users\willh\.mcp-servers\coderef-context` | `coderef-context` | `coderef-context.json` |
| `C:\Users\willh\.mcp-servers\coderef-docs` | `coderef-docs` | `coderef-docs.json` |
| `C:\Users\willh\.mcp-servers\coderef-workflow` | `coderef-workflow` | `coderef-workflow.json` |
| `C:\Users\willh\.mcp-servers\coderef-personas` | `coderef-personas` | `coderef-personas.json` |
| `C:\Users\willh\Desktop\coderef-dashboard` | `coderef-dashboard` | `coderef-dashboard.json` |
| `C:\Users\willh\Desktop\scrapper` | `scrapper` | `scrapper.json` |

---

## Example Use Case

**Scenario:** Quarterly documentation review across all MCP servers

**User Actions:**
1. Navigate to `/prompts`
2. Select **CODEREF_ECOSYSTEM_REVIEW** prompt
3. Enter title: `Q1-2026-Documentation-Review`
4. Select tags: Documentation, Workflows, Standards
5. Attach: `CLAUDE.md` files from all 6 MCP servers
6. Export to JSON
7. Copy prompt to each MCP server's agent chat

**Agents Execute:**
- coderef-context agent analyzes their CLAUDE.md → saves `coderef-context.json`
- coderef-docs agent analyzes their CLAUDE.md → saves `coderef-docs.json`
- coderef-workflow agent analyzes their CLAUDE.md → saves `coderef-workflow.json`
- (etc. for all 6 servers)

**Result:**
- 6 JSON files in `coderef/reviews/Q1-2026-Documentation-Review/responses/`
- Each with structured analysis of their documentation
- Orchestrator aggregates to find common themes
- User sees: "5/6 agents mentioned 'no staleness detection' as weakness"

---

## Dashboard Implementation Notes

**Phase 1: Basic Export** (Current workorder WO-DASHBOARD-ECOSYSTEM-REVIEW-001)
- Prompt card with 10 ecosystem tags
- Export to JSON with review title
- Manual distribution to agents

**Phase 2: Results Viewer** (Future workorder)
- `/reviews` route listing all review folders
- `/reviews/{title}` route showing aggregated results
- Side-by-side agent comparison
- Common themes highlighting

**Phase 3: Automation** (Future workorder)
- Automatic agent distribution via MCP
- Real-time response collection
- Live aggregation as agents complete
- Notifications when all agents respond

---

## Comparison to communication.json Pattern

| Feature | Communication.json | Common Folder (This) |
|---------|-------------------|---------------------|
| **Coordination** | Required | Not needed |
| **Agent Updates** | Update same file | Save separate files |
| **Status Tracking** | Via status field | Via file existence |
| **Polling** | Required | Not required |
| **Complexity** | Higher | Lower |
| **Best For** | Sequential workflows | Parallel reviews |

**When to use Common Folder pattern:**
- Parallel agent execution
- Independent analysis tasks
- No dependencies between agents
- Simple aggregation needs

**When to use communication.json pattern:**
- Sequential workflows (Phase 1 → Phase 2 → Phase 3)
- Agent coordination required
- Status updates needed
- Complex multi-step processes

---

**Last Updated:** 2026-01-01
**Workorder:** WO-DASHBOARD-ECOSYSTEM-REVIEW-001

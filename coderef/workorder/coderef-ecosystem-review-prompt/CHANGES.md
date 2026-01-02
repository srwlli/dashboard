# CODEREF_ECOSYSTEM_REVIEW Changes

**Date:** 2026-01-01
**Workorder:** WO-DASHBOARD-ECOSYSTEM-REVIEW-001

---

## What Changed

### Before (Original Plan)
- **Output Format:** Markdown in code block
- **Workflow:** Similar to CODE_REVIEW (single-agent, paste result back)
- **Coordination:** None - one agent at a time
- **Structure:** Freeform markdown with sections

### After (Updated Plan)
- **Output Format:** Structured JSON
- **Workflow:** Multi-agent coordination via common folder
- **Coordination:** Agents save independently to shared location
- **Structure:** Fixed JSON schema with validation

---

## Key Changes

### 1. Output Format: Markdown → JSON

**Why:**
- Structured data is easier to aggregate across multiple agents
- JSON can be programmatically parsed and merged
- Enables automated analysis and trend detection
- Dashboard can consume and display results

**Before:**
```markdown
### Documentation
**How Used:** Foundation docs provide...
**Strengths:** Clear structure...
```

**After:**
```json
{
  "ecosystem_analysis": {
    "documentation": {
      "how_used": "Foundation docs provide...",
      "strengths": "Clear structure..."
    }
  }
}
```

---

### 2. Workflow: Single-Agent → Multi-Agent

**Why:**
- Review entire ecosystem requires input from all agents
- Each agent has expertise in their domain
- Parallel execution is faster than sequential
- Aggregated insights reveal system-wide patterns

**Before:**
- User selects prompt → attaches files → exports → pastes to ONE agent → agent responds

**After:**
- User selects prompt → enters review title → exports → pastes to ALL agents → each agent saves JSON → orchestrator aggregates

---

### 3. Save Location: Paste Back → Common Folder

**Why:**
- Common folder enables easy aggregation
- Each agent saves independently (no coordination needed)
- Version control friendly (separate files)
- Clear authorship per file

**Location Pattern:**
```
coderef/reviews/{review-title}/responses/{agent-id}.json
```

**Examples:**
- `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-context.json`
- `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-docs.json`

---

### 4. User Input: None → Review Title

**Why:**
- Review title provides context for what's being reviewed
- Enables organization by time period or focus area
- Creates unique folder per review
- Makes finding past reviews easier

**Examples:**
- "Q1-2026-Documentation-Review"
- "Pre-Launch-Security-Audit"
- "MCP-Integration-Assessment"

---

### 5. Agent ID: Implicit → Explicit

**Why:**
- Each agent needs to know their unique identifier
- Agent ID = filename for saved JSON
- Clear attribution of which agent said what
- Enables tracking response coverage (did all agents respond?)

**Agent ID = Working Directory Name:**
- coderef-context → `coderef-context.json`
- coderef-docs → `coderef-docs.json`
- coderef-dashboard → `coderef-dashboard.json`

---

## Benefits of New Approach

### 1. **Scalability**
- Add more agents without changing workflow
- Works with 1 agent or 20 agents
- No bottlenecks

### 2. **Parallel Execution**
- All agents work simultaneously
- Much faster than sequential reviews
- No waiting for previous agent to finish

### 3. **Aggregation**
- Easy to find common themes across agents
- Identify consensus vs. outliers
- Generate summary reports

### 4. **Organization**
- Reviews organized by title/date
- All responses for one review in one folder
- Easy to reference past reviews

### 5. **Flexibility**
- User controls which agents participate
- User controls which tags to focus on
- Agents can work at their own pace

---

## Implementation Impact

### Dashboard Changes Needed

**No major UI changes** - still uses same PromptSelector, WorkflowContext, Export

**Minor additions:**
1. **Review Title Input:** Add text input field for user to enter review title
2. **Export Logic:** Interpolate `{{REVIEW_TITLE}}` in prompt text
3. **Metadata:** Include save location in export JSON

### Prompt Card Changes

**File:** `utils/prompts.ts`

**Add:**
```typescript
const CODEREF_ECOSYSTEM_REVIEW_PROMPT = `
CODEREF ECOSYSTEM REVIEW

[Prompt text from prompt-template.md]
`;

export const PRELOADED_PROMPTS: Record<string, PreloadedPrompt> = {
  // ... existing prompts
  '0004': {
    key: '0004',
    name: 'CODEREF_ECOSYSTEM_REVIEW',
    label: 'CodeRef Ecosystem Review',
    text: CODEREF_ECOSYSTEM_REVIEW_PROMPT,
    estimatedTokens: 1200,
    description: 'Multi-agent ecosystem review with JSON output',
  },
};
```

### Ecosystem Tags

**File:** `constants/ecosystem-tags.ts`

**Create new file with 10 tags** (similar structure to existing `tags.ts`)

---

## Migration Path

### Phase 1: Basic Implementation
- Create prompt card (key: '0004')
- Add ecosystem tags
- Add review title input field
- Export with interpolated review title

### Phase 2: Results Viewer
- Create `/reviews` route
- List all review folders
- Display individual review results
- Side-by-side agent comparison

### Phase 3: Automation
- Auto-distribute prompts via MCP
- Real-time response collection
- Live aggregation dashboard
- Notifications

---

## File Structure

**Created Files:**
- ✅ `prompt-template.md` - Full prompt text with JSON schema
- ✅ `workflow-guide.md` - Complete workflow documentation
- ✅ `CHANGES.md` - This file (summary of changes)
- ⏳ `context.json` - Original requirements (needs updating)
- ⏳ `communication.json` - Workflow tracking

**To Create (Dashboard Implementation):**
- `constants/ecosystem-tags.ts` - 10 ecosystem tags
- `utils/prompts.ts` - Add CODEREF_ECOSYSTEM_REVIEW prompt
- `components/PromptSelector.tsx` - Add ecosystem tag chips for key '0004'
- `components/PromptingWorkflow/components/ReviewTitleInput.tsx` - New component for title input

---

## Success Criteria

**Original:**
- ✅ 4th prompt card appears
- ✅ 10 ecosystem tags selectable
- ✅ Export includes selected tags

**Updated:**
- ✅ 4th prompt card appears
- ✅ 10 ecosystem tags selectable
- ✅ Review title input field works
- ✅ Export interpolates review title into prompt
- ✅ Export includes save location instructions
- ✅ JSON schema is clear and agents can follow it
- ✅ Multiple agents can save to common folder without conflicts

---

## Example Complete Workflow

**User:**
1. Go to `/prompts`
2. Select "CodeRef Ecosystem Review"
3. Enter title: "Q1-2026-Documentation-Review"
4. Select tags: Documentation, Workflows, Standards
5. Attach 6 CLAUDE.md files from MCP servers
6. Click "Export JSON"

**Agent (coderef-docs):**
1. Receives prompt with title and tags
2. Analyzes attached CLAUDE.md files
3. Creates JSON response following schema
4. Saves to: `coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-docs.json`

**Orchestrator:**
1. Reads all files from `coderef/reviews/Q1-2026-Documentation-Review/responses/`
2. Aggregates by tag category
3. Finds common themes
4. Generates summary report

**Result:**
"5/6 agents identified 'no staleness detection' as a weakness in Documentation"

---

**Next Steps:**
1. Update context.json with new requirements
2. Implement review title input field
3. Update prompt interpolation logic
4. Create ecosystem-tags.ts
5. Test with multiple agents

---

**Last Updated:** 2026-01-01

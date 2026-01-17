# CSV Audit Report
**Date:** 2026-01-16
**File:** tools-and-commands.csv
**Total Rows:** 333 data rows

---

## Executive Summary

**Critical Issues Found:**
1. **70 commands missing descriptions** (rows 2-72, all "assistant" server)
2. **54 duplicate commands** across assistant and MCP servers
3. **Inconsistent categorization** between duplicate entries
4. **Wrong server assignments** for delegated commands

**Recommended Actions:**
1. Add descriptions to all 70 assistant commands
2. Resolve duplicates (keep MCP server versions, deprecate assistant duplicates or mark as aliases)
3. Standardize categories across duplicate entries
4. Clarify server assignment strategy

---

## Issue 1: Missing Descriptions (70 commands)

All commands in rows 2-72 (server: "assistant") are missing descriptions.

**Affected Commands:**
```
/coderef-docs-agent
/coderef-foundation-docs
/generate-agent-communication
/generate-deliverables
/generate-docs
/generate-handoff-context
/generate-user-docs
/update-docs
/update-foundation-docs
/aggregate-agent-deliverables
/archive-feature
/assign-agent-task
/audit-codebase
/check-consistency
/coderef-context-agent
/coderef-mcp-lead
/coderef-testing-agent
/compare-runs
/create-resource-sheet
/detect-flaky
/discover-tests
/establish-standards
/features-inventory
/fix
/gather-context
/get-template
/git-release
/list-frameworks
/list-templates
/lloyd
/marcus
/quinn
/record-changes
/research-scout
/resource-sheet-catalog
/run-by-pattern
/run-parallel
/run-test-file
/run-tests
/stub
/test-coverage
/test-health
/test-performance
/test-report
/test-results
/test-trends
/testing-proof
/track-agent-status
/update-deliverables
/update-task-status
/verify-agent-completion
/coderef-personas-agent
/create-persona
/use-persona
/align-plan
/analyze-for-planning
/audit-plans
/complete-workorder
/create-plan
/create-workorder
/generate-plan-review
/get-planning-template
/get-workorder-log
/log-workorder
/validate-plan
```

**Only 5 assistant commands have descriptions:**
- /ava
- /coderef-assistant
- /debug-ui
- /create-session
- /taylor
- /archive-file

---

## Issue 2: Duplicate Commands (54 duplicates)

### Category A: Documentation Commands (12 duplicates)

| Command | Assistant Row | MCP Server Row | MCP Server | Description Status |
|---------|---------------|----------------|------------|-------------------|
| /audit-codebase | 14 (no desc) | 74 | coderef-docs | Has desc |
| /check-consistency | 16 (no desc) | 75 | coderef-docs | Has desc |
| /create-resource-sheet | 22 (no desc) | 76 | coderef-docs | Has desc |
| /establish-standards | 26 (no desc) | 77 | coderef-docs | Has desc |
| /generate-docs | 6 (no desc) | 78 | coderef-docs | Has desc |
| /generate-user-docs | 8 (no desc) | 79 | coderef-docs | Has desc |
| /get-template | 30 (no desc) | 80 | coderef-docs | Has desc |
| /list-templates | 33 (no desc) | 81 | coderef-docs | Has desc |
| /record-changes | 37 (no desc) | 82 | coderef-docs | Has desc |
| /resource-sheet-catalog | 39 (no desc) | 83 | coderef-docs | Has desc |
| /update-docs | 9 (no desc) | 84 | coderef-docs | Has desc |
| /update-foundation-docs | 10 (no desc) | 85 | coderef-docs | Has desc |

### Category B: Persona Commands (17 duplicates)

| Command | Assistant Row | MCP Server Row | MCP Server | Description Status |
|---------|---------------|----------------|------------|-------------------|
| /create-persona | 58 (no desc) | 86 | coderef-personas | Has desc |
| /debug-ui | 23 (has desc) | 87 | coderef-personas | Has desc |
| /fix | 28 (no desc) | 88 | coderef-personas | Has desc |
| /use-persona | 59 (no desc) | 89 | coderef-personas | Has desc |
| /ava | 15 (has desc) | 90 | coderef-personas | Has desc |
| /coderef-assistant | 17 (has desc) | 91 | coderef-personas | Has desc |
| /coderef-context-agent | 18 (no desc) | 92 | coderef-personas | Has desc |
| /coderef-docs-agent | 2 (no desc) | 93 | coderef-personas | Has desc |
| /coderef-mcp-lead | 19 (no desc) | 94 | coderef-personas | Has desc |
| /coderef-personas-agent | 57 (no desc) | 95 | coderef-personas | Has desc |
| /coderef-testing-agent | 20 (no desc) | 96 | coderef-personas | Has desc |
| /lloyd | 34 (no desc) | 97 | coderef-personas | Has desc |
| /marcus | 35 (no desc) | 98 | coderef-personas | Has desc |
| /quinn | 36 (no desc) | 99 | coderef-personas | Has desc |
| /research-scout | 38 (no desc) | 100 | coderef-personas | Has desc |
| /taylor | 45 (has desc) | 101 | coderef-personas | Has desc |

### Category C: Testing Commands (15 duplicates)

| Command | Assistant Row | MCP Server Row | MCP Server | Description Status |
|---------|---------------|----------------|------------|-------------------|
| /compare-runs | 21 (no desc) | 102 | coderef-testing | Has desc |
| /detect-flaky | 24 (no desc) | 103 | coderef-testing | Has desc |
| /discover-tests | 25 (no desc) | 104 | coderef-testing | Has desc |
| /list-frameworks | 32 (no desc) | 105 | coderef-testing | Has desc |
| /run-by-pattern | 40 (no desc) | 106 | coderef-testing | Has desc |
| /run-parallel | 41 (no desc) | 107 | coderef-testing | Has desc |
| /run-test-file | 42 (no desc) | 108 | coderef-testing | Has desc |
| /run-tests | 43 (no desc) | 109 | coderef-testing | Has desc |
| /test-coverage | 46 (no desc) | 110 | coderef-testing | Has desc |
| /test-health | 47 (no desc) | 111 | coderef-testing | Has desc |
| /test-performance | 48 (no desc) | 112 | coderef-testing | Has desc |
| /test-report | 49 (no desc) | 113 | coderef-testing | Has desc |
| /test-results | 50 (no desc) | 114 | coderef-testing | Has desc |
| /test-trends | 51 (no desc) | 115 | coderef-testing | Has desc |
| /testing-proof | 52 (no desc) | 116 | coderef-testing | Has desc |

### Category D: Workflow Commands (10 duplicates)

| Command | Assistant Row | MCP Server Row | MCP Server | Description Status |
|---------|---------------|----------------|------------|-------------------|
| /aggregate-agent-deliverables | 11 (no desc) | 117 | coderef-workflow | Has desc |
| /align-plan | 61 (no desc) | 118 | coderef-workflow | Has desc |
| /analyze-for-planning | 62 (no desc) | 119 | coderef-workflow | Has desc |
| /archive-feature | 12 (no desc) | 120 | coderef-workflow | Has desc |
| /assign-agent-task | 13 (no desc) | 121 | coderef-workflow | Has desc |
| /audit-plans | 63 (no desc) | 122 | coderef-workflow | Has desc |
| /complete-workorder | 64 (no desc) | 124 | coderef-workflow | Has desc |
| /create-plan | 65 (no desc) | 125 | coderef-workflow | Has desc |
| /create-session | 66 (has desc) | 126 | coderef-workflow | Has desc |
| /create-workorder | 67 (no desc) | 127 | coderef-workflow | Has desc |

---

## Issue 3: Categorization Inconsistencies

**Problem:** Duplicate commands have different categories

### Examples:
1. **/debug-ui**
   - Assistant: Category = "General"
   - coderef-personas: Category = "Management"
   - **Recommendation:** Use "Management" (more specific)

2. **/create-persona**
   - Assistant: Category = "Personas"
   - coderef-personas: Category = "Management"
   - **Recommendation:** Use "Management" (aligns with server structure)

3. **/ava, /taylor, /lloyd, etc. (persona activations)**
   - Assistant: Category = "General"
   - coderef-personas: Category = "Personas"
   - **Recommendation:** Use "Personas" (more descriptive)

---

## Issue 4: Server Assignment Strategy

**Current State:** Mixed approach
- Some commands in `C:\Users\willh\.claude\commands\` (server: "assistant")
- Same commands in `C:\Users\willh\.mcp-servers\{server}\.claude\commands\` (server: MCP server name)

**Hypothesis:** User-level commands are convenience aliases that delegate to MCP server commands

**Recommendation:** Choose one of two strategies:

### Strategy A: Keep Only MCP Server Commands
- **Pros:** Single source of truth, no duplicates
- **Cons:** Loses visibility into user-level command availability
- **Action:** Remove all assistant duplicates from CSV

### Strategy B: Mark Assistant Commands as Aliases
- **Pros:** Shows both user-level and MCP commands
- **Cons:** CSV has duplicates, but they're documented
- **Action:** Add Status="alias" for assistant commands that delegate to MCP servers

### Strategy C: Separate Type for Aliases
- **Pros:** Clear distinction, no confusion
- **Cons:** New Type category needed
- **Action:** Create Type="Alias" for assistant commands

**Recommended:** **Strategy B** - Mark assistant commands with Status="alias" and add description "Alias for /{server} command"

---

## Issue 5: Tool Duplicates

Some tools appear in multiple servers:

1. **coderef_foundation_docs**
   - coderef-docs: Row 231 (deprecated)
   - coderef-workflow: Row 267 (active)
   - **Action:** Keep both (intentional cross-server availability)

2. **generate_foundation_docs**
   - coderef-docs: Row 234 (active)
   - coderef-workflow: Row 278 (active)
   - **Action:** Keep both (intentional cross-server availability)

3. **audit_codebase, check_consistency, establish_standards**
   - coderef-docs: Active
   - coderef-workflow: Active
   - **Action:** Keep both (intentional cross-server availability)

---

## Recommended Actions

### Priority 1: Add Descriptions (CRITICAL)
1. Read each assistant command file
2. Extract frontmatter description or infer from content
3. Update CSV with descriptions

### Priority 2: Resolve Duplicates (HIGH)
1. Implement Strategy B (alias marking)
2. Update Status column for assistant duplicates to "alias"
3. Add description: "Alias for /{mcp-server} command - {original description}"

### Priority 3: Standardize Categories (MEDIUM)
1. Use MCP server category for all duplicates
2. Update assistant command categories to match

### Priority 4: Add Metadata Column (OPTIONAL)
1. Add "Notes" column
2. Document alias relationships
3. Note deprecations and migrations

---

## Sample Corrected Entries

**Before:**
```csv
Command,assistant,General,/ava,,active,C:\Users\willh\.claude\commands\ava.md
Command,coderef-personas,Personas,/ava,Activate Ava (frontend specialist),active,C:\Users\willh\.mcp-servers\coderef-personas\.claude\commands\ava.md
```

**After (Strategy B):**
```csv
Command,assistant,Personas,/ava,Alias for coderef-personas command - Activate Ava (frontend specialist),alias,C:\Users\willh\.claude\commands\ava.md
Command,coderef-personas,Personas,/ava,Activate Ava (frontend specialist),active,C:\Users\willh\.mcp-servers\coderef-personas\.claude\commands\ava.md
```

---

## Statistics

- **Total Commands:** 143
- **Commands with Descriptions:** 73 (51%)
- **Commands without Descriptions:** 70 (49%)
- **Duplicate Commands:** 54 (38% of total)
- **Unique Commands:** 89

- **Total Tools:** 93
- **Total Scripts:** 26
- **Total Validators:** 22
- **Total Schemas:** 28
- **Total Workflows:** 6
- **Total Outputs:** 9
- **Total Tabs:** 6

---

**Next Steps:**
1. Approve strategy (A, B, or C)
2. Generate corrected CSV
3. Update auto-update script to handle aliases
4. Document server assignment strategy in README

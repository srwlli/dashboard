# tools-and-commands.csv Update Requirements

**Generated:** 2026-01-16
**Reason:** Workflow enhancements for file tracking and git verification

---

## Changes Made to Workflows

### 1. /create-session Command Enhancements

**Location in CSV:** Row 98
**Current Description:** "Create multi-agent session"

**New Description (Proposed):** "Create multi-agent session with file tracking and git verification"

**Details:**
- **step_4 enhancement:** Agents now track files in real-time
  - New files → `outputs.files_created[]`
  - Modified files → `outputs.files_modified[]`
  - Format: `'path/file.ts (123 lines - description)'`

- **step_5 enhancement:** Git diff verification added
  - Run `git diff --name-only [session-start]..HEAD`
  - Compare git results vs tracked arrays
  - Auto-add missing files to tracking

**Impact:** Dashboard now displays actual implementation files as work progresses

---

### 2. /create-workorder Command Enhancement

**Location in CSV:** Row 99
**Current Description:** "Create new workorder"

**Proposed Change:** Description adequate, but note step_3b was added
- Agents must update communication.json after creating workorder
- Enables session dashboard tracking
- Not a command change, but execution requirement

---

## CSV Structure Validation

**Current State:**
- **Total Rows:** 160 (1 header + 159 data)
- **Tools:** 87 (rows 2-88)
- **Commands:** 72 (rows 89-160)

**Breakdown by Server:**

### Tools (87 total)
- coderef-context: 12 tools
- coderef-workflow: 36 tools
- coderef-docs: 13 tools
- coderef-personas: 8 tools
- coderef-testing: 14 tools
- papertrail: 4 tools

### Commands (72 total)
- coderef-workflow: 28 commands
- coderef-docs: 12 commands
- coderef-personas: 16 commands
- coderef-testing: 15 commands
- assistant: 1 command
- coderef-dashboard: 1 command (widget-architect)

---

## Recommended Updates

### Option A: Minimal Update
**Change only /create-session description:**

```csv
Command,coderef-workflow,Workflow,/create-session,Create multi-agent session with file tracking and git verification,active,C:\Users\willh\.mcp-servers\coderef-workflow\.claude\commands\create-session.md
```

### Option B: Comprehensive Update
**Add new columns for tracking capabilities:**

```csv
Type,Server,Category,Name,Description,Status,Path,Features
Command,coderef-workflow,Workflow,/create-session,Create multi-agent session,active,C:\Users\willh\.mcp-servers\coderef-workflow\.claude\commands\create-session.md,file-tracking|git-verification
```

---

## Next Steps

1. ✅ Document required changes (this file)
2. ⏳ Update CSV row 98 (/create-session description)
3. ⏳ Verify all other command/tool entries are current
4. ⏳ Check for any missing tools/commands
5. ⏳ Validate CSV format after updates

---

**Status:** Ready for update approval

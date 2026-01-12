# State of the System - January 12, 2026

**Last Audit:** WO-TOOLS-COMMANDS-AUDIT-001 (2026-01-12)
**Ecosystem Status:** Production-ready v2.0.0

---

## Executive Summary

The CodeRef ecosystem consists of **6 production MCP servers** providing **87 tools** and **69 slash commands** for comprehensive code intelligence, workflow orchestration, documentation generation, persona management, testing automation, and UDS validation.

**Key Metrics:**
- 87 MCP tools across 6 servers
- 69 slash commands (globally deployed)
- 10 intentional tool duplicates (cross-server compatibility)
- 0 deprecated tools (100% active)
- 9 project agents coordinated by orchestrator

---

## Projects

### CodeRef Ecosystem MCP Servers

#### 1. **coderef-context** - `C:\Users\willh\.mcp-servers\coderef-context`
   - **Version:** 2.0.0
   - **Status:** Production
   - **Purpose:** Code intelligence through .coderef/ file reading (117x faster than CLI)
   - **Tools:** 12 (scan, query, impact, complexity, patterns, coverage, context, validate, drift, diagram, tag, export)
   - **Commands:** 0 (tools only)

#### 2. **coderef-workflow** - `C:\Users\willh\.mcp-servers\coderef-workflow`
   - **Version:** 2.0.0
   - **Status:** Production
   - **Purpose:** Feature lifecycle orchestration with workorder tracking
   - **Tools:** 36 (planning, execution, coordination, archival)
   - **Commands:** 26 (gather-context, create-plan, align-plan, archive-feature, etc.)

#### 3. **coderef-docs** - `C:\Users\willh\.mcp-servers\coderef-docs`
   - **Version:** 3.7.0
   - **Status:** Production
   - **Purpose:** Documentation generation with POWER framework
   - **Tools:** 13 (templates, foundation docs, changelog, standards, validation)
   - **Commands:** 12 (generate-docs, record-changes, create-resource-sheet, etc.)

#### 4. **coderef-personas** - `C:\Users\willh\.mcp-servers\coderef-personas`
   - **Version:** 1.5.0
   - **Status:** Production
   - **Purpose:** Expert agent personas with specialized knowledge
   - **Tools:** 8 (persona management, Lloyd integration, plan execution)
   - **Commands:** 16 (ava, taylor, marcus, quinn, lloyd, coderef-assistant, etc.)
   - **Personas Available:** 11 active personas

#### 5. **coderef-testing** - `C:\Users\willh\.mcp-servers\coderef-testing`
   - **Version:** 1.0.0
   - **Status:** Production
   - **Purpose:** Universal test orchestration (pytest, jest, cargo, mocha, vitest)
   - **Tools:** 14 (discovery, execution, management, analysis)
   - **Commands:** 15 (run-tests, test-coverage, detect-flaky, test-performance, etc.)

#### 6. **papertrail** - `C:\Users\willh\.mcp-servers\papertrail`
   - **Version:** 1.0.0
   - **Status:** Production
   - **Purpose:** Universal Documentation Standards (UDS) validation
   - **Tools:** 4 (resource sheet validation, document validation)
   - **Commands:** 0 (tools only)

---

### Supporting Projects

#### 7. **assistant** (orchestrator) - `C:\Users\willh\Desktop\assistant`
   - **Purpose:** Centralized workorder tracking and cross-project coordination
   - **Tools:** 0 MCP tools
   - **Commands:** 1 (/archive-file)
   - **Role:** Delegates work to 9 project agents, tracks progress via communication.json

#### 8. **coderef-dashboard** - `C:\Users\willh\Desktop\coderef-dashboard`
   - **Purpose:** Next.js PWA + Electron wrapper with widget system
   - **Tools:** 0 MCP tools
   - **Commands:** 1 (/widget-architect)
   - **Technology:** TypeScript, React, Next.js

#### 9. **coderef-scanner** - `C:\Users\willh\Desktop\coderef-dashboard\packages\coderef-core`
   - **Purpose:** Core scanning and analysis library
   - **Functions:** 48 exported functions (43 active, 5 disabled)
   - **Tools:** 0 MCP tools
   - **Technology:** TypeScript library package

---

## Tool Distribution

| Server | Tools | Commands | Focus Area |
|--------|-------|----------|------------|
| coderef-context | 12 | 0 | Code intelligence |
| coderef-workflow | 36 | 26 | Orchestration |
| coderef-docs | 13 | 12 | Documentation |
| coderef-personas | 8 | 16 | Personas |
| coderef-testing | 14 | 15 | Testing |
| papertrail | 4 | 0 | Validation |
| **TOTAL** | **87** | **69** | — |

---

## Intentional Duplicates (10)

Tools duplicated across servers for different contexts/implementations:
- `list_templates` (workflow, docs)
- `get_template` (workflow, docs)
- `generate_foundation_docs` (workflow, docs)
- `generate_individual_doc` (workflow, docs)
- `add_changelog_entry` (workflow, docs)
- `generate_quickref_interactive` (workflow, docs)
- `establish_standards` (workflow, docs)
- `audit_codebase` (workflow, docs)
- `check_consistency` (workflow, docs)
- `validate_document` (docs, papertrail)

**Rationale:** Servers provide overlapping functionality for different contexts while maintaining separation of concerns.

---

## Deprecations & Gaps

**Deprecated Tools:** 0 (all tools active)
**Deprecated Commands:** 29 (coderef-docs commands moved to coderef-workflow)
**Planned Enhancements:**
- `add_persona` (coderef-personas) - Stack additional persona (composition)
- `get_active_personas` (coderef-personas) - Show current persona stack

---

## Recommendations

### Consolidation
- Consider consolidating duplicate tools between coderef-workflow and coderef-docs into shared library to reduce maintenance overhead

### Documentation
- Create tool cross-reference matrix showing which tools call other MCP tools
- Document tool dependencies and integration patterns
- Create workflow diagrams showing common tool sequences

### Testing
- Ensure all 87 tools have comprehensive integration tests
- Add end-to-end tests for common multi-tool workflows
- Create performance benchmarks for all tools

---

## Audit Metadata

- **Audit Workorder:** WO-TOOLS-COMMANDS-AUDIT-001
- **Audit Date:** 2026-01-12
- **Audit Duration:** ~15 minutes
- **Audit Method:** Automated scan of server.py files and .claude/commands/
- **Agents Participated:** 9 (all completed)
- **Master List:** `C:\Users\willh\.mcp-servers\coderef\sessions\tools-and-commands-audit-2026\orchestrator-master-list.json`

---

## Complete Tool & Command Reference

### MCP Tools by Category

#### Code Intelligence (coderef-context) - 12 tools
1. `coderef_scan` - Scan project and discover code elements
2. `coderef_query` - Query code relationships
3. `coderef_impact` - Analyze modification impact
4. `coderef_complexity` - Get complexity metrics
5. `coderef_patterns` - Discover code patterns
6. `coderef_coverage` - Analyze test coverage
7. `coderef_context` - Generate codebase context
8. `coderef_validate` - Validate CodeRef2 references
9. `coderef_drift` - Detect index drift
10. `coderef_diagram` - Generate dependency diagrams
11. `coderef_tag` - Add CodeRef2 tags to source files
12. `coderef_export` - Export coderef data

#### Workflow Orchestration (coderef-workflow) - 36 tools
**Documentation Templates (4)**
1. `list_templates` - List all documentation templates
2. `get_template` - Retrieve specific template
3. `generate_foundation_docs` - Generate foundation documentation
4. `generate_individual_doc` - Generate single doc file

**Changelog Management (3)**
5. `get_changelog` - Get project changelog
6. `add_changelog_entry` - Add changelog entry
7. `update_changelog` - Agentic changelog update

**Standards & Quality (4)**
8. `generate_quickref_interactive` - Generate universal quickref
9. `establish_standards` - Scan and generate standards
10. `audit_codebase` - Audit for standards violations
11. `check_consistency` - Pre-commit consistency check

**Planning (6)**
12. `get_planning_template` - Get planning template
13. `analyze_project_for_planning` - Automate prep phase
14. `gather_context` - Gather feature requirements
15. `validate_implementation_plan` - Validate plan quality
16. `generate_plan_review_report` - Generate review report
17. `create_plan` - Create implementation plan

**Execution & Tracking (5)**
18. `finalize_plan_from_agent` - Finalize plan from Task agent
19. `generate_deliverables_template` - Generate deliverables template
20. `update_deliverables` - Update with git metrics
21. `execute_plan` - Generate TodoWrite task list
22. `update_task_status` - Update task progress

**Multi-Agent Coordination (5)**
23. `generate_agent_communication` - Generate communication.json
24. `assign_agent_task` - Assign task to agent
25. `verify_agent_completion` - Verify completion
26. `aggregate_agent_deliverables` - Aggregate metrics
27. `track_agent_status` - Track agent status

**Archival & Inventory (4)**
28. `archive_feature` - Archive completed features
29. `audit_plans` - Audit all plans
30. `log_workorder` - Log workorder entry
31. `get_workorder_log` - Query workorder log

**Advanced Tools (5)**
32. `generate_handoff_context` - Generate agent handoff
33. `assess_risk` - AI-powered risk assessment
34. `coderef_foundation_docs` - Unified foundation docs
35. `generate_features_inventory` - Generate features inventory
36. `update_all_documentation` - Agentic doc updates

#### Documentation Generation (coderef-docs) - 13 tools
1. `list_templates` - List documentation templates
2. `get_template` - Retrieve template content
3. `generate_foundation_docs` - Generate foundation docs
4. `generate_individual_doc` - Generate single doc with UDS
5. `add_changelog_entry` - Add changelog entry
6. `record_changes` - Smart changelog recording
7. `generate_quickref_interactive` - Generate quickref
8. `generate_resource_sheet` - Generate resource sheets
9. `establish_standards` - Discover patterns
10. `audit_codebase` - Audit violations
11. `check_consistency` - Consistency checking
12. `validate_document` - UDS validation
13. `check_document_health` - Health score calculation

#### Persona Management (coderef-personas) - 8 tools
1. `use_persona` - Activate expert persona
2. `get_active_persona` - Get current persona info
3. `clear_persona` - Deactivate persona
4. `list_personas` - List all personas
5. `generate_todo_list` - Convert plan to TodoWrite
6. `track_plan_execution` - Sync plan with todos
7. `execute_plan_interactive` - Execute plan guided
8. `create_custom_persona` - Create custom persona

#### Testing Automation (coderef-testing) - 14 tools
**Discovery (2)**
1. `discover_tests` - Find all tests
2. `list_test_frameworks` - List frameworks

**Execution (4)**
3. `run_all_tests` - Execute entire suite
4. `run_test_file` - Run specific file
5. `run_test_category` - Run by pattern
6. `run_tests_in_parallel` - Parallel execution

**Management (4)**
7. `get_test_results` - Retrieve results
8. `aggregate_results` - Aggregate runs
9. `generate_test_report` - Generate reports
10. `compare_test_runs` - Compare runs

**Analysis (4)**
11. `analyze_coverage` - Coverage analysis
12. `detect_flaky_tests` - Find flaky tests
13. `analyze_test_performance` - Performance analysis
14. `validate_test_health` - Health check

#### UDS Validation (papertrail) - 4 tools
1. `validate_resource_sheet` - Validate resource sheet
2. `check_all_resource_sheets` - Validate all sheets
3. `validate_document` - Validate any document
4. `check_all_docs` - Validate all docs

---

### Slash Commands by Server

#### coderef-workflow (26 commands)
1. `/aggregate-agent-deliverables`
2. `/align-plan`
3. `/analyze-for-planning`
4. `/archive-feature`
5. `/assign-agent-task`
6. `/audit-plans`
7. `/coderef-foundation-docs`
8. `/complete-workorder`
9. `/create-plan`
10. `/create-session`
11. `/create-workorder`
12. `/features-inventory`
13. `/gather-context`
14. `/generate-agent-communication`
15. `/generate-deliverables`
16. `/generate-handoff-context`
17. `/generate-plan-review`
18. `/get-planning-template`
19. `/get-workorder-log`
20. `/git-release`
21. `/log-workorder`
22. `/stub`
23. `/track-agent-status`
24. `/update-deliverables`
25. `/update-task-status`
26. `/validate-plan`
27. `/verify-agent-completion`

#### coderef-docs (12 commands)
1. `/audit-codebase`
2. `/check-consistency`
3. `/create-resource-sheet`
4. `/establish-standards`
5. `/generate-docs`
6. `/generate-user-docs`
7. `/get-template`
8. `/list-templates`
9. `/record-changes`
10. `/resource-sheet-catalog`
11. `/update-docs`
12. `/update-foundation-docs`

#### coderef-personas (16 commands)
**Personas (10)**
1. `/ava` - Frontend specialist
2. `/coderef-assistant` - Orchestrator
3. `/coderef-context-agent` - Context specialist
4. `/coderef-docs-agent` - Docs specialist
5. `/coderef-mcp-lead` - MCP lead
6. `/coderef-personas-agent` - Personas specialist
7. `/coderef-testing-agent` - Testing specialist
8. `/lloyd` - General purpose
9. `/marcus` - Code architect
10. `/quinn` - Testing specialist
11. `/research-scout` - Research specialist
12. `/taylor` - General purpose

**Management (4)**
13. `/create-persona` - Create custom persona
14. `/debug-ui` - Debug UI issues
15. `/fix` - Quick fixes
16. `/use-persona` - Use persona

#### coderef-testing (15 commands)
1. `/compare-runs` - Compare test runs
2. `/detect-flaky` - Find flaky tests
3. `/discover-tests` - Discover tests
4. `/list-frameworks` - List test frameworks
5. `/run-by-pattern` - Run by pattern
6. `/run-parallel` - Parallel execution
7. `/run-test-file` - Run specific file
8. `/run-tests` - Run all tests
9. `/test-coverage` - Coverage analysis
10. `/test-health` - Health check
11. `/testing-proof` - Testing proof
12. `/test-performance` - Performance analysis
13. `/test-report` - Generate report
14. `/test-results` - Get results
15. `/test-trends` - Analyze trends

#### assistant (1 command)
1. `/archive-file` - Archive files by project

#### coderef-dashboard (1 command)
1. `/widget-architect` - Widget architecture tool

---

**Ecosystem Version:** 2.0.0
**Status:** Production-ready

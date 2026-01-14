# coderef-dashboard - Quick Reference

**Version:** 0.1.0  
**Last Updated:** 2026-01-14

---

## Documentation Tools

### Foundation Documentation
- `/generate-docs` - Generate foundation documentation (API, SCHEMA, COMPONENTS, ARCHITECTURE, README)
- `/update-foundation-docs` - Update foundation documentation after changes
- `/coderef-foundation-docs` - Generate foundation docs using coderef analysis
- `/list-templates` - List all available documentation templates
- `/get-template` - Retrieve content of specific template

### User Documentation
- `/generate-user-docs` - Generate user-facing documentation (my-guide, USER-GUIDE, FEATURES, quickref)
- `/create-resource-sheet` - Create resource sheet for code elements
- `/resource-sheet-catalog` - Show resource sheet catalog

### Standards & Quality
- `/establish-standards` - Scan codebase to discover patterns and generate standards
- `/audit-codebase` - Audit codebase for standards violations
- `/check-consistency` - Check code changes against established standards (pre-commit)
- `/update-docs` - Update all documentation files after completing a feature

### Changelog
- `/record-changes` - Smart changelog recording with git auto-detection

---

## Workflow & Planning Tools

### Planning
- `/gather-context` - Gather feature requirements and save to context.json
- `/analyze-for-planning` - Analyze project to discover foundation docs, standards, patterns
- `/get-planning-template` - Get feature implementation planning template
- `/create-plan` - Generate 10-section implementation plan from context
- `/validate-plan` - Validate implementation plan (0-100 score)
- `/generate-plan-review` - Generate human-readable plan review report
- `/align-plan` - Generate TodoWrite task list from plan.json

### Execution & Tracking
- `/create-workorder` - Create workorder with context.json and communication.json
- `/update-task-status` - Update task status in plan.json as agents complete work
- `/update-deliverables` - Update deliverables with git metrics
- `/complete-workorder` - Complete workorder workflow (update deliverables + archive)
- `/track-agent-status` - Track agent status across workorders

### Multi-Agent Coordination
- `/assign-agent-task` - Assign task to agent
- `/generate-agent-communication` - Generate communication.json file
- `/verify-agent-completion` - Verify agent completion
- `/aggregate-agent-deliverables` - Aggregate agent deliverables
- `/generate-handoff-context` - Generate agent handoff context

### Archival & Inventory
- `/archive-feature` - Archive completed features
- `/audit-plans` - Audit all plans in workorder/ directory
- `/features-inventory` - Generate features inventory
- `/log-workorder` - Log workorder entry
- `/get-workorder-log` - Query workorder log

---

## Code Intelligence Tools

### Scanning & Analysis
- `coderef_scan` - Scan project and discover code elements
- `coderef_query` - Query code relationships (what-calls, what-imports, etc.)
- `coderef_impact` - Analyze modification impact
- `coderef_complexity` - Get complexity metrics
- `coderef_patterns` - Discover code patterns
- `coderef_coverage` - Analyze test coverage

### Context & Validation
- `coderef_context` - Generate codebase context
- `coderef_validate` - Validate CodeRef2 references
- `coderef_drift` - Detect index drift
- `coderef_diagram` - Generate dependency diagrams
- `coderef_tag` - Add CodeRef2 tags to source files
- `coderef_export` - Export coderef data

---

## Persona Management

### Activate Personas
- `/lloyd` - Activate Lloyd (general purpose agent)
- `/marcus` - Activate Marcus (code architect)
- `/ava` - Activate Ava (frontend specialist)
- `/quinn` - Activate Quinn (testing specialist)
- `/taylor` - Activate Taylor (general purpose)
- `/coderef-assistant` - Activate CodeRef Assistant (orchestrator)
- `/coderef-context-agent` - Activate context specialist
- `/coderef-docs-agent` - Activate docs specialist
- `/coderef-mcp-lead` - Activate MCP lead
- `/coderef-personas-agent` - Activate personas specialist
- `/coderef-testing-agent` - Activate testing specialist
- `/research-scout` - Activate Research Scout

### Persona Management
- `/use-persona` - Use specific persona by name
- `/create-persona` - Create custom persona
- `/fix` - Quick fixes with persona assistance
- `/debug-ui` - Debug UI issues

---

## Testing Tools

### Test Execution
- `/run-tests` - Run all tests
- `/run-test-file` - Run specific test file
- `/run-by-pattern` - Run tests by pattern
- `/run-parallel` - Run tests in parallel

### Test Analysis
- `/test-coverage` - Analyze test coverage
- `/test-performance` - Analyze test performance
- `/test-health` - Check test health
- `/detect-flaky` - Detect flaky tests
- `/compare-runs` - Compare test runs
- `/test-trends` - Analyze test trends

### Test Management
- `/discover-tests` - Discover all tests
- `/list-frameworks` - List test frameworks
- `/test-results` - Get test results
- `/test-report` - Generate test report
- `/testing-proof` - Generate testing proof

---

## Utility Commands

- `/widget-architect` - Widget architecture tool
- `/create-session` - Create multi-agent session
- `/git-release` - Create git release
- `/stub` - Create feature stub

---

**Total:** 87 MCP tools, 69 slash commands  
**Ecosystem:** 6 production MCP servers  
**Status:** All active

---

*Generated by coderef-docs • 2026-01-14*

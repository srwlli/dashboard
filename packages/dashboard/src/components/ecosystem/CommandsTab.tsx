'use client';

interface Command {
  name: string;
  description: string;
  component: string;
  mcpTool: string;
}

interface CommandCategory {
  name: string;
  count: number;
  commands: Command[];
}

const commandCategories: CommandCategory[] = [
  {
    name: 'Documentation & Standards',
    count: 10,
    commands: [
      { name: '/list-templates', description: 'List all available documentation templates (README, ARCHITECTURE, API, etc.)', component: 'Docs', mcpTool: 'list_templates' },
      { name: '/get-template', description: 'Retrieve content of a specific documentation template', component: 'Docs', mcpTool: 'get_template' },
      { name: '/audit-codebase', description: 'Audit codebase for standards violations with compliance report', component: 'Workflow', mcpTool: 'audit_codebase' },
      { name: '/check-consistency', description: 'Check code changes against established standards (pre-commit validation)', component: 'Workflow', mcpTool: 'check_consistency' },
      { name: '/establish-standards', description: 'Scan codebase to discover patterns and generate standards documentation', component: 'Workflow', mcpTool: 'establish_standards' },
      { name: '/update-docs', description: 'Update all documentation files after completing a feature (agentic workflow)', component: 'Workflow', mcpTool: 'update_all_documentation' },
      { name: '/update-foundation-docs', description: 'Update foundation documentation (README, ARCHITECTURE, API, SCHEMA)', component: 'Docs', mcpTool: 'generate_foundation_docs' },
      { name: '/coderef-foundation-docs', description: 'Generate foundation docs using coderef analysis (hybrid approach)', component: 'Workflow', mcpTool: 'coderef_foundation_docs' },
      { name: '/generate-docs', description: 'Generate documentation from coderef data', component: 'Docs', mcpTool: 'generate_individual_doc' },
      { name: '/generate-user-docs', description: 'Generate user-facing documentation and guides', component: 'Docs', mcpTool: 'generate_quickref_interactive' },
    ],
  },
  {
    name: 'Planning & Workflow',
    count: 14,
    commands: [
      { name: '/gather-context', description: 'Gather feature requirements and save to context.json', component: 'Workflow', mcpTool: 'gather_context' },
      { name: '/analyze-for-planning', description: 'Analyze project to discover foundation docs, standards, patterns (Section 0 prep)', component: 'Workflow', mcpTool: 'analyze_project_for_planning' },
      { name: '/create-plan', description: 'Generate 10-section implementation plan from context and analysis', component: 'Workflow', mcpTool: 'create_plan' },
      { name: '/validate-plan', description: 'Validate implementation plan (0-100 score) against quality checklist', component: 'Workflow', mcpTool: 'validate_implementation_plan' },
      { name: '/get-planning-template', description: 'Get feature implementation planning template for AI reference', component: 'Workflow', mcpTool: 'get_planning_template' },
      { name: '/generate-plan-review', description: 'Generate human-readable plan review report with score and recommendations', component: 'Workflow', mcpTool: 'generate_plan_review_report' },
      { name: '/align-plan', description: 'Generate TodoWrite task list from plan.json for execution tracking', component: 'Workflow', mcpTool: 'execute_plan' },
      { name: '/create-workorder', description: 'Create workorder with context.json and communication.json setup', component: 'Orchestrator', mcpTool: 'Manual workflow' },
      { name: '/complete-workorder', description: 'Complete workorder workflow (update deliverables + archive)', component: 'Workflow', mcpTool: 'update_deliverables + archive_feature' },
      { name: '/update-task-status', description: 'Update task status in plan.json as agents complete work', component: 'Workflow', mcpTool: 'update_task_status' },
      { name: '/audit-plans', description: 'Audit all plans in workorder/ directory with health score', component: 'Workflow', mcpTool: 'audit_plans' },
      { name: '/features-inventory', description: 'Generate inventory of features in workorder/ and archived/', component: 'Workflow', mcpTool: 'generate_features_inventory' },
      { name: '/git-release', description: 'Git release workflow with versioning and changelog', component: 'Workflow', mcpTool: 'Git commands + changelog' },
      { name: '/record-changes', description: 'Smart changelog recording with git auto-detection', component: 'Workflow', mcpTool: 'record_changes' },
    ],
  },
  {
    name: 'Deliverables & Tracking',
    count: 6,
    commands: [
      { name: '/generate-deliverables', description: 'Generate DELIVERABLES.md template from plan.json structure', component: 'Workflow', mcpTool: 'generate_deliverables_template' },
      { name: '/update-deliverables', description: 'Update DELIVERABLES.md with git metrics (LOC, commits, time)', component: 'Workflow', mcpTool: 'update_deliverables' },
      { name: '/archive-feature', description: 'Archive completed feature from workorder/ to archived/', component: 'Workflow', mcpTool: 'archive_feature' },
      { name: '/log-workorder', description: 'Log new workorder entry to global workorder log', component: 'Workflow', mcpTool: 'log_workorder' },
      { name: '/get-workorder-log', description: 'Query global workorder log with filtering', component: 'Workflow', mcpTool: 'get_workorder_log' },
      { name: '/stub', description: 'Capture idea as STUB-XXX in orchestrator', component: 'Orchestrator', mcpTool: 'Manual stub creation' },
    ],
  },
  {
    name: 'Multi-Agent Coordination',
    count: 6,
    commands: [
      { name: '/generate-agent-communication', description: 'Generate communication.json from plan.json for multi-agent coordination', component: 'Workflow', mcpTool: 'generate_agent_communication' },
      { name: '/assign-agent-task', description: 'Assign specific task to agent with workorder scoping', component: 'Workflow', mcpTool: 'assign_agent_task' },
      { name: '/verify-agent-completion', description: 'Verify agent completion with git diff checks and success criteria', component: 'Workflow', mcpTool: 'verify_agent_completion' },
      { name: '/aggregate-agent-deliverables', description: 'Aggregate metrics from multiple agent DELIVERABLES.md files', component: 'Workflow', mcpTool: 'aggregate_agent_deliverables' },
      { name: '/track-agent-status', description: 'Track agent status across features with real-time dashboard', component: 'Workflow', mcpTool: 'track_agent_status' },
      { name: '/generate-handoff-context', description: 'Generate agent handoff context files (claude.md) from plan + git history', component: 'Workflow', mcpTool: 'generate_handoff_context' },
    ],
  },
  {
    name: 'Personas',
    count: 11,
    commands: [
      { name: '/ava', description: 'Activate Ava - Frontend Specialist persona', component: 'Personas', mcpTool: 'use_persona (ava)' },
      { name: '/marcus', description: 'Activate Marcus persona', component: 'Personas', mcpTool: 'use_persona (marcus)' },
      { name: '/quinn', description: 'Activate Quinn persona', component: 'Personas', mcpTool: 'use_persona (quinn)' },
      { name: '/taylor', description: 'Activate Taylor - General Purpose Agent persona', component: 'Personas', mcpTool: 'use_persona (taylor)' },
      { name: '/lloyd', description: 'Activate Lloyd persona', component: 'Personas', mcpTool: 'use_persona (lloyd)' },
      { name: '/use-persona', description: 'Activate any persona by name', component: 'Personas', mcpTool: 'use_persona' },
      { name: '/create-persona', description: 'Create custom persona through guided workflow', component: 'Personas', mcpTool: 'create_custom_persona' },
      { name: '/coderef-assistant', description: 'Activate CodeRef Assistant - Orchestrator persona', component: 'Personas', mcpTool: 'use_persona (coderef-assistant)' },
      { name: '/research-scout', description: 'Activate Research Scout - Research assistant persona', component: 'Personas', mcpTool: 'use_persona (research-scout)' },
      { name: '/coderef-mcp-lead', description: 'Activate MCP Lead persona - MCP system architect', component: 'Personas', mcpTool: 'use_persona (coderef-mcp-lead)' },
      { name: '/fix', description: 'Activate fix/debug workflow persona', component: 'Personas', mcpTool: 'Specialized debug workflow' },
    ],
  },
  {
    name: 'Testing',
    count: 14,
    commands: [
      { name: '/discover-tests', description: 'Discover test files in project', component: 'Testing', mcpTool: 'discover_tests' },
      { name: '/list-frameworks', description: 'List available testing frameworks', component: 'Testing', mcpTool: 'list_frameworks' },
      { name: '/run-tests', description: 'Run all tests in project', component: 'Testing', mcpTool: 'run_tests' },
      { name: '/run-test-file', description: 'Run specific test file', component: 'Testing', mcpTool: 'run_test_file' },
      { name: '/run-by-pattern', description: 'Run tests matching pattern', component: 'Testing', mcpTool: 'run_by_pattern' },
      { name: '/run-parallel', description: 'Run tests in parallel', component: 'Testing', mcpTool: 'run_parallel' },
      { name: '/test-results', description: 'View test results', component: 'Testing', mcpTool: 'test_results' },
      { name: '/test-report', description: 'Generate test report', component: 'Testing', mcpTool: 'test_report' },
      { name: '/compare-runs', description: 'Compare test runs', component: 'Testing', mcpTool: 'compare_runs' },
      { name: '/test-coverage', description: 'View test coverage', component: 'Testing', mcpTool: 'test_coverage' },
      { name: '/test-trends', description: 'View test trends over time', component: 'Testing', mcpTool: 'test_trends' },
      { name: '/test-performance', description: 'View test performance metrics', component: 'Testing', mcpTool: 'test_performance' },
      { name: '/detect-flaky', description: 'Detect flaky tests', component: 'Testing', mcpTool: 'detect_flaky' },
      { name: '/test-health', description: 'Check test health score', component: 'Testing', mcpTool: 'test_health' },
    ],
  },
  {
    name: 'Agent-Specific',
    count: 5,
    commands: [
      { name: '/coderef-context-agent', description: 'Activate Context Agent - Code intelligence specialist', component: 'Context', mcpTool: 'use_persona (coderef-context-agent)' },
      { name: '/coderef-docs-agent', description: 'Activate Docs Agent - Documentation specialist', component: 'Docs', mcpTool: 'use_persona (coderef-docs-agent)' },
      { name: '/coderef-testing-agent', description: 'Activate Testing Agent - Test automation specialist', component: 'Testing', mcpTool: 'use_persona (coderef-testing-agent)' },
      { name: '/coderef-personas-agent', description: 'Activate Personas Agent - Persona management specialist', component: 'Personas', mcpTool: 'use_persona (coderef-personas-agent)' },
      { name: '/testing-proof', description: 'Generate testing completion proof', component: 'Testing', mcpTool: 'proof_generator' },
    ],
  },
  {
    name: 'UI/Debug',
    count: 1,
    commands: [
      { name: '/debug-ui', description: 'Debug UI issues using Chrome DevTools MCP with Ava\'s frontend expertise', component: 'Personas', mcpTool: 'Chrome DevTools MCP + Ava persona' },
    ],
  },
];

const componentBadgeColors: Record<string, string> = {
  'Docs': 'bg-blue-500/10 text-blue-500',
  'Workflow': 'bg-green-500/10 text-green-500',
  'Orchestrator': 'bg-purple-500/10 text-purple-500',
  'Personas': 'bg-orange-500/10 text-orange-500',
  'Testing': 'bg-red-500/10 text-red-500',
  'Context': 'bg-cyan-500/10 text-cyan-500',
};

export default function CommandsTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">Total Commands: 68</strong> across 8 categories
        </p>
      </div>

      {/* Categories */}
      {commandCategories.map((category) => (
        <div key={category.name} className="space-y-3">
          <h2 className="text-lg font-semibold text-ind-text flex items-center gap-2">
            {category.name}
            <span className="text-xs px-2 py-1 rounded bg-ind-accent/10 text-ind-accent">
              {category.count} commands
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ind-border">
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Command</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Description</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Component</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">MCP Tool</th>
                </tr>
              </thead>
              <tbody>
                {category.commands.map((command) => (
                  <tr key={command.name} className="border-b border-ind-border hover:bg-ind-bg/50 transition-colors">
                    <td className="p-3">
                      <code className="text-xs font-mono text-ind-accent bg-ind-accent/10 px-2 py-1 rounded">
                        {command.name}
                      </code>
                    </td>
                    <td className="p-3 text-xs text-ind-text">{command.description}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${componentBadgeColors[command.component] || 'bg-ind-bg text-ind-text-muted'}`}>
                        {command.component}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-ind-text-muted font-mono">{command.mcpTool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

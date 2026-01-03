'use client';

export default function ToolsTab() {
  const mcpServers = [
    {
      name: 'coderef-context',
      description: 'Code Intelligence',
      toolCount: 12,
      tools: ['coderef_scan', 'coderef_query', 'coderef_impact', 'coderef_complexity', 'coderef_patterns', 'coderef_coverage', 'coderef_context', 'coderef_validate', 'coderef_drift', 'coderef_diagram', 'coderef_tag', 'coderef_export']
    },
    {
      name: 'coderef-workflow',
      description: 'Planning & Workflow Management',
      toolCount: 23,
      tools: ['Planning & Context (9 tools)', 'Multi-Agent Coordination (6 tools)', 'Documentation & Standards (8 tools)']
    },
    {
      name: 'coderef-personas',
      description: 'Persona Management',
      toolCount: 7,
      tools: ['use_persona', 'create_custom_persona', 'get_active_persona', 'clear_persona', 'list_personas', 'generate_todo_list', 'track_plan_execution']
    },
    {
      name: 'testing',
      description: 'Test Automation & Validation',
      toolCount: 18,
      tools: ['discover_tests', 'run_tests', 'test_results', 'test_coverage', 'test_health', 'detect_flaky', 'test_trends', 'test_performance']
    },
    {
      name: 'chrome-devtools',
      description: 'Browser Debugging & UI Inspection',
      toolCount: 11,
      tools: ['inspect_element', 'console_log', 'network_monitor', 'performance_profile', 'screenshot', 'accessibility_audit']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">Total Tools: 71+</strong> across 5 MCP servers
        </p>
      </div>

      {/* MCP Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcpServers.map((server) => (
          <div key={server.name} className="p-4 bg-ind-panel border border-ind-border rounded-lg hover:bg-ind-bg hover:border-ind-accent/50 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-ind-text">{server.name}</h3>
              <span className="text-xs px-2 py-1 rounded bg-ind-accent/10 text-ind-accent">
                {server.toolCount} tools
              </span>
            </div>
            <p className="text-xs text-ind-text-muted mb-3">{server.description}</p>
            <div className="space-y-1">
              {server.tools.slice(0, 4).map((tool, idx) => (
                <div key={idx} className="text-xs text-ind-text-muted font-mono">
                  • {tool}
                </div>
              ))}
              {server.tools.length > 4 && (
                <div className="text-xs text-ind-text-muted">
                  + {server.tools.length - 4} more...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

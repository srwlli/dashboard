'use client';

interface SetupSection {
  title: string;
  steps: string[];
  badge?: 'Required' | 'Optional';
}

const setupSections: SetupSection[] = [
  {
    title: 'Phase 1: Install MCP Servers',
    badge: 'Required',
    steps: [
      'npm install -g @anthropic/claude-mcp',
      'Clone coderef-mcp servers to ~/.mcp-servers/',
      'Verify installation: claude-mcp --version'
    ]
  },
  {
    title: 'Phase 2: Configure Claude Desktop',
    badge: 'Required',
    steps: [
      'Edit ~/.claude/claude_desktop_config.json',
      'Add coderef-workflow, coderef-context, coderef-personas servers',
      'Restart Claude Desktop to load MCP servers'
    ]
  },
  {
    title: 'Phase 3: Initialize Project Structure',
    badge: 'Required',
    steps: [
      'Run: python create-coderef-structure.py',
      'Creates coderef/ directory with workorder/, archived/, foundation/, user/, standards/',
      'Run: python scan-all.py to generate .coderef/ structure'
    ]
  },
  {
    title: 'Phase 4: Generate Foundation Docs',
    badge: 'Optional',
    steps: [
      '/coderef-foundation-docs to generate ARCHITECTURE, README, API docs',
      '/establish-standards to create UI/UX/behavior standards',
      'Review and commit documentation'
    ]
  }
];

export default function SetupTab() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">Complete setup workflow</strong> to configure CodeRef ecosystem for your project
        </p>
      </div>

      {/* Setup Sections */}
      {setupSections.map((section, idx) => (
        <div key={idx} className="p-6 bg-ind-panel border border-ind-border border-l-4 border-l-ind-accent rounded-lg space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ind-accent">{section.title}</h2>
            {section.badge && (
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                section.badge === 'Required'
                  ? 'bg-ind-accent text-white'
                  : 'bg-ind-border text-ind-text-muted'
              }`}>
                {section.badge}
              </span>
            )}
          </div>

          {/* Steps */}
          <ul className="space-y-3">
            {section.steps.map((step, stepIdx) => (
              <li key={stepIdx} className="flex items-start gap-3">
                <span className="text-ind-accent mt-1 font-bold">{stepIdx + 1}.</span>
                <div className="flex-1">
                  {step.includes('Run:') || step.includes('Edit:') ? (
                    <div className="space-y-2">
                      <p className="text-xs text-ind-text">{step.split(':')[0]}:</p>
                      <code className="block bg-ind-bg text-ind-accent px-3 py-2 rounded font-mono text-xs">
                        {step.split(':').slice(1).join(':').trim()}
                      </code>
                    </div>
                  ) : (
                    <p className="text-xs text-ind-text">{step}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Key Insight */}
      <div className="p-4 bg-ind-panel border-l-4 border-l-blue-500 rounded">
        <p className="text-xs text-ind-text">
          <strong className="text-blue-500">💡 Key Insight:</strong> After setup, use <code className="bg-ind-bg text-ind-accent px-2 py-0.5 rounded mx-1">/create-workorder</code> to start your first feature implementation workflow.
        </p>
      </div>
    </div>
  );
}

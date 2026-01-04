'use client';

interface OutputFormat {
  name: string;
  extension: string;
  description: string;
  useCases: string[];
}

const outputFormats: OutputFormat[] = [
  {
    name: 'JSON',
    extension: '.json',
    description: 'Structured data format for machine-readable output and API responses',
    useCases: [
      'index.json - Complete codebase structure',
      'plan.json - Implementation plans',
      'communication.json - Multi-agent coordination',
      'context.json - Feature requirements'
    ]
  },
  {
    name: 'Markdown',
    extension: '.md',
    description: 'Human-readable documentation format with rich formatting support',
    useCases: [
      'README.md - Project overview',
      'ARCHITECTURE.md - System design',
      'DELIVERABLES.md - Completion checklists',
      'context.md - Codebase summary'
    ]
  },
  {
    name: 'Mermaid Diagrams',
    extension: '.mmd',
    description: 'Visual diagrams for architecture and dependencies',
    useCases: [
      'architecture.mmd - Package-level architecture',
      'dependencies.mmd - Dependency graphs',
      'workflows.mmd - Process flowcharts'
    ]
  },
  {
    name: 'GraphViz DOT',
    extension: '.dot',
    description: 'Graph description language for complex visualizations',
    useCases: [
      'Full dependency trees',
      'Call graphs',
      'Module relationships'
    ]
  },
  {
    name: 'CSV',
    extension: '.csv',
    description: 'Tabular data format for spreadsheet analysis',
    useCases: [
      'Metrics export',
      'Test results',
      'Code statistics'
    ]
  },
  {
    name: 'HTML',
    extension: '.html',
    description: 'Interactive documentation with navigation and styling',
    useCases: [
      'Documentation websites',
      'Interactive reports',
      'User guides with TOC'
    ]
  }
];

export default function OutputTab() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">6 output formats</strong> for documentation, visualization, and data export
        </p>
      </div>

      {/* Output Formats */}
      {outputFormats.map((format, idx) => (
        <div key={idx} className="p-6 bg-ind-panel border border-ind-border rounded-lg space-y-3">
          {/* Header */}
          <div className="flex items-baseline gap-3 border-b border-ind-border pb-3">
            <h2 className="text-lg font-bold text-ind-accent">{format.name}</h2>
            <code className="text-xs font-mono text-ind-text-muted bg-ind-bg px-2 py-1 rounded">
              {format.extension}
            </code>
          </div>

          {/* Description */}
          <p className="text-xs text-ind-text">{format.description}</p>

          {/* Use Cases */}
          <div>
            <h3 className="text-xs font-semibold text-ind-text-muted mb-2">Common Use Cases:</h3>
            <ul className="space-y-1">
              {format.useCases.map((useCase, useCaseIdx) => (
                <li key={useCaseIdx} className="text-xs text-ind-text flex items-start gap-2">
                  <span className="text-ind-accent mt-0.5">•</span>
                  <span className="flex-1">
                    {useCase.includes('-') ? (
                      <>
                        <code className="bg-ind-bg text-ind-accent px-2 py-0.5 rounded font-mono text-xs mr-2">
                          {useCase.split('-')[0].trim()}
                        </code>
                        <span>{useCase.split('-').slice(1).join('-').trim()}</span>
                      </>
                    ) : (
                      useCase
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Export Tools */}
      <div className="p-4 bg-ind-panel border-l-4 border-l-blue-500 rounded">
        <p className="text-xs text-ind-text">
          <strong className="text-blue-500">💡 Export Tools:</strong> Use <code className="bg-ind-bg text-ind-accent px-2 py-0.5 rounded mx-1">coderef_export</code> MCP tool to export data in any format, or <code className="bg-ind-bg text-ind-accent px-2 py-0.5 rounded mx-1">coderef_diagram</code> for visual diagrams.
        </p>
      </div>
    </div>
  );
}

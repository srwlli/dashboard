'use client';

interface Workflow {
  title: string;
  time: string;
  complexity: string;
  phases: {
    title: string;
    steps: string[];
  }[];
}

const workflows: Workflow[] = [
  {
    title: 'Complete Feature Implementation (End-to-End)',
    time: '1-8+ hours',
    complexity: 'High',
    phases: [
      {
        title: 'Phase 1: Plan (5-10 min)',
        steps: [
          '/create-workorder → Gather context (interactive Q&A)',
          'Analyze project (coderef-context intelligence)',
          'Create 10-section plan.json',
          'Validate (score >= 90 recommended)'
        ]
      },
      {
        title: 'Phase 2: Execute (1-8 hours)',
        steps: [
          '/execute-plan → Generate TodoWrite tasks',
          'Activate expert persona (/ava, /marcus, etc)',
          'Implement with code context',
          'Update task status as work completes'
        ]
      },
      {
        title: 'Phase 3: Complete (2-5 min)',
        steps: [
          '/complete-workorder → Update deliverables',
          'Archive feature',
          'Git commit and push'
        ]
      }
    ]
  },
  {
    title: 'Documentation Update Workflow',
    time: '5-15 min',
    complexity: 'Medium',
    phases: [
      {
        title: 'Foundation Docs',
        steps: [
          '/coderef-foundation-docs → Generate ARCHITECTURE, README, API docs',
          '/establish-standards → Create UI/UX/behavior standards',
          'Review and commit'
        ]
      }
    ]
  },
  {
    title: 'Multi-Agent Coordination Workflow',
    time: '30 min - 2 hours',
    complexity: 'Very High',
    phases: [
      {
        title: 'Setup',
        steps: [
          'Create plan with multi_agent: true',
          '/generate-agent-communication → Auto-generate coordination file',
          'Review agent assignments'
        ]
      },
      {
        title: 'Execution',
        steps: [
          '/assign-agent-task → Assign phase to Agent 1, 2, 3...',
          'Each agent executes independently',
          '/track-agent-status → Monitor progress'
        ]
      },
      {
        title: 'Completion',
        steps: [
          '/verify-agent-completion → Validate each agent',
          '/aggregate-agent-deliverables → Combine metrics'
        ]
      }
    ]
  },
  {
    title: 'Git Release Workflow',
    time: '5-10 min',
    complexity: 'Low',
    phases: [
      {
        title: 'Release Steps',
        steps: [
          '/record-changes → Log changes to CHANGELOG.json',
          'Update version in package.json',
          'git add . && git commit',
          'git tag -a v1.0.0 -m "Release v1.0.0"',
          'git push && git push --tags'
        ]
      }
    ]
  }
];

const complexityColors: Record<string, string> = {
  'Low': 'bg-green-500/10 text-green-500',
  'Medium': 'bg-yellow-500/10 text-yellow-500',
  'High': 'bg-orange-500/10 text-orange-500',
  'Very High': 'bg-red-500/10 text-red-500'
};

export default function WorkflowsTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">14 core workflows</strong> for feature implementation, documentation, and quality assurance
        </p>
      </div>

      {/* Workflows */}
      {workflows.map((workflow, idx) => (
        <div key={idx} className="p-6 bg-ind-panel border border-ind-border rounded-lg space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-ind-border">
            <h2 className="text-lg font-bold text-ind-accent">{workflow.title}</h2>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded bg-ind-bg text-ind-text-muted font-mono">
                {workflow.time}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${complexityColors[workflow.complexity]}`}>
                {workflow.complexity}
              </span>
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            {workflow.phases.map((phase, phaseIdx) => (
              <div key={phaseIdx} className="pl-4 border-l-4 border-ind-accent bg-ind-bg p-4 rounded">
                <h3 className="text-sm font-bold text-ind-accent mb-3">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="text-xs text-ind-text flex items-start gap-2">
                      <span className="text-ind-accent mt-1">•</span>
                      <span className="flex-1">
                        {step.split('→').map((part, partIdx) => (
                          partIdx === 0 ? (
                            <code key={partIdx} className="bg-ind-accent/10 text-ind-accent px-2 py-0.5 rounded font-mono text-xs mr-2">
                              {part.trim()}
                            </code>
                          ) : (
                            <span key={partIdx}> → {part.trim()}</span>
                          )
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

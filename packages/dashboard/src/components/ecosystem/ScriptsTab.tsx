'use client';

interface Script {
  name: string;
  description: string;
  component: string;
  usedIn: string;
  location: string;
}

interface ScriptCategory {
  name: string;
  count: number;
  scripts: Script[];
}

const scriptCategories: ScriptCategory[] = [
  {
    name: 'Structure Creators',
    count: 3,
    scripts: [
      {
        name: 'create-coderef-structure.py',
        description: 'Create coderef/ directory structure (workorder/, archived/, foundation/, user/, standards/)',
        component: 'Orchestrator',
        usedIn: 'Project initialization, workorder setup',
        location: 'C:\\Users\\willh\\Desktop\\assistant\\scripts\\'
      },
      {
        name: 'scan-all.py',
        description: 'Generate minimal .coderef/ structure (2-3 files: index.json, context.md)',
        component: 'System',
        usedIn: 'Quick context generation, MCP server scans, v2 refactor',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\'
      },
      {
        name: 'populate-coderef.py',
        description: 'Generate complete .coderef/ structure (all 16 files: reports/, diagrams/, exports/)',
        component: 'System',
        usedIn: 'Full documentation pipeline, foundation docs, standards generation',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\'
      }
    ]
  },
  {
    name: 'Documentation Generators',
    count: 9,
    scripts: [
      {
        name: 'generate_docs.py',
        description: 'Generate foundation docs from .coderef/ data (README, ARCHITECTURE, API, SCHEMA, COMPONENTS)',
        component: 'System',
        usedIn: 'Documentation pipeline (stage 3), per-project doc generation',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\.coderef\\'
      },
      {
        name: 'foundation_generator.py',
        description: 'Generate foundation docs (traditional approach - reads source files directly)',
        component: 'Workflow',
        usedIn: 'coderef_foundation_docs MCP tool, legacy doc generation',
        location: 'C:\\Users\\willh\\.mcp-servers\\coderef-workflow\\generators\\'
      },
      {
        name: 'coderef_foundation_generator.py',
        description: 'Generate foundation docs (hybrid approach - uses .coderef/ data + source analysis)',
        component: 'Workflow',
        usedIn: 'coderef_foundation_docs MCP tool (preferred), v2 refactor',
        location: 'C:\\Users\\willh\\.mcp-servers\\coderef-workflow\\generators\\'
      },
      {
        name: 'enhance-standards.py',
        description: 'Generate UI/behavior/UX standards using .coderef/ data',
        component: 'System',
        usedIn: 'Documentation pipeline (stage 2), /establish-standards workflow',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\'
      },
      {
        name: 'standards_generator.py',
        description: 'Generate standards (MCP tool integration with .coderef/ fast path)',
        component: 'Workflow',
        usedIn: 'establish_standards MCP tool, consistency checking',
        location: 'C:\\Users\\willh\\.mcp-servers\\coderef-workflow\\generators\\'
      },
      {
        name: 'diagram-generator.py',
        description: 'Generate visual diagrams from codebase structure (Mermaid/DOT)',
        component: 'System',
        usedIn: 'Documentation pipeline (stage 4), coderef_diagram MCP tool',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\'
      },
      {
        name: 'mermaid_formatter.py',
        description: 'Format Mermaid diagrams',
        component: 'Workflow',
        usedIn: 'Diagram formatting, visual dependency graphs',
        location: 'C:\\Users\\willh\\.mcp-servers\\coderef-workflow\\generators\\'
      }
    ]
  },
  {
    name: 'Data Processing',
    count: 4,
    scripts: [
      {
        name: 'parse_coderef_data.py',
        description: 'Preprocess large index files (summarizes .coderef/index.json for large codebases)',
        component: 'System',
        usedIn: 'Documentation pipeline (stage 2), large codebase optimization',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\packages\\ (149 LOC)'
      },
      {
        name: 'extract-context.py',
        description: 'Extract context from source files',
        component: 'System',
        usedIn: 'Context extraction, metadata generation',
        location: 'C:\\Users\\willh\\Desktop\\projects\\coderef-system\\scripts\\'
      }
    ]
  }
];

const componentBadgeColors: Record<string, string> = {
  'Orchestrator': 'bg-purple-500/10 text-purple-500',
  'System': 'bg-cyan-500/10 text-cyan-500',
  'Workflow': 'bg-green-500/10 text-green-500',
  'Docs': 'bg-blue-500/10 text-blue-500',
};

export default function ScriptsTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="p-4 bg-ind-bg border border-ind-border rounded-lg">
        <p className="text-sm text-ind-text-muted">
          <strong className="text-ind-text">Total Scripts: 50+</strong> across 7 locations
        </p>
      </div>

      {/* Categories */}
      {scriptCategories.map((category) => (
        <div key={category.name} className="space-y-3">
          <h2 className="text-lg font-semibold text-ind-text flex items-center gap-2">
            {category.name}
            <span className="text-xs px-2 py-1 rounded bg-ind-accent/10 text-ind-accent">
              {category.count} scripts
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ind-border">
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Script</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Description</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Component</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Used In</th>
                  <th className="text-left p-3 text-xs font-semibold text-ind-text-muted">Location</th>
                </tr>
              </thead>
              <tbody>
                {category.scripts.map((script) => (
                  <tr key={script.name} className="border-b border-ind-border hover:bg-ind-bg/50 transition-colors">
                    <td className="p-3">
                      <code className="text-xs font-mono text-ind-accent bg-ind-accent/10 px-2 py-1 rounded">
                        {script.name}
                      </code>
                    </td>
                    <td className="p-3 text-xs text-ind-text">{script.description}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${componentBadgeColors[script.component] || 'bg-ind-bg text-ind-text-muted'}`}>
                        {script.component}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-ind-text-muted">{script.usedIn}</td>
                    <td className="p-3 text-xs text-ind-text-muted font-mono truncate max-w-xs">{script.location}</td>
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

'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import { Network, Package, Zap, GitBranch } from 'lucide-react';

/**
 * Ecosystem Page
 * Overview of CodeRef ecosystem tools and integrations
 */
export default function EcosystemPage() {
  const ecosystemTools = [
    {
      name: 'CodeRef MCP Server',
      description: 'Model Context Protocol server for AI-assisted development',
      icon: Zap,
      status: 'Active',
    },
    {
      name: 'Papertrail',
      description: 'Workorder tracking and documentation trail system',
      icon: GitBranch,
      status: 'Active',
    },
    {
      name: 'CodeRef Workflow',
      description: 'Project structure and workflow standards',
      icon: Package,
      status: 'Active',
    },
  ];

  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">
              Ecosystem
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              CodeRef ecosystem tools, integrations, and workflow systems.
            </p>
          </div>

          {/* Ecosystem Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {ecosystemTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="
                    p-4 sm:p-6 rounded-lg
                    bg-ind-panel border border-ind-border
                    hover:bg-ind-bg hover:border-ind-accent/50
                    transition-all duration-200
                  "
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded bg-ind-accent/10">
                      <Icon className="w-5 h-5 text-ind-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ind-text mb-1">
                        {tool.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-500">
                        {tool.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-ind-text-muted">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Integration Status */}
          <div className="mt-8 p-4 sm:p-6 rounded-lg bg-ind-bg border border-ind-border">
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-ind-accent" />
              <h2 className="text-lg font-semibold text-ind-text">
                Integration Status
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ind-text-muted">MCP Server Connection</span>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ind-text-muted">Papertrail Sync</span>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ind-text-muted">Workflow Engine</span>
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                  Running
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageCard>
    </PageLayout>
  );
}

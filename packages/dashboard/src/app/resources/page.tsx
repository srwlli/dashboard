'use client';

import { useState } from 'react';
import { Terminal, Wrench, FileCode, GitBranch, Settings, FileOutput } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import TabNavigation from '@/components/TabNavigation';
import CommandsTab from '@/components/resources/CommandsTab';
import ToolsTab from '@/components/resources/ToolsTab';
import ScriptsTab from '@/components/resources/ScriptsTab';
import WorkflowsTab from '@/components/resources/WorkflowsTab';
import SetupTab from '@/components/resources/SetupTab';
import OutputTab from '@/components/resources/OutputTab';

/**
 * Resources Page
 * CodeRef resources: commands, tools, scripts, workflows, and documentation
 */
export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('commands');

  const tabs = [
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'scripts', label: 'Scripts', icon: FileCode },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'output', label: 'Output', icon: FileOutput },
  ];

  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">
              Resources
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              Complete reference for CodeRef commands, tools, workflows, and documentation.
            </p>
          </div>

          {/* Tab Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {activeTab === 'commands' && <CommandsTab />}
          {activeTab === 'tools' && <ToolsTab />}
          {activeTab === 'scripts' && <ScriptsTab />}
          {activeTab === 'workflows' && <WorkflowsTab />}
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'output' && <OutputTab />}
        </div>
      </PageCard>
    </PageLayout>
  );
}

'use client';

import { useState } from 'react';
import { Clipboard, Lightbulb, BookOpen, RotateCw } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import TabNavigation from '@/components/TabNavigation';
import FilterBar, { FilterConfig } from '@/components/FilterBar';
import WorkorderList from '@/components/WorkorderList';
import StubList from '@/components/StubList';
import StatsCard from '@/components/StatsCard';
import { useWorkorders } from '@/hooks/useWorkorders';
import { useStubs } from '@/hooks/useStubs';

/**
 * Assistant Route
 * AI-powered assistant dashboard with workorders, stubs, and documentation
 */
export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<string>('workorders');
  const [workorderFilters, setWorkorderFilters] = useState<FilterConfig>({});
  const [stubFilters, setStubFilters] = useState<FilterConfig>({});

  const { workorders, isLoading: workordersLoading, error: workordersError, byProject, byStatus } = useWorkorders();
  const { stubs, isLoading: stubsLoading, error: stubsError, total: stubsTotal } = useStubs();

  const tabs = [
    { id: 'workorders', label: 'Workorders', icon: Clipboard },
    { id: 'stubs', label: 'Stubs', icon: Lightbulb },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  // Extract unique projects for filtering
  const projectOptions = Object.keys(byProject || {}).sort();
  const workorderStatusOptions = Object.keys(byStatus || {}).sort();
  const stubStatusOptions = ['stub', 'planned', 'in_progress', 'completed'];
  const stubPriorityOptions = ['low', 'medium', 'high', 'critical'];
  const stubCategoryOptions = ['feature', 'fix', 'improvement', 'idea', 'refactor', 'test'];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ind-text mb-2">Assistant</h1>
            <p className="text-sm text-ind-text-muted">
              Track workorders across projects, view implementation stubs, and manage documentation.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (activeTab === 'workorders') {
                  // Refetch workorders
                  const event = new Event('refetch-workorders');
                  window.dispatchEvent(event);
                }
                if (activeTab === 'stubs') {
                  // Refetch stubs
                  const event = new Event('refetch-stubs');
                  window.dispatchEvent(event);
                }
              }}
              className="
                px-4 py-2 rounded
                bg-ind-bg border border-ind-border
                text-ind-text hover:text-ind-accent hover:border-ind-accent
                transition-colors duration-200
                text-sm font-medium
              "
            >
              <RotateCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Workorders Tab */}
        {activeTab === 'workorders' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Sidebar */}
            <div>
              <FilterBar
                onFilterChange={setWorkorderFilters}
                statusOptions={workorderStatusOptions}
                projectOptions={projectOptions}
                showSearch={true}
              />

              {/* Stats */}
              {!workordersLoading && workorders.length > 0 && (
                <StatsCard
                  title="Stats"
                  items={Object.entries(byStatus || {}).map(([status, count]) => ({
                    label: status.replace(/_/g, ' '),
                    count: count as number,
                  }))}
                  total={workorders.length}
                />
              )}
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <WorkorderList
                workorders={workorders}
                filters={workorderFilters}
                isLoading={workordersLoading}
                error={workordersError}
                onWorkorderClick={(id) => console.log('Clicked workorder:', id)}
              />
            </div>
          </div>
        )}

        {/* Stubs Tab */}
        {activeTab === 'stubs' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Sidebar */}
            <div>
              <FilterBar
                onFilterChange={setStubFilters}
                statusOptions={stubStatusOptions}
                priorityOptions={stubPriorityOptions}
                categoryOptions={stubCategoryOptions}
                showSearch={true}
              />

              {/* Stats */}
              {!stubsLoading && stubs.length > 0 && (
                <StatsCard
                  title="Stats"
                  items={[]}
                  total={stubsTotal}
                />
              )}
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <StubList
                stubs={stubs}
                filters={stubFilters}
                isLoading={stubsLoading}
                error={stubsError}
                onStubClick={(name) => console.log('Clicked stub:', name)}
              />
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'documentation' && (
          <div className="p-6 rounded-lg bg-ind-panel border border-ind-border">
            <div className="text-center">
              <p className="text-sm text-ind-text-muted mb-2">📚</p>
              <h2 className="text-lg font-semibold text-ind-text mb-2">Documentation</h2>
              <p className="text-sm text-ind-text-muted">
                Project documentation and guides coming soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

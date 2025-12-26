'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import TabNavigation from '@/components/TabNavigation';
import FilterBar, { FilterConfig } from '@/components/FilterBar';
import WorkorderList from '@/components/WorkorderList';
import StubList from '@/components/StubList';
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
    { id: 'workorders', label: 'Workorders', icon: '📋' },
    { id: 'stubs', label: 'Stubs', icon: '💡' },
    { id: 'documentation', label: 'Documentation', icon: '📚' },
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
        <div>
          <h1 className="text-3xl font-bold text-ind-text mb-2">Assistant</h1>
          <p className="text-sm text-ind-text-muted">
            Track workorders across projects, view implementation stubs, and manage documentation.
          </p>
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
                <div className="mt-6 space-y-2 p-4 rounded-lg bg-ind-panel border border-ind-border/50">
                  <h3 className="text-xs font-semibold text-ind-text-muted uppercase">Stats</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-ind-text">
                      Total: <span className="font-semibold text-ind-accent">{workorders.length}</span>
                    </p>
                    {Object.entries(byStatus || {}).map(([status, count]) => (
                      <p key={status} className="text-xs text-ind-text-muted">
                        {status.replace(/_/g, ' ')}: <span className="text-ind-text font-medium">{count}</span>
                      </p>
                    ))}
                  </div>
                </div>
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
                <div className="mt-6 space-y-2 p-4 rounded-lg bg-ind-panel border border-ind-border/50">
                  <h3 className="text-xs font-semibold text-ind-text-muted uppercase">Stats</h3>
                  <p className="text-sm text-ind-text">
                    Total: <span className="font-semibold text-ind-accent">{stubsTotal}</span>
                  </p>
                </div>
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

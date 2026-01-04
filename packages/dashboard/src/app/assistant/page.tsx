'use client';

import { useState } from 'react';
import { Clipboard, Lightbulb, RotateCw } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import TabNavigation from '@/components/TabNavigation';
import WorkorderList from '@/components/WorkorderList';
import StubList from '@/components/StubList';
import { useWorkorders } from '@/hooks/useWorkorders';
import { useStubs } from '@/hooks/useStubs';

/**
 * Assistant Route
 * AI-powered assistant dashboard with workorders and stubs
 */
export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<string>('workorders');

  const { workorders, byStatus, isLoading: workordersLoading, error: workordersError } = useWorkorders();
  const { stubs, isLoading: stubsLoading, error: stubsError } = useStubs();

  // Calculate stub breakdowns for inline stats
  const stubsByStatus = {
    stub: stubs.filter(s => s.status === 'stub').length,
    planned: stubs.filter(s => s.status === 'planned').length,
    in_progress: stubs.filter(s => s.status === 'in_progress').length,
    completed: stubs.filter(s => s.status === 'completed').length,
  };

  const stubsByPriority = {
    low: stubs.filter(s => s.priority === 'low').length,
    medium: stubs.filter(s => s.priority === 'medium').length,
    high: stubs.filter(s => s.priority === 'high').length,
    critical: stubs.filter(s => s.priority === 'critical').length,
  };

  const tabs = [
    { id: 'workorders', label: 'Workorders', icon: Clipboard },
    { id: 'stubs', label: 'Stubs', icon: Lightbulb },
  ];

  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 min-w-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Assistant</h1>
              <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
                Track workorders across projects, view implementation stubs, and manage documentation.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
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
                  px-3 sm:px-4 py-2 rounded
                  bg-ind-bg border border-ind-border
                  text-ind-text hover:text-ind-accent hover:border-ind-accent
                  transition-colors duration-200
                  text-xs sm:text-sm font-medium
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
            <div>
              {/* Inline Stats Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-ind-border/30">
                {/* Total */}
                <div className="text-xs sm:text-sm">
                  <span className="text-ind-text-muted">Total:</span>
                  <span className="ml-1 font-semibold text-ind-accent">{workorders.length}</span>
                </div>

                {/* Status Breakdown */}
                {Object.keys(byStatus || {}).length > 0 && (
                  <>
                    <div className="h-3 w-px bg-ind-border/50"></div>
                    {Object.entries(byStatus || {}).map(([status, count]) => (
                      <div key={status} className="text-xs sm:text-sm">
                        <span className="text-ind-text-muted capitalize">{status.replace(/_/g, ' ')}:</span>
                        <span className="ml-1 font-medium text-ind-text">{count}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Content */}
              <div>
                <WorkorderList
                  workorders={workorders}
                  isLoading={workordersLoading}
                  error={workordersError}
                  onWorkorderClick={(id) => console.log('Clicked workorder:', id)}
                />
              </div>
            </div>
          )}

          {/* Stubs Tab */}
          {activeTab === 'stubs' && (
            <div className="min-w-0 overflow-hidden">
              {/* Inline Stats Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-ind-border/30">
                {/* Total */}
                <div className="text-xs sm:text-sm">
                  <span className="text-ind-text-muted">Total:</span>
                  <span className="ml-1 font-semibold text-ind-accent">{stubs.length}</span>
                </div>

                {/* Status Breakdown */}
                {stubs.length > 0 && (
                  <>
                    <div className="h-3 w-px bg-ind-border/50"></div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Stub:</span>
                      <span className="ml-1 font-medium text-ind-text">{stubsByStatus.stub}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Planned:</span>
                      <span className="ml-1 font-medium text-ind-text">{stubsByStatus.planned}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">In Progress:</span>
                      <span className="ml-1 font-medium text-ind-text">{stubsByStatus.in_progress}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Completed:</span>
                      <span className="ml-1 font-medium text-ind-text">{stubsByStatus.completed}</span>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="h-3 w-px bg-ind-border/50"></div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Critical:</span>
                      <span className="ml-1 font-medium text-red-400">{stubsByPriority.critical}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">High:</span>
                      <span className="ml-1 font-medium text-orange-400">{stubsByPriority.high}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Medium:</span>
                      <span className="ml-1 font-medium text-yellow-400">{stubsByPriority.medium}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-ind-text-muted">Low:</span>
                      <span className="ml-1 font-medium text-green-400">{stubsByPriority.low}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0">
                <StubList
                  stubs={stubs}
                  isLoading={stubsLoading}
                  error={stubsError}
                  onStubClick={(name) => console.log('Clicked stub:', name)}
                />
              </div>
            </div>
          )}
        </div>
      </PageCard>
    </PageLayout>
  );
}

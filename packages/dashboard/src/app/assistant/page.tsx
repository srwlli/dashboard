'use client';

import { useState } from 'react';
import { Clipboard, Lightbulb, BookOpen, RotateCw } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import TabNavigation from '@/components/TabNavigation';
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

  const { workorders, isLoading: workordersLoading, error: workordersError } = useWorkorders();
  const { stubs, isLoading: stubsLoading, error: stubsError } = useStubs();

  const tabs = [
    { id: 'workorders', label: 'Workorders', icon: Clipboard },
    { id: 'stubs', label: 'Stubs', icon: Lightbulb },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <PageLayout>
      {/* Card with corner accents wrapping all assistant content */}
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

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
      </div>
    </PageLayout>
  );
}

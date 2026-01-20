'use client';

import { useState, useMemo } from 'react';
import { Clipboard, Lightbulb, RotateCw, ArrowUpDown } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import TabNavigation from '@/components/TabNavigation';
import WorkorderList from '@/components/WorkorderList';
import StubList from '@/components/StubList';
import WorkorderDetailModal from '@/components/WorkorderDetailModal';
import StubDetailModal from '@/components/StubDetailModal';
import { useWorkorders } from '@/hooks/useWorkorders';
import { useStubs } from '@/hooks/useStubs';
import { StubObject } from '@/types/stubs';

type SortOrder = 'newest' | 'oldest';

/**
 * Assistant Route
 * AI-powered assistant dashboard with workorders and stubs
 */
export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<string>('workorders');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Modal state
  const [selectedWorkorderId, setSelectedWorkorderId] = useState<string | null>(null);
  const [selectedStub, setSelectedStub] = useState<StubObject | null>(null);
  const [isWorkorderModalOpen, setIsWorkorderModalOpen] = useState(false);
  const [isStubModalOpen, setIsStubModalOpen] = useState(false);

  const { workorders, byStatus, isLoading: workordersLoading, error: workordersError } = useWorkorders();
  const { stubs, isLoading: stubsLoading, error: stubsError } = useStubs();

  // Sort workorders by date
  const sortedWorkorders = useMemo(() => {
    const sorted = [...workorders].sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [workorders, sortOrder]);

  // Sort stubs by date
  const sortedStubs = useMemo(() => {
    const sorted = [...stubs].sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [stubs, sortOrder]);

  // Calculate stub breakdowns for inline stats
  const stubsByStatus = {
    stub: sortedStubs.filter(s => s.status === 'stub').length,
    planned: sortedStubs.filter(s => s.status === 'planned').length,
    in_progress: sortedStubs.filter(s => s.status === 'in_progress').length,
    completed: sortedStubs.filter(s => s.status === 'completed').length,
  };

  const stubsByPriority = {
    low: sortedStubs.filter(s => s.priority === 'low').length,
    medium: sortedStubs.filter(s => s.priority === 'medium').length,
    high: sortedStubs.filter(s => s.priority === 'high').length,
    critical: sortedStubs.filter(s => s.priority === 'critical').length,
  };

  const tabs = [
    { id: 'workorders', label: 'Workorders', icon: Clipboard },
    { id: 'stubs', label: 'Stubs', icon: Lightbulb },
  ];

  // Click handlers
  const handleWorkorderClick = (workorderId: string) => {
    setSelectedWorkorderId(workorderId);
    setIsWorkorderModalOpen(true);
  };

  const handleStubClick = (featureName: string) => {
    const stub = sortedStubs.find(s => s.feature_name === featureName);
    if (stub) {
      setSelectedStub(stub);
      setIsStubModalOpen(true);
    }
  };

  const closeWorkorderModal = () => {
    setIsWorkorderModalOpen(false);
    setSelectedWorkorderId(null);
  };

  const closeStubModal = () => {
    setIsStubModalOpen(false);
    setSelectedStub(null);
  };

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

          {/* Sort Order Toggle */}
          <div className="bg-ind-panel border border-ind-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-ind-text-muted" />
                <label className="text-xs font-semibold text-ind-text-muted">Sort by Date</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('newest')}
                  className={`
                    text-xs px-3 py-1 rounded-full transition-all duration-200
                    ${sortOrder === 'newest'
                      ? 'bg-ind-accent text-black font-semibold'
                      : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  Newest First
                </button>
                <button
                  onClick={() => setSortOrder('oldest')}
                  className={`
                    text-xs px-3 py-1 rounded-full transition-all duration-200
                    ${sortOrder === 'oldest'
                      ? 'bg-ind-accent text-black font-semibold'
                      : 'bg-ind-bg text-ind-text-muted border border-ind-border hover:border-ind-accent/50'
                    }
                  `}
                >
                  Oldest First
                </button>
              </div>
            </div>
          </div>

          {/* Workorders Tab */}
          {activeTab === 'workorders' && (
            <div>
              {/* Inline Stats Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 pb-3 border-b border-ind-border/30">
                {/* Total */}
                <div className="text-xs sm:text-sm">
                  <span className="text-ind-text-muted">Total:</span>
                  <span className="ml-1 font-semibold text-ind-accent">{sortedWorkorders.length}</span>
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
                  workorders={sortedWorkorders}
                  isLoading={workordersLoading}
                  error={workordersError}
                  onWorkorderClick={handleWorkorderClick}
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
                  <span className="ml-1 font-semibold text-ind-accent">{sortedStubs.length}</span>
                </div>

                {/* Status Breakdown */}
                {sortedStubs.length > 0 && (
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
                  stubs={sortedStubs}
                  isLoading={stubsLoading}
                  error={stubsError}
                  onStubClick={handleStubClick}
                />
              </div>
            </div>
          )}
        </div>
      </PageCard>

      {/* Modals */}
      <WorkorderDetailModal
        workorderId={selectedWorkorderId}
        isOpen={isWorkorderModalOpen}
        onClose={closeWorkorderModal}
      />

      <StubDetailModal
        stub={selectedStub}
        isOpen={isStubModalOpen}
        onClose={closeStubModal}
      />
    </PageLayout>
  );
}

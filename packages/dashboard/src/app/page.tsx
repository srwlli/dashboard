'use client';

import { PageLayout } from '@/components/PageLayout';
import StatsCard from '@/components/StatsCard';
import { useWorkorders } from '@/hooks/useWorkorders';
import { useStubs } from '@/hooks/useStubs';

/**
 * Dashboard Page
 * Main interface showing stats for workorders and stubs
 */
export default function Home() {
  const { workorders, byStatus } = useWorkorders();
  const { stubs } = useStubs();

  const workorderStats = Object.entries(byStatus || {}).map(([status, count]) => ({
    label: status.replace(/_/g, ' '),
    count: count as number,
  }));

  const stubStats = stubs.length > 0 ? [{ label: 'Total Stubs', count: stubs.length }] : [];

  return (
    <PageLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
            Overview of your workorders and implementation stubs across all projects.
          </p>
        </div>

        {/* Card with corner accents wrapping dashboard components */}
        <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            <StatsCard
              title="Workorders"
              items={workorderStats}
              total={workorders.length}
            />
            <StatsCard
              title="Stubs"
              items={stubStats}
              total={stubs.length}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

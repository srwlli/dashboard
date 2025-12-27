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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ind-text mb-2">Dashboard</h1>
          <p className="text-sm text-ind-text-muted">
            Overview of your workorders and implementation stubs across all projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </PageLayout>
  );
}

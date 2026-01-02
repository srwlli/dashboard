'use client';

import { ProjectListCard } from './ProjectListCard';
import { ConsoleTabs } from './ConsoleTabs';
import { ActionBar } from './ActionBar';

/**
 * Scanner Component
 * Main scanner interface with 12-column responsive grid
 * - ProjectListCard: 8 columns on desktop
 * - ConsoleTabs: 4 columns on desktop
 * - ActionBar: 12 columns (full width)
 */
export function Scanner() {
  return (
    <div className="space-y-6">
      {/* Main Grid: 12 columns on desktop, stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Project List (8 columns on desktop) */}
        <div className="lg:col-span-8 min-h-[500px]">
          <ProjectListCard />
        </div>

        {/* Right Panel: Console Tabs (4 columns on desktop) */}
        <div className="lg:col-span-4 min-h-[500px]">
          <ConsoleTabs />
        </div>
      </div>

      {/* Bottom Action Bar (full width) */}
      <div className="lg:col-span-12">
        <ActionBar />
      </div>
    </div>
  );
}

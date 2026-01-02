'use client';

import { useState } from 'react';
import { ProjectListCard } from './ProjectListCard';
import { ConsoleTabs } from './ConsoleTabs';
import { ActionBar } from './ActionBar';

/**
 * Scanner Component
 * Main scanner interface with dashboard-consistent styling
 * - Corner accent borders matching dashboard design
 * - 12-column responsive grid (8-4 split on desktop)
 * - Full-width action bar at bottom
 */
export function Scanner() {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [scanId, setScanId] = useState<string | null>(null);

  function handleScanStart(newScanId: string) {
    setScanId(newScanId);
  }

  return (
    <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Scanner</h1>
          <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
            Scan projects to discover CodeRef structure and workorders.
          </p>
        </div>

        {/* Main Grid: 12 columns on desktop, stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel: Project List (8 columns on desktop) */}
          <div className="lg:col-span-8 min-h-[500px]">
            <ProjectListCard onSelectionChange={setSelectedProjectIds} />
          </div>

          {/* Right Panel: Console Tabs (4 columns on desktop) */}
          <div className="lg:col-span-4 min-h-[500px]">
            <ConsoleTabs scanId={scanId} />
          </div>
        </div>

        {/* Bottom Action Bar (full width) */}
        <div className="lg:col-span-12">
          <ActionBar selectedProjectIds={selectedProjectIds} onScanStart={handleScanStart} />
        </div>
      </div>
    </div>
  );
}

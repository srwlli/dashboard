'use client';

import { useState } from 'react';
import { PageCard } from '@/components/PageCard';
import { ProjectListCard } from './ProjectListCard';
import { ConsoleTabs } from './ConsoleTabs';
import { ActionBar } from './ActionBar';

interface ProjectSelection {
  directories: boolean;
  scan: boolean;
  populate: boolean;
}

/**
 * Scanner Component
 * Main scanner interface with dashboard-consistent styling
 * - Uses PageCard for corner accents and full-viewport fill
 * - 12-column responsive grid (8-4 split on desktop)
 * - Full-width action bar at bottom
 */
export function Scanner() {
  const [selections, setSelections] = useState<Map<string, ProjectSelection>>(new Map());
  const [scanId, setScanId] = useState<string | null>(null);

  function handleScanStart(newScanId: string) {
    setScanId(newScanId);
  }

  return (
    <PageCard>
      <div className="space-y-6 sm:space-y-8">
        {/* Main Grid: 12 columns on desktop, stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel: Project List (8 columns on desktop) */}
          <div className="lg:col-span-8 h-[500px]">
            <ProjectListCard onSelectionChange={setSelections} />
          </div>

          {/* Right Panel: Console Tabs (4 columns on desktop) */}
          <div className="lg:col-span-4 h-[500px]">
            <ConsoleTabs scanId={scanId} />
          </div>
        </div>

        {/* Bottom Action Bar (full width) */}
        <div className="lg:col-span-12">
          <ActionBar
            selections={selections}
            onScanStart={handleScanStart}
          />
        </div>
      </div>
    </PageCard>
  );
}

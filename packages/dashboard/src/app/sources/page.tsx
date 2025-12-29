'use client';

import { PageLayout } from '@/components/PageLayout';
import ComingSoon from '@/components/ComingSoon';

/**
 * Sources Route
 * Repository of source materials, code references, and documentation assets
 */
export default function SourcesPage() {
  return (
    <PageLayout>
      {/* Card with corner accents wrapping all sources content */}
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

        <ComingSoon
          title="Sources"
          description="Repository of source materials, code references, and documentation assets for your projects."
          eta="Q1 2025"
        />
      </div>
    </PageLayout>
  );
}

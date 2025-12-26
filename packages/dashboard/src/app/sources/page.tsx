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
      <ComingSoon
        title="Sources"
        description="Repository of source materials, code references, and documentation assets for your projects."
        eta="Q1 2025"
      />
    </PageLayout>
  );
}

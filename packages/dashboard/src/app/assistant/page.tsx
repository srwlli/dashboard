'use client';

import { PageLayout } from '@/components/PageLayout';
import ComingSoon from '@/components/ComingSoon';

/**
 * Assistant Route
 * AI-powered assistant dashboard with workorders, stubs, and documentation
 */
export default function AssistantPage() {
  return (
    <PageLayout>
      <ComingSoon
        title="Assistant"
        description="AI-powered assistant dashboard for viewing workorders, implementation stubs, and project documentation."
        eta="Q1 2025"
      />
    </PageLayout>
  );
}

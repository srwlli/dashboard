'use client';

import { PageLayout } from '@/components/PageLayout';
import { ComingSoon } from '@/components/ComingSoon';

/**
 * Dashboard Page
 * Main interface with coming soon placeholder
 */
export default function Home() {
  return (
    <PageLayout title="CodeRef Dashboard">
      <ComingSoon
        title="Dashboard"
        description="Your personalized CodeRef dashboard is being built. Access the full prompting workflow via the Prompts page."
        eta="Q1 2025"
      />
    </PageLayout>
  );
}

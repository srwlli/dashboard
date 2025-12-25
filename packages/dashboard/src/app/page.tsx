'use client';

import { PageLayout } from '@/components/PageLayout';
import { PromptingWorkflow } from '@/components/PromptingWorkflow';

/**
 * Dashboard Page
 * Main interface displaying prompting workflow
 */
export default function Home() {
  return (
    <PageLayout title="CodeRef Dashboard">
      <PromptingWorkflow />
    </PageLayout>
  );
}

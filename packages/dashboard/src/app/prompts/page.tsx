'use client';

import { PageLayout } from '@/components/PageLayout';
import { PromptingWorkflow } from '@/components/PromptingWorkflow';

/**
 * Prompts Page
 * Dedicated interface for the prompting workflow
 */
export default function PromptsPage() {
  return (
    <PageLayout>
      <PromptingWorkflow />
    </PageLayout>
  );
}

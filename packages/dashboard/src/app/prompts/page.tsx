'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import { PromptingWorkflow } from '@/components/PromptingWorkflow';

/**
 * Prompts Page
 * Prompting workflow tools for AI-assisted development
 */
export default function PromptsPage() {
  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Prompts</h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              Prompting workflow tools for structuring and executing AI-powered development tasks.
            </p>
          </div>

          {/* Prompting Workflow Tools */}
          <PromptingWorkflow />
        </div>
      </PageCard>
    </PageLayout>
  );
}

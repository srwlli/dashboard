'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import SessionManager from '@/components/SessionManager';
import { PromptingWorkflow } from '@/components/PromptingWorkflow';

/**
 * Session Page
 * Coordination hub for managing active sessions with context, agents, and tasks
 */
export default function SessionPage() {
  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Session</h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              Coordination hub for managing active sessions with context, agents, and tasks.
            </p>
          </div>

          {/* Session Manager */}
          <SessionManager />

          {/* Prompting Workflow Tools */}
          <PromptingWorkflow />
        </div>
      </PageCard>
    </PageLayout>
  );
}

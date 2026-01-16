'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';

/**
 * Assistant Route - New Version
 * Placeholder for redesigned assistant interface
 */
export default function AssistantPage() {
  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-ind-text mb-2">Assistant</h1>
            <p className="text-base text-ind-text-muted">
              New assistant interface - under development
            </p>
          </div>
        </div>
      </PageCard>
    </PageLayout>
  );
}

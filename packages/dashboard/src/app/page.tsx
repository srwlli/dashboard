'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';

/**
 * Dashboard Page
 * Main landing page for CodeRef Dashboard
 */
export default function Home() {
  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">Dashboard</h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              Welcome to CodeRef Dashboard - your centralized development resource hub.
            </p>
          </div>
        </div>
      </PageCard>
    </PageLayout>
  );
}

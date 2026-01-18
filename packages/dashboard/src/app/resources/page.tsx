'use client';

import { PageLayout } from '@/components/PageLayout';
import { PageCard } from '@/components/PageCard';
import DynamicResourcesTable from '@/components/resources/DynamicResourcesTable';

/**
 * Resources Page - Dynamic CSV-Driven
 *
 * Displays all resources from coderef/tools-and-commands.csv
 * - 346+ resources across 10 types
 * - Real-time updates (30s polling)
 * - Advanced filtering (Type, Server, Category, Status)
 * - Search by name/description
 *
 * CSV Location: packages/dashboard/src/app/resources/coderef/tools-and-commands.csv
 * API Route: /api/resources
 */
export default function ResourcesPage() {
  return (
    <PageLayout>
      <PageCard>
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-ind-text mb-2">
              Resources
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-ind-text-muted">
              Complete reference for CodeRef ecosystem: commands, tools, scripts, workflows, schemas, and documentation.
            </p>
          </div>

          {/* Dynamic Resources Table */}
          <DynamicResourcesTable refreshInterval={30000} />
        </div>
      </PageCard>
    </PageLayout>
  );
}

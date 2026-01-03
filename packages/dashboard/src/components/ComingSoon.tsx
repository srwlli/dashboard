'use client';

import { PageCard } from './PageCard';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Feature description
   */
  description: string;
  /**
   * Estimated delivery timeframe
   */
  eta?: string;
}

/**
 * ComingSoon Component
 * Placeholder for unfinished pages with industrial design
 * Uses PageCard for consistent corner accents and styling
 *
 * @example
 * ```tsx
 * <ComingSoon
 *   title="Settings"
 *   description="Manage user preferences and application configuration."
 *   eta="Q1 2025"
 * />
 * ```
 */
export function ComingSoon({ title, description, eta }: ComingSoonProps) {
  return (
    <PageCard>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        {/* Icon */}
        <div className="w-20 h-20 bg-ind-bg border-2 border-ind-border flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-ind-accent" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ind-text mb-4">
          {title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-ind-text-muted max-w-md mb-6">
          {description}
        </p>

        {/* ETA Badge */}
        {eta && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ind-bg border border-ind-border">
            <span className="text-xs uppercase tracking-wider text-ind-text-muted font-mono">
              Expected:
            </span>
            <span className="text-sm font-bold text-ind-accent">
              {eta}
            </span>
          </div>
        )}

        {/* Status Message */}
        <div className="mt-8 px-4 py-3 bg-ind-bg border border-ind-accent/30 max-w-lg">
          <p className="text-xs text-ind-text-muted">
            🚧 This feature is currently under development. Check back soon for updates.
          </p>
        </div>
      </div>
    </PageCard>
  );
}

export default ComingSoon;

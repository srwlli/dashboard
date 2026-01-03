'use client';

import { ReactNode } from 'react';

interface PageCardProps {
  children: ReactNode;
  /**
   * Whether to apply minimum full viewport height
   * When true, card fills available screen space even with short content
   * Default: true
   */
  fillViewport?: boolean;
  /**
   * Whether to show corner accents
   * Default: true
   */
  showAccents?: boolean;
  /**
   * Custom padding (Tailwind class)
   * Default: 'p-8'
   */
  padding?: string;
}

/**
 * PageCard Component
 * Reusable container with corner accents and optional full-viewport fill
 *
 * Features:
 * - Corner accent borders (4 corners with ind-accent color)
 * - Full viewport height when content is short (min-h-full)
 * - Responsive padding
 * - Consistent ind-panel background and border styling
 *
 * Usage:
 * ```tsx
 * <PageCard>
 *   <h1>Page Title</h1>
 *   <p>Content...</p>
 * </PageCard>
 * ```
 *
 * The min-h-full pattern ensures the card stretches to fill the parent container
 * (which is the <main> element with flex-1 in RootClientWrapper).
 * This creates a polished full-screen appearance even with minimal content.
 */
export function PageCard({
  children,
  fillViewport = true,
  showAccents = true,
  padding = 'p-8'
}: PageCardProps) {
  return (
    <div
      className={`
        bg-ind-panel
        border-2
        border-ind-border
        ${padding}
        relative
        ${fillViewport ? 'min-h-full' : ''}
      `.trim().replace(/\s+/g, ' ')}
    >
      {showAccents && (
        <>
          {/* Top-left corner accent */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
          {/* Top-right corner accent */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>
          {/* Bottom-left corner accent */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
          {/* Bottom-right corner accent */}
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>
        </>
      )}

      {children}
    </div>
  );
}

export default PageCard;

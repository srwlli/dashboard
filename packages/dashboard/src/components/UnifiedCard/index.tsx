'use client';

import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

export interface UnifiedCardProps {
  /** Icon to display in header */
  icon: LucideIcon;
  /** Tailwind color class for icon */
  iconColor: string;
  /** Card title */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional description text (with line clamp) */
  description?: string;
  /** Optional content for right side of header */
  headerRight?: ReactNode;
  /** Content for left side of footer */
  footerLeft: ReactNode;
  /** Content for right side of footer */
  footerRight: ReactNode;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * UnifiedCard - Shared card component for consistent UI across stub and workorder cards
 *
 * Eliminates code duplication and ensures visual consistency.
 * Both StubCard and WorkorderCard use this as their foundation.
 */
export function UnifiedCard({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  description,
  headerRight,
  footerLeft,
  footerRight,
  onClick,
}: UnifiedCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 sm:p-4 rounded-lg
        bg-ind-panel border border-ind-border
        transition-all duration-200
        overflow-hidden
        ${onClick ? 'cursor-pointer hover:bg-ind-bg hover:border-ind-accent/50' : ''}
      `}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Icon className={`w-4 h-4 sm:w-5 sm:h-4 shrink-0 ${iconColor}`} />
            <h3 className="text-xs sm:text-sm font-semibold text-ind-text truncate min-w-0">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-ind-text-muted truncate">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-xs text-ind-text-muted line-clamp-2 break-words overflow-hidden mt-2">
              {description}
            </p>
          )}
        </div>
        {headerRight && (
          <div className="shrink-0">
            {headerRight}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-ind-border/50 min-w-0">
        <div className="shrink-0">
          {footerLeft}
        </div>
        <div className="shrink-0">
          {footerRight}
        </div>
      </div>
    </div>
  );
}

export default UnifiedCard;

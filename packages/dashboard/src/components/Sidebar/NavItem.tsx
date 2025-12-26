'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export default function NavItem({
  icon,
  label,
  href,
  isActive,
  isCollapsed,
}: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          transition-colors duration-200 cursor-pointer
          ${
            isActive
              ? 'text-ind-accent bg-ind-bg'
              : 'text-ind-text-muted hover:text-ind-text hover:bg-ind-bg/50'
          }
        `}
      >
        <div className="flex-shrink-0 w-5 h-5">{icon}</div>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">{label}</span>
          </>
        )}
      </div>
    </Link>
  );
}

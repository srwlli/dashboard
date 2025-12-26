'use client';

import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

const pageTitle: Record<string, string> = {
  '/': 'Dashboard',
  '/prompts': 'Prompts',
  '/settings': 'Settings',
  '/user-settings': 'User Settings',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitle[pathname] || 'Dashboard';

  return (
    <header
      className="
        sticky top-0 z-40
        bg-ind-panel border-b border-ind-border
        flex items-center justify-between
        px-6 py-4
        h-16
      "
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold tracking-wider">
          <span className="text-ind-text">Code</span>
          <span className="text-ind-accent">Ref</span>
        </span>
        <span className="text-ind-text uppercase tracking-wider text-sm font-bold">{title}</span>
      </div>

      <UserAvatar />
    </header>
  );
}

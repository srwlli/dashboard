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
        <span className="text-lg font-semibold text-ind-accent">CodeRef</span>
        <span className="text-ind-text-muted text-sm">{title}</span>
      </div>

      <UserAvatar />
    </header>
  );
}

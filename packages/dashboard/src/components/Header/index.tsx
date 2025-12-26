'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

const breadcrumbMap: Record<string, { label: string; href: string }> = {
  '/': { label: 'Dashboard', href: '/' },
  '/prompts': { label: 'Prompts', href: '/prompts' },
  '/settings': { label: 'Settings', href: '/settings' },
  '/user-settings': { label: 'User Settings', href: '/user-settings' },
  '/assistant': { label: 'Assistant', href: '/assistant' },
  '/sources': { label: 'Sources', href: '/sources' },
};

export default function Header() {
  const pathname = usePathname();
  const currentPage = breadcrumbMap[pathname] || { label: 'Dashboard', href: '/' };

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
      <nav className="flex items-center gap-4">
        <Link href="/">
          <span className="text-2xl font-bold tracking-wider hover:text-ind-accent transition-colors duration-200 cursor-pointer">
            <span className="text-ind-text">Code</span>
            <span className="text-ind-accent">Ref</span>
          </span>
        </Link>

        <span className="text-ind-text-muted">/</span>

        <Link href={currentPage.href}>
          <span className="text-lg text-ind-text tracking-wider hover:text-ind-accent transition-colors duration-200 cursor-pointer">
            {currentPage.label}
          </span>
        </Link>
      </nav>

      <UserAvatar />
    </header>
  );
}

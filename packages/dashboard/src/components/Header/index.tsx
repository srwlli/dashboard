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
  '/coderef-explorer': { label: 'Explorer', href: '/coderef-explorer' },
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
        px-2 sm:px-6 py-4
        h-12 sm:h-16
      "
    >
      {/* Logo and breadcrumb - hidden on mobile (xs/sm), visible on md+ */}
      <nav className="hidden sm:flex items-center gap-3 lg:gap-4">
        <Link href="/">
          <span className="text-lg sm:text-2xl font-bold tracking-wider hover:text-ind-accent transition-colors duration-200 cursor-pointer">
            <span className="text-ind-text">Code</span>
            <span className="text-ind-accent">Ref</span>
          </span>
        </Link>

        <span className="text-ind-text-muted">/</span>

        <Link href={currentPage.href}>
          <span className="text-sm sm:text-lg text-ind-text tracking-wider hover:text-ind-accent transition-colors duration-200 cursor-pointer">
            {currentPage.label}
          </span>
        </Link>
      </nav>

      {/* Mobile logo - visible only on mobile (xs/sm) */}
      <div className="sm:hidden">
        <Link href="/">
          <span className="text-lg font-bold tracking-wider hover:text-ind-accent transition-colors duration-200 cursor-pointer">
            <span className="text-ind-text">C</span>
            <span className="text-ind-accent">R</span>
          </span>
        </Link>
      </div>

      <UserAvatar />
    </header>
  );
}

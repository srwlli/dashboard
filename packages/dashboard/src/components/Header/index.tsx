'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const breadcrumbMap: Record<string, { label: string; href: string }> = {
  '/': { label: 'Dashboard', href: '/' },
  '/prompts': { label: 'Prompts', href: '/prompts' },
  '/settings': { label: 'Settings', href: '/settings' },
  '/user': { label: 'User', href: '/user' },
  '/assistant': { label: 'Assistant', href: '/assistant' },
  '/explorer': { label: 'Explorer', href: '/explorer' },
  '/scanner': { label: 'Scanner', href: '/scanner' },
  '/ecosystem': { label: 'Ecosystem', href: '/ecosystem' },
};

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
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
      {/* Mobile hamburger button - visible only on mobile */}
      {onMobileMenuClick && (
        <button
          onClick={onMobileMenuClick}
          className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-ind-bg/50 transition-colors duration-200 text-ind-text"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

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

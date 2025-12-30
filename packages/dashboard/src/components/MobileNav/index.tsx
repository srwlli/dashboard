'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, BookOpen, Zap, Archive, Settings, FolderTree } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNavItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Prompts', href: '/prompts', icon: BookOpen },
  { label: 'Assistant', href: '/assistant', icon: Zap },
  { label: 'Sources', href: '/sources', icon: Archive },
  { label: 'Explorer', href: '/coderef-explorer', icon: FolderTree },
];

const bottomNavItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * MobileNav Component
 * Provides hamburger menu and navigation drawer for mobile devices (< md)
 * Hidden on tablet and desktop (md+)
 *
 * Features:
 * - Hamburger button visible only on mobile (md:hidden)
 * - Drawer overlay with Sidebar navigation
 * - Click-outside-to-close functionality
 * - Smooth animations
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile (hidden md:flex) */}
      <button
        onClick={toggleDrawer}
        className="md:hidden flex items-center justify-center h-12 w-12 m-2 rounded-lg hover:bg-ind-panel transition-colors duration-200 text-ind-text"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Drawer Overlay - Only visible on mobile */}
      {isOpen && (
        <>
          {/* Backdrop overlay - click to close */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <div className="fixed left-0 top-0 h-screen z-60 md:hidden animate-in slide-in-from-left duration-300">
            <div className="w-64 h-full bg-ind-panel border-r border-ind-border overflow-y-auto flex flex-col">
              {/* Close button in drawer header */}
              <div className="flex items-center justify-between h-16 border-b border-ind-border px-4 flex-shrink-0">
                <span className="text-sm font-semibold text-ind-text">Navigation</span>
                <button
                  onClick={closeDrawer}
                  className="p-1 rounded-lg hover:bg-ind-bg/50 transition-colors duration-200 text-ind-text-muted hover:text-ind-text"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation Items */}
              <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-ind-accent/10 text-ind-accent border border-ind-accent/20'
                            : 'text-ind-text-muted hover:text-ind-text hover:bg-ind-bg/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Navigation Items */}
              <nav className="px-3 py-4 space-y-2 flex-shrink-0 border-t border-ind-border">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-ind-accent/10 text-ind-accent border border-ind-accent/20'
                            : 'text-ind-text-muted hover:text-ind-text hover:bg-ind-bg/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

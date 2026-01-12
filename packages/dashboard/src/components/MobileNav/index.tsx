'use client';

import { useEffect } from 'react';
import { X, Home, Layers, Zap, Settings, FolderTree, Radar, Network, Users, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNavItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Prompts', href: '/prompts', icon: Layers },
  { label: 'Sessions Hub', href: '/sessions', icon: Users },
  { label: 'Assistant', href: '/assistant', icon: Zap },
  { label: 'Explorer', href: '/explorer', icon: FolderTree },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Metrics', href: '/metrics', icon: BarChart3 },
  { label: 'Scanner', href: '/scanner', icon: Radar },
  { label: 'Resources', href: '/resources', icon: Network },
];

const bottomNavItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MobileNav Component
 * Navigation drawer for mobile devices (< md)
 * Hidden on tablet and desktop (md+)
 *
 * Features:
 * - Drawer overlay with navigation items
 * - Click-outside-to-close functionality
 * - Smooth animations
 * - Triggered by hamburger button in Header component
 */
export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close drawer on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Drawer Overlay - Only visible on mobile */}
      {isOpen && (
        <>
          {/* Backdrop overlay - click to close */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <div className="fixed left-0 top-0 h-screen z-60 md:hidden animate-in slide-in-from-left duration-300">
            <div className="w-64 h-full bg-ind-panel border-r border-ind-border overflow-y-auto flex flex-col">
              {/* Close button in drawer header */}
              <div className="flex items-center justify-between h-16 border-b border-ind-border px-4 flex-shrink-0">
                <span className="text-sm font-semibold text-ind-text">Navigation</span>
                <button
                  onClick={onClose}
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
                      onClick={onClose}
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
                      onClick={onClose}
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

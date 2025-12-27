'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <div className="fixed left-0 top-0 h-screen z-40 md:hidden animate-in slide-in-from-left duration-300">
            <div className="w-64 h-full bg-ind-panel border-r border-ind-border overflow-y-auto">
              {/* Close button in drawer header */}
              <div className="flex items-center justify-between h-16 border-b border-ind-border px-4">
                <span className="text-sm font-semibold text-ind-text">Navigation</span>
                <button
                  onClick={closeDrawer}
                  className="p-1 rounded-lg hover:bg-ind-bg/50 transition-colors duration-200 text-ind-text-muted hover:text-ind-text"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar navigation content (simplified for drawer) */}
              <nav className="flex-1 px-3 py-4 space-y-2">
                {/* Navigation items will be managed by click-to-close in parent Sidebar */}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PWAInitializer from './PWAInitializer';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { WorkflowProvider } from '@/contexts/WorkflowContext';

/**
 * RootClientWrapper
 * Global layout wrapper providing consistent page structure:
 * - Sidebar navigation (hidden on mobile, visible on md+)
 * - Sticky header with page title and user avatar
 * - Page content with responsive padding and container constraints
 * - PWA initialization
 *
 * Note: Theme initialization is handled by ThemeContext and AccentColorContext
 * to prevent hydration mismatches.
 *
 * Standalone Routes:
 * - Routes matching STANDALONE_ROUTES will render children directly without layout
 * - Used for popup windows, embeds, or minimal UI contexts
 *
 * Responsive Layout:
 * - Mobile (< md): vertical flex layout, sidebar hidden, mobile nav drawer
 * - Desktop (md+): horizontal flex layout, sidebar visible
 */

// Routes that should not have the global layout (sidebar, header)
const STANDALONE_ROUTES = ['/notes-standalone', '/boards-standalone', '/list-standalone'];

export function RootClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if current route is a standalone route
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  // Standalone routes: render children directly without layout
  if (isStandalone) {
    return (
      <WorkflowProvider>
        <PWAInitializer />
        {children}
      </WorkflowProvider>
    );
  }

  // Normal routes: render full layout with sidebar and header
  return (
    <WorkflowProvider>
      <PWAInitializer />
      {/* Mobile-first layout: flex-col on mobile, flex-row on md+ */}
      <div className="flex flex-col md:flex-row min-h-screen bg-ind-bg">
        {/* Mobile Navigation Drawer - controlled by Header hamburger button */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        {/* Sidebar: hidden on mobile, visible on md+ */}
        <Sidebar className="hidden md:flex" />
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* No padding, full width for all routes */}
            <div className="h-full w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WorkflowProvider>
  );
}

export default RootClientWrapper;

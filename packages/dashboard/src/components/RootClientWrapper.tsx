'use client';

import { ReactNode, useEffect } from 'react';
import PWAInitializer from './PWAInitializer';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

/**
 * RootClientWrapper
 * Global layout wrapper providing consistent page structure:
 * - Client-side theme initialization
 * - Sidebar navigation (hidden on mobile, visible on md+)
 * - Sticky header with page title and user avatar
 * - Page content with responsive padding and container constraints
 * - PWA initialization
 *
 * Responsive Layout:
 * - Mobile (< md): vertical flex layout, sidebar hidden
 * - Desktop (md+): horizontal flex layout, sidebar visible
 */
export function RootClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply saved theme from localStorage
    const savedTheme = localStorage.getItem('coderef-dashboard-theme') || 'dark';
    const htmlElement = document.documentElement;

    if (savedTheme === 'light') {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    } else {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    }
  }, []);

  return (
    <>
      <PWAInitializer />
      {/* Mobile-first layout: flex-col on mobile, flex-row on md+ */}
      <div className="flex flex-col md:flex-row min-h-screen bg-ind-bg">
        {/* Mobile Navigation Drawer - hidden on md+ */}
        <MobileNav />
        {/* Sidebar: hidden on mobile, visible on md+ */}
        <Sidebar className="hidden md:flex" />
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {/* Responsive padding: p-2 on mobile, p-4 on sm+, p-6 on lg+ */}
            <div className="p-2 sm:p-4 lg:p-6">
              {/* Responsive max-width: full on mobile, constrained on larger screens */}
              <div className="max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
                <div className="grid gap-6">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default RootClientWrapper;

'use client';

import { ReactNode, useEffect } from 'react';
import PWAInitializer from './PWAInitializer';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * RootClientWrapper
 * Global layout wrapper providing consistent page structure:
 * - Client-side theme initialization
 * - Sidebar navigation with collapsible toggle
 * - Sticky header with page title and user avatar
 * - Page content with padding and container constraints
 * - PWA initialization
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
      <div className="flex h-screen bg-ind-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="max-w-6xl mx-auto">
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

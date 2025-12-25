'use client';

import { ReactNode, useEffect } from 'react';
import PWAInitializer from './PWAInitializer';

/**
 * RootClientWrapper
 * Global layout wrapper providing consistent page structure:
 * - Client-side theme initialization
 * - Page padding and container constraints
 * - Content grid layout
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
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}

export default RootClientWrapper;

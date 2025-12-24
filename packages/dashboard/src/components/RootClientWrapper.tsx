'use client';

import { ReactNode, useEffect } from 'react';
import PWAInitializer from './PWAInitializer';

/**
 * RootClientWrapper
 * Wraps the entire application to handle client-side initialization
 * Manages theme class on html element for dark/light mode
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
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}

export default RootClientWrapper;

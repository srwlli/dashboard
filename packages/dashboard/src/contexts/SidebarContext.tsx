'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

/**
 * SidebarProvider
 * Manages sidebar collapsed state with localStorage persistence
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coderef-dashboard-sidebar-collapsed');
      setIsCollapsed(saved === 'true');
      setIsMounted(true);
    }
  }, []);

  // Save to localStorage when state changes
  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'coderef-dashboard-sidebar-collapsed',
          String(newState)
        );
      }
      return newState;
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook to use SidebarContext
 * Returns default values if context is not available (fallback for server-side rendering)
 */
export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    // Return default values as fallback for server-side rendering or missing provider
    return {
      isCollapsed: false,
      toggleSidebar: () => {},
    };
  }
  return context;
}

'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isHydrated: boolean;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

/**
 * SidebarProvider
 * Manages sidebar collapsed state with localStorage persistence
 * Initializes state from localStorage to prevent flash on reload
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  // Start with false to match SSR, then sync from localStorage on mount
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync from localStorage and mark as hydrated after mount
  useEffect(() => {
    const saved = localStorage.getItem('coderef-dashboard-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    setIsHydrated(true);
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

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isHydrated }}>
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
      isHydrated: false,
    };
  }
  return context;
}

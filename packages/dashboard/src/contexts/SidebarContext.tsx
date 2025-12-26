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
  // Initialize from localStorage to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coderef-dashboard-sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated after mount to prevent hydration mismatch
  useEffect(() => {
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

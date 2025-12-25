'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AccentColor = 'red' | 'orange' | 'yellow' | 'green' | 'purple' | 'blue' | 'white';

interface ColorVariant {
  base: string;
  hover: string;
}

export const ACCENT_COLORS: Record<AccentColor, ColorVariant> = {
  red: { base: '#ef4444', hover: '#dc2626' },
  orange: { base: '#ff6b00', hover: '#e65100' },
  yellow: { base: '#eab308', hover: '#ca8a04' },
  green: { base: '#22c55e', hover: '#16a34a' },
  purple: { base: '#a855f7', hover: '#9333ea' },
  blue: { base: '#3b82f6', hover: '#2563eb' },
  white: { base: '#ffffff', hover: '#f5f5f5' },
};

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

interface AccentColorProviderProps {
  children: ReactNode;
}

/**
 * AccentColorProvider component
 * Manages accent color state and applies CSS variables to root element
 * Persists accent color preference to localStorage
 */
export function AccentColorProvider({ children }: AccentColorProviderProps) {
  const [accentColor, setAccentColorState] = useState<AccentColor>('orange');

  // Initialize accent color from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedColor = localStorage.getItem('coderef-dashboard-accent-color') as AccentColor | null;

    if (savedColor && Object.keys(ACCENT_COLORS).includes(savedColor)) {
      setAccentColorState(savedColor);
      applyAccentColor(savedColor);
    } else {
      // Default to orange
      setAccentColorState('orange');
      applyAccentColor('orange');
    }
  }, []);

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
    localStorage.setItem('coderef-dashboard-accent-color', newColor);
    applyAccentColor(newColor);
  };

  const applyAccentColor = (color: AccentColor) => {
    if (typeof window === 'undefined') return;
    const htmlElement = document.documentElement;
    const colorVariant = ACCENT_COLORS[color];

    htmlElement.style.setProperty('--color-ind-accent', colorVariant.base);
    htmlElement.style.setProperty('--color-ind-accent-hover', colorVariant.hover);
  };

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </AccentColorContext.Provider>
  );
}

/**
 * Hook to use accent color context
 * Throws error if used outside AccentColorProvider
 */
export function useAccentColor(): AccentColorContextType {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within AccentColorProvider');
  }
  return context;
}

export default AccentColorProvider;

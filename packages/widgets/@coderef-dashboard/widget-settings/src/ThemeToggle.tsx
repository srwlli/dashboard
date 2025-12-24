import React, { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

/**
 * ThemeToggle Component
 * Sun/moon icon button to switch between dark and light modes
 * Uses industrial styling with orange accent
 * Manages theme directly via localStorage and DOM manipulation
 */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem('coderef-dashboard-theme') || 'dark') as Theme;
    setThemeState(savedTheme);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    localStorage.setItem('coderef-dashboard-theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    const htmlElement = document.documentElement;
    if (newTheme === 'light') {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    } else {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-ind-panel border-2 border-ind-border hover:border-ind-accent transition-colors active:translate-y-0.5"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Icon */}
      <span className="text-xl">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>

      {/* Label */}
      <span className="flex-1 text-left">
        <span className="text-ind-text font-bold uppercase tracking-wider text-sm">
          Theme
        </span>
        <span className="block text-ind-text-muted text-xs font-mono">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </span>

      {/* Indicator dot */}
      <div className="w-2 h-2 bg-ind-accent rounded-full"></div>
    </button>
  );
}

export default ThemeToggle;

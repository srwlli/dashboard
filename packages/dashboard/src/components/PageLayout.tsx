'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  accent?: boolean; // Whether "Ref" part should be accented
  subtitle?: string;
  children: ReactNode;
}

/**
 * PageLayout Component
 * Global header wrapper for consistent page structure
 * All pages use this for unified spacing and styling
 */
export function PageLayout({ title, accent = true, subtitle, children }: PageLayoutProps) {
  // Split title at "Ref" for accent styling
  const parts = accent ? title.split('Ref') : [title];

  return (
    <>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ind-text uppercase tracking-wider mb-2">
            {parts[0]}
            {accent && <span className="text-ind-accent">Ref</span>}
            {parts[1]}
          </h1>
          {subtitle && (
            <p className="text-ind-text-muted text-sm font-mono">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {children}
    </>
  );
}

export default PageLayout;

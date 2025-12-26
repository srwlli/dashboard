'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * PageLayout Component
 * Wrapper for consistent page structure and spacing
 * Page title is now displayed in the sticky header
 */
export function PageLayout({ children }: PageLayoutProps) {
  return <>{children}</>;
}

export default PageLayout;

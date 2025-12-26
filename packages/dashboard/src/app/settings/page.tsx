'use client';

import { PageLayout } from '@/components/PageLayout';
import { ThemePanel } from '@/components/ThemePanel';

/**
 * Settings Page
 * Manages display and theme preferences
 */
export default function SettingsPage() {
  return (
    <PageLayout>
      <ThemePanel />
    </PageLayout>
  );
}

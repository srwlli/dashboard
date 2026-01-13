'use client';

import { PageLayout } from '@/components/PageLayout';
import { ThemePanel } from '@/components/ThemePanel';
import { ProjectsPanel } from '@/components/Settings/ProjectsPanel';

/**
 * Settings Page
 * Manages display, theme preferences, and project configuration
 */
export default function SettingsPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <ProjectsPanel />
        <ThemePanel />
      </div>
    </PageLayout>
  );
}

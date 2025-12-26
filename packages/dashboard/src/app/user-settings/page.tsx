'use client';

import { PageLayout } from '@/components/PageLayout';
import ComingSoon from '@/components/ComingSoon';

export default function UserSettingsPage() {
  return (
    <PageLayout>
      <ComingSoon
        title="Settings"
        description="Manage user preferences, account settings, and application configuration."
        eta="Q1 2025"
      />
    </PageLayout>
  );
}

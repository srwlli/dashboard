'use client';

import { PageLayout } from '@/components/PageLayout';
import { Scanner } from '@/components/Scanner';

/**
 * Scanner Page
 * Mock UI for CodeRef Scanner interface
 * UI-only mockup with empty states, no live data
 */
export default function ScannerPage() {
  return (
    <PageLayout>
      <Scanner />
    </PageLayout>
  );
}

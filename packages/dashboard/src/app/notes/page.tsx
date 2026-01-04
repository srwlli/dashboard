'use client';

/**
 * Notes Page
 *
 * Full-page route for Notes widget
 * Path: /notes
 */

import { NotesWidget } from '@/widgets/notes';
import { PageCard } from '@/components/PageCard';

export default function NotesPage() {
  return (
    <PageCard padding="p-4">
      <div className="h-[calc(100vh-12rem)]">
        <NotesWidget />
      </div>
    </PageCard>
  );
}

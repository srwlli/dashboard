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
      <div className="h-full min-h-[calc(100vh-8rem)]">
        <NotesWidget />
      </div>
    </PageCard>
  );
}

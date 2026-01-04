/**
 * Notes Page
 *
 * Full-page route for Notes widget
 * Path: /notes
 */

import { NotesWidget } from '@/widgets/notes';

export default function NotesPage() {
  return (
    <div className="h-screen w-full">
      <NotesWidget />
    </div>
  );
}

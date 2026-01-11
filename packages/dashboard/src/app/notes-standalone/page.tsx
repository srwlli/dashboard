'use client';

/**
 * Standalone Notes Page
 *
 * Renders ONLY the NotesWidget without any dashboard layout (no sidebar, no header)
 * Used for Electron "New Window" functionality
 * Path: /notes-standalone
 *
 * Note: This route is recognized by RootClientWrapper as a standalone route
 * and will not have the global layout applied.
 */

import { NotesWidget } from '@/widgets/notes';

export default function NotesStandalonePage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <NotesWidget />
    </div>
  );
}

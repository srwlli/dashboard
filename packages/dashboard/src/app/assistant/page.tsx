import { redirect } from 'next/navigation';

/**
 * Redirect /assistant to /boards
 * Maintains backward compatibility for bookmarks and old links
 */
export default function AssistantRedirect() {
  redirect('/boards');
}

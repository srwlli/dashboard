import { SessionsHub } from '@/components/SessionsHub';

/**
 * Sessions Page
 *
 * Route: /sessions
 * Purpose: Multi-agent session creation and monitoring interface
 *
 * Features:
 * - Tab 1: Create new sessions from stubs with freeform instructions
 * - Tab 2: Monitor live multi-agent sessions in real-time
 *
 * Workorder: WO-SESSIONS-HUB-002-INTEGRATION
 */

export const metadata = {
  title: 'Sessions Hub | CodeRef Dashboard',
  description: 'Create and monitor multi-agent sessions for parallel task execution',
};

export default function SessionsPage() {
  return <SessionsHub />;
}

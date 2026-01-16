/**
 * Time utilities for session duration calculations
 *
 * Safe for client-side use (no Node.js dependencies)
 */

/**
 * Calculate human-readable duration between two timestamps
 *
 * @param created - ISO 8601 timestamp when session created
 * @param completed - ISO 8601 timestamp when session completed (optional)
 * @returns Human-readable duration string (e.g., "4h 15m", "45m", "N/A")
 */
export function calculateDuration(created: string, completed?: string): string {
  if (!completed) {
    return 'N/A';
  }

  try {
    const start = new Date(created).getTime();
    const end = new Date(completed).getTime();

    if (isNaN(start) || isNaN(end)) {
      return 'N/A';
    }

    if (end <= start) {
      return 'N/A';
    }

    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes}m`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Failed to calculate duration:', error);
    return 'N/A';
  }
}

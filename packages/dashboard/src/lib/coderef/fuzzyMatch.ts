/**
 * Fuzzy Match Utility
 *
 * @description Simple fuzzy matching for file/folder names in FileTree.
 * Matches partial substrings (case-insensitive) within file paths.
 *
 * @module fuzzyMatch
 * @example
 * ```ts
 * fuzzyMatch('button', 'Button.tsx') // true
 * fuzzyMatch('btn', 'Button.tsx') // false (not contiguous substring)
 * fuzzyMatch('comp/but', 'components/Button.tsx') // true
 * ```
 */

/**
 * Check if query matches target string (case-insensitive substring match)
 *
 * @param query - Search query string
 * @param target - Target string to match against
 * @returns True if query is found as substring in target (case-insensitive)
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true; // Empty query matches everything

  const normalizedQuery = query.toLowerCase();
  const normalizedTarget = target.toLowerCase();

  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Check if a file path matches the search query
 * Matches against filename and full path
 *
 * @param query - Search query
 * @param filePath - Full file path
 * @returns True if query matches filename or path
 */
export function matchesFilePath(query: string, filePath: string): boolean {
  if (!query) return true;

  // Extract filename from path
  const filename = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;

  // Match against both filename and full path
  return fuzzyMatch(query, filename) || fuzzyMatch(query, filePath);
}

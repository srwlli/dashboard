/**
 * Save Index - Save scan results to disk
 *
 * Outputs: .coderef/index.json
 *
 * @module fileGeneration/saveIndex
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { ElementData } from '../types/types.js';

/**
 * Save scan results to .coderef/index.json
 *
 * @param projectPath - Absolute path to project root
 * @param elements - Array of code elements from scan
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```typescript
 * const elements = await scanCurrentElements('./src', ['ts', 'tsx']);
 * await saveIndex('./my-project', elements);
 * // Creates: ./my-project/.coderef/index.json
 * ```
 */
export async function saveIndex(
  projectPath: string,
  elements: ElementData[]
): Promise<void> {
  const indexPath = path.join(projectPath, '.coderef', 'index.json');

  // Ensure .coderef directory exists
  const coderefDir = path.join(projectPath, '.coderef');
  await fs.mkdir(coderefDir, { recursive: true });

  // Format with metadata
  const indexData = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    projectPath,
    totalElements: elements.length,
    elementsByType: getElementCountsByType(elements),
    elements,
  };

  // Write to disk
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
}

/**
 * Get count of elements by type
 */
function getElementCountsByType(elements: ElementData[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const element of elements) {
    counts[element.type] = (counts[element.type] || 0) + 1;
  }

  return counts;
}

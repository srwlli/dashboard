/**
 * CodeRef Core Module - Main export index
 * Combines Phase 3 (Analyzer) and Phase 5 (Context, Export, AI) components
 */

// Phase 3: Analyzer module
export * from './analyzer/index.js';

// Phase 5: Context module
export * from './context/index.js';

// Phase 5: Export module
export * from './export/index.js';

// Phase 5: Integration module
export * from './integration/index.js';

// Parser module
export * from './parser/parser.js';

// Query module
export * from './query/query-executor.js';

// Validator module
export * from './validator/validator.js';

// Types module
export * from './types/types.js';

// Adapter module - Convert between scanner formats
export { convertGraphToElements, getConversionStats } from './adapter/graph-to-elements.js';
// export { mergeElements, getMergeStatistics } from './adapter/merge-scan-results.js';
// export type { ConversionOptions, MergeOptions, MergeResult } from './adapter/types.js';

/**
 * Scanner module - Regex-based code element scanning
 *
 * @example
 * ```typescript
 * import { scanCurrentElements, LANGUAGE_PATTERNS } from '@coderef/core';
 *
 * // Scan TypeScript files
 * const elements = await scanCurrentElements('./src', 'ts', {
 *   recursive: true,
 *   exclude: ['**\/node_modules/**']
 * });
 *
 * // Scan multiple languages
 * const allElements = await scanCurrentElements('./src', ['ts', 'tsx', 'js', 'jsx']);
 *
 * // Access language patterns
 * const tsPatterns = LANGUAGE_PATTERNS.ts;
 * ```
 *
 * @see {@link scanCurrentElements} - Main scanning function
 * @see {@link LANGUAGE_PATTERNS} - Pattern definitions by language
 */
export { scanCurrentElements, LANGUAGE_PATTERNS } from '../scanner.js';

/**
 * Scanner type definitions
 * @see {@link ScanOptions} - Configuration options for scanning
 * @see {@link ElementData} - Scanned element data structure
 */
export type { ScanOptions, ElementData } from '../types.js';

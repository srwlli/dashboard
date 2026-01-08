/**
 * CodeRef Core Module - Main export index
 * Combines Phase 3 (Analyzer) and Phase 5 (Context, Export, AI) components
 */
export * from './analyzer/index.js';
export * from './context/index.js';
export * from './export/index.js';
export * from './integration/index.js';
export * from './parser/parser.js';
export * from './query/query-executor.js';
export * from './validator/validator.js';
export * from './types/types.js';
export { convertGraphToElements, getConversionStats } from './adapter/graph-to-elements.js';
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
export type { ScanOptions, ElementData } from './types/types.js';
//# sourceMappingURL=index.d.ts.map
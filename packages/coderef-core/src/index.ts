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
// export * from './integration/index.js'; // Temporarily disabled - missing AI dependencies

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
export { scanCurrentElements, LANGUAGE_PATTERNS } from './scanner/scanner.js';

// Note: ScanOptions and ElementData are exported from ./types/types.js on line 28

/**
 * File Generation module - Generate .coderef output files
 *
 * @example
 * ```typescript
 * import { saveIndex, generateContext, buildDependencyGraph } from '@coderef/core';
 *
 * // Scan and save
 * const elements = await scanCurrentElements('./src', ['ts', 'tsx']);
 * await saveIndex('./my-project', elements);
 *
 * // Generate context files
 * await generateContext('./my-project', elements);
 *
 * // Build dependency graph
 * const graph = await buildDependencyGraph('./my-project', elements);
 * ```
 *
 * @see {@link saveIndex} - Save scan results to index.json
 * @see {@link generateContext} - Generate context.json and context.md
 * @see {@link buildDependencyGraph} - Build dependency graph
 */
// Phase 1: Core file generation
export { saveIndex } from './fileGeneration/saveIndex.js';
export { generateContext } from './fileGeneration/generateContext.js';
export { buildDependencyGraph } from './fileGeneration/buildDependencyGraph.js';
export type { DependencyGraph, GraphNode, GraphEdge } from './fileGeneration/buildDependencyGraph.js';

// Phase 2: Analysis reports
export { detectPatterns } from './fileGeneration/detectPatterns.js';
export { analyzeCoverage } from './fileGeneration/analyzeCoverage.js';
export { validateReferences } from './fileGeneration/validateReferences.js';
export { detectDrift } from './fileGeneration/detectDrift.js';

// Phase 3: Diagrams
export { generateDiagrams } from './fileGeneration/generateDiagrams.js';

// @coderef/core - Main entry point
// Phase 2: Original scanner (deprecated but kept for compatibility)
export * from './parser.js';
export * from './scanner.js';
export * from './types.js';
export * from './utils/fs.js';

// Phase 3+: New modular architecture
export * from './src/analyzer/index.js';
export * from './src/parser/parser.js';
export * from './src/query/query-executor.js';
export * from './src/validator/validator.js';
export * from './src/types/types.js';
export * from './src/context/index.js';
export * from './src/export/index.js';
export * from './src/integration/index.js';

// Adapter module - Convert between scanner formats
export { convertGraphToElements, getConversionStats } from './src/adapter/graph-to-elements.js';
// export { mergeElements, getMergeStatistics } from './src/adapter/merge-scan-results.js';
// export type { ConversionOptions, MergeOptions, MergeResult } from './src/adapter/types.js';

// Error classes
export * from './src/errors/index.js';

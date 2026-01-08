/**
 * @coderef/core - Main entry point
 * WO-CODEREF-CONSOLIDATION-001
 */

// Core modules
export * from './src/types/types.js';
export * from './src/scanner/scanner.js';
export * from './src/parser/parser.js';
export * from './src/analyzer/index.js';
export * from './src/validator/validator.js';
export * from './src/query/query-executor.js';

// Context & AI integration
export * from './src/context/index.js';
export * from './src/export/index.js';
export * from './src/integration/index.js';

// Adapters
export { convertGraphToElements, getConversionStats } from './src/adapter/graph-to-elements.js';

// Utilities
export * from './utils/fs.js';

// Error classes
export * from './src/errors/index.js';

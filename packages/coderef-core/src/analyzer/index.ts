/**
 * Analyzer Module Index - Export all analyzer components
 * Phase 3: Relationship Detection & Analysis
 */

export { default as ImportParser } from './import-parser.js';
export type { ImportStatement, ImportEdge } from './import-parser.js';

export { default as CallDetector } from './call-detector.js';
export type { CallExpression, CallEdge } from './call-detector.js';

export { default as GraphBuilder } from './graph-builder.js';
export type { GraphNode, GraphEdge, DependencyGraph } from './graph-builder.js';

export { default as GraphAnalyzer } from './graph-analyzer.js';
export type { TraversalPath, CircularDependency } from './graph-analyzer.js';

export { default as AnalyzerService } from './analyzer-service.js';
export type { AnalysisResult } from './analyzer-service.js';

export { GraphError, GraphErrorCode } from './graph-error.js';

// Graph Query Helpers - Resource Sheet Integration
export {
  getImportsForElement,
  getExportsForElement,
  getConsumersForElement,
  getDependenciesForElement,
  getElementCharacteristics,
  calculateAutoFillRate,
  parseNodeId,
} from './graph-helpers.js';
export type { ElementReference } from './graph-helpers.js';

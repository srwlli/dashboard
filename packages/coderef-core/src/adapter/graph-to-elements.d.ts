/**
 * Graph to Elements Adapter
 * Converts AST DependencyGraph to ElementData[] format
 *
 * @Fn/core/adapter#convertGraphToElements
 */
import { DependencyGraph } from '../analyzer/graph-builder.js';
import { ElementData } from '../types/types.js';
export interface ConversionOptions {
    includeFileNodes?: boolean;
    includeOrphans?: boolean;
    includeIsolated?: boolean;
    typeFilter?: string[];
    verbose?: boolean;
}
/**
 * Convert AST DependencyGraph to ElementData[] format
 *
 * This adapter enables generators designed for regex scanner output
 * to work with AST analyzer output by converting the graph structure
 * to the simpler ElementData[] format.
 *
 * @param graph - DependencyGraph from AnalyzerService
 * @param options - Conversion options
 * @returns Array of ElementData with enhanced properties (parameters, calls)
 *
 * @example
 * ```typescript
 * const analyzer = new AnalyzerService('./src');
 * const result = await analyzer.analyze();
 * const elements = convertGraphToElements(result.graph);
 * // elements now compatible with generators
 * ```
 */
export declare function convertGraphToElements(graph: DependencyGraph, options?: ConversionOptions): ElementData[];
/**
 * Get statistics about converted elements
 */
export declare function getConversionStats(elements: ElementData[]): {
    total: number;
    withParameters: number;
    withCalls: number;
    byType: Record<string, number>;
};
//# sourceMappingURL=graph-to-elements.d.ts.map
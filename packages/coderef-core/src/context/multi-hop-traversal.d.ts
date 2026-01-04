/**
 * Multi-Hop Traversal - Query relationships at 2-5 levels deep
 * Phase 5, Task P5-T1: Multi-hop Reference Maps (used-by, calls, depends-on)
 *
 * Provides:
 * - Multi-hop traversal with configurable depth
 * - used-by query (reverse dependencies)
 * - calls query (call chains)
 * - depends-on query (forward dependencies)
 * - Result memoization
 */
import { DependencyGraph, GraphNode, GraphEdge } from '../analyzer/graph-builder.js';
/**
 * Represents a traversal result with path information
 */
export interface TraversalResult {
    nodeId: string;
    depth: number;
    path: GraphNode[];
    edges: GraphEdge[];
    type: 'direct' | 'transitive' | 'secondary';
}
/**
 * Represents a multi-hop query result
 */
export interface MultiHopResult {
    sourceNodeId: string;
    queryType: 'used-by' | 'calls' | 'depends-on';
    maxDepth: number;
    results: TraversalResult[];
    totalCount: number;
    traversalTime: number;
}
export declare class MultiHopTraversal {
    private graph;
    private analyzer;
    private traversalCache;
    private maxDepth;
    private maxResults;
    constructor(graph: DependencyGraph, maxDepth?: number, maxResults?: number);
    /**
     * Query: What uses/depends on this element? (reverse dependencies)
     */
    usedBy(nodeId: string, maxDepth?: number): MultiHopResult;
    /**
     * Query: What does this element call?
     */
    calls(nodeId: string, maxDepth?: number): MultiHopResult;
    /**
     * Query: What does this element depend on?
     */
    dependsOn(nodeId: string, maxDepth?: number): MultiHopResult;
    /**
     * Generic traversal for any direction
     */
    traverse(nodeId: string, queryType: 'used-by' | 'calls' | 'depends-on', maxDepth?: number): MultiHopResult;
    /**
     * Clear traversal cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): Record<string, any>;
    /**
     * Private: BFS traversal implementation
     */
    private bfsTraversal;
    /**
     * Set maximum depth for traversals
     */
    setMaxDepth(depth: number): void;
    /**
     * Set maximum results per query
     */
    setMaxResults(count: number): void;
}
export default MultiHopTraversal;
//# sourceMappingURL=multi-hop-traversal.d.ts.map
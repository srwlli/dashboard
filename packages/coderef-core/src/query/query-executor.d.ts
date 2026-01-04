/**
 * Query Executor - Multi-dimensional query engine for relationship analysis
 * Phase 4, Task P4-T1: Query Engine Implementation
 *
 * Executes complex queries on CodeRef2 relationship graph with:
 * - 8 query types for different relationship questions
 * - Result caching for performance optimization
 * - Performance tracking and benchmarking
 * - Comprehensive error handling
 */
import AnalyzerService from '../analyzer/analyzer-service.js';
import { GraphNode } from '../analyzer/graph-builder.js';
/**
 * Query types supported by the executor
 */
export type QueryType = 'what-calls' | 'what-calls-me' | 'what-imports' | 'what-imports-me' | 'what-depends-on' | 'what-depends-on-me' | 'shortest-path' | 'all-paths';
/**
 * Query request parameters
 */
export interface QueryRequest {
    type: QueryType;
    target: string;
    source?: string;
    maxDepth?: number;
    format?: 'raw' | 'summary' | 'full';
}
/**
 * Query result with metadata
 */
export interface QueryResult {
    query: QueryRequest;
    results: GraphNode[];
    count: number;
    executionTime: number;
    cached: boolean;
    timestamp: number;
    error?: string;
}
/**
 * Query Executor class
 */
export declare class QueryExecutor {
    private analyzer;
    private resultCache;
    private cacheExpiryMs;
    private performanceMetrics;
    constructor(analyzer: AnalyzerService, cacheExpiryMs?: number);
    /**
     * Execute a query on the relationship graph
     */
    execute(request: QueryRequest): Promise<QueryResult>;
    /**
     * Execute specific query type
     */
    private executeQuery;
    /**
     * Convert traversal path to nodes
     */
    private pathToNodes;
    /**
     * Flatten multiple paths into unique nodes
     */
    private flattenPaths;
    /**
     * Generate cache key from query request
     */
    private generateCacheKey;
    /**
     * Get result from cache if not expired
     */
    private getFromCache;
    /**
     * Record performance metrics
     */
    private recordPerformance;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): Record<string, {
        avgTime: number;
        count: number;
    }>;
    /**
     * Clear result cache
     */
    clearCache(): void;
    /**
     * Clear performance metrics
     */
    resetPerformanceStats(): void;
    /**
     * Batch execute multiple queries
     */
    executeBatch(requests: QueryRequest[]): Promise<QueryResult[]>;
    /**
     * Query with filtering
     */
    queryWithFilter(request: QueryRequest, filter: (node: GraphNode) => boolean): Promise<QueryResult>;
    /**
     * Health check - verify analyzer is ready
     */
    healthCheck(): Promise<boolean>;
}
export default QueryExecutor;
//# sourceMappingURL=query-executor.d.ts.map
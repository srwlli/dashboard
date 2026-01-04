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
/**
 * Query Executor class
 */
export class QueryExecutor {
    analyzer;
    resultCache;
    cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
    performanceMetrics;
    constructor(analyzer, cacheExpiryMs) {
        this.analyzer = analyzer;
        this.resultCache = new Map();
        this.performanceMetrics = new Map();
        if (cacheExpiryMs) {
            this.cacheExpiryMs = cacheExpiryMs;
        }
        // Initialize performance metrics
        const queryTypes = [
            'what-calls',
            'what-calls-me',
            'what-imports',
            'what-imports-me',
            'what-depends-on',
            'what-depends-on-me',
            'shortest-path',
            'all-paths',
        ];
        queryTypes.forEach(type => {
            this.performanceMetrics.set(type, { total: 0, count: 0 });
        });
    }
    /**
     * Execute a query on the relationship graph
     */
    async execute(request) {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(request);
        // Check cache
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return {
                ...cached,
                cached: true,
                timestamp: Date.now(),
            };
        }
        let results = [];
        let error;
        try {
            results = await this.executeQuery(request);
        }
        catch (err) {
            error = err.message || 'Unknown error';
            console.error(`Query error (${request.type}):`, error);
        }
        const executionTime = Date.now() - startTime;
        const result = {
            query: request,
            results,
            count: results.length,
            executionTime,
            cached: false,
            timestamp: Date.now(),
            error,
        };
        // Cache result
        this.resultCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
        });
        // Track performance
        this.recordPerformance(request.type, executionTime);
        return result;
    }
    /**
     * Execute specific query type
     */
    async executeQuery(request) {
        const { type, target, source, maxDepth } = request;
        switch (type) {
            case 'what-calls':
                // What calls this element?
                return this.analyzer.getCallers(target);
            case 'what-calls-me':
                // What does this element call?
                return this.analyzer.getCallees(target);
            case 'what-imports':
                // What does this element depend on? (imports)
                return this.analyzer.getDependencies(target, maxDepth);
            case 'what-imports-me':
                // What depends on this element? (imports it)
                return this.analyzer.getDependents(target, maxDepth);
            case 'what-depends-on':
                // What does this element depend on?
                return this.analyzer.getDependencies(target, maxDepth);
            case 'what-depends-on-me':
                // What depends on this element?
                return this.analyzer.getDependents(target, maxDepth);
            case 'shortest-path':
                // Find shortest path between two elements
                if (!source) {
                    throw new Error('source parameter required for shortest-path query');
                }
                const shortestPath = this.analyzer.findShortestPath(source, target);
                return shortestPath ? this.pathToNodes(shortestPath) : [];
            case 'all-paths':
                // Find all paths between two elements
                if (!source) {
                    throw new Error('source parameter required for all-paths query');
                }
                const allPaths = this.analyzer.findAllPaths(source, target, maxDepth);
                return this.flattenPaths(allPaths);
            default:
                throw new Error(`Unknown query type: ${type}`);
        }
    }
    /**
     * Convert traversal path to nodes
     */
    pathToNodes(path) {
        if (!path || !path.nodes) {
            return [];
        }
        return Array.isArray(path.nodes) ? path.nodes : [path.nodes];
    }
    /**
     * Flatten multiple paths into unique nodes
     */
    flattenPaths(paths) {
        const nodeMap = new Map();
        paths.forEach(path => {
            if (path.nodes) {
                const nodes = Array.isArray(path.nodes) ? path.nodes : [path.nodes];
                nodes.forEach((node) => {
                    if (node && node.id) {
                        nodeMap.set(node.id, node);
                    }
                });
            }
        });
        return Array.from(nodeMap.values());
    }
    /**
     * Generate cache key from query request
     */
    generateCacheKey(request) {
        const parts = [
            request.type,
            request.target,
            request.source || '',
            request.maxDepth || '',
            request.format || 'raw',
        ];
        return parts.join('|');
    }
    /**
     * Get result from cache if not expired
     */
    getFromCache(key) {
        const cached = this.resultCache.get(key);
        if (!cached) {
            return null;
        }
        const age = Date.now() - cached.timestamp;
        if (age > this.cacheExpiryMs) {
            this.resultCache.delete(key);
            return null;
        }
        return cached.result;
    }
    /**
     * Record performance metrics
     */
    recordPerformance(type, executionTime) {
        const metrics = this.performanceMetrics.get(type);
        if (metrics) {
            metrics.total += executionTime;
            metrics.count += 1;
        }
    }
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const stats = {};
        this.performanceMetrics.forEach((metrics, type) => {
            stats[type] = {
                avgTime: metrics.count > 0 ? metrics.total / metrics.count : 0,
                count: metrics.count,
            };
        });
        return stats;
    }
    /**
     * Clear result cache
     */
    clearCache() {
        this.resultCache.clear();
    }
    /**
     * Clear performance metrics
     */
    resetPerformanceStats() {
        this.performanceMetrics.forEach(metrics => {
            metrics.total = 0;
            metrics.count = 0;
        });
    }
    /**
     * Batch execute multiple queries
     */
    async executeBatch(requests) {
        const results = [];
        for (const request of requests) {
            const result = await this.execute(request);
            results.push(result);
        }
        return results;
    }
    /**
     * Query with filtering
     */
    async queryWithFilter(request, filter) {
        const result = await this.execute(request);
        const filtered = result.results.filter(filter);
        return {
            ...result,
            results: filtered,
            count: filtered.length,
        };
    }
    /**
     * Health check - verify analyzer is ready
     */
    async healthCheck() {
        try {
            const graph = this.analyzer.getGraph();
            return !!graph;
        }
        catch {
            return false;
        }
    }
}
export default QueryExecutor;
//# sourceMappingURL=query-executor.js.map
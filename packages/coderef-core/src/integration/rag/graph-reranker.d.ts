/**
 * Graph-Aware Re-Ranker
 * P3-T3: Re-ranks search results using CodeRef's dependency graph knowledge
 *
 * This is a key differentiator of CodeRef's RAG system: it combines semantic
 * similarity with structural importance from the dependency graph to provide
 * more relevant results.
 */
import type { DependencyGraph } from '../../analyzer/graph-builder.js';
import type { SearchResult } from './semantic-search.js';
/**
 * Options for re-ranking
 */
export interface ReRankingOptions {
    /** Weight for dependency count (0-1, default: 0.2) */
    dependencyWeight?: number;
    /** Weight for dependent count (0-1, default: 0.3) */
    dependentWeight?: number;
    /** Weight for test coverage (0-1, default: 0.2) */
    coverageWeight?: number;
    /** Weight for complexity penalty (0-1, default: 0.1) */
    complexityWeight?: number;
    /** Weight for semantic similarity (0-1, default: 0.2) */
    semanticWeight?: number;
    /** Query-specific boost strategy */
    queryStrategy?: QueryStrategy;
    /** Maximum boost factor (default: 2.0) */
    maxBoost?: number;
    /** Minimum score threshold (default: 0.0) */
    minScore?: number;
}
/**
 * Query strategy for specialized boosting
 */
export type QueryStrategy = 'general' | 'centrality' | 'quality' | 'usage' | 'recent' | 'public';
/**
 * Re-ranked result with explanation
 */
export interface ReRankedResult extends SearchResult {
    /** Original semantic score */
    originalScore: number;
    /** Final re-ranked score */
    rerankedScore: number;
    /** Boost factor applied */
    boostFactor: number;
    /** Explanation of ranking factors */
    explanation: RankingExplanation;
}
/**
 * Explanation of how score was calculated
 */
export interface RankingExplanation {
    /** Semantic similarity contribution */
    semanticScore: number;
    /** Dependency graph contribution */
    graphScore: number;
    /** Quality metrics contribution */
    qualityScore: number;
    /** Breakdown of factors */
    factors: {
        dependencyBoost?: number;
        dependentBoost?: number;
        coverageBoost?: number;
        complexityPenalty?: number;
        queryBoost?: number;
    };
}
/**
 * Re-ranks search results using dependency graph
 */
export declare class GraphReRanker {
    private graph?;
    constructor(graph?: DependencyGraph);
    /**
     * Set or update the dependency graph
     */
    setGraph(graph: DependencyGraph): void;
    /**
     * Re-rank search results
     */
    rerank(results: SearchResult[], options?: ReRankingOptions): ReRankedResult[];
    /**
     * Calculate ranking factors for a result
     */
    private calculateRankingFactors;
    /**
     * Calculate graph-based score
     */
    private calculateGraphScore;
    /**
     * Calculate quality-based score
     */
    private calculateQualityScore;
    /**
     * Calculate query-specific boost
     */
    private calculateQueryBoost;
    /**
     * Convert SearchResult to ReRankedResult
     */
    private toReRankedResult;
    /**
     * Calculate node centrality (simplified PageRank)
     */
    private calculateCentrality;
    /**
     * Get query strategy from query text
     */
    static inferQueryStrategy(query: string): QueryStrategy;
    /**
     * Analyze re-ranking impact
     */
    analyzeReRankingImpact(original: SearchResult[], reranked: ReRankedResult[]): {
        avgBoostFactor: number;
        positionChanges: number;
        topResultChanged: boolean;
        significantChanges: number;
    };
}
//# sourceMappingURL=graph-reranker.d.ts.map
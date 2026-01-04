/**
 * Context Builder
 * P3-T4: Formats retrieved code chunks into LLM-ready markdown context
 *
 * Transforms search results into well-structured markdown that includes:
 * - CodeRef tags for navigation
 * - Code snippets with syntax highlighting
 * - Relevance scores
 * - Dependency information
 * - Quality metrics
 */
import type { SearchResult } from './semantic-search.js';
import type { ReRankedResult } from './graph-reranker.js';
/**
 * Options for context building
 */
export interface ContextBuilderOptions {
    /** Maximum number of results to include */
    maxResults?: number;
    /** Include source code in context */
    includeCode?: boolean;
    /** Include dependencies information */
    includeDependencies?: boolean;
    /** Include quality metrics */
    includeMetrics?: boolean;
    /** Include relevance scores */
    includeScores?: boolean;
    /** Format style */
    style?: 'detailed' | 'compact' | 'minimal';
    /** Include table of contents */
    includeToc?: boolean;
}
/**
 * Built context ready for LLM
 */
export interface BuiltContext {
    /** Formatted markdown context */
    markdown: string;
    /** Number of results included */
    resultCount: number;
    /** Estimated token count */
    estimatedTokens: number;
    /** Results that were included */
    includedResults: SearchResult[];
}
/**
 * Builds LLM context from search results
 */
export declare class ContextBuilder {
    /**
     * Build context from search results
     */
    buildContext(results: SearchResult[] | ReRankedResult[], options?: ContextBuilderOptions): BuiltContext;
    /**
     * Build summary section
     */
    private buildSummary;
    /**
     * Build table of contents
     */
    private buildTableOfContents;
    /**
     * Build section for a single result
     */
    private buildResultSection;
    /**
     * Build compact context (fewer details)
     */
    buildCompactContext(results: SearchResult[]): string;
    /**
     * Build minimal context (just CodeRefs)
     */
    buildMinimalContext(results: SearchResult[]): string;
    /**
     * Build context with custom template
     */
    buildWithTemplate(results: SearchResult[], template: (result: SearchResult, index: number) => string): string;
    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokens;
    /**
     * Truncate context to fit token limit
     */
    truncateToTokenLimit(context: BuiltContext, maxTokens: number): BuiltContext;
    /**
     * Build context summary (for logging/debugging)
     */
    buildContextSummary(context: BuiltContext): string;
    /**
     * Get counts of unique values for a metadata field
     */
    private getUniqueCounts;
    /**
     * Validate context quality
     *
     * Returns warnings about the built context
     */
    validateContext(context: BuiltContext): string[];
}
//# sourceMappingURL=context-builder.d.ts.map
/**
 * Semantic Search Service
 * P3-T2: Implements semantic code search using vector similarity
 *
 * Enables natural language queries against the codebase by:
 * 1. Embedding the query
 * 2. Searching vector store for similar code
 * 3. Returning ranked results
 */
import type { LLMProvider } from '../llm/llm-provider.js';
import type { VectorStore } from '../vector/vector-store.js';
import type { CodeChunkMetadata } from '../vector/vector-store.js';
/**
 * A search result with code metadata
 */
export interface SearchResult {
    /** CodeRef tag */
    coderef: string;
    /** Relevance score (0-1, higher is more relevant) */
    score: number;
    /** Code metadata */
    metadata: CodeChunkMetadata;
    /** Snippet of the code (if available) */
    snippet?: string;
}
/**
 * Options for semantic search
 */
export interface SearchOptions {
    /** Number of results to return (default: 10) */
    topK?: number;
    /** Minimum relevance score threshold (0-1) */
    minScore?: number;
    /** Filter by programming language */
    language?: string;
    /** Filter by element type (function, class, etc.) */
    type?: string;
    /** Filter by file path */
    file?: string;
    /** Filter by exported status */
    exported?: boolean;
    /** Additional metadata filters */
    filters?: Partial<CodeChunkMetadata>;
    /** Namespace for multi-tenancy */
    namespace?: string;
}
/**
 * Query context for better search results
 */
export interface QueryContext {
    /** Previous queries in the session */
    previousQueries?: string[];
    /** Recently viewed code */
    recentCodeRefs?: string[];
    /** User's preferred language */
    preferredLanguage?: string;
    /** Current file context */
    currentFile?: string;
}
/**
 * Result from a search operation
 */
export interface SearchResponse {
    /** Query that was executed */
    query: string;
    /** Search results */
    results: SearchResult[];
    /** Total results found */
    totalResults: number;
    /** Search time in milliseconds */
    searchTimeMs: number;
    /** Whether results were filtered */
    filtered: boolean;
}
/**
 * Semantic search service for code
 */
export declare class SemanticSearchService {
    private llmProvider;
    private vectorStore;
    private textGenerator;
    constructor(llmProvider: LLMProvider, vectorStore: VectorStore);
    /**
     * Search for code using natural language query
     */
    search(query: string, options?: SearchOptions, context?: QueryContext): Promise<SearchResponse>;
    /**
     * Search with multiple queries and merge results
     *
     * Useful for complex questions that might require multiple search strategies
     */
    multiQuerySearch(queries: string[], options?: SearchOptions, context?: QueryContext): Promise<SearchResponse>;
    /**
     * Find similar code to a given CodeRef
     */
    findSimilar(coderef: string, options?: SearchOptions): Promise<SearchResponse>;
    /**
     * Search by example code snippet
     */
    searchByExample(codeSnippet: string, options?: SearchOptions): Promise<SearchResponse>;
    /**
     * Get related code elements
     *
     * Returns code that is semantically or structurally related
     */
    getRelated(coderef: string, relationshipType?: 'semantic' | 'structural' | 'both', options?: SearchOptions): Promise<SearchResponse>;
    /**
     * Embed a query string
     */
    private embedQuery;
    /**
     * Enhance query with context
     */
    private enhanceQuery;
    /**
     * Analyze search quality
     *
     * Returns metrics about search result quality
     */
    analyzeResults(results: SearchResult[]): {
        avgScore: number;
        scoreDistribution: {
            high: number;
            medium: number;
            low: number;
        };
        diversityScore: number;
    };
    /**
     * Suggest query improvements
     *
     * Analyzes query and suggests improvements for better results
     */
    suggestQueryImprovements(query: string, results: SearchResult[]): string[];
}
//# sourceMappingURL=semantic-search.d.ts.map
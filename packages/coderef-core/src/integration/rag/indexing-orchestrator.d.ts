/**
 * Indexing Orchestrator
 * P3-T1: Orchestrates the complete pipeline from source code to vector DB
 *
 * This is the main entry point for RAG indexing. It coordinates:
 * 1. Code scanning (AnalyzerService)
 * 2. Graph building (GraphBuilder)
 * 3. Chunk conversion
 * 4. Embedding generation
 * 5. Vector storage
 * 6. Incremental indexing
 */
import type { AnalyzerService } from '../../analyzer/analyzer-service.js';
import type { LLMProvider } from '../llm/llm-provider.js';
import type { VectorStore } from '../vector/vector-store.js';
import { type ChunkOptions } from './chunk-converter.js';
import { type EmbeddingServiceOptions } from './embedding-service.js';
import { type IncrementalIndexOptions } from './incremental-indexer.js';
/**
 * Progress callback for indexing
 */
export type IndexingProgressCallback = (progress: IndexingProgress) => void;
/**
 * Progress information during indexing
 */
export interface IndexingProgress {
    /** Current stage */
    stage: IndexingStage;
    /** Stage description */
    stageDescription: string;
    /** Progress within stage (0-100) */
    stageProgress: number;
    /** Overall progress (0-100) */
    overallProgress: number;
    /** Additional stage-specific data */
    data?: any;
}
/**
 * Indexing stages
 */
export declare enum IndexingStage {
    ANALYZING = "analyzing",
    CONVERTING = "converting",
    EMBEDDING = "embedding",
    STORING = "storing",
    COMPLETE = "complete"
}
/**
 * Options for indexing
 */
export interface IndexingOptions {
    /** Source directory to index */
    sourceDir: string;
    /** Languages to scan */
    languages?: string[];
    /** Chunk conversion options */
    chunkOptions?: ChunkOptions;
    /** Embedding service options */
    embeddingOptions?: EmbeddingServiceOptions;
    /** Incremental indexing options */
    incrementalOptions?: IncrementalIndexOptions;
    /** Namespace for vector store */
    namespace?: string;
    /** Progress callback */
    onProgress?: IndexingProgressCallback;
    /** Whether to use the analyzer (AST-based) or regex scanner */
    useAnalyzer?: boolean;
}
/**
 * Result from indexing operation
 */
export interface IndexingResult {
    /** Number of chunks successfully indexed */
    chunksIndexed: number;
    /** Number of chunks skipped (unchanged) */
    chunksSkipped: number;
    /** Number of failed chunks */
    chunksFailed: number;
    /** Total files processed */
    filesProcessed: number;
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Statistics */
    stats: IndexingStatistics;
    /** Errors encountered */
    errors: IndexingError[];
}
/**
 * Statistics from indexing
 */
export interface IndexingStatistics {
    /** Total tokens used */
    tokensUsed: number;
    /** Estimated cost */
    estimatedCost?: number;
    /** Average embedding time per chunk (ms) */
    avgEmbeddingTimeMs: number;
    /** Chunks by type */
    byType: Record<string, number>;
    /** Chunks by language */
    byLanguage: Record<string, number>;
}
/**
 * Error during indexing
 */
export interface IndexingError {
    /** Stage where error occurred */
    stage: IndexingStage;
    /** Error message */
    message: string;
    /** Optional context */
    context?: string;
    /** Original error */
    originalError?: Error;
}
/**
 * Orchestrates the complete RAG indexing pipeline
 */
export declare class IndexingOrchestrator {
    private analyzerService;
    private llmProvider;
    private vectorStore;
    private basePath;
    constructor(analyzerService: AnalyzerService, llmProvider: LLMProvider, vectorStore: VectorStore, basePath?: string);
    /**
     * Index a codebase
     */
    indexCodebase(options: IndexingOptions): Promise<IndexingResult>;
    /**
     * Get statistics about current index
     */
    getIndexStats(): Promise<{
        vectorStoreStats: any;
        incrementalStats: any;
    }>;
    /**
     * Clear all indexed data
     */
    clearIndex(namespace?: string): Promise<void>;
}
//# sourceMappingURL=indexing-orchestrator.d.ts.map
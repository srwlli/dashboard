/**
 * Embedding Service
 * P2-T4: Efficiently generates embeddings for code chunks in batches
 *
 * Handles batch processing, progress reporting, error recovery, and
 * optimization for API rate limits and token usage.
 */
import type { LLMProvider } from '../llm/llm-provider.js';
import type { CodeChunk } from './code-chunk.js';
import { type TextGenerationOptions } from './embedding-text-generator.js';
/**
 * A code chunk with its embedding vector
 */
export interface EmbeddedChunk {
    /** Original code chunk */
    chunk: CodeChunk;
    /** Embedding vector (typically 1536 dimensions for OpenAI) */
    embedding: number[];
    /** Text that was embedded */
    text: string;
    /** Timestamp when embedded */
    timestamp: number;
}
/**
 * Progress callback for embedding generation
 */
export type ProgressCallback = (progress: EmbeddingProgress) => void;
/**
 * Progress information during embedding
 */
export interface EmbeddingProgress {
    /** Number of chunks processed so far */
    processed: number;
    /** Total number of chunks to process */
    total: number;
    /** Progress percentage (0-100) */
    percentage: number;
    /** Current batch being processed */
    currentBatch: number;
    /** Total number of batches */
    totalBatches: number;
    /** Estimated time remaining (seconds) */
    estimatedSecondsRemaining?: number;
}
/**
 * Options for embedding service
 */
export interface EmbeddingServiceOptions {
    /** Batch size for API calls (default: 100) */
    batchSize?: number;
    /** Text generation options */
    textOptions?: TextGenerationOptions;
    /** Progress callback */
    onProgress?: ProgressCallback;
    /** Delay between batches in milliseconds (for rate limiting) */
    batchDelayMs?: number;
    /** Maximum concurrent batch operations (default: 1) */
    maxConcurrency?: number;
}
/**
 * Result from embedding operation
 */
export interface EmbeddingResult {
    /** Successfully embedded chunks */
    embedded: EmbeddedChunk[];
    /** Chunks that failed to embed */
    failed: EmbeddingError[];
    /** Total processing time in milliseconds */
    processingTimeMs: number;
    /** Statistics */
    stats: EmbeddingStatistics;
}
/**
 * Error during embedding
 */
export interface EmbeddingError {
    /** CodeRef of the chunk that failed */
    coderef: string;
    /** Error message */
    message: string;
    /** Original error */
    originalError?: Error;
}
/**
 * Statistics about embedding operation
 */
export interface EmbeddingStatistics {
    /** Total chunks processed */
    totalChunks: number;
    /** Successful embeddings */
    successCount: number;
    /** Failed embeddings */
    failedCount: number;
    /** Total batches processed */
    totalBatches: number;
    /** Average processing time per batch (ms) */
    avgBatchTimeMs: number;
    /** Total tokens used (estimated) */
    totalTokensUsed: number;
}
/**
 * Service for generating embeddings in efficient batches
 */
export declare class EmbeddingService {
    private llmProvider;
    private textGenerator;
    constructor(llmProvider: LLMProvider);
    /**
     * Generate embeddings for chunks in batches
     */
    embedChunks(chunks: CodeChunk[], options?: EmbeddingServiceOptions): Promise<EmbeddingResult>;
    /**
     * Generate embedding for a single chunk
     */
    embedChunk(chunk: CodeChunk, textOptions?: TextGenerationOptions): Promise<EmbeddedChunk>;
    /**
     * Generate embedding for raw text
     */
    embedText(text: string): Promise<number[]>;
    /**
     * Split chunks into batches
     */
    private createBatches;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Estimate cost for embedding chunks
     *
     * Rough estimates:
     * - OpenAI text-embedding-3-small: $0.020 / 1M tokens
     * - OpenAI text-embedding-3-large: $0.130 / 1M tokens
     */
    estimateCost(chunks: CodeChunk[], pricePerMillionTokens?: number, textOptions?: TextGenerationOptions): {
        estimatedTokens: number;
        estimatedCost: number;
    };
    /**
     * Validate embeddings quality
     *
     * Checks for common issues like zero vectors, NaN values, etc.
     */
    validateEmbeddings(embedded: EmbeddedChunk[]): string[];
    /**
     * Calculate similarity between two embeddings
     * Uses cosine similarity (0-1, higher is more similar)
     */
    calculateSimilarity(embedding1: number[], embedding2: number[]): number;
    /**
     * Find most similar chunks to a query embedding
     */
    findSimilar(queryEmbedding: number[], embedded: EmbeddedChunk[], topK?: number): Array<{
        chunk: CodeChunk;
        similarity: number;
    }>;
}
//# sourceMappingURL=embedding-service.d.ts.map
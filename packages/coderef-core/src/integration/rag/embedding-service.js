/**
 * Embedding Service
 * P2-T4: Efficiently generates embeddings for code chunks in batches
 *
 * Handles batch processing, progress reporting, error recovery, and
 * optimization for API rate limits and token usage.
 */
import { EmbeddingTextGenerator } from './embedding-text-generator.js';
/**
 * Service for generating embeddings in efficient batches
 */
export class EmbeddingService {
    llmProvider;
    textGenerator;
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
        this.textGenerator = new EmbeddingTextGenerator();
    }
    /**
     * Generate embeddings for chunks in batches
     */
    async embedChunks(chunks, options) {
        const startTime = Date.now();
        const opts = {
            batchSize: options?.batchSize ?? 100,
            textOptions: options?.textOptions ?? {},
            onProgress: options?.onProgress ?? (() => { }),
            batchDelayMs: options?.batchDelayMs ?? 0,
            maxConcurrency: options?.maxConcurrency ?? 1
        };
        const embedded = [];
        const failed = [];
        // Split chunks into batches
        const batches = this.createBatches(chunks, opts.batchSize);
        const totalBatches = batches.length;
        let processedCount = 0;
        let totalTokensUsed = 0;
        const batchTimes = [];
        // Process batches
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchStartTime = Date.now();
            try {
                // Generate texts for batch
                const texts = batch.map(chunk => this.textGenerator.generate(chunk, opts.textOptions));
                // Count tokens
                const batchTokens = texts.reduce((sum, text) => sum + this.textGenerator.estimateTokens(text), 0);
                totalTokensUsed += batchTokens;
                // Call LLM provider to get embeddings
                const embeddings = await this.llmProvider.embed(texts);
                // Map embeddings back to chunks
                for (let j = 0; j < batch.length; j++) {
                    embedded.push({
                        chunk: batch[j],
                        embedding: embeddings[j],
                        text: texts[j],
                        timestamp: Date.now()
                    });
                }
                processedCount += batch.length;
            }
            catch (error) {
                // Batch failed, record errors for all chunks in batch
                for (const chunk of batch) {
                    failed.push({
                        coderef: chunk.coderef,
                        message: `Batch embedding failed: ${error.message}`,
                        originalError: error
                    });
                }
                processedCount += batch.length;
            }
            const batchTime = Date.now() - batchStartTime;
            batchTimes.push(batchTime);
            // Report progress
            const avgBatchTime = batchTimes.reduce((sum, t) => sum + t, 0) / batchTimes.length;
            const remainingBatches = totalBatches - (i + 1);
            const estimatedSecondsRemaining = (remainingBatches * avgBatchTime) / 1000;
            opts.onProgress({
                processed: processedCount,
                total: chunks.length,
                percentage: (processedCount / chunks.length) * 100,
                currentBatch: i + 1,
                totalBatches,
                estimatedSecondsRemaining
            });
            // Add delay between batches if configured
            if (opts.batchDelayMs > 0 && i < batches.length - 1) {
                await this.delay(opts.batchDelayMs);
            }
        }
        const processingTimeMs = Date.now() - startTime;
        const avgBatchTimeMs = batchTimes.reduce((sum, t) => sum + t, 0) / batchTimes.length;
        return {
            embedded,
            failed,
            processingTimeMs,
            stats: {
                totalChunks: chunks.length,
                successCount: embedded.length,
                failedCount: failed.length,
                totalBatches,
                avgBatchTimeMs,
                totalTokensUsed
            }
        };
    }
    /**
     * Generate embedding for a single chunk
     */
    async embedChunk(chunk, textOptions) {
        const text = this.textGenerator.generate(chunk, textOptions);
        const embeddings = await this.llmProvider.embed([text]);
        return {
            chunk,
            embedding: embeddings[0],
            text,
            timestamp: Date.now()
        };
    }
    /**
     * Generate embedding for raw text
     */
    async embedText(text) {
        const embeddings = await this.llmProvider.embed([text]);
        return embeddings[0];
    }
    /**
     * Split chunks into batches
     */
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Estimate cost for embedding chunks
     *
     * Rough estimates:
     * - OpenAI text-embedding-3-small: $0.020 / 1M tokens
     * - OpenAI text-embedding-3-large: $0.130 / 1M tokens
     */
    estimateCost(chunks, pricePerMillionTokens = 0.020, textOptions) {
        const texts = chunks.map(chunk => this.textGenerator.generate(chunk, textOptions));
        const estimatedTokens = texts.reduce((sum, text) => sum + this.textGenerator.estimateTokens(text), 0);
        const estimatedCost = (estimatedTokens / 1_000_000) * pricePerMillionTokens;
        return {
            estimatedTokens,
            estimatedCost
        };
    }
    /**
     * Validate embeddings quality
     *
     * Checks for common issues like zero vectors, NaN values, etc.
     */
    validateEmbeddings(embedded) {
        const issues = [];
        for (const item of embedded) {
            // Check for zero vector
            const isZeroVector = item.embedding.every(val => val === 0);
            if (isZeroVector) {
                issues.push(`Zero vector detected for ${item.chunk.coderef} - likely an error`);
            }
            // Check for NaN values
            const hasNaN = item.embedding.some(val => isNaN(val));
            if (hasNaN) {
                issues.push(`NaN values detected for ${item.chunk.coderef}`);
            }
            // Check for infinite values
            const hasInfinite = item.embedding.some(val => !isFinite(val));
            if (hasInfinite) {
                issues.push(`Infinite values detected for ${item.chunk.coderef}`);
            }
            // Check dimension consistency
            if (embedded.length > 1) {
                const expectedDim = embedded[0].embedding.length;
                if (item.embedding.length !== expectedDim) {
                    issues.push(`Inconsistent dimensions for ${item.chunk.coderef}: ` +
                        `expected ${expectedDim}, got ${item.embedding.length}`);
                }
            }
        }
        return issues;
    }
    /**
     * Calculate similarity between two embeddings
     * Uses cosine similarity (0-1, higher is more similar)
     */
    calculateSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Embeddings must have the same dimension');
        }
        // Calculate dot product
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);
        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }
        return dotProduct / (norm1 * norm2);
    }
    /**
     * Find most similar chunks to a query embedding
     */
    findSimilar(queryEmbedding, embedded, topK = 10) {
        const similarities = embedded.map(item => ({
            chunk: item.chunk,
            similarity: this.calculateSimilarity(queryEmbedding, item.embedding)
        }));
        // Sort by similarity (descending)
        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topK);
    }
}
//# sourceMappingURL=embedding-service.js.map
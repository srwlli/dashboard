/**
 * Embedding Text Generator
 * P2-T3: Generates optimized text representations for embedding models
 *
 * Converts CodeChunks into structured text that includes all relevant
 * context for semantic search while optimizing for embedding model performance.
 */
import type { CodeChunk } from './code-chunk.js';
/**
 * Options for text generation
 */
export interface TextGenerationOptions {
    /**
     * Include source code in the text
     * Default: true
     */
    includeSourceCode?: boolean;
    /**
     * Include dependencies in the text
     * Default: true
     */
    includeDependencies?: boolean;
    /**
     * Include documentation in the text
     * Default: true
     */
    includeDocumentation?: boolean;
    /**
     * Maximum length of generated text (characters)
     * Default: 4000 (fits comfortably in most embedding models)
     */
    maxLength?: number;
    /**
     * Format style: 'natural' or 'structured'
     * - natural: Reads like natural language
     * - structured: More machine-readable with clear sections
     * Default: 'natural'
     */
    style?: 'natural' | 'structured';
}
/**
 * Generates embedding-optimized text from CodeChunks
 */
export declare class EmbeddingTextGenerator {
    /**
     * Generate embedding text for a single chunk
     */
    generate(chunk: CodeChunk, options?: TextGenerationOptions): string;
    /**
     * Generate natural language description
     */
    private generateNaturalDescription;
    /**
     * Generate structured description
     */
    private generateStructuredDescription;
    /**
     * Get human-readable type description
     */
    private getTypeDescription;
    /**
     * Generate batch of texts for multiple chunks
     */
    generateBatch(chunks: CodeChunk[], options?: TextGenerationOptions): string[];
    /**
     * Generate query-optimized text (for semantic search queries)
     *
     * This is similar to chunk text but formatted for queries:
     * - Shorter
     * - More focused on intent
     * - Less structured
     */
    generateQueryText(query: string, context?: {
        language?: string;
        type?: string;
        file?: string;
    }): string;
    /**
     * Calculate approximate token count
     * (rough estimate: 1 token ≈ 4 characters)
     */
    estimateTokens(text: string): number;
    /**
     * Calculate statistics about generated texts
     */
    calculateTextStatistics(texts: string[]): {
        totalTexts: number;
        avgLength: number;
        avgTokens: number;
        maxLength: number;
        minLength: number;
    };
    /**
     * Validate generated text quality
     *
     * Returns issues found in the text
     */
    validateText(text: string): string[];
    /**
     * Generate comparison text for two chunks
     * Useful for finding similar/related code elements
     */
    generateComparisonText(chunk1: CodeChunk, chunk2: CodeChunk): string;
}
//# sourceMappingURL=embedding-text-generator.d.ts.map
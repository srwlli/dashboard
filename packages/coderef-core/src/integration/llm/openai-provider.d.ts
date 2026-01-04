/**
 * OpenAI LLM Provider Implementation
 * P1-T2: Implements LLMProvider interface using OpenAI API
 */
import type { LLMProvider, CompletionOptions, LLMResponse, LLMProviderConfig } from './llm-provider.js';
/**
 * OpenAI provider implementation
 *
 * @example
 * ```typescript
 * const provider = new OpenAIProvider({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4-turbo-preview'
 * });
 *
 * const response = await provider.complete('Explain RAG', {
 *   temperature: 0.3,
 *   maxTokens: 500
 * });
 * ```
 */
export declare class OpenAIProvider implements LLMProvider {
    private client;
    private model;
    private embeddingModel;
    private maxRetries;
    private timeout;
    constructor(config: LLMProviderConfig);
    /**
     * Generate text completion using OpenAI chat API
     */
    complete(prompt: string, options?: CompletionOptions): Promise<LLMResponse>;
    /**
     * Generate embeddings using OpenAI embeddings API
     */
    embed(texts: string[]): Promise<number[][]>;
    /**
     * Count tokens in text using tiktoken
     */
    countTokens(text: string): number;
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Get current model
     */
    getModel(): string;
    /**
     * Retry logic with exponential backoff
     */
    private withRetry;
    /**
     * Map OpenAI finish reason to our standard format
     */
    private mapFinishReason;
    /**
     * Handle OpenAI errors and convert to LLMError
     */
    private handleError;
}
/**
 * Factory function to create OpenAI provider
 */
export declare function createOpenAIProvider(config: LLMProviderConfig): OpenAIProvider;
//# sourceMappingURL=openai-provider.d.ts.map
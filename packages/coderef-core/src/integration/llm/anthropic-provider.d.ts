/**
 * Anthropic LLM Provider Implementation
 * P1-T3: Implements LLMProvider interface using Anthropic Claude API
 */
import type { LLMProvider, CompletionOptions, LLMResponse, LLMProviderConfig } from './llm-provider.js';
/**
 * Anthropic provider implementation
 *
 * NOTE: Anthropic does not provide embedding models, so this provider
 * delegates embedding operations to OpenAI. You must provide both API keys.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-3-5-sonnet-20241022'
 * }, {
 *   apiKey: process.env.OPENAI_API_KEY // For embeddings
 * });
 *
 * const response = await provider.complete('Explain RAG', {
 *   temperature: 0.3,
 *   maxTokens: 500
 * });
 * ```
 */
export declare class AnthropicProvider implements LLMProvider {
    private client;
    private model;
    private maxRetries;
    private timeout;
    private embeddingProvider;
    constructor(config: LLMProviderConfig, openAIConfig?: LLMProviderConfig);
    /**
     * Generate text completion using Anthropic Claude API
     */
    complete(prompt: string, options?: CompletionOptions): Promise<LLMResponse>;
    /**
     * Generate embeddings - delegates to OpenAI
     *
     * Note: Anthropic does not provide embedding models, so we use OpenAI
     */
    embed(texts: string[]): Promise<number[][]>;
    /**
     * Count tokens - uses OpenAI's tiktoken as approximation
     *
     * Note: This is an approximation. Anthropic uses a different tokenizer,
     * but tiktoken provides a reasonable estimate for planning purposes.
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
     * Map Anthropic stop reason to our standard format
     */
    private mapStopReason;
    /**
     * Handle Anthropic errors and convert to LLMError
     */
    private handleError;
}
/**
 * Factory function to create Anthropic provider
 */
export declare function createAnthropicProvider(config: LLMProviderConfig, openAIConfig?: LLMProviderConfig): AnthropicProvider;
//# sourceMappingURL=anthropic-provider.d.ts.map
/**
 * LLM Provider Interface
 * P1-T1: Provider-agnostic interface for LLM operations
 *
 * Supports multiple LLM providers (OpenAI, Anthropic, etc.) with a unified interface
 * for completions, embeddings, and token counting.
 */
/**
 * Error thrown by LLM providers
 */
export class LLMError extends Error {
    code;
    originalError;
    retryable;
    constructor(message, code, originalError, retryable = false) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.retryable = retryable;
        this.name = 'LLMError';
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LLMError);
        }
    }
}
/**
 * Error codes for LLM operations
 */
export var LLMErrorCode;
(function (LLMErrorCode) {
    /** API key is missing or invalid */
    LLMErrorCode["INVALID_API_KEY"] = "INVALID_API_KEY";
    /** Rate limit exceeded */
    LLMErrorCode["RATE_LIMIT"] = "RATE_LIMIT";
    /** Network error communicating with provider */
    LLMErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    /** Request timeout */
    LLMErrorCode["TIMEOUT"] = "TIMEOUT";
    /** Invalid request parameters */
    LLMErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    /** Content was filtered by provider */
    LLMErrorCode["CONTENT_FILTER"] = "CONTENT_FILTER";
    /** Token limit exceeded */
    LLMErrorCode["TOKEN_LIMIT"] = "TOKEN_LIMIT";
    /** Unknown error */
    LLMErrorCode["UNKNOWN"] = "UNKNOWN";
})(LLMErrorCode || (LLMErrorCode = {}));
//# sourceMappingURL=llm-provider.js.map
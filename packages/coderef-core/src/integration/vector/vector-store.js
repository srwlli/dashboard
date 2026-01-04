/**
 * Vector Store Interface
 * P1-T4: Provider-agnostic interface for vector database operations
 *
 * Supports multiple vector database providers (Pinecone, Chroma, etc.) with
 * a unified interface for storing and querying code embeddings.
 */
/**
 * Error thrown by vector store operations
 */
export class VectorStoreError extends Error {
    code;
    originalError;
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'VectorStoreError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, VectorStoreError);
        }
    }
}
/**
 * Error codes for vector store operations
 */
export var VectorStoreErrorCode;
(function (VectorStoreErrorCode) {
    /** Connection error */
    VectorStoreErrorCode["CONNECTION_ERROR"] = "CONNECTION_ERROR";
    /** Index/collection not found */
    VectorStoreErrorCode["INDEX_NOT_FOUND"] = "INDEX_NOT_FOUND";
    /** Invalid vector dimensions */
    VectorStoreErrorCode["INVALID_DIMENSIONS"] = "INVALID_DIMENSIONS";
    /** Invalid query parameters */
    VectorStoreErrorCode["INVALID_QUERY"] = "INVALID_QUERY";
    /** Rate limit exceeded */
    VectorStoreErrorCode["RATE_LIMIT"] = "RATE_LIMIT";
    /** Unknown error */
    VectorStoreErrorCode["UNKNOWN"] = "UNKNOWN";
})(VectorStoreErrorCode || (VectorStoreErrorCode = {}));
//# sourceMappingURL=vector-store.js.map
/**
 * Pinecone Vector Store Implementation
 * P1-T5: Implements VectorStore interface using Pinecone cloud service
 */
import type { VectorStore, VectorRecord, QueryOptions, QueryResult, VectorStoreStats, VectorStoreConfig } from './vector-store.js';
/**
 * Pinecone vector store implementation
 *
 * @example
 * ```typescript
 * const store = new PineconeStore({
 *   apiKey: process.env.PINECONE_API_KEY,
 *   environment: process.env.PINECONE_ENVIRONMENT,
 *   indexName: 'coderef-index',
 *   dimension: 1536
 * });
 *
 * await store.upsert([{
 *   id: '@Fn/auth/login#authenticate:24',
 *   values: embeddings,
 *   metadata: { ... }
 * }]);
 * ```
 */
export declare class PineconeStore implements VectorStore {
    private client;
    private indexName;
    private dimension;
    private index;
    constructor(config: VectorStoreConfig);
    /**
     * Initialize connection to index
     * Must be called before using the store
     */
    initialize(): Promise<void>;
    /**
     * Wait for index to be ready after creation
     */
    private waitForIndexReady;
    /**
     * Upsert vectors in batches (max 100 per request)
     */
    upsert(records: VectorRecord[], namespace?: string): Promise<void>;
    /**
     * Query for similar vectors
     */
    query(vector: number[], options?: QueryOptions): Promise<QueryResult>;
    /**
     * Delete vectors by ID
     */
    delete(ids: string[], namespace?: string): Promise<void>;
    /**
     * Clear all vectors
     */
    clear(namespace?: string): Promise<void>;
    /**
     * Get store statistics
     */
    stats(): Promise<VectorStoreStats>;
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Build Pinecone metadata filter from our filter format
     */
    private buildFilter;
    /**
     * Handle Pinecone errors and convert to VectorStoreError
     */
    private handleError;
}
/**
 * Factory function to create Pinecone store
 */
export declare function createPineconeStore(config: VectorStoreConfig): Promise<PineconeStore>;
//# sourceMappingURL=pinecone-store.d.ts.map
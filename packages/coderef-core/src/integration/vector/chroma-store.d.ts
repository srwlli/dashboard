/**
 * Chroma Vector Store Implementation
 * P1-T6: Implements VectorStore interface using Chroma (self-hosted option)
 */
import type { VectorStore, VectorRecord, QueryOptions, QueryResult, VectorStoreStats, VectorStoreConfig } from './vector-store.js';
/**
 * Chroma vector store implementation
 *
 * Chroma is an open-source embedding database that can run locally or self-hosted.
 * This provides an alternative to cloud-based vector stores like Pinecone.
 *
 * @example
 * ```typescript
 * // Local Chroma instance
 * const store = new ChromaStore({
 *   host: 'http://localhost',
 *   port: 8000,
 *   indexName: 'coderef-collection'
 * });
 *
 * // Or remote Chroma instance
 * const store = new ChromaStore({
 *   host: 'https://my-chroma-server.com',
 *   indexName: 'coderef-collection'
 * });
 *
 * await store.initialize();
 * ```
 */
export declare class ChromaStore implements VectorStore {
    private client;
    private collectionName;
    private collection?;
    private dimension;
    constructor(config: VectorStoreConfig);
    /**
     * Initialize connection and create/get collection
     */
    initialize(): Promise<void>;
    /**
     * Upsert vectors to Chroma
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
     * Handle Chroma errors and convert to VectorStoreError
     */
    private handleError;
}
/**
 * Factory function to create Chroma store
 */
export declare function createChromaStore(config: VectorStoreConfig): Promise<ChromaStore>;
//# sourceMappingURL=chroma-store.d.ts.map
/**
 * Pinecone Vector Store Implementation
 * P1-T5: Implements VectorStore interface using Pinecone cloud service
 */
import { Pinecone } from '@pinecone-database/pinecone';
import { VectorStoreError, VectorStoreErrorCode } from './vector-store.js';
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
export class PineconeStore {
    client;
    indexName;
    dimension;
    index; // Pinecone Index type
    constructor(config) {
        if (!config.apiKey) {
            throw new VectorStoreError('Pinecone API key is required', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        if (!config.indexName) {
            throw new VectorStoreError('Pinecone index name is required', VectorStoreErrorCode.INVALID_QUERY);
        }
        this.client = new Pinecone({
            apiKey: config.apiKey
        });
        this.indexName = config.indexName;
        this.dimension = config.dimension ?? 1536;
    }
    /**
     * Initialize connection to index
     * Must be called before using the store
     */
    async initialize() {
        try {
            // Check if index exists
            const indexes = await this.client.listIndexes();
            const indexExists = indexes.indexes?.some((idx) => idx.name === this.indexName);
            if (!indexExists) {
                // Create index if it doesn't exist
                await this.client.createIndex({
                    name: this.indexName,
                    dimension: this.dimension,
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: 'us-east-1'
                        }
                    }
                });
                // Wait for index to be ready
                await this.waitForIndexReady();
            }
            // Get index reference
            this.index = this.client.index(this.indexName);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Wait for index to be ready after creation
     */
    async waitForIndexReady(maxWaitMs = 60000) {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitMs) {
            try {
                const description = await this.client.describeIndex(this.indexName);
                if (description.status?.ready) {
                    return;
                }
            }
            catch (error) {
                // Index might not be available yet, continue waiting
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        throw new VectorStoreError('Timeout waiting for Pinecone index to be ready', VectorStoreErrorCode.CONNECTION_ERROR);
    }
    /**
     * Upsert vectors in batches (max 100 per request)
     */
    async upsert(records, namespace) {
        if (!this.index) {
            throw new VectorStoreError('Pinecone store not initialized. Call initialize() first', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        if (records.length === 0) {
            return;
        }
        try {
            // Batch records into groups of 100 (Pinecone limit)
            const batchSize = 100;
            const batches = [];
            for (let i = 0; i < records.length; i += batchSize) {
                batches.push(records.slice(i, i + batchSize));
            }
            // Process batches sequentially to avoid rate limits
            for (const batch of batches) {
                const vectors = batch.map(record => ({
                    id: record.id,
                    values: record.values,
                    metadata: record.metadata
                }));
                if (namespace) {
                    await this.index.namespace(namespace).upsert(vectors);
                }
                else {
                    await this.index.upsert(vectors);
                }
            }
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Query for similar vectors
     */
    async query(vector, options) {
        if (!this.index) {
            throw new VectorStoreError('Pinecone store not initialized. Call initialize() first', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        try {
            const queryParams = {
                vector,
                topK: options?.topK ?? 10,
                includeMetadata: options?.includeMetadata ?? true,
                includeValues: options?.includeValues ?? false
            };
            // Add filter if provided
            if (options?.filter) {
                queryParams.filter = this.buildFilter(options.filter);
            }
            // Query the appropriate namespace
            const response = options?.namespace
                ? await this.index.namespace(options.namespace).query(queryParams)
                : await this.index.query(queryParams);
            // Filter by minimum score if specified
            let matches = response.matches || [];
            if (options?.minScore !== undefined) {
                matches = matches.filter((match) => match.score >= options.minScore);
            }
            // Convert to our format
            const vectorMatches = matches.map((match) => ({
                id: match.id,
                score: match.score,
                metadata: match.metadata,
                values: match.values
            }));
            return {
                matches: vectorMatches,
                namespace: options?.namespace
            };
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Delete vectors by ID
     */
    async delete(ids, namespace) {
        if (!this.index) {
            throw new VectorStoreError('Pinecone store not initialized. Call initialize() first', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        if (ids.length === 0) {
            return;
        }
        try {
            if (namespace) {
                await this.index.namespace(namespace).deleteMany(ids);
            }
            else {
                await this.index.deleteMany(ids);
            }
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Clear all vectors
     */
    async clear(namespace) {
        if (!this.index) {
            throw new VectorStoreError('Pinecone store not initialized. Call initialize() first', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        try {
            if (namespace) {
                await this.index.namespace(namespace).deleteAll();
            }
            else {
                await this.index.deleteAll();
            }
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get store statistics
     */
    async stats() {
        if (!this.index) {
            throw new VectorStoreError('Pinecone store not initialized. Call initialize() first', VectorStoreErrorCode.CONNECTION_ERROR);
        }
        try {
            const description = await this.client.describeIndex(this.indexName);
            const stats = await this.index.describeIndexStats();
            return {
                totalVectors: stats.totalRecordCount ?? 0,
                dimension: description.dimension ?? this.dimension,
                namespaces: Object.keys(stats.namespaces ?? {}),
                metric: description.metric,
                status: description.status
            };
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get provider name
     */
    getProviderName() {
        return 'pinecone';
    }
    /**
     * Build Pinecone metadata filter from our filter format
     */
    buildFilter(filter) {
        const pineconeFilter = {};
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                pineconeFilter[key] = { $eq: value };
            }
        }
        return pineconeFilter;
    }
    /**
     * Handle Pinecone errors and convert to VectorStoreError
     */
    handleError(error) {
        // Check for specific error patterns
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
            return new VectorStoreError(`Pinecone index not found: ${this.indexName}`, VectorStoreErrorCode.INDEX_NOT_FOUND, error);
        }
        if (error.message?.includes('dimension')) {
            return new VectorStoreError('Invalid vector dimensions', VectorStoreErrorCode.INVALID_DIMENSIONS, error);
        }
        if (error.message?.includes('rate limit') || error.status === 429) {
            return new VectorStoreError('Pinecone rate limit exceeded', VectorStoreErrorCode.RATE_LIMIT, error);
        }
        if (error.message?.includes('connection') || error.code === 'ECONNREFUSED') {
            return new VectorStoreError('Connection error to Pinecone', VectorStoreErrorCode.CONNECTION_ERROR, error);
        }
        // Unknown error
        return new VectorStoreError(`Pinecone error: ${error.message}`, VectorStoreErrorCode.UNKNOWN, error);
    }
}
/**
 * Factory function to create Pinecone store
 */
export async function createPineconeStore(config) {
    const store = new PineconeStore(config);
    await store.initialize();
    return store;
}
//# sourceMappingURL=pinecone-store.js.map
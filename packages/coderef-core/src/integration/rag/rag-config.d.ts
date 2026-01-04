/**
 * RAG Configuration Loader
 * P5-T1: Loads and validates RAG configuration from environment
 *
 * Manages configuration for:
 * - LLM providers (OpenAI, Anthropic)
 * - Vector stores (Pinecone, Chroma)
 * - RAG behavior settings
 */
import type { LLMProviderConfig } from '../llm/llm-provider.js';
import type { VectorStoreConfig } from '../vector/vector-store.js';
/**
 * Complete RAG system configuration
 */
export interface RAGConfig {
    /** LLM provider configuration */
    llm: {
        provider: 'openai' | 'anthropic';
        config: LLMProviderConfig;
    };
    /** Vector store configuration */
    vectorStore: {
        provider: 'pinecone' | 'chroma';
        config: VectorStoreConfig;
    };
    /** Indexing settings */
    indexing?: {
        batchSize?: number;
        batchDelayMs?: number;
        maxSourceCodeLength?: number;
        includeDocumentation?: boolean;
        includeDependencies?: boolean;
    };
    /** Search settings */
    search?: {
        defaultTopK?: number;
        minScore?: number;
        enableReRanking?: boolean;
    };
    /** Answer generation settings */
    generation?: {
        temperature?: number;
        maxTokens?: number;
        maxContextResults?: number;
    };
}
/**
 * Environment variable names
 */
export declare const ENV_VARS: {
    readonly LLM_PROVIDER: "CODEREF_LLM_PROVIDER";
    readonly OPENAI_API_KEY: "OPENAI_API_KEY";
    readonly OPENAI_MODEL: "CODEREF_OPENAI_MODEL";
    readonly OPENAI_ORG: "OPENAI_ORGANIZATION";
    readonly ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY";
    readonly ANTHROPIC_MODEL: "CODEREF_ANTHROPIC_MODEL";
    readonly VECTOR_STORE_PROVIDER: "CODEREF_VECTOR_STORE";
    readonly PINECONE_API_KEY: "PINECONE_API_KEY";
    readonly PINECONE_ENVIRONMENT: "PINECONE_ENVIRONMENT";
    readonly PINECONE_INDEX: "CODEREF_PINECONE_INDEX";
    readonly CHROMA_HOST: "CODEREF_CHROMA_HOST";
    readonly CHROMA_PORT: "CODEREF_CHROMA_PORT";
    readonly CHROMA_COLLECTION: "CODEREF_CHROMA_COLLECTION";
    readonly BATCH_SIZE: "CODEREF_BATCH_SIZE";
    readonly DEFAULT_TOP_K: "CODEREF_DEFAULT_TOP_K";
    readonly TEMPERATURE: "CODEREF_TEMPERATURE";
    readonly MAX_TOKENS: "CODEREF_MAX_TOKENS";
};
/**
 * Default configuration values
 */
export declare const DEFAULT_CONFIG: Partial<RAGConfig>;
/**
 * Configuration validation errors
 */
export declare class ConfigError extends Error {
    constructor(message: string);
}
/**
 * RAG configuration loader and validator
 */
export declare class RAGConfigLoader {
    /**
     * Load configuration from environment
     */
    loadConfig(): RAGConfig;
    /**
     * Get LLM provider from environment
     */
    private getLLMProvider;
    /**
     * Get LLM provider configuration
     */
    private getLLMConfig;
    /**
     * Get vector store provider from environment
     */
    private getVectorStoreProvider;
    /**
     * Get vector store configuration
     */
    private getVectorStoreConfig;
    /**
     * Get indexing settings
     */
    private getIndexingSettings;
    /**
     * Get search settings
     */
    private getSearchSettings;
    /**
     * Get generation settings
     */
    private getGenerationSettings;
    /**
     * Validate configuration
     */
    validateConfig(config: RAGConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Print configuration summary (safe for logging)
     */
    printConfigSummary(config: RAGConfig): string;
    /**
     * Generate example .env file content
     */
    generateEnvTemplate(): string;
}
//# sourceMappingURL=rag-config.d.ts.map
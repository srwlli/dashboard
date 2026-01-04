/**
 * Answer Generation Service
 * P4-T2: Orchestrates the complete Q&A pipeline
 *
 * This is the main entry point for asking questions. It:
 * 1. Searches for relevant code
 * 2. Re-ranks with graph awareness
 * 3. Builds context
 * 4. Generates answer with LLM
 * 5. Calculates confidence
 */
import type { LLMProvider } from '../llm/llm-provider.js';
import type { VectorStore } from '../vector/vector-store.js';
import type { DependencyGraph } from '../../analyzer/graph-builder.js';
import { type SearchOptions, type QueryContext } from './semantic-search.js';
import { type ReRankingOptions, type ReRankedResult } from './graph-reranker.js';
import { type ContextBuilderOptions, type BuiltContext } from './context-builder.js';
import { type PromptVariables } from './prompt-templates.js';
/**
 * Options for answer generation
 */
export interface AnswerOptions {
    /** Search options */
    searchOptions?: SearchOptions;
    /** Re-ranking options */
    rerankingOptions?: ReRankingOptions;
    /** Context building options */
    contextOptions?: ContextBuilderOptions;
    /** Completion options for LLM */
    completionOptions?: {
        temperature?: number;
        maxTokens?: number;
    };
    /** Query context for better results */
    queryContext?: QueryContext;
    /** User preferences */
    preferences?: PromptVariables['preferences'];
}
/**
 * Generated answer with metadata
 */
export interface Answer {
    /** The generated answer text */
    answer: string;
    /** Question that was asked */
    question: string;
    /** Source code references used */
    sources: ReRankedResult[];
    /** Confidence score (0-1) */
    confidence: number;
    /** Confidence explanation */
    confidenceReasoning: string;
    /** Suggested follow-up questions */
    relatedQuestions?: string[];
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Token usage */
    tokenUsage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    /** Context that was provided to LLM */
    context: BuiltContext;
    /** Metadata */
    metadata?: {
        searchTime: number;
        rerankingTime: number;
        contextBuildTime: number;
        llmTime: number;
        questionType: string;
    };
}
/**
 * Service for generating answers to code questions
 */
export declare class AnswerGenerationService {
    private llmProvider;
    private searchService;
    private reranker;
    private contextBuilder;
    private promptBuilder;
    constructor(llmProvider: LLMProvider, vectorStore: VectorStore, graph?: DependencyGraph);
    /**
     * Update the dependency graph for re-ranking
     */
    setGraph(graph: DependencyGraph): void;
    /**
     * Generate answer to a question
     */
    generateAnswer(question: string, options?: AnswerOptions): Promise<Answer>;
    /**
     * Generate answer when no results found
     */
    private generateNoResultsAnswer;
    /**
     * Calculate confidence score for the answer
     */
    private calculateConfidence;
    /**
     * Extract related questions from LLM response
     */
    private extractRelatedQuestions;
    /**
     * Generate multiple answer variations
     *
     * Useful for getting diverse perspectives or checking consistency
     */
    generateVariations(question: string, count?: number, options?: AnswerOptions): Promise<Answer[]>;
    /**
     * Validate answer quality
     *
     * Returns warnings about the generated answer
     */
    validateAnswer(answer: Answer): string[];
    /**
     * Analyze answer for quality metrics
     */
    analyzeAnswer(answer: Answer): {
        hasCodeRefs: boolean;
        codeRefCount: number;
        hasRelatedQuestions: boolean;
        answerLength: number;
        avgSourceRelevance: number;
        processingEfficiency: number;
    };
}
//# sourceMappingURL=answer-generation-service.d.ts.map
/**
 * AI Prompt Generator - Create context-aware prompts for LLM understanding
 * Phase 5, Task P5-T6: AI Agent Prompt Generation System
 *
 * Provides:
 * - Context synthesis for AI agents
 * - Template-based prompt generation
 * - Multi-hop context inclusion
 * - Token limit optimization
 */
import { GraphNode } from '../analyzer/graph-builder.js';
import { ContextTracker } from '../context/context-tracker.js';
/**
 * AI query types
 */
export type AIQueryType = 'understanding' | 'impact' | 'refactoring' | 'general';
/**
 * Generated AI prompt
 */
export interface GeneratedPrompt {
    queryType: AIQueryType;
    originalQuery: string;
    prompt: string;
    contextIncluded: {
        sourceElement: string;
        relatedElements: number;
        depth: number;
        affectedFiles: number;
    };
    tokenEstimate: number;
    maxTokens: number;
    truncated: boolean;
}
export declare class AIPromptGenerator {
    private contextTracker?;
    private maxTokens;
    private maxContextDepth;
    private tokenBudgetForContext;
    constructor(contextTracker?: ContextTracker, maxTokens?: number);
    /**
     * Generate AI prompt from context
     */
    generatePrompt(sourceElementId: string, sourceElement: GraphNode, query: string, relatedElements?: GraphNode[], queryType?: AIQueryType): GeneratedPrompt;
    /**
     * Synthesize context from elements
     */
    private synthesizeContext;
    /**
     * Get template for query type
     */
    private getTemplate;
    /**
     * Apply template with context
     */
    private applyTemplate;
    /**
     * Estimate tokens (rough approximation: 1 token ≈ 4 characters)
     */
    private estimateTokens;
    /**
     * Optimize prompt to fit token budget
     */
    private optimizePromptForTokens;
    /**
     * Set maximum tokens
     */
    setMaxTokens(tokens: number): void;
    /**
     * Set maximum context depth
     */
    setMaxContextDepth(depth: number): void;
    /**
     * Get generator statistics
     */
    getStatistics(): Record<string, any>;
}
export default AIPromptGenerator;
//# sourceMappingURL=ai-prompt-generator.d.ts.map
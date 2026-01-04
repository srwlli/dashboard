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
export class AIPromptGenerator {
    contextTracker;
    maxTokens = 4000;
    maxContextDepth = 3;
    tokenBudgetForContext = 3500; // Reserve 500 tokens for query
    constructor(contextTracker, maxTokens = 4000) {
        this.contextTracker = contextTracker;
        this.maxTokens = maxTokens;
    }
    /**
     * Generate AI prompt from context
     */
    generatePrompt(sourceElementId, sourceElement, query, relatedElements = [], queryType = 'general') {
        const startTime = Date.now();
        // Synthesize context
        const contextSynthesis = this.synthesizeContext(sourceElementId, sourceElement, relatedElements, queryType);
        // Get appropriate template
        const template = this.getTemplate(queryType);
        // Generate prompt using template
        const prompt = this.applyTemplate(template, {
            query,
            sourceElement,
            contextSynthesis,
            relatedElements,
        });
        // Estimate tokens and truncate if needed
        const tokenEstimate = this.estimateTokens(prompt);
        let finalPrompt = prompt;
        let truncated = false;
        if (tokenEstimate > this.tokenBudgetForContext) {
            const result = this.optimizePromptForTokens(prompt, this.tokenBudgetForContext);
            finalPrompt = result.optimized;
            truncated = result.truncated;
        }
        const affectedFiles = new Set(relatedElements.map((e) => e.file)).size;
        return {
            queryType,
            originalQuery: query,
            prompt: finalPrompt,
            contextIncluded: {
                sourceElement: sourceElementId,
                relatedElements: relatedElements.length,
                depth: this.maxContextDepth,
                affectedFiles,
            },
            tokenEstimate: this.estimateTokens(finalPrompt),
            maxTokens: this.maxTokens,
            truncated,
        };
    }
    /**
     * Synthesize context from elements
     */
    synthesizeContext(sourceElementId, sourceElement, relatedElements, queryType) {
        const contextLines = [];
        // Add source element description
        contextLines.push(`## Main Element`);
        contextLines.push(`- ID: ${sourceElement.id}`);
        contextLines.push(`- Type: ${sourceElement.type}`);
        if (sourceElement.file)
            contextLines.push(`- File: ${sourceElement.file}`);
        if (sourceElement.line)
            contextLines.push(`- Line: ${sourceElement.line}`);
        // Add related elements grouped by type
        if (relatedElements.length > 0) {
            contextLines.push(`\n## Related Elements (${relatedElements.length} total)`);
            // Group by type
            const byType = new Map();
            for (const elem of relatedElements) {
                if (!byType.has(elem.type))
                    byType.set(elem.type, []);
                byType.get(elem.type).push(elem);
            }
            // Add groups
            for (const [type, elements] of byType.entries()) {
                contextLines.push(`\n### ${type} (${elements.length})`);
                for (const elem of elements.slice(0, 5)) {
                    // Limit to 5 per type
                    contextLines.push(`- ${elem.id}${elem.file ? ` (${elem.file})` : ''}`);
                }
                if (elements.length > 5) {
                    contextLines.push(`- ... and ${elements.length - 5} more`);
                }
            }
        }
        // Add query-type specific context
        if (queryType === 'impact') {
            contextLines.push(`\n## Impact Context`);
            contextLines.push(`- This query focuses on understanding the blast radius and cascading effects`);
            contextLines.push(`- Consider all transitive dependencies when analyzing impact`);
        }
        else if (queryType === 'refactoring') {
            contextLines.push(`\n## Refactoring Context`);
            contextLines.push(`- This query focuses on code improvements and restructuring`);
            contextLines.push(`- Consider backward compatibility and migration paths`);
        }
        else if (queryType === 'understanding') {
            contextLines.push(`\n## Understanding Context`);
            contextLines.push(`- This query focuses on code comprehension and relationships`);
            contextLines.push(`- Include usage patterns and integration points`);
        }
        return contextLines.join('\n');
    }
    /**
     * Get template for query type
     */
    getTemplate(queryType) {
        const templates = {
            understanding: `You are analyzing a codebase to understand code structure and relationships.

Query: {query}

{context}

Please help understand:
1. What this element does
2. How it's used by other parts of the system
3. What dependencies it has
4. Potential improvements or issues`,
            impact: `You are analyzing the impact of a potential code change.

Query: {query}

{context}

Please analyze:
1. Direct impact of changing this element
2. Cascading effects on dependent code
3. Risk assessment (low/medium/high)
4. Recommended testing strategy
5. Mitigation strategies if risks are identified`,
            refactoring: `You are planning a code refactoring.

Query: {query}

{context}

Please help with:
1. Current structure and design patterns
2. Recommended refactoring approach
3. Elements that must be preserved
4. Migration strategy for consumers
5. Testing considerations`,
            general: `You are analyzing code in context of a developer question.

Query: {query}

{context}

Please provide relevant analysis and recommendations.`,
        };
        return templates[queryType];
    }
    /**
     * Apply template with context
     */
    applyTemplate(template, data) {
        return template
            .replace('{query}', data.query)
            .replace('{context}', data.contextSynthesis)
            .replace('{sourceElement}', data.sourceElement.id);
    }
    /**
     * Estimate tokens (rough approximation: 1 token ≈ 4 characters)
     */
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    /**
     * Optimize prompt to fit token budget
     */
    optimizePromptForTokens(prompt, budget) {
        const tokenCount = this.estimateTokens(prompt);
        if (tokenCount <= budget) {
            return { optimized: prompt, truncated: false };
        }
        // Calculate how much we need to keep
        const ratio = budget / tokenCount;
        const charLimit = Math.floor(prompt.length * ratio);
        // TODO: Smart truncation that preserves structure
        // For now, simple truncation
        let truncated = prompt.substring(0, charLimit);
        // Try to truncate at paragraph boundary
        const lastParagraphEnd = truncated.lastIndexOf('\n\n');
        if (lastParagraphEnd > charLimit * 0.8) {
            truncated = truncated.substring(0, lastParagraphEnd);
        }
        truncated += '\n\n[Context truncated to fit token limit]';
        return { optimized: truncated, truncated: true };
    }
    /**
     * Set maximum tokens
     */
    setMaxTokens(tokens) {
        if (tokens < 1000) {
            throw new Error('Max tokens must be at least 1000');
        }
        this.maxTokens = tokens;
        this.tokenBudgetForContext = tokens - 500;
    }
    /**
     * Set maximum context depth
     */
    setMaxContextDepth(depth) {
        if (depth < 1 || depth > 5) {
            throw new Error('Max context depth must be between 1 and 5');
        }
        this.maxContextDepth = depth;
    }
    /**
     * Get generator statistics
     */
    getStatistics() {
        return {
            maxTokens: this.maxTokens,
            tokenBudgetForContext: this.tokenBudgetForContext,
            maxContextDepth: this.maxContextDepth,
            supportedQueryTypes: ['understanding', 'impact', 'refactoring', 'general'],
        };
    }
}
export default AIPromptGenerator;
//# sourceMappingURL=ai-prompt-generator.js.map
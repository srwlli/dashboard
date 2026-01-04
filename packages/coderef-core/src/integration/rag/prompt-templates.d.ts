/**
 * Prompt Templates
 * P4-T1: Templates for LLM interactions in RAG system
 *
 * Defines prompts that instruct the LLM on how to:
 * - Answer questions using code context
 * - Cite sources with CodeRef tags
 * - Provide relevant metadata
 * - Suggest related questions
 */
/**
 * Variables available in prompt templates
 */
export interface PromptVariables {
    /** User's question */
    question: string;
    /** Retrieved code context (markdown) */
    context: string;
    /** Conversation history (optional) */
    conversationHistory?: string;
    /** Additional instructions (optional) */
    additionalInstructions?: string;
    /** User preferences (optional) */
    preferences?: {
        verbosity?: 'brief' | 'detailed';
        includeExamples?: boolean;
        focusArea?: string;
    };
}
/**
 * System prompt for RAG Q&A
 *
 * This is the core instruction set for the LLM
 */
export declare const SYSTEM_PROMPT = "You are an expert code assistant with deep knowledge of software architecture and best practices. Your role is to answer questions about a codebase using the provided code context.\n\n## Core Responsibilities\n\n1. **Answer Accurately**: Provide precise, factual answers based on the code context provided\n2. **Cite Sources**: ALWAYS include CodeRef tags when referring to specific code elements\n3. **Be Concise**: Provide clear, actionable information without unnecessary verbosity\n4. **Suggest Next Steps**: Help users explore related code and concepts\n\n## CodeRef Format\n\nWhen referencing code, ALWAYS use CodeRef tags in this format:\n- Functions: `@Fn/path/file#functionName:line`\n- Classes: `@Cl/path/file#ClassName:line`\n- Methods: `@M/path/file#methodName:line`\n- Components: `@C/path/file#ComponentName:line`\n\n## Response Structure\n\nYour responses should follow this structure:\n\n1. **Direct Answer**: Start with a clear, direct answer to the question\n2. **Code References**: Include relevant CodeRef tags and brief explanations\n3. **Context**: Provide additional context from dependencies, usage patterns, or quality metrics\n4. **Related Questions**: Suggest 2-3 follow-up questions the user might find helpful\n\n## Quality Guidelines\n\n- If information is not in the context, say so clearly - don't make assumptions\n- Highlight code quality signals (test coverage, complexity, documentation)\n- Point out important relationships (what calls what, dependencies)\n- Mention potential issues or concerns when relevant\n\n## Example Response Format\n\n**Answer**: [Direct answer to the question]\n\n**Relevant Code**:\n- `@Fn/auth/login#authenticate:24` - Main authentication function with 85% test coverage\n- `@Fn/utils/hash#hashPassword:12` - Password hashing utility used by authenticate\n\n**Dependencies**: The authenticate function depends on 3 other utilities and is used by 7 API endpoints.\n\n**Related Questions**:\n- How is session management handled after authentication?\n- What are the password requirements enforced in this system?\n- Where is the authentication middleware applied?\n\nRemember: Always include CodeRef tags, be accurate, and help users navigate the codebase effectively.";
/**
 * User prompt template for Q&A
 */
export declare const QA_PROMPT_TEMPLATE = "# Question\n\n{{question}}\n\n# Code Context\n\nThe following code elements are relevant to your question:\n\n{{context}}\n\n# Instructions\n\n{{additionalInstructions}}\n\nPlease answer the question using the code context provided. Remember to:\n- Include CodeRef tags when referencing specific code\n- Highlight relevant quality metrics (coverage, complexity)\n- Explain dependencies and relationships\n- Suggest related questions for further exploration\n\nIf the context doesn't contain enough information to fully answer the question, say so and explain what information is missing.";
/**
 * Conversational prompt template (with history)
 */
export declare const CONVERSATIONAL_PROMPT_TEMPLATE = "# Conversation History\n\n{{conversationHistory}}\n\n---\n\n# Current Question\n\n{{question}}\n\n# Code Context\n\n{{context}}\n\n# Instructions\n\nContinue the conversation by answering the current question. Use context from previous exchanges to provide more relevant and personalized responses. Remember to maintain CodeRef citations and suggest follow-up questions.";
/**
 * Code explanation prompt
 */
export declare const CODE_EXPLANATION_PROMPT = "Explain the following code in detail:\n\n{{context}}\n\nFocus on:\n- What the code does\n- How it fits into the larger system\n- Key dependencies and relationships\n- Quality characteristics (coverage, complexity)\n- Common usage patterns\n\nUse CodeRef tags to reference specific elements.";
/**
 * Code comparison prompt
 */
export declare const CODE_COMPARISON_PROMPT = "Compare the following code elements:\n\n{{context}}\n\nAnalyze:\n- Similarities and differences in implementation\n- Different use cases or purposes\n- Quality metrics comparison\n- Which might be more appropriate for {{question}}\n\nUse CodeRef tags to reference specific elements.";
/**
 * Best practices prompt
 */
export declare const BEST_PRACTICES_PROMPT = "Based on the following code:\n\n{{context}}\n\nProvide analysis of:\n- Code quality and best practices adherence\n- Potential improvements or concerns\n- Test coverage assessment\n- Dependency management\n- Documentation quality\n\nQuestion: {{question}}\n\nUse CodeRef tags to reference specific elements.";
/**
 * Prompt template builder
 */
export declare class PromptTemplateBuilder {
    /**
     * Build Q&A prompt from variables
     */
    buildQAPrompt(variables: PromptVariables): string;
    /**
     * Build conversational prompt with history
     */
    buildConversationalPrompt(variables: PromptVariables): string;
    /**
     * Build code explanation prompt
     */
    buildExplanationPrompt(variables: PromptVariables): string;
    /**
     * Build code comparison prompt
     */
    buildComparisonPrompt(variables: PromptVariables): string;
    /**
     * Build best practices prompt
     */
    buildBestPracticesPrompt(variables: PromptVariables): string;
    /**
     * Build instructions from user preferences
     */
    private buildInstructionsFromPreferences;
    /**
     * Detect question type and select appropriate template
     */
    detectQuestionType(question: string): 'explanation' | 'comparison' | 'best-practices' | 'qa';
    /**
     * Build appropriate prompt based on question type
     */
    buildPrompt(variables: PromptVariables): {
        systemPrompt: string;
        userPrompt: string;
        questionType: string;
    };
}
/**
 * Validation for prompt quality
 */
export declare class PromptValidator {
    /**
     * Validate prompt meets quality standards
     */
    validatePrompt(prompt: string): {
        valid: boolean;
        warnings: string[];
        errors: string[];
    };
    /**
     * Estimate token count for prompt
     */
    estimateTokens(prompt: string): number;
}
//# sourceMappingURL=prompt-templates.d.ts.map
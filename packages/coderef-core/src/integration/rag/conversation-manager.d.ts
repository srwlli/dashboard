/**
 * Conversation Manager
 * P4-T3: Manages conversation sessions and message history
 *
 * Enables multi-turn conversations by:
 * - Tracking message history
 * - Maintaining session context
 * - Supporting conversation continuation
 * - Managing session lifecycle
 */
import type { Answer } from './answer-generation-service.js';
/**
 * A single message in a conversation
 */
export interface ConversationMessage {
    /** Message ID */
    id: string;
    /** Role: user or assistant */
    role: 'user' | 'assistant';
    /** Message content */
    content: string;
    /** Timestamp */
    timestamp: number;
    /** Message metadata */
    metadata?: {
        /** For user messages: query context */
        queryType?: string;
        /** For assistant messages: confidence */
        confidence?: number;
        /** For assistant messages: sources used */
        sourceCount?: number;
        /** Token usage */
        tokenUsage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    };
}
/**
 * A conversation session
 */
export interface ConversationSession {
    /** Session ID */
    sessionId: string;
    /** Messages in this conversation */
    messages: ConversationMessage[];
    /** Session created timestamp */
    createdAt: number;
    /** Last activity timestamp */
    lastActivityAt: number;
    /** Session metadata */
    metadata?: {
        /** User identifier (optional) */
        userId?: string;
        /** Session title/topic */
        title?: string;
        /** Total tokens used in session */
        totalTokens?: number;
        /** Number of questions asked */
        questionCount?: number;
    };
}
/**
 * Options for conversation management
 */
export interface ConversationOptions {
    /** Maximum messages to keep in history */
    maxHistoryLength?: number;
    /** Maximum tokens in history (older messages removed to fit) */
    maxHistoryTokens?: number;
    /** Session timeout in milliseconds */
    sessionTimeoutMs?: number;
    /** Whether to include full message history in context */
    includeFullHistory?: boolean;
}
/**
 * Manages conversation sessions and history
 */
export declare class ConversationManager {
    private sessions;
    private options;
    constructor(options?: ConversationOptions);
    /**
     * Create a new conversation session
     */
    createSession(userId?: string): ConversationSession;
    /**
     * Get existing session or create new one
     */
    getOrCreateSession(sessionId?: string, userId?: string): ConversationSession;
    /**
     * Add user question to conversation
     */
    addUserMessage(sessionId: string, question: string, metadata?: ConversationMessage['metadata']): void;
    /**
     * Add assistant answer to conversation
     */
    addAssistantMessage(sessionId: string, answer: Answer): void;
    /**
     * Get conversation history for a session
     */
    getHistory(sessionId: string): ConversationMessage[];
    /**
     * Get conversation history formatted for LLM context
     */
    getHistoryForContext(sessionId: string, lastN?: number): string;
    /**
     * Clear a conversation session
     */
    clearSession(sessionId: string): void;
    /**
     * Clear all expired sessions
     */
    clearExpiredSessions(): number;
    /**
     * Get all active sessions
     */
    getActiveSessions(): ConversationSession[];
    /**
     * Get session statistics
     */
    getSessionStats(sessionId: string): {
        messageCount: number;
        questionCount: number;
        totalTokens: number;
        avgConfidence: number;
        duration: number;
    } | null;
    /**
     * Export conversation to JSON
     */
    exportConversation(sessionId: string): string;
    /**
     * Import conversation from JSON
     */
    importConversation(json: string): ConversationSession;
    /**
     * Trim conversation history to fit limits
     */
    private trimHistory;
    /**
     * Check if session is expired
     */
    private isSessionExpired;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Generate unique message ID
     */
    private generateMessageId;
    /**
     * Start interval to cleanup expired sessions
     */
    private startCleanupInterval;
    /**
     * Generate conversation summary
     */
    summarizeConversation(sessionId: string): string;
}
//# sourceMappingURL=conversation-manager.d.ts.map
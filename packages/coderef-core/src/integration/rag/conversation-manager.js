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
/**
 * Manages conversation sessions and history
 */
export class ConversationManager {
    sessions = new Map();
    options;
    constructor(options) {
        this.options = {
            maxHistoryLength: options?.maxHistoryLength ?? 20,
            maxHistoryTokens: options?.maxHistoryTokens ?? 4000,
            sessionTimeoutMs: options?.sessionTimeoutMs ?? 3600000, // 1 hour
            includeFullHistory: options?.includeFullHistory ?? true
        };
        // Start cleanup interval
        this.startCleanupInterval();
    }
    /**
     * Create a new conversation session
     */
    createSession(userId) {
        const sessionId = this.generateSessionId();
        const session = {
            sessionId,
            messages: [],
            createdAt: Date.now(),
            lastActivityAt: Date.now(),
            metadata: {
                userId,
                totalTokens: 0,
                questionCount: 0
            }
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    /**
     * Get existing session or create new one
     */
    getOrCreateSession(sessionId, userId) {
        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            // Check if session is expired
            if (this.isSessionExpired(session)) {
                this.sessions.delete(sessionId);
                return this.createSession(userId);
            }
            session.lastActivityAt = Date.now();
            return session;
        }
        return this.createSession(userId);
    }
    /**
     * Add user question to conversation
     */
    addUserMessage(sessionId, question, metadata) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const message = {
            id: this.generateMessageId(),
            role: 'user',
            content: question,
            timestamp: Date.now(),
            metadata
        };
        session.messages.push(message);
        session.lastActivityAt = Date.now();
        if (session.metadata) {
            session.metadata.questionCount = (session.metadata.questionCount || 0) + 1;
        }
        // Trim history if needed
        this.trimHistory(session);
    }
    /**
     * Add assistant answer to conversation
     */
    addAssistantMessage(sessionId, answer) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const message = {
            id: this.generateMessageId(),
            role: 'assistant',
            content: answer.answer,
            timestamp: Date.now(),
            metadata: {
                confidence: answer.confidence,
                sourceCount: answer.sources.length,
                tokenUsage: answer.tokenUsage
            }
        };
        session.messages.push(message);
        session.lastActivityAt = Date.now();
        // Update session token count
        if (session.metadata) {
            session.metadata.totalTokens =
                (session.metadata.totalTokens || 0) + answer.tokenUsage.totalTokens;
        }
        // Trim history if needed
        this.trimHistory(session);
    }
    /**
     * Get conversation history for a session
     */
    getHistory(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? [...session.messages] : [];
    }
    /**
     * Get conversation history formatted for LLM context
     */
    getHistoryForContext(sessionId, lastN) {
        const session = this.sessions.get(sessionId);
        if (!session || session.messages.length === 0) {
            return 'No previous conversation.';
        }
        const messages = lastN
            ? session.messages.slice(-lastN * 2) // Get last N Q&A pairs
            : session.messages;
        const formatted = messages.map((msg, idx) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `**${role}**: ${msg.content}`;
        });
        return formatted.join('\n\n---\n\n');
    }
    /**
     * Clear a conversation session
     */
    clearSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    /**
     * Clear all expired sessions
     */
    clearExpiredSessions() {
        let cleared = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (this.isSessionExpired(session)) {
                this.sessions.delete(sessionId);
                cleared++;
            }
        }
        return cleared;
    }
    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.sessions.values()).filter((session) => !this.isSessionExpired(session));
    }
    /**
     * Get session statistics
     */
    getSessionStats(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        const assistantMessages = session.messages.filter((m) => m.role === 'assistant');
        const confidenceScores = assistantMessages
            .map((m) => m.metadata?.confidence)
            .filter((c) => c !== undefined);
        const avgConfidence = confidenceScores.length > 0
            ? confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length
            : 0;
        const duration = session.lastActivityAt - session.createdAt;
        return {
            messageCount: session.messages.length,
            questionCount: session.metadata?.questionCount || 0,
            totalTokens: session.metadata?.totalTokens || 0,
            avgConfidence,
            duration
        };
    }
    /**
     * Export conversation to JSON
     */
    exportConversation(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        return JSON.stringify(session, null, 2);
    }
    /**
     * Import conversation from JSON
     */
    importConversation(json) {
        const session = JSON.parse(json);
        this.sessions.set(session.sessionId, session);
        return session;
    }
    /**
     * Trim conversation history to fit limits
     */
    trimHistory(session) {
        // Trim by message count
        if (session.messages.length > this.options.maxHistoryLength) {
            const excess = session.messages.length - this.options.maxHistoryLength;
            session.messages.splice(0, excess);
        }
        // Trim by token count
        let totalTokens = session.messages.reduce((sum, msg) => sum + (msg.metadata?.tokenUsage?.totalTokens || 0), 0);
        while (totalTokens > this.options.maxHistoryTokens &&
            session.messages.length > 2) {
            // Keep at least one Q&A pair
            const removed = session.messages.shift();
            if (removed?.metadata?.tokenUsage) {
                totalTokens -= removed.metadata.tokenUsage.totalTokens;
            }
        }
    }
    /**
     * Check if session is expired
     */
    isSessionExpired(session) {
        const timeSinceActivity = Date.now() - session.lastActivityAt;
        return timeSinceActivity > this.options.sessionTimeoutMs;
    }
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Start interval to cleanup expired sessions
     */
    startCleanupInterval() {
        // Run cleanup every 5 minutes
        setInterval(() => {
            const cleared = this.clearExpiredSessions();
            if (cleared > 0) {
                console.log(`Cleared ${cleared} expired conversation sessions`);
            }
        }, 300000);
    }
    /**
     * Generate conversation summary
     */
    summarizeConversation(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return 'Session not found';
        }
        const stats = this.getSessionStats(sessionId);
        if (!stats) {
            return 'No statistics available';
        }
        const questions = session.messages
            .filter((m) => m.role === 'user')
            .map((m) => m.content);
        return [
            `Conversation Summary (${sessionId})`,
            `Duration: ${Math.round(stats.duration / 1000)}s`,
            `Questions: ${stats.questionCount}`,
            `Messages: ${stats.messageCount}`,
            `Tokens: ${stats.totalTokens}`,
            `Avg Confidence: ${(stats.avgConfidence * 100).toFixed(0)}%`,
            '',
            'Topics Discussed:',
            ...questions.map((q, i) => `${i + 1}. ${q}`)
        ].join('\n');
    }
}
//# sourceMappingURL=conversation-manager.js.map
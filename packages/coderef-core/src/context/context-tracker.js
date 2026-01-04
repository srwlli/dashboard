/**
 * Context Tracker - Maintains conversation state across multiple queries
 * Phase 5, Task P5-T2: Context Tracking (setContext, getContext)
 *
 * Provides:
 * - Context storage and retrieval
 * - History management with size limits
 * - TTL-based context expiration
 * - Context persistence and merging
 */
export class ContextTracker {
    contexts = new Map();
    history = [];
    conversationId;
    maxHistorySize = 100;
    defaultTTL = 3600000; // 1 hour in milliseconds
    cleanupInterval;
    constructor(conversationId = this.generateId(), maxHistorySize = 100) {
        this.conversationId = conversationId;
        this.maxHistorySize = maxHistorySize;
        this.startCleanupTimer();
    }
    /**
     * Set context value with optional TTL
     */
    setContext(key, value, ttl) {
        const id = this.generateId();
        const entry = {
            id,
            key,
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
            metadata: {
                conversationId: this.conversationId,
            },
        };
        this.contexts.set(key, entry);
        this.addToHistory(entry);
        return id;
    }
    /**
     * Get context value by key
     */
    getContext(key) {
        const entry = this.contexts.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.contexts.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Get context entry with metadata
     */
    getContextEntry(key) {
        const entry = this.contexts.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.contexts.delete(key);
            return null;
        }
        return entry;
    }
    /**
     * Check if context key exists
     */
    hasContext(key) {
        return this.getContext(key) !== null;
    }
    /**
     * List all active context keys
     */
    getContextKeys() {
        const keys = [];
        for (const [key, entry] of this.contexts.entries()) {
            // Skip expired entries
            if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
                this.contexts.delete(key);
                continue;
            }
            keys.push(key);
        }
        return keys;
    }
    /**
     * Get all active context entries
     */
    getAllContext() {
        const result = {};
        for (const [key, entry] of this.contexts.entries()) {
            // Skip expired entries
            if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
                this.contexts.delete(key);
                continue;
            }
            result[key] = entry.value;
        }
        return result;
    }
    /**
     * Delete specific context
     */
    deleteContext(key) {
        return this.contexts.delete(key);
    }
    /**
     * Clear all context
     */
    clearContext() {
        this.contexts.clear();
    }
    /**
     * Merge multiple context values
     */
    mergeContext(source, mergeStrategy = 'overwrite') {
        for (const [key, value] of Object.entries(source)) {
            if (mergeStrategy === 'overwrite') {
                this.setContext(key, value);
            }
            else if (mergeStrategy === 'preserve') {
                if (!this.hasContext(key)) {
                    this.setContext(key, value);
                }
            }
            else if (mergeStrategy === 'concat') {
                const existing = this.getContext(key);
                if (Array.isArray(existing) && Array.isArray(value)) {
                    this.setContext(key, [...existing, ...value]);
                }
                else if (typeof existing === 'object' && typeof value === 'object') {
                    this.setContext(key, { ...existing, ...value });
                }
                else {
                    this.setContext(key, value);
                }
            }
        }
    }
    /**
     * Get complete conversation history
     */
    getHistory() {
        return {
            conversationId: this.conversationId,
            entries: [...this.history],
            createdAt: this.history[0]?.timestamp || Date.now(),
            lastAccessed: Date.now(),
        };
    }
    /**
     * Get history entries for specific key
     */
    getKeyHistory(key) {
        return this.history.filter((entry) => entry.key === key);
    }
    /**
     * Get history of last N entries
     */
    getRecentHistory(count) {
        return this.history.slice(Math.max(0, this.history.length - count));
    }
    /**
     * Get conversation ID
     */
    getConversationId() {
        return this.conversationId;
    }
    /**
     * Export context to JSON
     */
    exportToJSON() {
        const data = {
            conversationId: this.conversationId,
            contexts: Array.from(this.contexts.entries()).map(([key, entry]) => ({
                key,
                ...entry,
            })),
            history: this.history,
            exportedAt: Date.now(),
        };
        return JSON.stringify(data, null, 2);
    }
    /**
     * Import context from JSON
     */
    importFromJSON(json) {
        try {
            const data = JSON.parse(json);
            this.conversationId = data.conversationId;
            this.contexts.clear();
            for (const entry of data.contexts) {
                const { key, ...contextEntry } = entry;
                this.contexts.set(key, contextEntry);
            }
            this.history = data.history;
        }
        catch (error) {
            throw new Error(`Failed to import context from JSON: ${error.message}`);
        }
    }
    /**
     * Get context statistics
     */
    getStatistics() {
        return {
            conversationId: this.conversationId,
            contextCount: this.contexts.size,
            historySize: this.history.length,
            maxHistorySize: this.maxHistorySize,
            activeKeys: this.getContextKeys().length,
            memory: {
                contextSize: JSON.stringify(Array.from(this.contexts.values())).length,
                historySize: JSON.stringify(this.history).length,
            },
        };
    }
    /**
     * Clean up expired contexts
     */
    cleanupExpiredContexts() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.contexts.entries()) {
            if (entry.ttl && now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.contexts.delete(key);
        }
    }
    /**
     * Add entry to history
     */
    addToHistory(entry) {
        this.history.push(entry);
        // Enforce history size limit
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(Math.max(0, this.history.length - this.maxHistorySize));
        }
    }
    /**
     * Start periodic cleanup of expired contexts
     */
    startCleanupTimer() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredContexts();
        }, 60000); // Run every minute
    }
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Destroy tracker and clean up resources
     */
    destroy() {
        this.stopCleanupTimer();
        this.clearContext();
        this.history = [];
    }
}
export default ContextTracker;
//# sourceMappingURL=context-tracker.js.map
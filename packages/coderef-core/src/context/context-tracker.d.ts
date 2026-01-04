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
/**
 * Represents a stored context entry with metadata
 */
export interface ContextEntry {
    id: string;
    key: string;
    value: any;
    timestamp: number;
    ttl?: number;
    metadata?: Record<string, any>;
}
/**
 * Represents the complete conversation history
 */
export interface ContextHistory {
    conversationId: string;
    entries: ContextEntry[];
    createdAt: number;
    lastAccessed: number;
    metadata?: Record<string, any>;
}
export declare class ContextTracker {
    private contexts;
    private history;
    private conversationId;
    private maxHistorySize;
    private defaultTTL;
    private cleanupInterval?;
    constructor(conversationId?: string, maxHistorySize?: number);
    /**
     * Set context value with optional TTL
     */
    setContext(key: string, value: any, ttl?: number): string;
    /**
     * Get context value by key
     */
    getContext(key: string): any | null;
    /**
     * Get context entry with metadata
     */
    getContextEntry(key: string): ContextEntry | null;
    /**
     * Check if context key exists
     */
    hasContext(key: string): boolean;
    /**
     * List all active context keys
     */
    getContextKeys(): string[];
    /**
     * Get all active context entries
     */
    getAllContext(): Record<string, any>;
    /**
     * Delete specific context
     */
    deleteContext(key: string): boolean;
    /**
     * Clear all context
     */
    clearContext(): void;
    /**
     * Merge multiple context values
     */
    mergeContext(source: Record<string, any>, mergeStrategy?: 'overwrite' | 'preserve' | 'concat'): void;
    /**
     * Get complete conversation history
     */
    getHistory(): ContextHistory;
    /**
     * Get history entries for specific key
     */
    getKeyHistory(key: string): ContextEntry[];
    /**
     * Get history of last N entries
     */
    getRecentHistory(count: number): ContextEntry[];
    /**
     * Get conversation ID
     */
    getConversationId(): string;
    /**
     * Export context to JSON
     */
    exportToJSON(): string;
    /**
     * Import context from JSON
     */
    importFromJSON(json: string): void;
    /**
     * Get context statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Clean up expired contexts
     */
    private cleanupExpiredContexts;
    /**
     * Add entry to history
     */
    private addToHistory;
    /**
     * Start periodic cleanup of expired contexts
     */
    private startCleanupTimer;
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer(): void;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Destroy tracker and clean up resources
     */
    destroy(): void;
}
export default ContextTracker;
//# sourceMappingURL=context-tracker.d.ts.map
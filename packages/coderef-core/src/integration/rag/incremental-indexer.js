/**
 * Incremental Indexer
 * P2-T5: Tracks file changes to avoid re-embedding unchanged code
 *
 * Uses file hashes to detect changes and only processes modified files,
 * significantly reducing API costs and processing time for large codebases.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
/**
 * Manages incremental indexing to avoid redundant work
 */
export class IncrementalIndexer {
    basePath;
    stateFile;
    currentState;
    constructor(basePath = process.cwd(), stateFile) {
        this.basePath = basePath;
        this.stateFile = stateFile ?? path.join(basePath, '.coderef-rag-index.json');
    }
    /**
     * Load existing index state from disk
     */
    async loadState() {
        try {
            const content = await fs.readFile(this.stateFile, 'utf-8');
            const data = JSON.parse(content);
            // Convert files array to Map
            const files = new Map();
            if (data.files && Array.isArray(data.files)) {
                for (const file of data.files) {
                    files.set(file.file, file);
                }
            }
            this.currentState = {
                ...data,
                files
            };
            return this.currentState;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // State file doesn't exist yet, that's ok
                return null;
            }
            throw new Error(`Failed to load index state: ${error.message}`);
        }
    }
    /**
     * Save index state to disk
     */
    async saveState(state) {
        try {
            // Convert Map to array for JSON serialization
            const filesArray = Array.from(state.files.values());
            const data = {
                ...state,
                files: filesArray
            };
            await fs.writeFile(this.stateFile, JSON.stringify(data, null, 2), 'utf-8');
            this.currentState = state;
        }
        catch (error) {
            throw new Error(`Failed to save index state: ${error.message}`);
        }
    }
    /**
     * Analyze which files need re-indexing
     */
    async analyzeChanges(currentFiles, options) {
        const opts = {
            force: options?.force ?? false,
            stateFile: options?.stateFile ?? this.stateFile
        };
        // Load existing state
        const previousState = await this.loadState();
        const modifiedFiles = [];
        const newFiles = [];
        const unchangedFiles = [];
        const deletedFiles = [];
        const chunksToDelete = [];
        // If forcing or no previous state, all files are "new"
        if (opts.force || !previousState) {
            return {
                modifiedFiles: [],
                newFiles: currentFiles,
                deletedFiles: [],
                unchangedFiles: [],
                totalFiles: currentFiles.length,
                chunksToDelete: [],
                summary: {
                    needsIndexing: currentFiles.length,
                    unchanged: 0,
                    deletions: 0
                }
            };
        }
        // Check each current file
        for (const file of currentFiles) {
            const previousFileState = previousState.files.get(file);
            if (!previousFileState) {
                // New file
                newFiles.push(file);
            }
            else {
                // Check if file was modified
                const currentHash = await this.hashFile(file);
                if (currentHash !== previousFileState.hash) {
                    // File was modified
                    modifiedFiles.push(file);
                    // Mark old chunks for deletion
                    chunksToDelete.push(...previousFileState.chunks);
                }
                else {
                    // File unchanged
                    unchangedFiles.push(file);
                }
            }
        }
        // Find deleted files
        const currentFileSet = new Set(currentFiles);
        for (const [file, fileState] of previousState.files) {
            if (!currentFileSet.has(file)) {
                deletedFiles.push(file);
                chunksToDelete.push(...fileState.chunks);
            }
        }
        return {
            modifiedFiles,
            newFiles,
            deletedFiles,
            unchangedFiles,
            totalFiles: currentFiles.length,
            chunksToDelete,
            summary: {
                needsIndexing: newFiles.length + modifiedFiles.length,
                unchanged: unchangedFiles.length,
                deletions: deletedFiles.length
            }
        };
    }
    /**
     * Filter chunks to only those from changed files
     */
    async filterChangedChunks(allChunks, options) {
        // Get all unique files from chunks
        const files = new Set(allChunks.map(chunk => chunk.file));
        const fileList = Array.from(files);
        // Analyze changes
        const analysis = await this.analyzeChanges(fileList, options);
        // Filter chunks
        const filesToIndex = new Set([
            ...analysis.newFiles,
            ...analysis.modifiedFiles
        ]);
        const chunksToIndex = allChunks.filter(chunk => filesToIndex.has(chunk.file));
        // Chunks to keep are from unchanged files
        const previousState = await this.loadState();
        const chunksToKeep = [];
        if (previousState) {
            for (const file of analysis.unchangedFiles) {
                const fileState = previousState.files.get(file);
                if (fileState) {
                    chunksToKeep.push(...fileState.chunks);
                }
            }
        }
        return {
            chunksToIndex,
            chunksToKeep
        };
    }
    /**
     * Update index state after indexing
     */
    async updateState(indexedChunks, preserveUnchanged = true) {
        // Load existing state or create new one
        let state = await this.loadState();
        if (!state) {
            state = {
                version: '1.0',
                lastIndexed: Date.now(),
                basePath: this.basePath,
                files: new Map()
            };
        }
        else if (!preserveUnchanged) {
            // Clear existing state if not preserving
            state.files.clear();
        }
        // Group chunks by file
        const chunksByFile = new Map();
        for (const chunk of indexedChunks) {
            const chunks = chunksByFile.get(chunk.file) || [];
            chunks.push(chunk);
            chunksByFile.set(chunk.file, chunks);
        }
        // Update file states
        for (const [file, chunks] of chunksByFile) {
            const hash = await this.hashFile(file);
            state.files.set(file, {
                file,
                hash,
                timestamp: Date.now(),
                chunks: chunks.map(c => c.coderef),
                chunkCount: chunks.length
            });
        }
        // Update last indexed timestamp
        state.lastIndexed = Date.now();
        // Save state
        await this.saveState(state);
        return state;
    }
    /**
     * Hash file content using SHA-256
     */
    async hashFile(filePath) {
        try {
            const fullPath = path.isAbsolute(filePath)
                ? filePath
                : path.join(this.basePath, filePath);
            const content = await fs.readFile(fullPath, 'utf-8');
            return crypto.createHash('sha256').update(content).digest('hex');
        }
        catch (error) {
            throw new Error(`Failed to hash file ${filePath}: ${error.message}`);
        }
    }
    /**
     * Clear index state
     */
    async clearState() {
        try {
            await fs.unlink(this.stateFile);
            this.currentState = undefined;
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw new Error(`Failed to clear state: ${error.message}`);
            }
        }
    }
    /**
     * Get statistics about current state
     */
    async getStatistics() {
        const state = await this.loadState();
        if (!state) {
            return null;
        }
        let totalChunks = 0;
        let oldestTimestamp = Infinity;
        let newestTimestamp = 0;
        for (const fileState of state.files.values()) {
            totalChunks += fileState.chunkCount;
            oldestTimestamp = Math.min(oldestTimestamp, fileState.timestamp);
            newestTimestamp = Math.max(newestTimestamp, fileState.timestamp);
        }
        return {
            totalFiles: state.files.size,
            totalChunks,
            lastIndexed: new Date(state.lastIndexed),
            oldestFile: new Date(oldestTimestamp),
            newestFile: new Date(newestTimestamp)
        };
    }
    /**
     * Check if a specific file needs reindexing
     */
    async needsReindexing(filePath) {
        const state = await this.loadState();
        if (!state) {
            return true; // No state, needs indexing
        }
        const fileState = state.files.get(filePath);
        if (!fileState) {
            return true; // File not in index, needs indexing
        }
        try {
            const currentHash = await this.hashFile(filePath);
            return currentHash !== fileState.hash; // Changed if hashes differ
        }
        catch (error) {
            return true; // Error reading file, assume needs indexing
        }
    }
}
//# sourceMappingURL=incremental-indexer.js.map
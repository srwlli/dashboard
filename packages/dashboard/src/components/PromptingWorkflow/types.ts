/**
 * Attachment data structure representing a file, pasted text, or image
 */
export interface Attachment {
  id: string;                          // UUID
  filename: string;                    // Original filename (UserAuth.tsx) or auto-generated (clipboard_001.txt)
  type: 'FILE' | 'PASTED_TEXT' | 'IMAGE';
  extension: string;                   // .tsx, .txt, .md, .json, etc
  mimeType: string;                    // text/typescript, text/plain, image/png, etc
  size: number;                        // File size in bytes
  content?: string;                    // Actual file content (critical for export)
  preview?: string;                    // First 200 chars for preview
  language?: string;                   // typescript, python, javascript (for code block formatting)
  isText: boolean;                     // Can be extracted to text/code
  isBinary: boolean;                   // Image, PDF, etc - cannot extract content
  createdAt: Date;
}

/**
 * Preloaded prompt template
 */
export interface PreloadedPrompt {
  key: string;                         // '0001', '0002', '0003'
  name: string;                        // 'CODE_REVIEW', 'SYNTHESIZE', 'CONSOLIDATE'
  label: string;                       // 'Code Review', 'Synthesize', 'Consolidate' (for UI)
  text: string;                        // Full prompt text WITH agent identification header
  estimatedTokens: number;             // ~950, ~1300, ~1300
  description: string;                 // What this prompt does
}

/**
 * Current workflow state
 */
export interface Workflow {
  id: string;                          // UUID
  selectedPrompt?: PreloadedPrompt;
  selectedTags?: string[];             // Selected improvement tag IDs for CODE_REVIEW prompt
  attachments: Attachment[];
  finalResult?: string;                // LLM output pasted back by user
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Complete workflow session for saving/loading
 */
export interface WorkflowSession {
  id: string;                          // 'session_2025_01_05_143045'
  created: Date;
  name: string;                        // 'UserAuth Code Review'
  description?: string;
  workflow: {
    prompt: PreloadedPrompt;
    attachments: Attachment[];         // WITH content field populated
    finalResult?: string;              // LLM output (if pasted)
    metadata: {
      totalTokens: number;
      fileCount: number;
      attachmentTypes: string[];       // ['FILE', 'PASTED_TEXT']
      generatedAt: Date;
    }
  }
}

/**
 * JSON export format for clipboard/file export
 */
export interface WorkflowExport {
  session_id: string;
  generated_at: string;
  prompt: PreloadedPrompt;
  attachments: Array<{
    id: string;
    filename: string;
    type: string;
    extension: string;
    language?: string;
    size: number;
    content: string;
  }>;
  metadata: {
    total_tokens: number;
    estimated_tokens_per_file: Record<string, number>;
    file_count: number;
    attachment_types: string[];
    selected_tags?: string[];
    created_at: string;
    user_instructions: string;
  }
}

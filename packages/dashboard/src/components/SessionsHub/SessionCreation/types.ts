/**
 * Type definitions for Session Creation system
 */

export interface Stub {
  id: string;                    // STUB-082, STUB-054, etc.
  feature_name: string;          // Feature name
  description: string;           // What this stub is about
  target_project: string;        // Which project this stub belongs to
  category: 'feature' | 'fix' | 'improvement' | 'refactor';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface InstructionBlock {
  id: string;                    // UUID
  content: string;               // Freeform markdown text
  type: 'task' | 'guideline' | 'example' | 'constraint';
  assignedTo: string[];          // Agent IDs
}

export type BlockType = InstructionBlock['type'];

export interface AgentAssignment {
  agentId: string;
  role: string;
  instructions: string[];        // Instruction block IDs
  attachments: string[];         // Attachment IDs
  outputFiles: string[];
  dependsOn?: string[];          // Other agent IDs
}

export interface SessionBuilderState {
  selectedStub: Stub | null;
  instructionBlocks: InstructionBlock[];
  attachments: any[];            // Reusing Attachment type from PromptingWorkflow
  agents: AgentAssignment[];
}

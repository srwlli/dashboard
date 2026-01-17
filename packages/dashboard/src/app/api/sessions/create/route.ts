import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Stub {
  id: string;
  feature_name: string;
  description: string;
  target_project: string;
  category: string;
  priority: string;
}

interface InstructionBlock {
  id: string;
  content: string;
  type: 'task' | 'guideline' | 'example' | 'constraint';
  assignedTo: string[];
}

interface ContextFile {
  id: string;
  filename: string;
  path: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  path?: string;
  content?: string;
}

interface AgentAssignment {
  agentId: string;
  role: string;
  instructions: string[];
  attachments: string[];
  outputFiles: string[];
  dependsOn?: string[];
}

interface SessionCreateRequest {
  stub: Stub;
  instructionBlocks: InstructionBlock[];
  contextFiles: ContextFile[];
  attachments: Attachment[];
  agents: AgentAssignment[];
}

/**
 * Session Creation API
 *
 * Generates multi-agent session files:
 * 1. context-backbone.md (comprehensive context package)
 * 2. communication.json (agent coordination metadata)
 * 3. instructions.json (freeform instructions)
 * 4. agent-prompts/ (individual agent prompt files)
 */
export async function POST(request: Request) {
  try {
    const body: SessionCreateRequest = await request.json();
    const { stub, instructionBlocks, contextFiles, attachments, agents } = body;

    // Validate request
    if (!stub || !instructionBlocks || !agents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create session directory
    const sessionId = `${stub.id}-${Date.now()}`;
    const sessionPath = path.join(
      process.cwd(),
      'coderef',
      'sessions',
      sessionId
    );

    await fs.mkdir(sessionPath, { recursive: true });

    // Generate files
    await generateContextBackbone(sessionPath, stub, contextFiles, instructionBlocks);
    await generateCommunicationJson(sessionPath, stub, agents);
    await generateInstructionsJson(sessionPath, instructionBlocks);
    await generateAgentPrompts(sessionPath, agents, instructionBlocks, attachments);

    return NextResponse.json({
      success: true,
      sessionId,
      sessionPath,
      files: [
        `${sessionPath}/context-backbone.md`,
        `${sessionPath}/communication.json`,
        `${sessionPath}/instructions.json`,
        `${sessionPath}/agent-prompts/`
      ]
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Generate context-backbone.md
 * Comprehensive context package (15,000-20,000 lines)
 */
async function generateContextBackbone(
  sessionPath: string,
  stub: Stub,
  contextFiles: ContextFile[],
  instructionBlocks: InstructionBlock[]
): Promise<void> {
  let content = `# Context Backbone - ${stub.id}\n\n`;
  content += `**Feature:** ${stub.feature_name}\n`;
  content += `**Generated:** ${new Date().toISOString()}\n\n`;
  content += `---\n\n`;

  content += `## Stub Description\n\n`;
  content += `${stub.description}\n\n`;
  content += `---\n\n`;

  content += `## Instructions Summary\n\n`;
  content += `Total blocks: ${instructionBlocks.length}\n\n`;
  instructionBlocks.forEach((block, index) => {
    content += `### Block ${index + 1} - ${block.type}\n\n`;
    content += `${block.content}\n\n`;
  });
  content += `---\n\n`;

  content += `## Context Files\n\n`;
  content += `Total files: ${contextFiles.length}\n\n`;

  // Read and embed context files
  for (const file of contextFiles) {
    content += `### ${file.filename}\n\n`;
    content += `**Path:** \`${file.path}\`\n\n`;

    try {
      const fileContent = await fs.readFile(file.path, 'utf-8');
      content += `\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    } catch (err) {
      content += `*Error reading file: ${err instanceof Error ? err.message : 'Unknown error'}*\n\n`;
    }
  }

  await fs.writeFile(path.join(sessionPath, 'context-backbone.md'), content, 'utf-8');
}

/**
 * Generate communication.json
 * Agent coordination metadata
 */
async function generateCommunicationJson(
  sessionPath: string,
  stub: Stub,
  agents: AgentAssignment[]
): Promise<void> {
  const communication = {
    session_id: path.basename(sessionPath),
    stub_id: stub.id,
    feature_name: stub.feature_name,
    created_at: new Date().toISOString(),
    agents: agents.map((agent, index) => ({
      agent_id: agent.agentId,
      agent_number: index + 1,
      role: agent.role,
      status: 'pending',
      outputs: {
        files_created: [],
        files_modified: [],
        workorders_created: [],
        primary_output: ''
      },
      assigned_instructions: agent.instructions.length,
      assigned_attachments: agent.attachments.length,
      output_files: agent.outputFiles,
      depends_on: agent.dependsOn || [],
      execution_wave: calculateExecutionWave(agent, agents)
    })),
    total_agents: agents.length,
    coordination_mode: 'parallel',
    status: 'created'
  };

  await fs.writeFile(
    path.join(sessionPath, 'communication.json'),
    JSON.stringify(communication, null, 2),
    'utf-8'
  );
}

/**
 * Generate instructions.json
 * Freeform instructions with type classification
 */
async function generateInstructionsJson(
  sessionPath: string,
  instructionBlocks: InstructionBlock[]
): Promise<void> {
  const instructions = {
    total_blocks: instructionBlocks.length,
    blocks: instructionBlocks.map(block => ({
      id: block.id,
      type: block.type,
      content: block.content,
      assigned_to: block.assignedTo
    })),
    types_summary: {
      task: instructionBlocks.filter(b => b.type === 'task').length,
      guideline: instructionBlocks.filter(b => b.type === 'guideline').length,
      example: instructionBlocks.filter(b => b.type === 'example').length,
      constraint: instructionBlocks.filter(b => b.type === 'constraint').length
    }
  };

  await fs.writeFile(
    path.join(sessionPath, 'instructions.json'),
    JSON.stringify(instructions, null, 2),
    'utf-8'
  );
}

/**
 * Generate agent-prompts/
 * Individual prompt files for each agent
 */
async function generateAgentPrompts(
  sessionPath: string,
  agents: AgentAssignment[],
  instructionBlocks: InstructionBlock[],
  attachments: Attachment[]
): Promise<void> {
  const promptsDir = path.join(sessionPath, 'agent-prompts');
  await fs.mkdir(promptsDir, { recursive: true });

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const agentNumber = i + 1;

    let prompt = `# Agent ${agentNumber} - ${agent.role}\n\n`;
    prompt += `**Agent ID:** ${agent.agentId}\n`;
    prompt += `**Execution Wave:** ${calculateExecutionWave(agent, agents)}\n\n`;

    if (agent.dependsOn && agent.dependsOn.length > 0) {
      prompt += `**Dependencies:** Wait for Agent ${agent.dependsOn.map(id => agents.findIndex(a => a.agentId === id) + 1).join(', Agent ')}\n\n`;
    }

    prompt += `---\n\n`;
    prompt += `## Your Instructions\n\n`;

    agent.instructions.forEach(instructionId => {
      const block = instructionBlocks.find(b => b.id === instructionId);
      if (block) {
        prompt += `### ${block.type.toUpperCase()}\n\n`;
        prompt += `${block.content}\n\n`;
      }
    });

    prompt += `---\n\n`;
    prompt += `## Your Outputs\n\n`;
    agent.outputFiles.forEach(file => {
      prompt += `- \`${file}\`\n`;
    });

    prompt += `\n---\n\n`;
    prompt += `## Attachments\n\n`;
    if (agent.attachments.length === 0) {
      prompt += `*No attachments assigned*\n`;
    } else {
      agent.attachments.forEach(attachmentId => {
        const attachment = attachments.find(a => a.id === attachmentId);
        if (attachment) {
          prompt += `- **${attachment.name}** (${attachment.type})\n`;
        }
      });
    }

    await fs.writeFile(
      path.join(promptsDir, `agent-${agentNumber}.md`),
      prompt,
      'utf-8'
    );
  }
}

/**
 * Calculate execution wave for agent based on dependencies
 */
function calculateExecutionWave(agent: AgentAssignment, allAgents: AgentAssignment[]): number {
  if (!agent.dependsOn || agent.dependsOn.length === 0) {
    return 1;
  }

  const depWaves = agent.dependsOn.map(depId => {
    const depAgent = allAgents.find(a => a.agentId === depId);
    return depAgent ? calculateExecutionWave(depAgent, allAgents) : 0;
  });

  return Math.max(...depWaves) + 1;
}

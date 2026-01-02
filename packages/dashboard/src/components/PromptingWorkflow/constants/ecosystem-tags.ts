/**
 * Ecosystem Tags for CODEREF_ECOSYSTEM_REVIEW prompt
 * 10 specialized tags for reviewing coderef system components
 */

export interface EcosystemTag {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const ECOSYSTEM_TAGS: Record<string, EcosystemTag> = {
  'documentation': {
    id: 'documentation',
    label: 'Documentation',
    icon: 'FileText',
    description: 'Foundation docs, standards, workflows, coderef outputs'
  },
  'code-quality': {
    id: 'code-quality',
    label: 'Code Quality',
    icon: 'Code2',
    description: 'Patterns, complexity, architecture, dependencies'
  },
  'workflows': {
    id: 'workflows',
    label: 'Workflows',
    icon: 'GitBranch',
    description: 'Planning, execution, coordination, handoff'
  },
  'integration': {
    id: 'integration',
    label: 'Integration',
    icon: 'Plug',
    description: 'MCP servers, ecosystem, CLI, dashboard, git'
  },
  'standards': {
    id: 'standards',
    label: 'Standards',
    icon: 'Ruler',
    description: 'UI, UX, API, behavior standards'
  },
  'agent-coordination': {
    id: 'agent-coordination',
    label: 'Agent Coordination',
    icon: 'Users',
    description: 'Personas, multi-agent, context, tooling'
  },
  'metadata-governance': {
    id: 'metadata-governance',
    label: 'Metadata & Governance',
    icon: 'Database',
    description: 'Versioning, provenance, schemas, validation'
  },
  'outputs': {
    id: 'outputs',
    label: 'Outputs',
    icon: 'FileOutput',
    description: 'Reports, diagrams, exports, deliverables'
  },
  'performance': {
    id: 'performance',
    label: 'Performance',
    icon: 'Zap',
    description: 'System performance, caching, scalability'
  },
  'testing': {
    id: 'testing',
    label: 'Testing',
    icon: 'FlaskConical',
    description: 'Test coverage, automation, quality'
  },
};

/**
 * Get all ecosystem tags as array
 */
export function getAllEcosystemTags(): EcosystemTag[] {
  return Object.values(ECOSYSTEM_TAGS);
}

/**
 * Get single ecosystem tag by ID
 */
export function getEcosystemTag(tagId: string): EcosystemTag | undefined {
  return ECOSYSTEM_TAGS[tagId];
}

/**
 * Get multiple ecosystem tags by IDs
 */
export function getEcosystemTagsByIds(tagIds: string[]): EcosystemTag[] {
  return tagIds
    .map(id => ECOSYSTEM_TAGS[id])
    .filter((tag): tag is EcosystemTag => tag !== undefined);
}

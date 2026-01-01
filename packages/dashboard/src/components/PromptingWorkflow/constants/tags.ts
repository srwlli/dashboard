/**
 * Improvement Tags for CODE_REVIEW Prompt
 *
 * Defines 8 predefined categories for organizing code review feedback.
 * Tags allow users to focus feedback on specific areas (Performance, Security, etc.)
 * instead of receiving generic catch-all suggestions.
 */

export interface ImprovementTag {
  id: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * 8 predefined improvement tags
 * Used in CODE_REVIEW prompt for categorized feedback
 */
export const IMPROVEMENT_TAGS: Record<string, ImprovementTag> = {
  'performance': {
    id: 'performance',
    label: 'Performance',
    icon: '⚡',
    description: 'Speed, efficiency, optimization'
  },
  'security': {
    id: 'security',
    label: 'Security',
    icon: '🔒',
    description: 'Vulnerabilities, auth, data protection'
  },
  'code-quality': {
    id: 'code-quality',
    label: 'Code Quality',
    icon: '✨',
    description: 'Readability, maintainability, patterns'
  },
  'architecture': {
    id: 'architecture',
    label: 'Architecture',
    icon: '🏗️',
    description: 'Structure, design, scalability'
  },
  'testing': {
    id: 'testing',
    label: 'Testing',
    icon: '🧪',
    description: 'Coverage, test quality, edge cases'
  },
  'accessibility': {
    id: 'accessibility',
    label: 'Accessibility',
    icon: '♿',
    description: 'A11y, screen readers, WCAG'
  },
  'error-handling': {
    id: 'error-handling',
    label: 'Error Handling',
    icon: '🚨',
    description: 'Edge cases, validation, recovery'
  },
  'ux-ui': {
    id: 'ux-ui',
    label: 'UX/UI',
    icon: '🎨',
    description: 'User experience, design, usability'
  }
};

/**
 * Get all tags as array (for iteration)
 */
export function getAllTags(): ImprovementTag[] {
  return Object.values(IMPROVEMENT_TAGS);
}

/**
 * Get tag by ID
 */
export function getTag(tagId: string): ImprovementTag | undefined {
  return IMPROVEMENT_TAGS[tagId];
}

/**
 * Get tags by IDs (for selected tags)
 */
export function getTagsByIds(tagIds: string[]): ImprovementTag[] {
  return tagIds.map(id => IMPROVEMENT_TAGS[id]).filter(Boolean);
}

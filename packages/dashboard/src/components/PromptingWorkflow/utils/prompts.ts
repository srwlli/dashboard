import { PreloadedPrompt } from '../types';
import { getTagsByIds, getAllTags } from '../constants/tags';
import { getEcosystemTagsByIds, getAllEcosystemTags } from '../constants/ecosystem-tags';

/**
 * 3 Preloaded prompts with agent identification headers
 * Each prompt requires agent to identify themselves in metadata header
 */

const CODE_REVIEW_PROMPT = `CODE REVIEW TASK
Review the attached code and any provided context for a comprehensive feature review.
Output standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** CODE_REVIEW
---

## PART 1: TOP 3 FEATURES
List the **top 3 most valuable features** found in the code:

| Feature Name | Description | Value (1-10) |
|--------------|-------------|--------------|
| ...          | ...         | ...          |

## PART 2: IMPROVEMENT SUGGESTIONS
{{TAG_SECTION}}

For each category, provide suggestions with this format:

### {{CATEGORY_NAME}}
**Improvement:** [What to change]
**Reasoning:** [Why this matters]
**Impact Rating:** [1-10 expected value]

Provide 2-5 suggestions per category, focusing on the highest-impact improvements.`;

const SYNTHESIZE_PROMPT = `SYNTHESIS TASK
I have conducted multiple Code Reviews using different LLMs. Below are the Code Review responses.
Please SYNTHESIZE these responses into a single, authoritative Code Review.
Output format: Standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** SYNTHESIZE
---

## PART 1: SYNTHESIZED EXISTING FEATURES
1. Review all PART 1 (EXISTING FEATURES) sections from the provided Code Reviews.
2. Create a consolidated ORDERED LIST of all unique existing features, ranked by Rating (1-10) from highest to lowest.
   - Merge duplicate features, keeping the highest rating and best description
   - Resolve conflicts by prioritizing the most detailed/accurate description
3. Follow the list with a TABLE summarizing these synthesized features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
4. Include ALL unique features identified across all reviews in this table.

## PART 2: SYNTHESIZED SUGGESTIONS FOR IMPROVEMENT
5. Review all PART 2 (SUGGESTIONS FOR IMPROVEMENT) sections from the provided Code Reviews.
6. Create a consolidated ORDERED LIST of all unique suggestions, ranked by Rating (1-10) from highest to lowest.
   - Merge duplicate suggestions, keeping the highest rating and most comprehensive description
   - Resolve conflicts by prioritizing the most actionable/valuable suggestion
7. Follow the list with a TABLE summarizing these synthesized suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
8. Include ALL unique suggestions identified across all reviews in this table.

## CONCLUSION
9. Provide a brief summary highlighting:
   - The most important features identified
   - The highest-priority suggestions for improvement
   - Any consensus or disagreements across the reviews`;

const CONSOLIDATE_PROMPT = `CONSOLIDATION TASK
I have multiple Synthesized Code Reviews from different synthesis runs. Below are the Synthesize outputs.
Please create a FINAL MASTER CONSOLIDATION that combines all of these into one authoritative document.
Output format: Standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** CONSOLIDATE
---

## PART 1: MASTER EXISTING FEATURES
1. Review all PART 1 (SYNTHESIZED EXISTING FEATURES) sections from all Synthesize outputs.
2. Create a FINAL consolidated ORDERED LIST of all unique features, ranked by Rating (1-10) from highest to lowest.
   - Merge all features, keeping the highest rating and most comprehensive description
   - Remove true duplicates (same feature, same description)
   - Resolve conflicts by prioritizing the most detailed/accurate description
   - Focus on the most important/valuable features
3. Follow the list with a MASTER TABLE summarizing these final features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
4. Include ALL unique features in this master table.

## PART 2: MASTER SUGGESTIONS FOR IMPROVEMENT
5. Review all PART 2 (SYNTHESIZED SUGGESTIONS FOR IMPROVEMENT) sections from all Synthesize outputs.
6. Create a FINAL consolidated ORDERED LIST of all unique suggestions, ranked by Rating (1-10) from highest to lowest.
   - Merge all suggestions, keeping the highest rating and most actionable description
   - Remove true duplicates
   - Resolve conflicts by prioritizing the most valuable/actionable suggestion
   - Focus on high-impact, implementable improvements
7. Follow the list with a MASTER TABLE summarizing these final suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
8. Include ALL unique suggestions in this master table.

## MASTER CONCLUSION
9. Provide an executive summary that:
   - Highlights the top 5 most important features
   - Highlights the top 5 highest-priority suggestions
   - Identifies patterns and consensus across all synthesis runs
   - Provides actionable next steps for implementation`;

const CODEREF_ECOSYSTEM_REVIEW_PROMPT = `CODEREF ECOSYSTEM REVIEW TASK
Review the attached coderef ecosystem component(s) for comprehensive analysis.
Output standard Markdown (.md) inside a SINGLE code block.

**AGENT IDENTIFICATION REQUIRED**
Start your response with a metadata header identifying yourself:

---
**Agent:** [Your model name and version]
**Date:** [Current date]
**Task:** CODEREF_ECOSYSTEM_REVIEW
---

## PART 1: COMPONENT OVERVIEW
Provide a brief overview of what this component does and its key features:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| ...       | ...     | ...          |

## PART 2: ECOSYSTEM ANALYSIS
{{TAG_SECTION}}

For each category, provide structured analysis with this format:

### {{CATEGORY_NAME}}
**How Used:** [How this component/document is used in the ecosystem]
**Strengths:** [What works well]
**Weaknesses:** [What's missing or unclear]
**Add/Remove:** [Specific suggestions with ADD/REMOVE/REFACTOR prefixes]

Provide 2-5 suggestions per category, focusing on the highest-impact improvements.`;

/**
 * Preloaded prompts available in the widget
 */
export const PRELOADED_PROMPTS: Record<string, PreloadedPrompt> = {
  '0001': {
    key: '0001',
    name: 'CODE_REVIEW',
    label: 'Code Review',
    text: CODE_REVIEW_PROMPT,
    estimatedTokens: 950,
    description: 'Analyzes single code file → features + suggestions',
  },
  '0002': {
    key: '0002',
    name: 'SYNTHESIZE',
    label: 'Synthesize',
    text: SYNTHESIZE_PROMPT,
    estimatedTokens: 1300,
    description: 'Merges multiple reviews → authoritative review',
  },
  '0003': {
    key: '0003',
    name: 'CONSOLIDATE',
    label: 'Consolidate',
    text: CONSOLIDATE_PROMPT,
    estimatedTokens: 1300,
    description: 'Creates final master review from multiple syntheses',
  },
  '0004': {
    key: '0004',
    name: 'CODEREF_ECOSYSTEM_REVIEW',
    label: 'CodeRef Ecosystem Review',
    text: CODEREF_ECOSYSTEM_REVIEW_PROMPT,
    estimatedTokens: 1100,
    description: 'Review coderef ecosystem components with focused feedback',
  },
};

/**
 * Get prompt by key
 */
export function getPrompt(key: string): PreloadedPrompt | undefined {
  return PRELOADED_PROMPTS[key];
}

/**
 * Get all available prompts
 */
export function getAllPrompts(): PreloadedPrompt[] {
  return Object.values(PRELOADED_PROMPTS);
}

/**
 * Get CODE_REVIEW prompt with tag interpolation
 * Replaces {{TAG_SECTION}} and {{CATEGORY_NAME}} placeholders based on selected tags
 *
 * @param selectedTagIds - Array of selected tag IDs (e.g., ['performance', 'security'])
 * @returns Prompt text with tags interpolated
 *
 * Behavior:
 * - If no tags selected (empty array): Shows all 8 categories
 * - If tags selected: Shows only selected categories
 * - If all 8 tags selected: Treats same as no tags (shows all)
 */
export function getPromptWithTags(selectedTagIds: string[] = []): string {
  const prompt = PRELOADED_PROMPTS['0001'].text;

  // Determine which tags to show
  const allTags = getAllTags();
  const isAllSelected = selectedTagIds.length === 0 || selectedTagIds.length === allTags.length;
  const tagsToShow = isAllSelected ? allTags : getTagsByIds(selectedTagIds);

  // Build tag section text
  let tagSection = '';
  if (isAllSelected) {
    tagSection = 'Provide improvement suggestions in ALL categories:\n';
    tagSection += allTags.map(tag => `- ${tag.icon} **${tag.label}**: ${tag.description}`).join('\n');
  } else {
    tagSection = `User has requested feedback on: **${tagsToShow.map(t => t.label).join(', ')}**\n\n`;
    tagSection += 'Focus your suggestions on these categories:\n';
    tagSection += tagsToShow.map(tag => `- ${tag.icon} **${tag.label}**: ${tag.description}`).join('\n');
  }

  // Replace {{TAG_SECTION}} placeholder
  let interpolatedPrompt = prompt.replace('{{TAG_SECTION}}', tagSection);

  // Replace {{CATEGORY_NAME}} with actual category names (used in template)
  // Since we have multiple categories, we'll duplicate the template section for each tag
  const categoryTemplate = `### {{CATEGORY_NAME}}
**Improvement:** [What to change]
**Reasoning:** [Why this matters]
**Impact Rating:** [1-10 expected value]

Provide 2-5 suggestions per category, focusing on the highest-impact improvements.`;

  const categorySections = tagsToShow.map(tag =>
    `### ${tag.icon} ${tag.label}
**Improvement:** [What to change]
**Reasoning:** [Why this matters]
**Impact Rating:** [1-10 expected value]`
  ).join('\n\n');

  // Replace the template section with actual category sections
  interpolatedPrompt = interpolatedPrompt.replace(categoryTemplate, categorySections);

  return interpolatedPrompt;
}

/**
 * Get CODEREF_ECOSYSTEM_REVIEW prompt with tag interpolation
 * Replaces {{TAG_SECTION}} and {{CATEGORY_NAME}} placeholders based on selected ecosystem tags
 *
 * @param selectedTagIds - Array of selected ecosystem tag IDs (e.g., ['documentation', 'workflows'])
 * @returns Prompt text with tags interpolated
 *
 * Behavior:
 * - If no tags selected (empty array): Shows all 10 categories
 * - If tags selected: Shows only selected categories
 * - If all 10 tags selected: Treats same as no tags (shows all)
 */
export function getEcosystemPromptWithTags(selectedTagIds: string[] = []): string {
  const prompt = PRELOADED_PROMPTS['0004'].text;

  // Determine which tags to show
  const allTags = getAllEcosystemTags();
  const isAllSelected = selectedTagIds.length === 0 || selectedTagIds.length === allTags.length;
  const tagsToShow = isAllSelected ? allTags : getEcosystemTagsByIds(selectedTagIds);

  // Build tag section text
  let tagSection = '';
  if (isAllSelected) {
    tagSection = 'Provide ecosystem analysis in ALL categories:\n';
    tagSection += allTags.map(tag => `- **${tag.label}**: ${tag.description}`).join('\n');
  } else {
    tagSection = `User has requested feedback on: **${tagsToShow.map(t => t.label).join(', ')}**\n\n`;
    tagSection += 'Focus your analysis on these categories:\n';
    tagSection += tagsToShow.map(tag => `- **${tag.label}**: ${tag.description}`).join('\n');
  }

  // Replace {{TAG_SECTION}} placeholder
  let interpolatedPrompt = prompt.replace('{{TAG_SECTION}}', tagSection);

  // Replace {{CATEGORY_NAME}} with actual category names
  const categoryTemplate = `### {{CATEGORY_NAME}}
**How Used:** [How this component/document is used in the ecosystem]
**Strengths:** [What works well]
**Weaknesses:** [What's missing or unclear]
**Add/Remove:** [Specific suggestions with ADD/REMOVE/REFACTOR prefixes]

Provide 2-5 suggestions per category, focusing on the highest-impact improvements.`;

  const categorySections = tagsToShow.map(tag =>
    `### ${tag.label}
**How Used:** [How this component/document is used in the ecosystem]
**Strengths:** [What works well]
**Weaknesses:** [What's missing or unclear]
**Add/Remove:** [Specific suggestions with ADD/REMOVE/REFACTOR prefixes]`
  ).join('\n\n');

  // Replace the template section with actual category sections
  interpolatedPrompt = interpolatedPrompt.replace(categoryTemplate, categorySections);

  return interpolatedPrompt;
}

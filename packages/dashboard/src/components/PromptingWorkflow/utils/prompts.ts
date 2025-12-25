import { PreloadedPrompt } from '../types';

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

## PART 1: EXISTING FEATURES
1. Create an ORDERED LIST of existing features found in the code, ranked by Rating (1-10) from highest to lowest.
2. Follow the list with a TABLE summarizing these features with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
3. Include ALL existing features identified in the list in this table.

## PART 2: SUGGESTIONS FOR IMPROVEMENT
4. Create an ORDERED LIST of suggested improvements/enhancements, ranked by Rating (1-10) from highest to lowest.
5. Follow the list with a TABLE summarizing these suggestions with columns: Name, Description, Value (Benefit), Rating (1-10), Risk (1-10).
6. Include ALL suggestions identified in the list in this table.`;

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

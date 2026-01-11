# CODEREF_ECOSYSTEM_REVIEW Prompt Template

**Output Format:** JSON
**Workflow:** Multi-agent coordination via common folder
**User Input:** Review title + selected tags + attached files

---

## The Prompt

```
CODEREF ECOSYSTEM REVIEW

You are reviewing coderef ecosystem components. Analyze the attached files and provide structured feedback in JSON format.

**YOUR TASK:**
1. Analyze the attached component(s) based on the selected improvement tags
2. Create a structured JSON response following the schema below
3. Save your response to: coderef/reviews/{{REVIEW_TITLE}}/responses/{{YOUR_AGENT_ID}}.json

**YOUR AGENT ID:** Your agent ID is your working directory name (e.g., "coderef-context", "coderef-docs", "coderef-workflow")

---

## Selected Improvement Areas

{{TAG_SECTION}}

---

## JSON Response Schema

Create a JSON file with this exact structure:

```json
{
  "agent_metadata": {
    "agent_id": "YOUR_AGENT_ID",
    "agent_name": "Your Human-Readable Name",
    "model": "Your LLM Model Name and Version",
    "analyzed_at": "ISO_TIMESTAMP",
    "review_title": "{{REVIEW_TITLE}}"
  },

  "component_overview": {
    "component_name": "Name of component/file analyzed",
    "component_purpose": "What this component does (1-2 sentences)",
    "key_features": [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ]
  },

  "ecosystem_analysis": {
    {{ANALYSIS_SECTIONS}}
  },

  "additional_comments": {
    "improvements": "General improvement ideas not tied to specific tags",
    "weaknesses": "Systemic or cross-cutting issues",
    "other": "Any other insights, context, or observations"
  }
}
```

---

## Analysis Field Definitions

For each selected tag category, provide:

**how_used:** How this component/document is used in the coderef ecosystem
- Be specific: What do agents/users do with it?
- Examples: "Read during planning", "Generate as output", "Never used - outside domain"

**strengths:** What works well about this component
- List concrete positives
- Examples: "Clear structure", "Comprehensive coverage", "Auto-generated (always current)"

**weaknesses:** What's missing, unclear, or problematic
- List specific issues
- Examples: "No versioning", "Missing edge case docs", "Duplicated across multiple files"

**add_remove:** Specific actionable suggestions
- Use prefixes: ADD, REMOVE, REFACTOR
- Be concrete and implementable
- Examples:
  - "ADD: Timestamp metadata to detect staleness"
  - "REMOVE: Duplicate sections in favor of cross-references"
  - "REFACTOR: Split large file into focused modules"

---

## File Save Instructions

**Location:** coderef/reviews/{{REVIEW_TITLE}}/responses/{{YOUR_AGENT_ID}}.json

**Example Paths:**
- coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-context.json
- coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-docs.json
- coderef/reviews/Q1-2026-Documentation-Review/responses/coderef-workflow.json

**IMPORTANT:**
- Use YOUR agent ID as the filename (e.g., "coderef-context.json")
- Save to the common responses/ folder
- Ensure valid JSON (use JSON validator before saving)
- Do NOT include markdown code fences in the saved file

---

## Example Complete Response

```json
{
  "agent_metadata": {
    "agent_id": "coderef-docs",
    "agent_name": "CodeRef Documentation Server",
    "model": "Claude Sonnet 4.5",
    "analyzed_at": "2026-01-01T14:30:00Z",
    "review_title": "Q1-2026-Documentation-Review"
  },

  "component_overview": {
    "component_name": "Foundation Documentation System",
    "component_purpose": "Generates and maintains project foundation docs (README, ARCHITECTURE, API, SCHEMA, COMPONENTS)",
    "key_features": [
      "Template-based generation with customization",
      "Workorder tracking integration",
      "Automated changelog management",
      "Version tracking via git"
    ]
  },

  "ecosystem_analysis": {
    "documentation": {
      "how_used": "Foundation docs provide project context for agents during planning and implementation. Agents read CLAUDE.md for context, generate README/ARCHITECTURE during foundation_docs workflow.",
      "strengths": "Clear structure, comprehensive coverage, version tracking via git, standardized format across projects using templates",
      "weaknesses": "No automated staleness detection, manual updates required, inconsistent adherence to standards, large CLAUDE.md files become unwieldy",
      "add_remove": "ADD: Timestamp metadata to detect stale docs (last_updated, last_verified). REFACTOR: Split CLAUDE.md into modular sections (architecture.md, workflows.md, decisions.md). REMOVE: Duplicate content across README and CLAUDE.md in favor of single source with cross-references. ADD: Validation tool to check doc freshness and completeness"
    },

    "workflows": {
      "how_used": "Documentation workflows (generate_foundation_docs, add_changelog_entry, update_deliverables) used by agents to create and maintain docs. Called via MCP tools during workorder execution.",
      "strengths": "Standardized process reduces manual work, automated generation ensures consistency, template system allows customization while maintaining standards",
      "weaknesses": "No validation step before generation, templates can drift out of sync with standards, no rollback mechanism if generation fails, unclear which workflow to use when",
      "add_remove": "ADD: Schema validation for generated docs before saving. ADD: Template versioning system to track changes. ADD: Dry-run mode for workflows to preview changes. REFACTOR: Create decision tree/flowchart showing which workflow to use in which scenario"
    }
  },

  "additional_comments": {
    "improvements": "Consider adding automated doc freshness monitoring with alerts when docs haven't been updated in 30+ days. Integrate doc generation with CI/CD pipeline for automatic validation.",
    "weaknesses": "Documentation generation is siloed - not integrated with other ecosystem tools. No unified documentation dashboard to see status across all projects.",
    "other": "Strong foundation but needs better governance, automation, and monitoring. High value target for Phase 2 improvements."
  }
}
```

---

## Tips for Strong Responses

1. **Be specific:** Vague feedback like "improve docs" is not actionable. Say exactly what to add/remove/change.

2. **Prioritize:** Focus on high-impact improvements. Not every minor issue needs to be mentioned.

3. **Use data:** Reference specific files, line numbers, or examples when possible.

4. **Be constructive:** Frame weaknesses as opportunities for improvement.

5. **Think ecosystem-wide:** Consider how this component interacts with other parts of the system.

6. **Follow the schema exactly:** Your JSON must match the structure shown above.

---

After saving your JSON file, confirm the save with a brief message.
```

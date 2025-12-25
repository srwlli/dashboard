# Generic Implementation Summary Prompt

## Purpose

This is a reusable LLM prompt template that generates implementation summary documents following the format documented in `IMPLEMENTATION-SUMMARY-FORMAT.md`. Use this prompt to generate structured completion summaries for any feature, widget, or module.

---

## Template Prompt

```
You are an expert technical writer generating implementation summaries for software projects.

TASK: Generate a comprehensive implementation summary document for the following project:

PROJECT DETAILS:
- Name: [PROJECT_NAME]
- Type: [TYPE: widget|module|feature|library]
- Status: [PERCENTAGE]% Complete
- Workorder: [WORKORDER_ID]
- Session: [START_DATE] to [END_DATE]
- Current Phase: [PHASE_NUMBER] of [TOTAL_PHASES]

DELIVERABLES OVERVIEW:
- Total Files Created: [FILE_COUNT]
- Lines of Code: [LOC_COUNT]
- Components/Classes: [COMPONENT_COUNT]
- Utilities/Functions: [UTILITY_COUNT]
- Custom Hooks/Patterns: [HOOK_COUNT]
- Interfaces/Types: [TYPE_COUNT]
- Unit Tests: [TEST_COUNT] (all passing)

CORE FEATURES IMPLEMENTED:
1. [FEATURE_1_NAME]: [BRIEF_DESCRIPTION]
2. [FEATURE_2_NAME]: [BRIEF_DESCRIPTION]
3. [FEATURE_3_NAME]: [BRIEF_DESCRIPTION]
4. [FEATURE_4_NAME]: [BRIEF_DESCRIPTION]
5. [FEATURE_5_NAME]: [BRIEF_DESCRIPTION]
6. [FEATURE_6_NAME]: [BRIEF_DESCRIPTION]

TECHNICAL DETAILS:
- Language(s): [LANGUAGES]
- Framework(s): [FRAMEWORKS]
- Key Libraries: [LIBRARIES]
- Architecture Pattern: [PATTERN]
- Styling Approach: [STYLING]
- Testing Framework: [TEST_FRAMEWORK]

FILE ORGANIZATION:
Components Directory:
[COMPONENT_FILE_LIST]

Utilities Directory:
[UTILITY_FILE_LIST]

Hooks/Custom Patterns:
[HOOK_FILE_LIST]

Tests:
[TEST_FILE_LIST]

Configuration:
[CONFIG_FILE_LIST]

FEATURE DETAILS:
For each core feature, provide:
- List of capabilities (use ✅ checkmarks)
- Specific implementation details
- Code examples if applicable
- Performance characteristics
- Supported formats/types

TESTING COVERAGE:
- Unit Tests: [COUNT] tests across [NUM_FILES] files
  - [TEST_FILE_1]: [NUM_TESTS] tests covering [AREAS]
  - [TEST_FILE_2]: [NUM_TESTS] tests covering [AREAS]
  - [TEST_FILE_3]: [NUM_TESTS] tests covering [AREAS]

CODE QUALITY METRICS:
- Type Safety: [TYPESCRIPT|PYTHON_TYPE_HINTS|etc]
- Error Handling: [COMPREHENSIVE|PARTIAL|MINIMAL]
- Documentation: [JSDoc|Docstrings|Comments]
- Code Style: [FORMATTING_TOOL]

INTEGRATION POINTS:
- External APIs: [LIST]
- Fallback Mechanisms: [DESCRIBE]
- Platform Compatibility: [WEB|ELECTRON|NATIVE|etc]

WHAT'S READY vs PENDING:

COMPLETED (Phases 1-[COMPLETED_PHASE]):
- [ITEM_1]
- [ITEM_2]
- [ITEM_3]

REMAINING (Phase [NEXT_PHASE]):
- [ITEM_1]
- [ITEM_2]
- [ITEM_3]

NEXT STEPS WITH COMMANDS:
[PROVIDE 3-4 BASH COMMANDS users can copy-paste for building/testing]

KNOWN LIMITATIONS:
- [LIMITATION_1]
- [LIMITATION_2]
- [LIMITATION_3]

FUTURE ENHANCEMENTS:
- [IDEA_1]
- [IDEA_2]
- [IDEA_3]

ADDITIONAL CONTEXT:
[ANY_OTHER_RELEVANT_DETAILS]

---

OUTPUT FORMAT REQUIREMENTS:

1. Generate a markdown document following this structure:
   - H1 Title: "[PROJECT_NAME] - [STATUS]"
   - H2 sections for: Status, What Has Been Built, Technical Implementation, Files Delivered,
     Features in Detail, Quality Assurance, User Experience (if applicable), Integration Points,
     What's Ready vs Pending, How to Continue, Known Limitations, Enhancement Ideas, Summary,
     Documentation Files, Footer with metadata

2. Use these formatting rules:
   - Bold feature names and key concepts with **text**
   - Checkmarks (✅) for completed items, (⏳) for pending
   - Code blocks for architecture diagrams, file trees, API examples
   - Numbered lists (1-6) for core features
   - Sub-bullets for feature details
   - Horizontal rules (---) between major sections

3. Include these elements in appropriate sections:
   - ASCII architecture diagram
   - Complete file tree (organized by type)
   - Code examples from actual implementation (JSON, Markdown, TypeScript examples)
   - Test summary with specific test file names and counts
   - Metrics with specific numbers (not vague)
   - Implementation readiness assessment
   - Copy-paste-ready bash commands for next steps

4. Maintain this tone:
   - Professional but accessible
   - Confident and assertive
   - Transparent about limitations
   - Action-oriented (use verbs)
   - Specific (include numbers, not approximations)

5. Target audience:
   - Project stakeholders (need status and timeline)
   - Other developers (need architecture and file organization)
   - Integration engineers (need API and integration points)
   - Future maintainers (need documentation and testing info)

---

OUTPUT: Provide the complete markdown document, ready to be saved as IMPLEMENTED.md or similar.
```

---

## How to Use This Template

### 1. Extract Project Information

Before running the prompt, gather:

```
PROJECT_NAME: [from package.json or project title]
TYPE: [choose: widget|module|feature|library]
PERCENTAGE: [current completion, e.g., 90]
WORKORDER_ID: [from plan.json or tracking system]
DATES: [session start and end]
PHASE_INFO: [current and total phases from plan.json]
```

### 2. Count Project Artifacts

```bash
# Files created
find src -type f | wc -l

# Lines of code
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.css" \) \
  | xargs wc -l | tail -1

# Components (example)
find src/components -type f -name "*.tsx" | wc -l

# Tests
find src -type f -name "*.test.ts" -o -name "*.test.tsx" | wc -l
```

### 3. Prepare Feature Descriptions

Write 1-2 sentence descriptions for each core feature:

```
FEATURE_1_NAME: Prompt Selection
BRIEF_DESCRIPTION: Browse and select from preloaded LLM prompts with token estimates and agent identification headers
```

### 4. List Test Coverage

For each test file, note:

```
TEST_FILE_1: tokenEstimator.test.ts (6 tests)
AREAS: token counting formula, edge cases, formatting, warnings
```

### 5. Run the Prompt

Execute the prompt with your project information filled in. The LLM will generate a complete implementation summary.

---

## Variables Reference

### Required Variables

| Variable | Example | Source |
|----------|---------|--------|
| PROJECT_NAME | Prompting Workflow Widget | package.json name or folder |
| TYPE | widget | Architecture type |
| PERCENTAGE | 90 | Current completion % |
| WORKORDER_ID | WO-PROMPTING-WORKFLOW-001 | Tracking system |
| START_DATE | 2025-12-24 | First commit date |
| END_DATE | 2025-12-25 | Last commit date |
| PHASE_NUMBER | 7 | Current phase |
| TOTAL_PHASES | 8 | Total planned phases |

### Artifact Count Variables

| Variable | How to Count |
|----------|-------------|
| FILE_COUNT | `find src -type f \| wc -l` |
| LOC_COUNT | `find src -type f -name "*.ts" -o -name "*.tsx" \| xargs wc -l` |
| COMPONENT_COUNT | `find src/components -name "*.tsx" \| wc -l` |
| UTILITY_COUNT | `find src/utils -name "*.ts" \| wc -l` |
| HOOK_COUNT | `find src/hooks -name "*.ts" \| wc -l` |
| TYPE_COUNT | Number of interfaces in types/index.ts |
| TEST_COUNT | `find src -name "*.test.ts" \| wc -l` |

### List Variables

| Variable | Format |
|----------|--------|
| COMPONENT_FILE_LIST | Same format as IMPLEMENTED.md file tree |
| UTILITY_FILE_LIST | Same format as IMPLEMENTED.md file tree |
| HOOK_FILE_LIST | Same format as IMPLEMENTED.md file tree |
| TEST_FILE_LIST | Same format as IMPLEMENTED.md file tree |
| CORE_FEATURES | Numbered 1-6 with descriptions |

---

## Example Variable Filling

Here's a complete example of filling the template for a React component library:

```
PROJECT_NAME: ComponentLibrary
TYPE: library
PERCENTAGE: 85
WORKORDER_ID: WO-COMPONENTS-001
SESSION: 2025-12-20 to 2025-12-24
PHASE_NUMBER: 6
TOTAL_PHASES: 7

FILE_COUNT: 42
LOC_COUNT: 3,200
COMPONENT_COUNT: 12
UTILITY_COUNT: 8
HOOK_COUNT: 3
TYPE_COUNT: 15
TEST_COUNT: 48

CORE_FEATURES:
1. Button Component: Multiple variants (primary, secondary, ghost) with size and state management
2. Modal Component: Accessibility-compliant modal with animations and focus management
3. Form Components: Input, select, checkbox, radio with validation and error states
4. Theming System: Dark/light mode with CSS-in-JS customization
5. Icon Library: 200+ SVG icons with sizing and color props
6. Documentation: Storybook stories for each component

[continue filling remaining variables...]
```

---

## Tips for Best Results

1. **Be Specific** - Include exact numbers, not ranges ("24 tests" not "many tests")
2. **Organize Logically** - Group files by type (components, utilities, hooks)
3. **Highlight Critical Features** - Include implementation details for major features
4. **Show Code** - Provide real examples (JSON exports, API signatures, etc.)
5. **Test Transparency** - List specific test categories, not just counts
6. **Acknowledge Gaps** - Be honest about limitations and pending work
7. **Enable Next Steps** - Include copy-paste-ready commands for continuation
8. **Use Formatting** - Take advantage of markdown formatting for readability
9. **Target Multiple Audiences** - Include technical and non-technical perspectives
10. **Document Decisions** - Note why architectural choices were made

---

## Customization

### For Different Project Types

#### Widget (Recommended)
- Include: Component architecture, exports, integration points
- Emphasize: UI/UX, styling, accessibility
- Add: CodeRefCore API usage, browser fallbacks

#### Library
- Include: API reference, module structure, exports
- Emphasize: Performance, type safety, test coverage
- Add: Breaking changes, migration guides, versioning

#### CLI Tool
- Include: Command reference, configuration options
- Emphasize: Error handling, documentation, user experience
- Add: Installation, platform compatibility, shell integration

#### Backend Service
- Include: API endpoints, data models, database schema
- Emphasize: Performance, security, scalability
- Add: Infrastructure, deployment, monitoring

### Section Adjustments

Some sections may not apply to all projects:

- **User Experience** - Skip for libraries/tools without UI
- **Integration Points** - Essential for widgets/services, optional for libraries
- **How to Continue** - Always include, but adjust commands for project type
- **Enhancement Ideas** - Optional but recommended for features
- **Performance** - Essential for performance-critical projects

---

## Workflow Integration

To add this to your prompting workflow:

1. **Store this template** in a prompts library or shared location
2. **Create a prompt selection** in your widget/system to choose "Implementation Summary"
3. **Fill variables** automatically from plan.json and file system analysis
4. **Send to LLM** with the filled template
5. **Save result** as IMPLEMENTED.md in the feature working directory
6. **Include in handoffs** when passing work to other engineers or at session end

---

## Related Documentation

- **IMPLEMENTATION-SUMMARY-FORMAT.md** - Detailed format specification
- **IMPLEMENTED.md** - Example output (Prompting Workflow Widget)
- **plan.json** - Source for workorder, phases, and deliverables data
- **IMPLEMENTATION_SUMMARY.md** - Alternative detailed summary format

---

**Last Updated:** 2025-12-25
**Template Version:** 1.0
**Compatibility:** All project types (widgets, modules, features, libraries)

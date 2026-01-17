# Scripts Directory

## Auto-Update CSV Script

### Purpose
Automatically generate and update `coderef/tools-and-commands.csv` from source files across the CodeRef ecosystem.

### Location
`scripts/update-resources-csv.py`

### Features
- Scans MCP server.py files for tool definitions
- Scans .claude/commands/*.md files for slash commands
- Extracts validators from papertrail/validators/*.py
- Extracts schemas from papertrail/schemas/**/*.json
- Includes hardcoded scripts, workflows, outputs, and dashboard tabs
- Merges with existing CSV to preserve manual entries
- Validates structure and content

### Usage

#### Generate/Update CSV
```bash
cd C:\Users\willh\Desktop\coderef-dashboard
python scripts/update-resources-csv.py
```

#### Preview Changes (Dry Run)
```bash
python scripts/update-resources-csv.py --dry-run
```

#### Generate with Validation
```bash
python scripts/update-resources-csv.py --validate
```

#### Generate Fresh CSV (Ignore Existing)
```bash
python scripts/update-resources-csv.py --fresh
```

#### Validate Existing CSV Only
```bash
python scripts/update-resources-csv.py --validate-only
```

### Output
- **File:** `coderef/tools-and-commands.csv`
- **Format:** Type, Server, Category, Name, Description, Status, Path
- **Rows:** ~330+ resources
- **Sorting:** By Type → Server → Category → Name

### Resource Types
1. **Tool** (93) - MCP tools from server.py files
2. **Command** (142) - Slash commands from .claude/commands/
3. **Tab** (6) - Dashboard UI navigation tabs
4. **Script** (26) - Utility scripts and automation
5. **Workflow** (6) - Multi-step workflows
6. **Output** (9) - Output format types
7. **Validator** (22) - Validation classes from papertrail
8. **Schema** (28) - JSON schemas from papertrail

### Data Sources

#### MCP Tools
- **Source:** `C:\Users\willh\.mcp-servers\*/server.py`
- **Method:** AST parsing for `Tool()` definitions in `list_tools()` functions
- **Servers:** coderef-context, coderef-docs, coderef-personas, papertrail

#### Slash Commands
- **Source:** `C:\Users\willh\.claude\commands\*.md` and `C:\Users\willh\.mcp-servers\*\.claude\commands\*.md`
- **Method:** Glob + frontmatter extraction
- **Servers:** assistant, coderef-workflow, coderef-docs, coderef-personas

#### Validators
- **Source:** `C:\Users\willh\.mcp-servers\papertrail\papertrail\validators\*.py`
- **Method:** AST parsing for `*Validator` class definitions
- **Categories:** Documentation, Workflow, Session, Core, Utility

#### Schemas
- **Source:** `C:\Users\willh\.mcp-servers\papertrail\schemas\**\*-schema.json`
- **Method:** Recursive glob for JSON schema files
- **Categories:** Documentation, Workflow, Session, System, MCP, Security

#### Hardcoded Resources
- **Scripts:** Extracted from ScriptsTab.tsx structure
- **Workflows:** Extracted from WorkflowsTab.tsx structure
- **Outputs:** Extracted from OutputTab.tsx structure
- **Tabs:** Dashboard UI navigation tabs

### Merge Strategy
1. Read existing CSV (preserves manual entries)
2. Extract resources from source files
3. Merge: Extracted data overrides existing for same (Type, Server, Name)
4. Result: Comprehensive CSV with auto-updated + manual entries

### Validation Checks
1. All rows have 7 columns
2. No duplicate entries (same Type + Server + Name)
3. All Type values are valid (Tool, Command, Tab, Script, Workflow, Output, Validator, Schema)
4. All Status values are "active" or "deprecated"
5. Row count is within acceptable range (185-335 rows)

### Example Output
```csv
Type,Server,Category,Name,Description,Status,Path
Tool,coderef-context,Code Intelligence,coderef_scan,Scan project and discover all code elements,active,C:\Users\willh\.mcp-servers\coderef-context\server.py
Command,coderef-workflow,Workflow,/create-session,Create multi-agent session,active,C:\Users\willh\.claude\commands\create-session.md
Validator,papertrail,Documentation,ResourceSheetValidator,Validate resource sheets against RSMS v2.0 schema,active,C:\Users\willh\.mcp-servers\papertrail\papertrail\validators\resource_sheet.py
Schema,papertrail,Documentation,foundation-doc-frontmatter-schema.json,JSON Schema for foundation doc frontmatter validation,active,C:\Users\willh\.mcp-servers\papertrail\schemas\documentation\foundation-doc-frontmatter-schema.json
```

### Automation

#### Pre-Commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
python scripts/update-resources-csv.py --validate
if [ $? -ne 0 ]; then
    echo "Error: CSV update failed. Fix errors and try again."
    exit 1
fi
git add coderef/tools-and-commands.csv
```

#### CI/CD Integration
```yaml
# .github/workflows/update-csv.yml
name: Update Resources CSV
on:
  push:
    paths:
      - '**/server.py'
      - '.claude/commands/*.md'
      - 'papertrail/validators/*.py'
      - 'papertrail/schemas/**/*.json'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Update CSV
        run: python scripts/update-resources-csv.py
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add coderef/tools-and-commands.csv
          git commit -m "Auto-update resources CSV" || echo "No changes"
          git push
```

### Troubleshooting

#### "Server file not found" Warning
- Some MCP servers may have different directory structures
- Script tries alternative locations (src/ subdirectories)
- Existing CSV entries are preserved for missing servers

#### Encoding Errors
- Script supports multiple encodings: utf-8-sig, utf-8, utf-16, cp1252, latin-1
- Existing CSV is automatically detected and handled

#### Duplicate Entries
- Duplicates can occur if key (Type, Server, Name) doesn't match exactly
- Review CSV manually to identify and remove duplicates
- Use `--fresh` flag to generate clean CSV from scratch

### Maintenance

#### When to Run
- After adding new MCP tools
- After creating new slash commands
- After adding validators or schemas
- Before releases to ensure documentation accuracy

#### Manual Updates
Some entries may require manual updates:
- Tool descriptions that need refinement
- Custom categorization
- Deprecated status flags
- Special path references

### Future Enhancements
1. Improved AST parsing for better tool extraction
2. Template discovery (documentation templates)
3. Dependency tracking between resources
4. Health score calculation per resource
5. Drift detection between CSV and source files

---

**Last Updated:** 2026-01-16
**Status:** Production
**Spec Document:** `coderef/CSV-AUTO-UPDATE-SPEC.md`

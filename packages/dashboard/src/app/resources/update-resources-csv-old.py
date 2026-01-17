#!/usr/bin/env python3
"""
CSV Auto-Update Script
Purpose: Automatically generate/update tools-and-commands.csv from source files
Status: Production
"""

import ast
import csv
import json
import re
import sys
from pathlib import Path
from typing import List, Tuple, Dict, Any

# Base paths
DASHBOARD_ROOT = Path(__file__).parent.parent.parent.parent.parent.parent  # Navigate up to coderef-dashboard root
CSV_OUTPUT = Path(__file__).parent / "tools-and-commands.csv"  # Same directory as script
MCP_SERVERS_DIR = Path(r"C:\Users\willh\.mcp-servers")
CLAUDE_COMMANDS_DIR = Path(r"C:\Users\willh\.claude\commands")

# Resource type definitions
VALID_TYPES = ["Tool", "Command", "Tab", "Script", "Workflow", "Output", "Validator", "Schema"]
VALID_STATUS = ["active", "deprecated"]


class ResourceExtractor:
    """Extract resources from various source files"""

    def __init__(self):
        self.resources: List[Tuple[str, str, str, str, str, str, str]] = []
        self.errors: List[str] = []

    def scan_mcp_tools(self) -> List[Tuple]:
        """Scan MCP server.py files for tool definitions"""
        tools = []

        # Known MCP servers
        servers = [
            ("coderef-context", MCP_SERVERS_DIR / "coderef-context"),
            ("coderef-docs", MCP_SERVERS_DIR / "coderef-docs"),
            ("coderef-personas", MCP_SERVERS_DIR / "coderef-personas"),
            ("papertrail", MCP_SERVERS_DIR / "papertrail"),
        ]

        for server_name, server_path in servers:
            server_file = server_path / "server.py"
            if not server_file.exists():
                # Try alternative locations
                server_file = server_path / "src" / f"{server_name.replace('-', '_')}" / "server.py"

            if not server_file.exists():
                self.errors.append(f"Server file not found: {server_file}")
                continue

            try:
                with open(server_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Parse AST to find Tool definitions
                tree = ast.parse(content)

                for node in ast.walk(tree):
                    # Look for Tool() calls in list_tools functions
                    if isinstance(node, ast.Call):
                        if hasattr(node.func, 'id') and node.func.id == 'Tool':
                            tool_name = self._get_tool_arg(node, 'name')
                            tool_desc = self._get_tool_arg(node, 'description')

                            if tool_name:
                                # Determine category based on server
                                category = self._categorize_tool(server_name)
                                tools.append((
                                    "Tool",
                                    server_name,
                                    category,
                                    tool_name,
                                    tool_desc or "",
                                    "active",
                                    str(server_file)
                                ))

            except Exception as e:
                self.errors.append(f"Error parsing {server_file}: {e}")

        return tools

    def _get_tool_arg(self, node: ast.Call, arg_name: str) -> str:
        """Extract argument value from Tool() call"""
        for keyword in node.keywords:
            if keyword.arg == arg_name:
                if isinstance(keyword.value, ast.Constant):
                    return keyword.value.value
        return ""

    def _categorize_tool(self, server_name: str) -> str:
        """Categorize tool based on server name"""
        categories = {
            "coderef-context": "Code Intelligence",
            "coderef-docs": "Documentation",
            "coderef-personas": "Personas",
            "papertrail": "Validation",
        }
        return categories.get(server_name, "General")

    def scan_slash_commands(self) -> List[Tuple]:
        """Scan .claude/commands/*.md files for slash commands"""
        commands = []

        # Scan user-level commands
        command_dirs = [
            CLAUDE_COMMANDS_DIR,
            MCP_SERVERS_DIR / "coderef-workflow" / ".claude" / "commands",
            MCP_SERVERS_DIR / "coderef-docs" / ".claude" / "commands",
            MCP_SERVERS_DIR / "coderef-personas" / ".claude" / "commands",
        ]

        for cmd_dir in command_dirs:
            if not cmd_dir.exists():
                continue

            # Determine server name from path
            if "coderef-workflow" in str(cmd_dir):
                server = "coderef-workflow"
            elif "coderef-docs" in str(cmd_dir):
                server = "coderef-docs"
            elif "coderef-personas" in str(cmd_dir):
                server = "coderef-personas"
            else:
                server = "assistant"

            for md_file in cmd_dir.glob("*.md"):
                try:
                    with open(md_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Extract frontmatter description
                    desc = self._extract_frontmatter_description(content)
                    name = "/" + md_file.stem

                    # Categorize command
                    category = self._categorize_command(name, server)

                    commands.append((
                        "Command",
                        server,
                        category,
                        name,
                        desc,
                        "active",
                        str(md_file)
                    ))

                except Exception as e:
                    self.errors.append(f"Error reading {md_file}: {e}")

        return commands

    def _extract_frontmatter_description(self, content: str) -> str:
        """Extract description from markdown frontmatter"""
        match = re.search(r'^---\s*\ndescription:\s*(.+?)\n---', content, re.MULTILINE | re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    def _categorize_command(self, name: str, server: str) -> str:
        """Categorize command based on name pattern"""
        if "workorder" in name or "plan" in name or "session" in name:
            return "Workflow"
        elif "doc" in name or "generate" in name:
            return "Documentation"
        elif "persona" in name:
            return "Personas"
        return "General"

    def scan_dashboard_tabs(self) -> List[Tuple]:
        """Scan dashboard resources page for UI tabs"""
        tabs = [
            ("Tab", "coderef-dashboard", "UI Navigation", "Commands", "Slash commands reference (68 commands)", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "CommandsTab.tsx")),
            ("Tab", "coderef-dashboard", "UI Navigation", "Tools", "MCP tools reference (89 tools)", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "ToolsTab.tsx")),
            ("Tab", "coderef-dashboard", "UI Navigation", "Scripts", "Utility scripts and automation", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "ScriptsTab.tsx")),
            ("Tab", "coderef-dashboard", "UI Navigation", "Workflows", "Multi-step workflows", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "WorkflowsTab.tsx")),
            ("Tab", "coderef-dashboard", "UI Navigation", "Setup", "Installation and configuration", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "SetupTab.tsx")),
            ("Tab", "coderef-dashboard", "UI Navigation", "Output", "Output formats and file structure", "active",
             str(DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "components" / "resources" / "OutputTab.tsx")),
        ]
        return tabs

    def scan_scripts(self) -> List[Tuple]:
        """Extract scripts from ScriptsTab.tsx"""
        scripts = [
            ("Script", "System", "Structure Creators", "scan-all.py", "Generate minimal .coderef/ structure (2-3 files: index.json context.md)", "active", r"C:\Users\willh\Desktop\projects\coderef-system\scripts"),
            ("Script", "System", "Structure Creators", "create-coderef-structure.py", "Create coderef/ directory structure", "active", r"C:\Users\willh\Desktop\assistant\scripts"),
            ("Script", "System", "Structure Creators", "create-foundation-docs.py", "Generate foundation docs (README ARCHITECTURE API)", "active", r"C:\Users\willh\Desktop\assistant\scripts"),

            ("Script", "coderef-docs", "Documentation Generators", "generate-readme.py", "Generate README.md from template", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-architecture.py", "Generate ARCHITECTURE.md from template", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-api.py", "Generate API.md from template", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-components.py", "Generate COMPONENTS.md from template", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-schema.py", "Generate SCHEMA.md from template", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-quickref.py", "Generate quickref.md interactive guide", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-my-guide.py", "Generate my-guide.md (60-80 line reference)", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-user-guide.py", "Generate USER-GUIDE.md (comprehensive onboarding)", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),
            ("Script", "coderef-docs", "Documentation Generators", "generate-features.py", "Generate FEATURES.md (workorder inventory)", "active", r"C:\Users\willh\.mcp-servers\coderef-docs\generators"),

            ("Script", "coderef-context", "Data Processing", "export-graph.py", "Export dependency graph (JSON JSON-LD Mermaid DOT)", "active", r"C:\Users\willh\.mcp-servers\coderef-context\src\coderef_context"),
            ("Script", "papertrail", "Data Processing", "validate-all-docs.py", "Validate all docs in directory against UDS", "active", r"C:\Users\willh\.mcp-servers\papertrail\scripts"),
            ("Script", "papertrail", "Data Processing", "check-document-health.py", "Calculate health score (0-100) for document", "active", r"C:\Users\willh\.mcp-servers\papertrail\scripts"),
        ]
        return scripts

    def scan_workflows(self) -> List[Tuple]:
        """Extract workflows from WorkflowsTab.tsx"""
        workflows = [
            ("Workflow", "Multi-Component", "Feature Implementation", "Complete Feature Implementation", "End-to-end workflow from planning to completion (3 phases: Plan Execute Complete)", "active", "/create-workorder → /execute-plan → /complete-workorder"),
            ("Workflow", "coderef-docs", "Documentation", "Documentation Update", "Update foundation docs when code changes (3 phases: Scan Generate Validate)", "active", "/scan-codebase → /generate-foundation-docs → /validate-document"),
            ("Workflow", "coderef-workflow", "Coordination", "Multi-Agent Session", "Create and manage multi-agent session (4 steps: Structure Agents Execute Track)", "active", "/create-session → agent execution → /track-plan-execution"),
            ("Workflow", "System", "Release", "Git Release Workflow", "Tag version update changelog create release (3 phases: Prepare Tag Publish)", "active", "git tag → /add-changelog-entry → gh release create"),
        ]
        return workflows

    def scan_outputs(self) -> List[Tuple]:
        """Extract output formats from OutputTab.tsx"""
        outputs = [
            ("Output", "System", "Data Format", "JSON", "Structured data format for machine-readable output (index.json plan.json communication.json)", "active", ".json"),
            ("Output", "System", "Documentation", "Markdown", "Human-readable documentation format (README.md ARCHITECTURE.md API.md)", "active", ".md"),
            ("Output", "coderef-context", "Visualization", "Mermaid", "Dependency graph diagrams (flowchart sequence class)", "active", ".mmd"),
            ("Output", "coderef-context", "Visualization", "DOT", "Graphviz graph format (export with coderef_export)", "active", ".dot"),
            ("Output", "System", "Data Format", "CSV", "Tabular data format (tools-and-commands.csv)", "active", ".csv"),
            ("Output", "coderef-dashboard", "Web", "HTML", "Dashboard UI (index.html workorders dashboard)", "active", ".html"),
        ]
        return outputs

    def scan_validators(self) -> List[Tuple]:
        """Scan papertrail/validators/*.py for validator classes"""
        validators = []
        validator_dir = MCP_SERVERS_DIR / "papertrail" / "papertrail" / "validators"

        if not validator_dir.exists():
            self.errors.append(f"Validators directory not found: {validator_dir}")
            return validators

        for py_file in validator_dir.glob("*.py"):
            if py_file.name == "__init__.py":
                continue

            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                tree = ast.parse(content)

                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef) and node.name.endswith("Validator"):
                        desc = ast.get_docstring(node) or f"Validator for {node.name.replace('Validator', '').lower()}"
                        desc = desc.split('\n')[0][:100]  # First line, max 100 chars

                        category = self._categorize_validator(py_file.stem)

                        validators.append((
                            "Validator",
                            "papertrail",
                            category,
                            node.name,
                            desc,
                            "active",
                            str(py_file)
                        ))

            except Exception as e:
                self.errors.append(f"Error parsing {py_file}: {e}")

        return validators

    def _categorize_validator(self, filename: str) -> str:
        """Categorize validator based on filename"""
        if filename in ["foundation", "resource_sheet", "user_facing", "standards"]:
            return "Documentation"
        elif filename in ["plan", "workorder", "analysis", "execution_log"]:
            return "Workflow"
        elif filename in ["session", "system", "infrastructure", "migration"]:
            return "Session"
        elif filename in ["stub", "base", "factory", "general"]:
            return "Core"
        return "Utility"

    def scan_schemas(self) -> List[Tuple]:
        """Scan papertrail/schemas/**/*.json for JSON schemas"""
        schemas = []
        schema_dir = MCP_SERVERS_DIR / "papertrail" / "schemas"

        if not schema_dir.exists():
            self.errors.append(f"Schemas directory not found: {schema_dir}")
            return schemas

        for json_file in schema_dir.rglob("*-schema.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                desc = data.get("description", f"JSON Schema for {json_file.stem.replace('-schema', '')}")
                category = json_file.parent.name.capitalize()

                schemas.append((
                    "Schema",
                    "papertrail",
                    category,
                    json_file.name,
                    desc,
                    "active",
                    str(json_file)
                ))

            except Exception as e:
                self.errors.append(f"Error reading {json_file}: {e}")

        return schemas

    def extract_all(self) -> List[Tuple]:
        """Extract all resources"""
        print("Scanning MCP tools...")
        self.resources.extend(self.scan_mcp_tools())

        print("Scanning slash commands...")
        self.resources.extend(self.scan_slash_commands())

        print("Scanning dashboard tabs...")
        self.resources.extend(self.scan_dashboard_tabs())

        print("Scanning scripts...")
        self.resources.extend(self.scan_scripts())

        print("Scanning workflows...")
        self.resources.extend(self.scan_workflows())

        print("Scanning output formats...")
        self.resources.extend(self.scan_outputs())

        print("Scanning validators...")
        self.resources.extend(self.scan_validators())

        print("Scanning schemas...")
        self.resources.extend(self.scan_schemas())

        return self.resources


class CSVValidator:
    """Validate CSV structure and content"""

    def __init__(self, resources: List[Tuple]):
        self.resources = resources
        self.errors: List[str] = []

    def validate(self) -> bool:
        """Run all validation checks"""
        self._check_column_count()
        self._check_duplicates()
        self._check_valid_types()
        self._check_valid_status()
        self._check_row_count()

        return len(self.errors) == 0

    def _check_column_count(self):
        """Check all rows have 7 columns"""
        for i, row in enumerate(self.resources, start=1):
            if len(row) != 7:
                self.errors.append(f"Row {i}: Expected 7 columns, got {len(row)}")

    def _check_duplicates(self):
        """Check for duplicate entries"""
        seen = set()
        for row in self.resources:
            key = (row[0], row[1], row[3])  # Type, Server, Name
            if key in seen:
                self.errors.append(f"Duplicate entry: {row[0]} - {row[1]} - {row[3]}")
            seen.add(key)

    def _check_valid_types(self):
        """Check Type values are valid"""
        for row in self.resources:
            if row[0] not in VALID_TYPES:
                self.errors.append(f"Invalid type: {row[0]} (row: {row[3]})")

    def _check_valid_status(self):
        """Check Status values are valid"""
        for row in self.resources:
            if row[5] not in VALID_STATUS:
                self.errors.append(f"Invalid status: {row[5]} (row: {row[3]})")

    def _check_row_count(self):
        """Check row count matches expected"""
        expected = 235
        actual = len(self.resources) + 1  # +1 for header
        if actual < expected - 50:
            self.errors.append(f"Row count too low: expected ~{expected}, got {actual}")
        elif actual > expected + 100:
            self.errors.append(f"Row count too high: expected ~{expected}, got {actual}")
        # else: acceptable range (185-335 rows)


def write_csv(resources: List[Tuple], output_path: Path, dry_run: bool = False):
    """Write resources to CSV file"""
    # Sort by Type, Server, Category, Name
    sorted_resources = sorted(resources, key=lambda x: (x[0], x[1], x[2], x[3]))

    if dry_run:
        print(f"\nDRY RUN: Would write {len(sorted_resources)} rows to {output_path}")
        print("\nFirst 10 rows:")
        for row in sorted_resources[:10]:
            print(f"  {row[0]:12} {row[1]:20} {row[2]:20} {row[3][:40]}")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Type", "Server", "Category", "Name", "Description", "Status", "Path"])
        writer.writerows(sorted_resources)

    print(f"\n[OK] Successfully wrote {len(sorted_resources)} rows to {output_path}")


def read_existing_csv(csv_path: Path) -> Dict[Tuple[str, str, str], Tuple]:
    """Read existing CSV and return as dict keyed by (Type, Server, Name)"""
    existing = {}
    if not csv_path.exists():
        return existing

    # Try multiple encodings
    encodings = ['utf-8-sig', 'utf-8', 'utf-16', 'cp1252', 'latin-1']

    for encoding in encodings:
        try:
            with open(csv_path, 'r', encoding=encoding) as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                for row in reader:
                    if len(row) == 7:
                        key = (row[0], row[1], row[3])  # Type, Server, Name
                        existing[key] = tuple(row)
            return existing
        except (UnicodeDecodeError, UnicodeError):
            continue
        except Exception as e:
            print(f"Warning: Error reading CSV with {encoding}: {e}")
            continue

    print(f"Warning: Could not read existing CSV with any known encoding")
    return existing


def merge_resources(extracted: List[Tuple], existing_csv: Dict[Tuple[str, str, str], Tuple]) -> List[Tuple]:
    """Merge extracted resources with existing CSV, preferring extracted data"""
    merged = {}

    # Start with existing entries
    for key, row in existing_csv.items():
        merged[key] = row

    # Override with extracted entries (these are auto-generated and always current)
    for row in extracted:
        key = (row[0], row[1], row[3])  # Type, Server, Name
        merged[key] = row

    return list(merged.values())


def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Update tools-and-commands.csv from source files")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    parser.add_argument("--validate-only", action="store_true", help="Only validate existing CSV")
    parser.add_argument("--validate", action="store_true", help="Validate after generating")
    parser.add_argument("--fresh", action="store_true", help="Generate fresh CSV (ignore existing entries)")
    args = parser.parse_args()

    print("=" * 60)
    print("CSV Auto-Update Script")
    print("=" * 60)

    # Extract resources
    extractor = ResourceExtractor()
    resources = extractor.extract_all()

    # Merge with existing CSV unless --fresh is specified
    if not args.fresh:
        print("\nMerging with existing CSV...")
        existing = read_existing_csv(CSV_OUTPUT)
        print(f"  - Existing entries: {len(existing)}")
        print(f"  - Extracted entries: {len(resources)}")
        resources = merge_resources(resources, existing)
        print(f"  - Merged total: {len(resources)}")

    # Report extraction errors
    if extractor.errors:
        print("\nExtraction warnings:")
        for error in extractor.errors:
            print(f"  - {error}")

    print(f"\nExtracted {len(resources)} total resources")

    # Count by type
    type_counts = {}
    for row in resources:
        type_counts[row[0]] = type_counts.get(row[0], 0) + 1

    print("\nBreakdown by type:")
    for rtype, count in sorted(type_counts.items()):
        print(f"  {rtype:12} {count:3}")

    # Validate
    if args.validate or args.validate_only:
        print("\n" + "=" * 60)
        print("Validation")
        print("=" * 60)

        validator = CSVValidator(resources)
        is_valid = validator.validate()

        if is_valid:
            print("[OK] All validation checks passed")
        else:
            print("\n[ERROR] Validation errors:")
            for error in validator.errors:
                print(f"  - {error}")
            sys.exit(1)

    if args.validate_only:
        return

    # Write CSV
    print("\n" + "=" * 60)
    print("Writing CSV")
    print("=" * 60)
    write_csv(resources, CSV_OUTPUT, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

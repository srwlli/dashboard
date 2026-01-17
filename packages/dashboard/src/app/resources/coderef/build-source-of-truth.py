#!/usr/bin/env python3
"""
Build Single Source of Truth CSV
Comprehensive scan of entire CodeRef ecosystem
"""

import ast
import csv
import json
import re
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from datetime import datetime

# Base paths
RESOURCES_DIR = Path(__file__).parent
MCP_SERVERS = Path(r"C:\Users\willh\.mcp-servers")
ASSISTANT = Path(r"C:\Users\willh\Desktop\assistant")
DASHBOARD = Path(r"C:\Users\willh\Desktop\coderef-dashboard")
CODEREF_SYSTEM = Path(r"C:\Users\willh\Desktop\projects\coderef-system")
CLAUDE_COMMANDS = Path(r"C:\Users\willh\.claude\commands")

OUTPUT_CSV = RESOURCES_DIR / "scanned-resources-temp.csv"


class ResourceScanner:
    """Comprehensive resource scanner for entire ecosystem"""

    def __init__(self):
        self.resources: List[Dict] = []
        self.errors: List[str] = []

    def get_git_timestamps(self, file_path: Path) -> Tuple[Optional[str], Optional[str]]:
        """Get creation and last update timestamps from git"""
        try:
            # Get first commit (creation)
            result = subprocess.run(
                ['git', 'log', '--diff-filter=A', '--format=%aI', '--', str(file_path)],
                capture_output=True,
                text=True,
                cwd=file_path.parent
            )
            created = result.stdout.strip().split('\n')[-1] if result.stdout.strip() else None

            # Get last commit (update)
            result = subprocess.run(
                ['git', 'log', '-1', '--format=%aI', '--', str(file_path)],
                capture_output=True,
                text=True,
                cwd=file_path.parent
            )
            updated = result.stdout.strip() if result.stdout.strip() else None

            return created, updated
        except Exception:
            return None, None

    def get_filesystem_timestamps(self, file_path: Path) -> Tuple[str, str]:
        """Fallback to filesystem timestamps"""
        try:
            stat = file_path.stat()
            created = datetime.fromtimestamp(stat.st_ctime).isoformat()
            updated = datetime.fromtimestamp(stat.st_mtime).isoformat()
            return created, updated
        except Exception:
            now = datetime.now().isoformat()
            return now, now

    def add_resource(self, type_: str, server: str, category: str, name: str,
                    description: str, status: str, path: str):
        """Add a resource with timestamps"""
        file_path = Path(path)

        # Try git first, fallback to filesystem
        created, updated = self.get_git_timestamps(file_path)
        if not created or not updated:
            created, updated = self.get_filesystem_timestamps(file_path)

        self.resources.append({
            'Type': type_,
            'Server': server,
            'Category': category,
            'Name': name,
            'Description': description,
            'Status': status,
            'Path': path,
            'Created': created or '',
            'LastUpdated': updated or ''
        })

    # ========== MCP TOOLS ==========

    def scan_mcp_tools(self):
        """Scan all MCP server.py files for tool definitions"""
        print("Scanning MCP tools...")

        servers = {
            'coderef-context': MCP_SERVERS / 'coderef-context',
            'coderef-docs': MCP_SERVERS / 'coderef-docs',
            'coderef-personas': MCP_SERVERS / 'coderef-personas',
            'coderef-workflow': MCP_SERVERS / 'coderef-workflow',
            'coderef-testing': MCP_SERVERS / 'coderef-testing',
            'papertrail': MCP_SERVERS / 'papertrail'
        }

        for server_name, server_path in servers.items():
            # Try multiple possible locations
            server_files = [
                server_path / 'server.py',
                server_path / 'src' / server_name.replace('-', '_') / 'server.py',
                server_path / server_name.replace('-', '_') / 'server.py'
            ]

            for server_file in server_files:
                if server_file.exists():
                    self._parse_server_file(server_file, server_name)
                    break

    def _parse_server_file(self, server_file: Path, server_name: str):
        """Parse server.py to extract tool definitions"""
        try:
            with open(server_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract tool names and descriptions via regex (AST is complex for this)
            # Look for @server.call_tool or Tool() patterns
            tool_pattern = r'(?:name=|@server\.call_tool\(["\'])([a-z_]+)(?:["\']|,)'
            desc_pattern = r'description=["\'](.*?)["\']'

            lines = content.split('\n')
            i = 0
            while i < len(lines):
                line = lines[i]

                # Check if this line has a tool definition
                tool_match = re.search(tool_pattern, line)
                if tool_match:
                    tool_name = tool_match.group(1)

                    # Look for description in next 5 lines
                    description = ""
                    for j in range(i, min(i+10, len(lines))):
                        desc_match = re.search(desc_pattern, lines[j])
                        if desc_match:
                            description = desc_match.group(1)
                            break

                    category = self._categorize_tool(server_name, tool_name)
                    self.add_resource(
                        'Tool', server_name, category, tool_name,
                        description, 'active', str(server_file)
                    )

                i += 1

        except Exception as e:
            self.errors.append(f"Error parsing {server_file}: {e}")

    def _categorize_tool(self, server: str, tool_name: str) -> str:
        """Categorize tool based on server and name"""
        categories = {
            'coderef-context': 'Code Intelligence',
            'coderef-docs': 'Documentation',
            'coderef-personas': 'Personas',
            'coderef-workflow': 'Workflow',
            'coderef-testing': 'Testing',
            'papertrail': 'Validation'
        }
        return categories.get(server, 'General')

    # ========== SLASH COMMANDS ==========

    def scan_slash_commands(self):
        """Scan all .claude/commands/ directories for slash commands"""
        print("Scanning slash commands...")

        command_dirs = [
            (CLAUDE_COMMANDS, 'assistant'),
            (DASHBOARD / '.claude' / 'commands', 'coderef-dashboard'),
            (MCP_SERVERS / 'coderef-workflow' / '.claude' / 'commands', 'coderef-workflow'),
            (MCP_SERVERS / 'coderef-docs' / '.claude' / 'commands', 'coderef-docs'),
            (MCP_SERVERS / 'coderef-personas' / '.claude' / 'commands', 'coderef-personas'),
            (MCP_SERVERS / 'coderef-testing' / '.claude' / 'commands', 'coderef-testing'),
        ]

        for cmd_dir, server in command_dirs:
            if not cmd_dir.exists():
                continue

            for md_file in cmd_dir.glob('*.md'):
                try:
                    with open(md_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Extract frontmatter description
                    desc_match = re.search(r'^---\s*\ndescription:\s*(.+?)\n---', content, re.MULTILINE | re.DOTALL)
                    description = desc_match.group(1).strip() if desc_match else content.split('\n')[0][:100]

                    # Remove markdown formatting
                    description = description.replace('**', '').replace('*', '').strip()

                    name = '/' + md_file.stem
                    category = self._categorize_command(name, server)

                    self.add_resource(
                        'Command', server, category, name,
                        description, 'active', str(md_file)
                    )
                except Exception as e:
                    self.errors.append(f"Error reading {md_file}: {e}")

    def _categorize_command(self, name: str, server: str) -> str:
        """Categorize command based on name and server"""
        if 'workorder' in name or 'plan' in name or 'session' in name:
            return 'Workflow'
        elif 'doc' in name or 'generate' in name or 'template' in name:
            return 'Documentation'
        elif 'persona' in name or 'ava' in name or 'taylor' in name or 'marcus' in name or 'quinn' in name or 'lloyd' in name:
            return 'Personas'
        elif 'test' in name or 'coverage' in name or 'flaky' in name:
            return 'Testing'
        elif 'audit' in name or 'check' in name or 'validate' in name:
            return 'Quality'
        return 'General'

    # ========== SCRIPTS ==========

    def scan_scripts(self):
        """Scan all Python scripts"""
        print("Scanning scripts...")

        script_locations = [
            (ASSISTANT / 'scripts', 'Orchestrator'),
            (CODEREF_SYSTEM / 'scripts', 'System'),
            (CODEREF_SYSTEM / 'packages', 'System'),
            (MCP_SERVERS / 'coderef-workflow' / 'generators', 'Workflow'),
            (MCP_SERVERS / 'coderef-docs' / 'generators', 'coderef-docs'),
            (MCP_SERVERS / 'coderef-context' / 'src' / 'coderef_context', 'coderef-context'),
            (MCP_SERVERS / 'papertrail' / 'scripts', 'papertrail'),
        ]

        for script_dir, server in script_locations:
            if not script_dir.exists():
                continue

            for script_file in script_dir.rglob('*.py'):
                if script_file.name.startswith('__'):
                    continue

                try:
                    with open(script_file, 'r', encoding='utf-8') as f:
                        first_lines = [f.readline() for _ in range(5)]

                    # Extract docstring or first comment
                    description = ""
                    for line in first_lines:
                        if '"""' in line or "'''" in line or line.strip().startswith('#'):
                            description = line.strip().replace('"""', '').replace("'''", '').replace('#', '').strip()
                            if description:
                                break

                    if not description:
                        description = f"Python script: {script_file.stem}"

                    category = self._categorize_script(script_file.stem)

                    self.add_resource(
                        'Script', server, category, script_file.name,
                        description, 'active', str(script_file)
                    )
                except Exception as e:
                    self.errors.append(f"Error reading {script_file}: {e}")

    def _categorize_script(self, name: str) -> str:
        """Categorize script based on name"""
        if 'generate' in name or 'create' in name:
            return 'Generators'
        elif 'validate' in name or 'check' in name:
            return 'Validators'
        elif 'scan' in name or 'parse' in name or 'extract' in name:
            return 'Scanners'
        elif 'export' in name or 'diagram' in name:
            return 'Exporters'
        return 'Utilities'

    # ========== VALIDATORS ==========

    def scan_validators(self):
        """Scan papertrail validators"""
        print("Scanning validators...")

        validator_dir = MCP_SERVERS / 'papertrail' / 'papertrail' / 'validators'
        if not validator_dir.exists():
            return

        for py_file in validator_dir.glob('*.py'):
            if py_file.name == '__init__.py':
                continue

            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                tree = ast.parse(content)

                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef) and node.name.endswith('Validator'):
                        desc = ast.get_docstring(node) or f"Validator for {node.name.replace('Validator', '').lower()}"
                        desc = desc.split('\n')[0][:100]

                        category = self._categorize_validator(py_file.stem)

                        self.add_resource(
                            'Validator', 'papertrail', category, node.name,
                            desc, 'active', str(py_file)
                        )
            except Exception as e:
                self.errors.append(f"Error parsing {py_file}: {e}")

    def _categorize_validator(self, filename: str) -> str:
        """Categorize validator"""
        if filename in ['foundation', 'resource_sheet', 'user_facing', 'standards']:
            return 'Documentation'
        elif filename in ['plan', 'workorder', 'analysis', 'execution_log']:
            return 'Workflow'
        elif filename in ['session', 'system', 'infrastructure', 'migration']:
            return 'Session'
        return 'Core'

    # ========== SCHEMAS ==========

    def scan_schemas(self):
        """Scan all JSON schemas"""
        print("Scanning schemas...")

        schema_dir = MCP_SERVERS / 'papertrail' / 'schemas'
        if not schema_dir.exists():
            return

        for json_file in schema_dir.rglob('*-schema.json'):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                desc = data.get('description', f"JSON Schema for {json_file.stem.replace('-schema', '')}")
                category = json_file.parent.name.capitalize()

                self.add_resource(
                    'Schema', 'papertrail', category, json_file.name,
                    desc, 'active', str(json_file)
                )
            except Exception as e:
                self.errors.append(f"Error reading {json_file}: {e}")

    # ========== RESOURCE SHEETS ==========

    def scan_resource_sheets(self):
        """Scan all resource sheet documents"""
        print("Scanning resource sheets...")

        sheet_locations = [
            DASHBOARD / 'coderef' / 'resources-sheets',
            ASSISTANT / 'coderef',
            MCP_SERVERS / 'coderef-workflow' / 'coderef',
        ]

        for location in sheet_locations:
            if not location.exists():
                continue

            for sheet_file in location.rglob('*-RESOURCE-SHEET.md'):
                try:
                    with open(sheet_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Extract YAML frontmatter
                    yaml_match = re.search(r'^---\s*\n(.*?)\n---', content, re.MULTILINE | re.DOTALL)

                    subject = ""
                    description = ""

                    if yaml_match:
                        yaml_content = yaml_match.group(1)
                        subject_match = re.search(r'^subject:\s*(.+)$', yaml_content, re.MULTILINE)
                        desc_match = re.search(r'^description:\s*(.+)$', yaml_content, re.MULTILINE)

                        if subject_match:
                            subject = subject_match.group(1).strip()
                        if desc_match:
                            description = desc_match.group(1).strip()

                    if not subject:
                        subject = sheet_file.stem.replace('-RESOURCE-SHEET', '').replace('-', ' ')

                    if not description:
                        # Use first line after frontmatter
                        lines = content.split('\n')
                        for line in lines:
                            if line.strip() and not line.startswith('#') and not line.startswith('---'):
                                description = line.strip()[:100]
                                break

                    category = self._categorize_resource_sheet(sheet_file)

                    self.add_resource(
                        'ResourceSheet', 'documentation', category, subject,
                        description, 'active', str(sheet_file)
                    )
                except Exception as e:
                    self.errors.append(f"Error reading {sheet_file}: {e}")

    def _categorize_resource_sheet(self, file_path: Path) -> str:
        """Categorize resource sheet by directory"""
        parts = file_path.parts
        if 'components' in parts:
            return 'Component'
        elif 'system' in parts or 'systems' in parts:
            return 'System'
        elif 'analysis' in parts:
            return 'Analysis'
        elif 'api' in parts:
            return 'API'
        elif 'scanner' in parts:
            return 'Scanner'
        return 'General'

    # ========== WORKFLOWS ==========

    def scan_workflows(self):
        """Add known workflows"""
        print("Scanning workflows...")

        workflows = [
            ('Workflow', 'Multi-Component', 'Feature Implementation', 'Complete Feature Implementation',
             'End-to-end workflow from planning to completion (3 phases: Plan Execute Complete)',
             'active', '/create-workorder → /execute-plan → /complete-workorder'),

            ('Workflow', 'coderef-docs', 'Documentation', 'Documentation Update',
             'Update foundation docs when code changes (3 phases: Scan Generate Validate)',
             'active', '/scan-codebase → /generate-foundation-docs → /validate-document'),

            ('Workflow', 'coderef-workflow', 'Coordination', 'Multi-Agent Session',
             'Create and manage multi-agent session (4 steps: Structure Agents Execute Track)',
             'active', '/create-session → agent execution → /track-plan-execution'),

            ('Workflow', 'System', 'Release', 'Git Release Workflow',
             'Tag version update changelog create release (3 phases: Prepare Tag Publish)',
             'active', 'git tag → /add-changelog-entry → gh release create'),
        ]

        for wf in workflows:
            self.resources.append({
                'Type': wf[0],
                'Server': wf[1],
                'Category': wf[2],
                'Name': wf[3],
                'Description': wf[4],
                'Status': wf[5],
                'Path': wf[6],
                'Created': '',
                'LastUpdated': ''
            })

    # ========== OUTPUT FORMATS ==========

    def scan_output_formats(self):
        """Add known output formats"""
        print("Scanning output formats...")

        formats = [
            ('Output', 'System', 'Data Format', 'JSON', 'Structured data format (index.json plan.json communication.json)', 'active', '.json'),
            ('Output', 'System', 'Documentation', 'Markdown', 'Human-readable documentation (README.md ARCHITECTURE.md API.md)', 'active', '.md'),
            ('Output', 'coderef-context', 'Visualization', 'Mermaid', 'Dependency graph diagrams (flowchart sequence class)', 'active', '.mmd'),
            ('Output', 'coderef-context', 'Visualization', 'DOT', 'Graphviz graph format', 'active', '.dot'),
            ('Output', 'System', 'Data Format', 'CSV', 'Tabular data format', 'active', '.csv'),
            ('Output', 'coderef-dashboard', 'Web', 'HTML', 'Dashboard UI (index.html workorders dashboard)', 'active', '.html'),
        ]

        for fmt in formats:
            self.resources.append({
                'Type': fmt[0],
                'Server': fmt[1],
                'Category': fmt[2],
                'Name': fmt[3],
                'Description': fmt[4],
                'Status': fmt[5],
                'Path': fmt[6],
                'Created': '',
                'LastUpdated': ''
            })

    # ========== DASHBOARD TABS ==========

    def scan_dashboard_tabs(self):
        """Add dashboard UI tabs"""
        print("Scanning dashboard tabs...")

        tabs_file = DASHBOARD / 'packages' / 'dashboard' / 'src' / 'app' / 'resources' / 'page.tsx'

        tabs = [
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Commands', 'Slash commands reference', 'active', str(tabs_file)),
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Tools', 'MCP tools reference', 'active', str(tabs_file)),
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Scripts', 'Utility scripts and automation', 'active', str(tabs_file)),
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Workflows', 'Multi-step workflows', 'active', str(tabs_file)),
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Setup', 'Installation and configuration', 'active', str(tabs_file)),
            ('Tab', 'coderef-dashboard', 'UI Navigation', 'Output', 'Output formats and file structure', 'active', str(tabs_file)),
        ]

        for tab in tabs:
            self.add_resource(*tab)

    # ========== MAIN EXECUTION ==========

    def scan_all(self):
        """Scan everything"""
        print("="*60)
        print("COMPREHENSIVE ECOSYSTEM SCAN")
        print("="*60)

        self.scan_mcp_tools()
        self.scan_slash_commands()
        self.scan_scripts()
        self.scan_validators()
        self.scan_schemas()
        self.scan_resource_sheets()
        self.scan_workflows()
        self.scan_output_formats()
        self.scan_dashboard_tabs()

        print(f"\nTotal resources scanned: {len(self.resources)}")

        if self.errors:
            print(f"\nWarnings: {len(self.errors)}")
            for error in self.errors[:10]:
                print(f"  - {error}")

        return self.resources

    def write_csv(self, output_path: Path):
        """Write resources to CSV"""
        # Sort by Type, Server, Category, Name
        sorted_resources = sorted(self.resources, key=lambda x: (x['Type'], x['Server'], x['Category'], x['Name']))

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'Type', 'Server', 'Category', 'Name', 'Description', 'Status', 'Path', 'Created', 'LastUpdated'
            ])
            writer.writeheader()
            writer.writerows(sorted_resources)

        print(f"\n[OK] CSV written to: {output_path}")
        print(f"[OK] Total rows: {len(sorted_resources)}")

        # Print breakdown
        type_counts = {}
        for r in sorted_resources:
            type_counts[r['Type']] = type_counts.get(r['Type'], 0) + 1

        print("\nBreakdown by type:")
        for rtype, count in sorted(type_counts.items()):
            print(f"  {rtype:15} {count:4}")


def main():
    """Main execution"""
    scanner = ResourceScanner()
    scanner.scan_all()
    scanner.write_csv(OUTPUT_CSV)

    print("\n" + "="*60)
    print("SCAN COMPLETE")
    print("="*60)
    print(f"\nNext steps:")
    print(f"1. Review: {OUTPUT_CSV}")
    print(f"2. Delete old CSV files")
    print(f"3. Rename FINAL-tools-and-commands.csv → tools-and-commands.csv")


if __name__ == '__main__':
    main()

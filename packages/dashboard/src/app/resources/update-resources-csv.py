#!/usr/bin/env python3
"""
CSV Auto-Update Script v2.0
Purpose: Automatically generate/update tools-and-commands.csv from source files
Features: Resource sheets tracking, timestamps (created/updated)
Status: Production
"""

import ast
import csv
import json
import re
import sys
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime
import yaml

# Base paths
DASHBOARD_ROOT = Path(__file__).parent.parent.parent.parent.parent.parent
CSV_OUTPUT = Path(__file__).parent / "tools-and-commands.csv"
MCP_SERVERS_DIR = Path(r"C:\Users\willh\.mcp-servers")
CLAUDE_COMMANDS_DIR = Path(r"C:\Users\willh\.claude\commands")

# Resource type definitions
VALID_TYPES = ["Tool", "Command", "Tab", "Script", "Workflow", "Output", "Validator", "Schema", "ResourceSheet"]
VALID_STATUS = ["active", "deprecated", "draft"]

# New CSV schema with timestamps
CSV_HEADER = ["Type", "Server", "Category", "Name", "Description", "Status", "Path", "Created", "LastUpdated"]


class TimestampExtractor:
    """Extract creation and last updated timestamps from files"""

    @staticmethod
    def get_git_created(file_path: Path) -> Optional[str]:
        """Get creation date from git history (first commit)"""
        try:
            result = subprocess.run(
                ['git', 'log', '--format=%aI', '--diff-filter=A', '--', str(file_path)],
                capture_output=True,
                text=True,
                cwd=DASHBOARD_ROOT,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                # Get first line (earliest commit)
                lines = result.stdout.strip().split('\n')
                return lines[-1] if lines else None
        except Exception:
            pass
        return None

    @staticmethod
    def get_git_updated(file_path: Path) -> Optional[str]:
        """Get last updated date from git history (most recent commit)"""
        try:
            result = subprocess.run(
                ['git', 'log', '-1', '--format=%aI', '--', str(file_path)],
                capture_output=True,
                text=True,
                cwd=DASHBOARD_ROOT,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
        except Exception:
            pass
        return None

    @staticmethod
    def get_file_created(file_path: Path) -> str:
        """Get file creation time from filesystem"""
        try:
            timestamp = file_path.stat().st_ctime
            return datetime.fromtimestamp(timestamp).isoformat()
        except Exception:
            return datetime.now().isoformat()

    @staticmethod
    def get_file_updated(file_path: Path) -> str:
        """Get file modification time from filesystem"""
        try:
            timestamp = file_path.stat().st_mtime
            return datetime.fromtimestamp(timestamp).isoformat()
        except Exception:
            return datetime.now().isoformat()

    @staticmethod
    def get_yaml_date(file_path: Path) -> Optional[str]:
        """Extract date from YAML frontmatter"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract YAML frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1])
                    if isinstance(frontmatter, dict):
                        date = frontmatter.get('date')
                        if date:
                            # Convert to ISO format if needed
                            if isinstance(date, str):
                                return date
                            elif hasattr(date, 'isoformat'):
                                return date.isoformat()
        except Exception:
            pass
        return None

    @classmethod
    def get_timestamps(cls, file_path: Path) -> Tuple[str, str]:
        """
        Get created and updated timestamps for a file.
        Priority: Git > YAML frontmatter > Filesystem
        Returns: (created_iso, updated_iso)
        """
        # Try git first (most accurate)
        created = cls.get_git_created(file_path)
        updated = cls.get_git_updated(file_path)

        # Fallback to YAML frontmatter for created date
        if not created:
            yaml_date = cls.get_yaml_date(file_path)
            if yaml_date:
                created = yaml_date

        # Fallback to filesystem
        if not created:
            created = cls.get_file_created(file_path)
        if not updated:
            updated = cls.get_file_updated(file_path)

        return created, updated


class ResourceExtractor:
    """Extract resources from various source files"""

    def __init__(self):
        self.resources: List[Tuple[str, str, str, str, str, str, str, str, str]] = []
        self.errors: List[str] = []
        self.timestamp_extractor = TimestampExtractor()

    def scan_resource_sheets(self) -> List[Tuple]:
        """Scan for *-RESOURCE-SHEET.md files across the codebase"""
        sheets = []

        # Search patterns
        search_dirs = [
            DASHBOARD_ROOT / "coderef" / "resources-sheets",
            DASHBOARD_ROOT / "coderef" / "foundation-docs",
            DASHBOARD_ROOT / "packages" / "dashboard" / "src" / "app",
            DASHBOARD_ROOT / "packages" / "coderef-core",
        ]

        for search_dir in search_dirs:
            if not search_dir.exists():
                continue

            for sheet_file in search_dir.rglob("*-RESOURCE-SHEET.md"):
                try:
                    # Extract metadata from YAML frontmatter
                    with open(sheet_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Parse frontmatter
                    metadata = self._parse_frontmatter(content)

                    # Determine category and server
                    category = metadata.get('category', 'unknown')
                    server = self._determine_server(sheet_file)

                    # Get subject/name
                    subject = metadata.get('subject', sheet_file.stem.replace('-RESOURCE-SHEET', ''))

                    # Get status
                    status = metadata.get('status', 'APPROVED').lower()
                    if status == 'approved':
                        status = 'active'
                    elif status == 'draft':
                        status = 'draft'

                    # Get timestamps
                    created, updated = self.timestamp_extractor.get_timestamps(sheet_file)

                    # Get description from first paragraph after executive summary
                    description = self._extract_description(content) or f"Resource sheet for {subject}"

                    # Make path relative to dashboard root
                    try:
                        rel_path = sheet_file.relative_to(DASHBOARD_ROOT)
                    except ValueError:
                        rel_path = sheet_file

                    sheets.append((
                        "ResourceSheet",
                        server,
                        category,
                        subject,
                        description,
                        status,
                        str(rel_path),
                        created,
                        updated
                    ))

                except Exception as e:
                    self.errors.append(f"Error processing {sheet_file}: {e}")

        return sheets

    def _parse_frontmatter(self, content: str) -> Dict[str, Any]:
        """Parse YAML frontmatter from markdown"""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                try:
                    return yaml.safe_load(parts[1]) or {}
                except Exception:
                    pass
        return {}

    def _determine_server(self, file_path: Path) -> str:
        """Determine server/component from file path"""
        path_str = str(file_path)

        if 'packages/dashboard' in path_str:
            return 'dashboard'
        elif 'packages/coderef-core' in path_str:
            return 'coderef-core'
        elif 'coderef/resources-sheets/systems' in path_str:
            return 'systems'
        elif 'coderef/resources-sheets' in path_str:
            return 'dashboard'
        elif 'coderef/foundation-docs' in path_str:
            return 'foundation'
        else:
            return 'unknown'

    def _extract_description(self, content: str) -> Optional[str]:
        """Extract description from resource sheet content"""
        # Look for executive summary section
        lines = content.split('\n')
        in_summary = False
        description_lines = []

        for line in lines:
            if '## Executive Summary' in line:
                in_summary = True
                continue
            elif in_summary:
                if line.startswith('##'):
                    break
                if line.strip() and not line.startswith('#'):
                    description_lines.append(line.strip())

        if description_lines:
            # Take first sentence
            text = ' '.join(description_lines)
            first_sentence = text.split('.')[0]
            return first_sentence[:200] + ('...' if len(first_sentence) > 200 else '')

        return None

    def scan_mcp_tools(self) -> List[Tuple]:
        """Scan MCP server.py files for tool definitions"""
        tools = []
        # ... (existing code, but add timestamp extraction)

        servers = [
            ("coderef-context", MCP_SERVERS_DIR / "coderef-context"),
            ("coderef-docs", MCP_SERVERS_DIR / "coderef-docs"),
            ("coderef-personas", MCP_SERVERS_DIR / "coderef-personas"),
            ("papertrail", MCP_SERVERS_DIR / "papertrail"),
        ]

        for server_name, server_path in servers:
            server_file = server_path / "server.py"
            if not server_file.exists():
                server_file = server_path / "src" / f"{server_name.replace('-', '_')}" / "server.py"

            if not server_file.exists():
                self.errors.append(f"Server file not found: {server_file}")
                continue

            try:
                # Get timestamps for server file
                created, updated = self.timestamp_extractor.get_timestamps(server_file)

                with open(server_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                tree = ast.parse(content)

                for node in ast.walk(tree):
                    if isinstance(node, ast.Call):
                        if hasattr(node.func, 'id') and node.func.id == 'Tool':
                            tool_name = self._get_tool_arg(node, 'name')
                            tool_desc = self._get_tool_arg(node, 'description')

                            if tool_name:
                                category = self._categorize_tool(server_name)
                                tools.append((
                                    "Tool",
                                    server_name,
                                    category,
                                    tool_name,
                                    tool_desc or "",
                                    "active",
                                    str(server_file),
                                    created,
                                    updated
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

    def scan_commands(self) -> List[Tuple]:
        """Scan .claude/commands/*.md files"""
        commands = []

        command_dirs = [
            CLAUDE_COMMANDS_DIR,
            DASHBOARD_ROOT / ".claude" / "commands",
        ]

        # Also scan MCP server command directories
        for server_dir in MCP_SERVERS_DIR.glob("*"):
            if (server_dir / ".claude" / "commands").exists():
                command_dirs.append(server_dir / ".claude" / "commands")

        for cmd_dir in command_dirs:
            if not cmd_dir.exists():
                continue

            for cmd_file in cmd_dir.glob("*.md"):
                try:
                    # Get timestamps
                    created, updated = self.timestamp_extractor.get_timestamps(cmd_file)

                    # Extract frontmatter
                    with open(cmd_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    metadata = self._parse_frontmatter(content)
                    description = metadata.get('description', '')

                    # Determine server from path
                    if 'coderef-docs' in str(cmd_dir):
                        server = 'coderef-docs'
                    elif 'coderef-personas' in str(cmd_dir):
                        server = 'coderef-personas'
                    elif 'coderef-workflow' in str(cmd_dir):
                        server = 'coderef-workflow'
                    elif 'coderef-testing' in str(cmd_dir):
                        server = 'coderef-testing'
                    elif 'coderef-dashboard' in str(cmd_dir):
                        server = 'coderef-dashboard'
                    else:
                        server = 'assistant'

                    category = self._categorize_command(cmd_file.stem, description)

                    commands.append((
                        "Command",
                        server,
                        category,
                        f"/{cmd_file.stem}",
                        description,
                        "active",
                        str(cmd_file),
                        created,
                        updated
                    ))

                except Exception as e:
                    self.errors.append(f"Error processing {cmd_file}: {e}")

        return commands

    def _categorize_command(self, name: str, description: str) -> str:
        """Categorize command based on name and description"""
        desc_lower = description.lower()
        name_lower = name.lower()

        if 'persona' in name_lower or 'ava' in name_lower or 'taylor' in name_lower:
            return 'Personas'
        elif 'doc' in name_lower or 'template' in desc_lower:
            return 'Documentation'
        elif 'test' in name_lower:
            return 'Testing'
        elif 'workflow' in desc_lower or 'workorder' in name_lower or 'session' in name_lower:
            return 'Workflow'
        else:
            return 'General'

    def generate_csv(self):
        """Generate complete CSV with all resources"""
        print("Scanning resources...")

        # Scan all resource types
        print("  - Scanning resource sheets...")
        self.resources.extend(self.scan_resource_sheets())

        print("  - Scanning MCP tools...")
        self.resources.extend(self.scan_mcp_tools())

        print("  - Scanning commands...")
        self.resources.extend(self.scan_commands())

        # Sort by Type, Server, Category, Name
        self.resources.sort(key=lambda x: (x[0], x[1], x[2], x[3]))

        # Write CSV
        print(f"\nWriting {len(self.resources)} resources to {CSV_OUTPUT}")

        with open(CSV_OUTPUT, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADER)
            writer.writerows(self.resources)

        # Print summary
        print("\n[OK] CSV generated successfully!")
        print(f"\nSummary:")
        type_counts = {}
        for resource in self.resources:
            type_name = resource[0]
            type_counts[type_name] = type_counts.get(type_name, 0) + 1

        for type_name, count in sorted(type_counts.items()):
            print(f"  {type_name}: {count}")

        if self.errors:
            print(f"\n[WARNING] {len(self.errors)} errors encountered:")
            for error in self.errors[:10]:  # Show first 10
                print(f"  - {error}")


def main():
    """Main entry point"""
    extractor = ResourceExtractor()
    extractor.generate_csv()


if __name__ == "__main__":
    main()

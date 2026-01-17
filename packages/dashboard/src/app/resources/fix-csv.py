#!/usr/bin/env python3
"""
Fix tools-and-commands.csv
- Add missing descriptions from command files
- Mark assistant duplicates as aliases
- Standardize categories
"""

import csv
from pathlib import Path
from typing import Dict, List, Tuple

# Paths
CSV_PATH = Path(__file__).parent / "tools-and-commands.csv"
ASSISTANT_COMMANDS = Path(r"C:\Users\willh\.claude\commands")

# Known MCP servers that have duplicate commands
MCP_SERVERS = {
    "coderef-docs",
    "coderef-personas",
    "coderef-testing",
    "coderef-workflow"
}


def read_command_description(command_file: Path) -> str:
    """Read first line of command file as description"""
    try:
        with open(command_file, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            # Remove markdown formatting
            first_line = first_line.replace('**', '').replace('*', '')
            return first_line
    except Exception as e:
        print(f"  Warning: Could not read {command_file.name}: {e}")
        return ""


def load_existing_csv(csv_path: Path) -> List[List[str]]:
    """Load existing CSV with multiple encoding attempts"""
    rows = []
    encodings = ['utf-8-sig', 'utf-8', 'utf-16', 'cp1252', 'latin-1']

    for encoding in encodings:
        try:
            with open(csv_path, 'r', encoding=encoding, newline='') as f:
                reader = csv.reader(f)
                for row in reader:
                    rows.append(row)
            return rows
        except (UnicodeDecodeError, UnicodeError):
            rows = []  # Reset for next attempt
            continue
        except Exception as e:
            print(f"  Warning: Error with {encoding}: {e}")
            rows = []
            continue

    raise Exception(f"Could not read CSV with any known encoding")
    return rows


def find_mcp_command(rows: List[List[str]], command_name: str) -> Tuple[str, str, str]:
    """Find MCP server version of command and return (server, category, description)"""
    for row in rows:
        if len(row) >= 7:
            row_type, server, category, name, description, status, path = row[:7]
            if (row_type == "Command" and
                name == command_name and
                server in MCP_SERVERS):
                return (server, category, description)
    return ("", "", "")


def fix_csv():
    """Main fix function"""
    print("Loading existing CSV...")
    rows = load_existing_csv(CSV_PATH)

    # Separate header and data
    header = rows[0]
    data_rows = rows[1:]

    print(f"Found {len(data_rows)} data rows")

    # Track changes
    descriptions_added = 0
    aliases_marked = 0
    categories_updated = 0

    print("\nProcessing commands...")

    fixed_rows = []
    for row in data_rows:
        if len(row) < 7:
            fixed_rows.append(row)
            continue

        row_type, server, category, name, description, status, path = row[:7]

        # Only process assistant commands
        if row_type == "Command" and server == "assistant":
            command_file = ASSISTANT_COMMANDS / f"{name[1:]}.md"  # Remove leading /

            # Check if this is a duplicate (exists in MCP server)
            mcp_server, mcp_category, mcp_description = find_mcp_command(data_rows, name)

            if mcp_server:
                # This is an alias
                if status != "alias":
                    status = "alias"
                    aliases_marked += 1

                # Update category to match MCP server
                if category != mcp_category:
                    category = mcp_category
                    categories_updated += 1

                # Update description to indicate alias
                if not description or description == "":
                    if mcp_description:
                        description = f"Alias for {mcp_server} - {mcp_description}"
                    else:
                        description = f"Alias for {mcp_server} command"
                    descriptions_added += 1
            else:
                # Not a duplicate, just add description if missing
                if (not description or description == "") and command_file.exists():
                    description = read_command_description(command_file)
                    if description:
                        descriptions_added += 1

        fixed_rows.append([row_type, server, category, name, description, status, path])

    # Write fixed CSV
    print(f"\nWriting fixed CSV...")
    output_path = CSV_PATH.parent / "tools-and-commands-fixed.csv"

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(fixed_rows)

    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Descriptions added:   {descriptions_added}")
    print(f"Aliases marked:       {aliases_marked}")
    print(f"Categories updated:   {categories_updated}")
    print(f"\nFixed CSV written to: {output_path}")
    print(f"Original CSV backed up (not overwritten)")
    print(f"\nTo apply changes:")
    print(f"  1. Review {output_path}")
    print(f"  2. If satisfied, replace tools-and-commands.csv")


if __name__ == "__main__":
    fix_csv()

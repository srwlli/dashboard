#!/usr/bin/env python3
"""
Merge new scanned resources with existing tool data
Filter out duplicate assistant commands
Create final single source of truth
"""

import csv
from pathlib import Path
from collections import defaultdict

RESOURCES_DIR = Path(__file__).parent

# Input files
SCANNED_CSV = RESOURCES_DIR / "scanned-resources-temp.csv"  # Has: ResourceSheets, Scripts, etc
OLD_CSV = RESOURCES_DIR / "tools-and-commands-backup.csv"  # Has: Tools from MCP servers

# Output
FINAL_CSV = RESOURCES_DIR / "FINAL-tools-and-commands.csv"


def read_csv(path: Path):
    """Read CSV into list of dicts"""
    rows = []
    encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'cp1252']

    for encoding in encodings:
        try:
            with open(path, 'r', encoding=encoding, newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rows.append(dict(row))
            return rows
        except (UnicodeDecodeError, UnicodeError):
            continue

    raise Exception(f"Could not read {path}")


def is_duplicate_assistant_command(row, mcp_commands):
    """Check if this assistant command is a duplicate of an MCP command"""
    if row['Type'] != 'Command' or row['Server'] != 'assistant':
        return False

    # Check if same command exists in MCP servers
    command_name = row['Name']
    for mcp_row in mcp_commands:
        if mcp_row['Name'] == command_name and mcp_row['Server'] != 'assistant':
            return True

    return False


def merge_csvs():
    """Merge new and old CSVs, removing duplicates"""
    print("Reading CSVs...")
    scanned_resources = read_csv(SCANNED_CSV)
    old_resources = read_csv(OLD_CSV)

    print(f"  Scanned CSV: {len(scanned_resources)} resources")
    print(f"  Old CSV: {len(old_resources)} resources")

    # Extract Tools and MCP Commands from old CSV
    tools_from_old = [r for r in old_resources if r['Type'] == 'Tool']
    mcp_commands_from_old = [r for r in old_resources if r['Type'] == 'Command' and r['Server'] != 'assistant']

    print(f"\nFrom old CSV (keeping):")
    print(f"  Tools: {len(tools_from_old)}")
    print(f"  MCP Commands: {len(mcp_commands_from_old)}")

    # Filter scanned resources - remove assistant commands that are duplicates
    scanned_filtered = []
    dup_count = 0

    for row in scanned_resources:
        if is_duplicate_assistant_command(row, mcp_commands_from_old):
            dup_count += 1
            continue
        # Skip commands from scanned CSV (we'll use old CSV commands which are correct)
        if row['Type'] == 'Command':
            continue
        scanned_filtered.append(row)

    print(f"\nFrom scanned CSV (keeping):")
    print(f"  Filtered assistant duplicates: {dup_count} removed")
    print(f"  ResourceSheets, Scripts, etc.: {len(scanned_filtered)}")

    # Merge: Tools + MCP Commands from old + filtered scanned resources
    merged = tools_from_old + mcp_commands_from_old + scanned_filtered

    # Remove any remaining duplicates by (Type, Server, Name)
    seen = set()
    deduped = []

    for row in merged:
        key = (row['Type'], row['Server'], row['Name'])
        if key not in seen:
            seen.add(key)
            deduped.append(row)

    print(f"\nFinal merged: {len(deduped)} resources")

    # Count by type
    type_counts = defaultdict(int)
    for row in deduped:
        type_counts[row['Type']] += 1

    print("\nBreakdown:")
    for rtype, count in sorted(type_counts.items()):
        print(f"  {rtype:15} {count:4}")

    return deduped


def write_csv(resources, output_path):
    """Write final CSV"""
    # Sort by Type, Server, Category, Name
    sorted_resources = sorted(resources, key=lambda x: (
        x.get('Type', ''),
        x.get('Server', ''),
        x.get('Category', ''),
        x.get('Name', '')
    ))

    # Standard fieldnames (ensure all rows have these)
    fieldnames = ['Type', 'Server', 'Category', 'Name', 'Description', 'Status', 'Path', 'Created', 'LastUpdated']

    # Fill missing fields with empty strings
    for row in sorted_resources:
        for field in fieldnames:
            if field not in row:
                row[field] = ''

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(sorted_resources)

    print(f"\n[OK] Wrote {len(sorted_resources)} rows to {output_path}")


def main():
    print("="*60)
    print("MERGE AND DEDUPE")
    print("="*60)

    resources = merge_csvs()
    write_csv(resources, FINAL_CSV)

    print("\n" + "="*60)
    print("COMPLETE")
    print("="*60)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Validate FINAL CSV completeness"""

import csv
from pathlib import Path
from collections import Counter

RESOURCES_DIR = Path(__file__).parent
FINAL_CSV = RESOURCES_DIR / "FINAL-tools-and-commands.csv"

def validate_csv():
    """Validate CSV structure and contents"""
    with open(FINAL_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)

    print("=" * 60)
    print("CSV VALIDATION REPORT")
    print("=" * 60)

    print(f"\nTotal resources: {len(data)}")

    # Count by type
    type_counts = Counter(r['Type'] for r in data)
    print("\nBreakdown by Type:")
    for rtype, count in sorted(type_counts.items()):
        print(f"  {rtype:15} {count:4}")

    # Count by server
    server_counts = Counter(r['Server'] for r in data)
    print("\nBreakdown by Server:")
    for server, count in sorted(server_counts.items()):
        print(f"  {server:20} {count:4}")

    # Check for missing data
    missing_desc = [r for r in data if not r['Description']]
    missing_status = [r for r in data if not r['Status']]
    missing_path = [r for r in data if not r['Path']]

    print("\nData Quality:")
    print(f"  Missing Description: {len(missing_desc)}")
    print(f"  Missing Status: {len(missing_status)}")
    print(f"  Missing Path: {len(missing_path)}")

    # Sample of each type
    print("\nSample Entries by Type:")
    for rtype in sorted(type_counts.keys()):
        sample = next((r for r in data if r['Type'] == rtype), None)
        if sample:
            print(f"\n  {rtype}:")
            print(f"    Name: {sample['Name']}")
            print(f"    Server: {sample['Server']}")
            print(f"    Category: {sample['Category']}")

    print("\n" + "=" * 60)
    print("VALIDATION COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    validate_csv()

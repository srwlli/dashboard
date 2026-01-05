#!/usr/bin/env python3
"""
---
resource_sheet: coderef/reference/Setup-Coderef-Dir-RESOURCE-SHEET.md
related_test: scripts/setup-coderef-dir/test_setup_coderef_dirs.py
---

setup-coderef-dirs.py - Directory Structure Initializer

Purpose:
    Creates the standardized directory structure for the Coderef system.
    Separates structural setup from data generation/analysis.

Directories Created:
    1. .coderef/ (Hidden, Technical)
       - reports/complexity/
       - diagrams/
       - exports/
    
    2. coderef/ (Visible, Workflow)
       - workorder/
       - archived/
       - standards/
       - documents/
       - reference/
       - user/
       - notes/

Usage:
    python setup-coderef-dirs.py [project_path] [--dry-run]
"""

import sys
import argparse
from pathlib import Path

def create_structure(project_path: str, dry_run: bool = False) -> dict:
    """
    Creates the standard Coderef directory structure.
    Returns a status dict of created directories.
    """
    project = Path(project_path).resolve()
    
    if not project.exists() and not dry_run:
        print(f"[ERROR] Project path does not exist: {project}")
        return {'success': False, 'created': [], 'errors': ['Path not found']}

    # Define the structure
    # tuple format: (parent_name, subpaths_list)
    structure = [
        ('.coderef', [
            'reports/complexity',
            'diagrams',
            'exports'
        ]),
        ('coderef', [
            'workorder',
            'archived',
            'standards',
            'documents',
            'resource',
            'user',
            'notes'
        ])
    ]

    status = {'success': True, 'created': [], 'skipped': [], 'errors': []}

    print(f"\nSetting up Coderef structure in: {project}")
    if dry_run:
        print("[DRY-RUN] No directories will be created.\n")

    for parent, subdirs in structure:
        parent_dir = project / parent
        
        # 1. Create Parent (e.g., .coderef/)
        if dry_run:
            print(f"[DRY-RUN] Would create: {parent_dir}")
        else:
            try:
                if not parent_dir.exists():
                    parent_dir.mkdir(parents=True, exist_ok=True)
                    status['created'].append(str(parent_dir))
                    print(f"[CREATE] {parent}/")
                else:
                    status['skipped'].append(str(parent_dir))
                    print(f"[EXISTS] {parent}/")
            except Exception as e:
                status['errors'].append(str(e))
                status['success'] = False
                print(f"[ERROR] Could not create {parent_dir}: {e}")
                continue

        # 2. Create Subdirectories
        for sub in subdirs:
            target = parent_dir / sub
            if dry_run:
                print(f"  [DRY-RUN] Would create: {target}")
            else:
                try:
                    if not target.exists():
                        target.mkdir(parents=True, exist_ok=True)
                        status['created'].append(str(target))
                        print(f"  [CREATE] {parent}/{sub}/")
                    else:
                        status['skipped'].append(str(target))
                        print(f"  [EXISTS] {parent}/{sub}/")
                except Exception as e:
                    status['errors'].append(str(e))
                    status['success'] = False
                    print(f"  [ERROR] Could not create {target}: {e}")

    return status

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Initialize Coderef directory structure')
    parser.add_argument('project_path', nargs='?', default='.', help='Project root directory')
    parser.add_argument('--dry-run', action='store_true', help='Simulate without creating directories')
    
    args = parser.parse_args()
    
    result = create_structure(args.project_path, args.dry_run)
    
    if not result['success']:
        sys.exit(1)

#!/usr/bin/env python3
"""
generate-coderef-directories.py - Generate Complete .coderef/ and coderef/ Structure

Generates both directory structures:
- .coderef/ (hidden): 16 technical output files (index, graph, reports, diagrams, exports)
- coderef/ (visible): Workflow directories (workorder, archived, standards, documents, reference, user, notes)

Usage:
    python scripts/generate-coderef-directories.py [project_path] [--dry-run]
    python scripts/generate-coderef-directories.py C:/Users/willh/Desktop/my-project
    python scripts/generate-coderef-directories.py . --dry-run
"""

import subprocess
import sys
from pathlib import Path
import json
import argparse

# Global dry-run flag
DRY_RUN = False


def run_command(cmd: str, shell: bool = True) -> tuple[bool, str]:
    """Run CLI command and return (success, output)."""
    try:
        result = subprocess.run(
            cmd, shell=shell, capture_output=True, text=True,
            encoding='utf-8', errors='replace', check=True,
            cwd=Path(__file__).parent.parent
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        stderr_safe = e.stderr.encode('ascii', errors='replace').decode('ascii') if e.stderr else ""
        print(f"[ERROR] {cmd}\n        {stderr_safe}")
        return False, ""
    except Exception as e:
        print(f"[ERROR] {e}")
        return False, ""


def run_save(cmd: str, output_file: Path) -> bool:
    """Run command and save output to file."""
    print(f"[*] {output_file.name}")

    if DRY_RUN:
        if output_file.exists():
            print(f"    [DRY-RUN] File exists, would skip: {output_file}")
        else:
            print(f"    [DRY-RUN] Would run: {cmd[:80]}...")
            print(f"    [DRY-RUN] Would save to: {output_file}")
        return True

    # Skip if file already exists
    if output_file.exists():
        size_kb = output_file.stat().st_size / 1024
        print(f"    [EXISTS] Skipping existing file ({size_kb:.1f} KB)")
        return False

    success, output = run_command(cmd)
    if success and output and output.strip():
        output_file.parent.mkdir(parents=True, exist_ok=True)
        # Remove emoji and progress indicators
        lines = [l for l in output.split('\n') if not any(c > '\u007F' for c in l[:20])]
        cleaned = '\n'.join(lines)
        output_file.write_text(cleaned, encoding='utf-8')
        size = len(cleaned) / 1024
        print(f"    [OK] {size:.1f} KB")
        return True
    print(f"    [SKIP] Skipped (no output)")
    return False


def detect_unexpected_items(directory: Path, expected_subdirs: set[str]) -> dict:
    """Detect unexpected files and directories in the coderef structure."""
    unexpected = {'files': [], 'dirs': []}

    if not directory.exists():
        return unexpected

    for item in directory.iterdir():
        if item.is_file():
            unexpected['files'].append(item.name)
        elif item.is_dir() and item.name not in expected_subdirs:
            unexpected['dirs'].append(item.name)

    return unexpected


def populate_coderef(project_path: str):
    """Generate complete .coderef/ and coderef/ structure with all 16 output types."""
    project = Path(project_path).resolve()
    if not project.exists():
        print(f"[ERROR] Project path does not exist: {project}")
        sys.exit(1)

    coderef_dir = project / '.coderef'
    coderef_visible_dir = project / 'coderef'
    cli = "coderef"
    lang = "py,ts,tsx,js,jsx"  # Support both Python and TypeScript projects

    # Define expected directory structure
    expected_coderef_dirs = {'reports', 'diagrams', 'exports'}
    expected_visible_dirs = {'workorder', 'archived', 'standards', 'documents', 'reference', 'user', 'notes'}

    print(f"\n{'='*60}")
    if DRY_RUN:
        print(f"[DRY-RUN MODE] Previewing changes for: {project.name}")
    else:
        print(f"Populating .coderef/ and coderef/ in: {project.name}")
    print(f"{'='*60}\n")

    # Create .coderef/ directory structure (hidden, technical outputs)
    if DRY_RUN:
        print(f"[DRY-RUN] Would create: {coderef_dir / 'reports' / 'complexity'}")
        print(f"[DRY-RUN] Would create: {coderef_dir / 'diagrams'}")
        print(f"[DRY-RUN] Would create: {coderef_dir / 'exports'}")
    else:
        (coderef_dir / 'reports' / 'complexity').mkdir(parents=True, exist_ok=True)
        (coderef_dir / 'diagrams').mkdir(parents=True, exist_ok=True)
        (coderef_dir / 'exports').mkdir(parents=True, exist_ok=True)

    # Create coderef/ directory structure (visible, workflow outputs)
    if DRY_RUN:
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'workorder'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'archived'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'standards'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'documents'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'reference'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'user'}")
        print(f"[DRY-RUN] Would create: {coderef_visible_dir / 'notes'}")
    else:
        (coderef_visible_dir / 'workorder').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'archived').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'standards').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'documents').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'reference').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'user').mkdir(parents=True, exist_ok=True)
        (coderef_visible_dir / 'notes').mkdir(parents=True, exist_ok=True)

    stats = {'success': 0, 'skipped': 0}

    # ========================================
    # ROOT LEVEL (4 files)
    # ========================================
    print("\n[ROOT LEVEL] (4 files)\n")

    # 1. index.json
    if run_save(f'{cli} scan "{project}" -l {lang} --json', coderef_dir / 'index.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 2. graph.json (via export)
    if run_save(f'{cli} export -f json -s "{project}" --lang {lang} -o "{coderef_dir}/graph.json"',
                coderef_dir / 'graph.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 3. context.json
    if run_save(f'{cli} context "{project}" -f json', coderef_dir / 'context.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 4. context.md
    if run_save(f'{cli} context "{project}"', coderef_dir / 'context.md'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # ========================================
    # REPORTS DIRECTORY (5+ files)
    # ========================================
    print("\n[REPORTS DIRECTORY] (5+ files)\n")

    # 5. reports/patterns.json
    if run_save(f'{cli} patterns -f json', coderef_dir / 'reports' / 'patterns.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 6. reports/coverage.json
    if run_save(f'{cli} coverage -f json', coderef_dir / 'reports' / 'coverage.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 7. reports/validation.json
    if run_save(f'{cli} validate "{project}" -f json', coderef_dir / 'reports' / 'validation.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 8. reports/drift.json
    if run_save(f'{cli} drift "{project}" --json -i "{coderef_dir}/index.json"',
                coderef_dir / 'reports' / 'drift.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 9. reports/complexity/ (note: per-element, generated on-demand)
    complexity_note = coderef_dir / 'reports' / 'complexity' / 'README.md'
    print(f"[*] complexity/README.md")

    if DRY_RUN:
        if complexity_note.exists():
            print(f"    [DRY-RUN] File exists, would skip")
        else:
            print(f"    [DRY-RUN] Would create on-demand generation guide")
    elif complexity_note.exists():
        size_kb = complexity_note.stat().st_size / 1024
        print(f"    [EXISTS] Skipping existing file ({size_kb:.1f} KB)")
    else:
        complexity_note.write_text(
            "# Complexity Reports\n\n"
            "Per-element complexity metrics are generated on-demand.\n\n"
            "Usage: `coderef complexity <element> -f json > complexity/<element>.json`\n",
            encoding='utf-8'
        )
        print(f"    [OK] On-demand generation guide created")

    # ========================================
    # DIAGRAMS DIRECTORY (4 files)
    # ========================================
    print("\n[DIAGRAMS DIRECTORY] (4 files)\n")

    # 10. diagrams/dependencies.mmd
    if run_save(f'{cli} diagram -f mermaid -t dependencies -l {lang} "" "{project}"',
                coderef_dir / 'diagrams' / 'dependencies.mmd'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 11. diagrams/dependencies.dot
    if run_save(f'{cli} diagram -f dot -t dependencies -l {lang} "" "{project}"',
                coderef_dir / 'diagrams' / 'dependencies.dot'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 12. diagrams/calls.mmd
    if run_save(f'{cli} diagram -f mermaid -t calls -l {lang} "" "{project}"',
                coderef_dir / 'diagrams' / 'calls.mmd'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 13. diagrams/imports.mmd
    if run_save(f'{cli} diagram -f mermaid -t imports -l {lang} "" "{project}"',
                coderef_dir / 'diagrams' / 'imports.mmd'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # ========================================
    # EXPORTS DIRECTORY (3 files)
    # ========================================
    print("\n[EXPORTS DIRECTORY] (3 files)\n")

    # 14. exports/graph.json (full export)
    if run_save(f'{cli} export -f json -s "{project}" --lang {lang} -o "{coderef_dir}/exports/graph.json"',
                coderef_dir / 'exports' / 'graph.json'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 15. exports/graph.jsonld
    if run_save(f'{cli} export -f jsonld -s "{project}" --lang {lang} -o "{coderef_dir}/exports/graph.jsonld"',
                coderef_dir / 'exports' / 'graph.jsonld'):
        stats['success'] += 1
    else:
        stats['skipped'] += 1

    # 16. exports/diagram-wrapped.md (wrapped Mermaid)
    wrapped_diagram = coderef_dir / 'exports' / 'diagram-wrapped.md'
    deps_mmd = coderef_dir / 'diagrams' / 'dependencies.mmd'

    print(f"[*] diagram-wrapped.md")
    if DRY_RUN:
        if wrapped_diagram.exists():
            print(f"    [DRY-RUN] File exists, would skip")
        elif deps_mmd.exists():
            print(f"    [DRY-RUN] Would generate from dependencies.mmd")
        else:
            print(f"    [DRY-RUN] Would skip (no dependencies.mmd)")
    elif wrapped_diagram.exists():
        size_kb = wrapped_diagram.stat().st_size / 1024
        print(f"    [EXISTS] Skipping existing file ({size_kb:.1f} KB)")
        stats['skipped'] += 1
    elif deps_mmd.exists():
        content = deps_mmd.read_text(encoding='utf-8')
        wrapped = f"""# {project.name} Dependency Diagram

Generated: {Path(__file__).stem}

## Architecture Overview

```mermaid
{content}
```

## Usage

Render this diagram at:
- https://mermaid.live
- GitHub markdown
- VSCode with Mermaid extension
"""
        wrapped_diagram.write_text(wrapped, encoding='utf-8')
        print(f"    [OK] {len(wrapped)/1024:.1f} KB")
        stats['success'] += 1
    else:
        print(f"    [SKIP] Skipped (no dependencies.mmd)")
        stats['skipped'] += 1

    # ========================================
    # SUMMARY
    # ========================================
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Success:  {stats['success']}/16")
    print(f"Skipped:  {stats['skipped']}/16")
    print(f"\nTechnical Output: {coderef_dir}")
    print(f"Workflow Output:  {coderef_visible_dir}")

    # Show .coderef/ structure
    print(f"\n{'='*60}")
    print(".CODEREF/ DIRECTORY STRUCTURE (Technical)")
    print(f"{'='*60}")
    print_tree(coderef_dir)

    # Show coderef/ structure
    print(f"\n{'='*60}")
    print("CODEREF/ DIRECTORY STRUCTURE (Workflow)")
    print(f"{'='*60}")
    print_tree(coderef_visible_dir)

    # ========================================
    # DETECT UNEXPECTED ITEMS
    # ========================================
    unexpected_coderef = detect_unexpected_items(coderef_dir, expected_coderef_dirs)
    unexpected_visible = detect_unexpected_items(coderef_visible_dir, expected_visible_dirs)

    has_unexpected = (
        unexpected_coderef['files'] or unexpected_coderef['dirs'] or
        unexpected_visible['files'] or unexpected_visible['dirs']
    )

    if has_unexpected:
        print(f"\n{'='*60}")
        print("UNEXPECTED ITEMS DETECTED")
        print(f"{'='*60}")

        if unexpected_coderef['files']:
            print(f"\n[WARNING] Unexpected files in .coderef/:")
            for f in unexpected_coderef['files']:
                print(f"  - {f}")

        if unexpected_coderef['dirs']:
            print(f"\n[WARNING] Unexpected directories in .coderef/:")
            for d in unexpected_coderef['dirs']:
                print(f"  - {d}/")

        if unexpected_visible['files']:
            print(f"\n[WARNING] Unexpected files in coderef/:")
            for f in unexpected_visible['files']:
                print(f"  - {f}")

        if unexpected_visible['dirs']:
            print(f"\n[WARNING] Unexpected directories in coderef/:")
            for d in unexpected_visible['dirs']:
                print(f"  - {d}/")

        print(f"\nNote: These items were not created by this script and will be preserved.")
    else:
        print(f"\n[OK] No unexpected items detected in coderef directories.")


def print_tree(directory: Path, prefix: str = "", max_depth: int = 3, current_depth: int = 0):
    """Print directory tree structure."""
    if current_depth >= max_depth:
        return

    try:
        items = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name))
        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            connector = "+-- " if is_last else "|-- "

            if item.is_file():
                size_kb = item.stat().st_size / 1024
                print(f"{prefix}{connector}{item.name} ({size_kb:.1f} KB)")
            else:
                print(f"{prefix}{connector}{item.name}/")
                extension = "    " if is_last else "|   "
                print_tree(item, prefix + extension, max_depth, current_depth + 1)
    except PermissionError:
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Generate complete .coderef/ and coderef/ directory structure'
    )
    parser.add_argument(
        'project_path',
        nargs='?',
        default=None,
        help='Project directory path (default: interactive prompt)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without creating directories or files'
    )

    args = parser.parse_args()

    # Set global dry-run flag
    DRY_RUN = args.dry_run

    # Get project path (from args or interactive)
    if args.project_path:
        project_path = args.project_path
    else:
        project_path = input("Enter project path: ").strip() or "."

    if DRY_RUN:
        print("\n" + "="*60)
        print("DRY-RUN MODE ENABLED - No files or directories will be created")
        print("="*60)

    populate_coderef(project_path)

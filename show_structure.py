#!/usr/bin/env python3
"""
Show folder and file structure of a project (clean version).
Skips junk/system folders like node_modules, .git, dist, etc.
Also saves the output to 'project_structure.txt'.

Usage:
    python show_structure.py [path]

If no path is given, it shows the current directory.
"""

import os
import sys
from datetime import datetime

IGNORE_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "__pycache__", "venv", ".idea", ".vscode"
}
IGNORE_EXTENSIONS = {
    ".pyc", ".log", ".tmp"
}

output_lines = []

def print_tree(start_path, prefix=""):
    try:
        items = sorted(os.listdir(start_path))
    except PermissionError:
        output_lines.append(prefix + "🚫 [Permission Denied]")
        return

    items = [
        name for name in items
        if not (name in IGNORE_DIRS or name.startswith(".") or
                os.path.splitext(name)[1] in IGNORE_EXTENSIONS)
    ]

    for index, name in enumerate(items):
        path = os.path.join(start_path, name)
        connector = "└── " if index == len(items) - 1 else "├── "
        line = prefix + connector + name
        print(line)
        output_lines.append(line)

        if os.path.isdir(path):
            extension = "    " if index == len(items) - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    root_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    abs_path = os.path.abspath(root_dir)

    header = f"\n📦 Project structure for: {abs_path}\nGenerated: {datetime.now()}\n"
    print(header)
    output_lines.append(header)

    print_tree(abs_path)

    output_lines.append("\n✅ Done.\n")

    output_file = os.path.join(abs_path, "project_structure.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))

    print(f"\n✅ Structure saved to: {output_file}\n")

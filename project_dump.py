#!/usr/bin/env python3
"""
Project Structure + Routes + Code Dump → output.txt

- ROUTES: Detects Next.js routes from /app and /pages (or src/pages)
- TREE:   Prints a clean directory tree (skipping junk)
- DUMP:   Appends file contents of text-like files
- NO LIMITS: Use --no-limits to dump 100% of every included file (no truncation)
- INCLUDE ENV: Use --include-env to include .env files (e.g., .env.local) in the dump

Usage:
  python project_dump.py [--path .] [--out output.txt]
                         [--max-mb 500] [--per-file-kb 1000]
                         [--show-hidden] [--no-limits] [--include-env]

WARNING: --no-limits and/or --include-env can produce huge files and may expose secrets.
"""

import os, sys, argparse, mimetypes, re, math
from pathlib import Path
from datetime import datetime

# ---- Defaults / Filters ----
SKIP_DIRS = {
    "node_modules", ".git", ".husky", ".turbo", ".cache", ".vercel", ".vscode",
    ".next", "out", "dist", "build", "coverage", "cypress", "playwright",
    "scan_reports", "venv", ".venv", "_scanscratch"
}
# lockfiles are still excluded
NEVER_DUMP_FILES = {"package-lock.json", "package.lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"}

# Env files (excluded by default unless --include-env)
ENV_FILE_NAMES = {
    ".env", ".env.local", ".env.development", ".env.production", ".env.test"
}

TEXT_EXTS = {
    ".ts",".tsx",".js",".jsx",".mjs",".cjs",
    ".json",".toml",".yaml",".yml",
    ".css",".scss",".sass",".less",
    ".md",".mdx",".html",".svg",".txt",
    ".dockerignore",".gitignore",".gitattributes",".conf",".cfg",".ini",".sh",".py",".rb",".go",".java",".rs",".php"
}

def is_env_file(p: Path) -> bool:
    # Matches .env, .env.local, .env.production, and also .env.<anything>
    return p.name in ENV_FILE_NAMES or p.name.startswith(".env.")

def is_text_file(p: Path) -> bool:
    if p.suffix.lower() in TEXT_EXTS:
        return True
    mime, _ = mimetypes.guess_type(str(p))
    if mime and (mime.startswith("text/") or mime in ("application/json","image/svg+xml")):
        return True
    return False

def should_skip_path(p: Path) -> bool:
    parts = set(p.parts)
    return any(d in parts for d in SKIP_DIRS)

def read_text_safe(p: Path, max_bytes: int | None) -> str:
    try:
        if max_bytes is None:  # full read (no truncation)
            return p.read_text(encoding="utf-8", errors="ignore")
        with p.open("rb") as f:
            data = f.read(max_bytes + 1)
        s = data[:max_bytes].decode("utf-8", errors="ignore")
        if len(data) > max_bytes:
            s += "\n\n/* ... truncated ... */\n"
        return s
    except Exception:
        return ""

# ---- ROUTES (Next.js style) ----
def enumerate_next_routes(root: Path):
    routes = {"app_routes": set(), "pages_routes": set(), "dynamic_routes": []}
    app_dir = root / "app"
    pages_dir = root / "pages"
    src_pages = root / "src" / "pages"

    if app_dir.exists():
        for f in app_dir.rglob("page.*"):
            rel = f.relative_to(app_dir)
            parts = rel.parts[:-1]
            clean = [seg for seg in parts if not seg.startswith("(")]
            path = "/" + "/".join(clean)
            path = path or "/"
            if any("[" in seg and "]" in seg for seg in parts):
                routes["dynamic_routes"].append({"path": path, "file": str(f.relative_to(root))})
            routes["app_routes"].add(path)

    for base in [pages_dir, src_pages]:
        if base.exists():
            for f in base.rglob("*"):
                if not f.is_file() or f.suffix not in (".js",".jsx",".ts",".tsx"):
                    continue
                rel = f.relative_to(base)
                stem = rel.with_suffix("").name
                if stem.startswith(("_app","_document","_error")):
                    continue
                parts = rel.with_suffix("").parts
                if stem == "index":
                    path = "/" + "/".join(parts[:-1])
                else:
                    segs = [ (p if not (p.startswith("[") and p.endswith("]")) else f":{p[1:-1]}") for p in parts ]
                    path = "/" + "/".join(segs)
                path = path.rstrip("/") or "/"
                if "[" in rel.name or "]" in rel.name:
                    routes["dynamic_routes"].append({"path": path, "file": str(f.relative_to(root))})
                routes["pages_routes"].add(path)
    return routes

# ---- TREE PRINTER ----
def print_tree_lines(root: Path, show_hidden=False, include_env=False):
    lines = []
    def walk(dir_path: Path, prefix=""):
        try:
            entries = sorted(dir_path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            lines.append(prefix + "🚫 [Permission Denied]")
            return
        filt = []
        for e in entries:
            # keep .env* if include_env, otherwise apply hidden-file filter
            if not include_env and (not show_hidden) and e.name.startswith(".") and e.name not in {".gitignore",".gitattributes",".dockerignore"}:
                continue
            if should_skip_path(e):
                continue
            filt.append(e)
        for i, e in enumerate(filt):
            connector = "└── " if i == len(filt) - 1 else "├── "
            tag = ""
            # mark files that won't be dumped (lockfiles) unless env is excluded
            if e.is_file():
                if e.name in NEVER_DUMP_FILES:
                    tag = "  (not dumped)"
                elif (not include_env) and is_env_file(e):
                    tag = "  (not dumped)"
            lines.append(prefix + connector + e.name + tag)
            if e.is_dir():
                extension = "    " if i == len(filt) - 1 else "│   "
                walk(e, prefix + extension)
    lines.append(f"{root.name}/")
    walk(root, "")
    return lines

# ---- DUMP ----
def dump_files(root: Path, max_total_bytes: float, per_file_bytes: int | None, show_hidden=False, include_env=False):
    """Yield (header_line, content) tuples for each dumped file."""
    written = 0
    infinite = not math.isfinite(max_total_bytes)
    for p in sorted(root.rglob("*"), key=lambda x: str(x).lower()):
        if not p.is_file():
            continue
        if should_skip_path(p):
            continue
        # hidden files are skipped unless show_hidden OR it's an env file and include_env is set
        if p.name.startswith(".") and p.name not in {".gitignore",".gitattributes",".dockerignore"}:
            if not (show_hidden or (include_env and is_env_file(p))):
                continue
        if p.name in NEVER_DUMP_FILES:
            continue
        if (not include_env) and is_env_file(p):
            continue
        if not is_text_file(p):
            continue

        rel = p.relative_to(root)
        size = p.stat().st_size
        header = f"\n\n===== FILE: {rel}  (size={size} bytes) =====\n"

        if not infinite:
            projected = written + len(header.encode("utf-8"))
            if projected > max_total_bytes:
                yield ("\n\n# --- SIZE LIMIT REACHED; remaining files omitted ---\n", "")
                return

        body = read_text_safe(p, max_bytes=per_file_bytes)  # None → full file
        if not infinite:
            projected = written + len(header.encode("utf-8")) + len(body.encode("utf-8"))
            if projected > max_total_bytes:
                overflow = projected - max_total_bytes
                if overflow > 0:
                    keep = max(0, len(body.encode("utf-8")) - overflow - 64)
                    trimmed = body.encode("utf-8")[:keep].decode("utf-8", errors="ignore")
                    body = trimmed + "\n\n/* ... truncated due to total size limit ... */\n"
                yield (header, body)
                yield ("\n\n# --- SIZE LIMIT REACHED; remaining files omitted ---\n", "")
                return

        yield (header, body)
        if not infinite:
            written += len(header.encode("utf-8")) + len(body.encode("utf-8"))

# ---- MAIN ----
def main():
    ap = argparse.ArgumentParser(description="Project dump: routes + tree + code → output.txt")
    ap.add_argument("--path", default=".", help="Project root (default: .)")
    ap.add_argument("--out", default="output.txt", help="Output file name (default: output.txt)")
    ap.add_argument("--max-mb", type=float, default=500.0, help="Max total MB for code dump (default: 500)")
    ap.add_argument("--per-file-kb", type=int, default=1000, help="Max KB per file (default: 1000)")
    ap.add_argument("--show-hidden", action="store_true", help="Include hidden files/dirs")
    ap.add_argument("--no-limits", action="store_true", help="Dump 100% of every included file (no truncation, no total cap)")
    ap.add_argument("--include-env", action="store_true", help="Include .env* files (e.g., .env.local) in the dump")
    args = ap.parse_args()

    root = Path(args.path).resolve()
    out_path = Path(args.out).resolve()

    if args.no_limits:
        max_total_bytes = float("inf")
        per_file_bytes = None  # full file
        size_note = "NO LIMITS (danger: huge output possible)"
    else:
        max_total_bytes = int(args.max_mb * 1024 * 1024)
        per_file_bytes = int(args.per_file_kb * 1024)
        size_note = f"total≈{args.max_mb}MB, per-file≈{args.per_file_kb}KB"

    lines = []
    header = [
        "# PROJECT DUMP",
        f"# Root: {root}",
        f"# Generated: {datetime.now()}",
        f"# Limits: {size_note}",
        "# Skips: " + ", ".join(sorted(SKIP_DIRS)),
        "# Lockfiles excluded: " + ", ".join(sorted(NEVER_DUMP_FILES)),
        "# ENV INCLUDED: YES" if args.include_env else "# ENV INCLUDED: NO (use --include-env to include .env files)",
        ""
    ]
    if args.include_env:
        header.append("# WARNING: .env* files may contain secrets. Handle output.txt securely.\n")
    lines.extend(header)

    # ROUTES
    routes = enumerate_next_routes(root)
    all_routes = sorted(routes["app_routes"] | routes["pages_routes"])
    lines.append("## ROUTES (Next.js-style)")
    if all_routes:
        for r in all_routes:
            lines.append(f"- {r}")
    else:
        lines.append("- (none detected)")
    if routes["dynamic_routes"]:
        lines.append("\n### Dynamic Routes")
        for dr in routes["dynamic_routes"]:
            lines.append(f"- {dr['path']}  ← {dr['file']}")
    lines.append("")

    # TREE
    lines.append("## DIRECTORY TREE")
    lines.extend(print_tree_lines(root, show_hidden=args.show_hidden, include_env=args.include_env))
    lines.append("")

    # CONTENTS
    lines.append("## FILE CONTENTS")
    for header_line, body in dump_files(root, max_total_bytes, per_file_bytes, show_hidden=args.show_hidden, include_env=args.include_env):
        lines.append(header_line.rstrip("\n"))
        if body:
            lines.append(body.rstrip("\n"))

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"✅ Dump written to: {out_path}")

if __name__ == "__main__":
    main()

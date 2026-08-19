#!/usr/bin/env python3
"""
scan_codebase.py — fast structural overview of a TypeScript/Next.js repo.

This is a first-pass discovery aid, not a substitute for actually reading
files. It pattern-matches on well-known folder/file names, so a repo that
expresses the same ideas under different names will look emptier here than
it really is — treat surprising results ("no FSD layers detected") as a
prompt to go look by hand, not as confirmation the repo has no structure.

Usage:
    python3 scan_codebase.py [path-to-repo-root]

No third-party dependencies; stdlib only.
"""

import json
import os
import re
import sys
from pathlib import Path

IGNORED_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "coverage",
    "out", ".turbo", ".vercel", ".cache", "__pycache__",
}

FSD_LAYERS = {"app", "pages", "widgets", "features", "entities", "shared", "processes"}
ATOMIC_FOLDERS = {"atoms", "molecules", "organisms", "templates"}

STATE_LIBS = ["zustand", "redux", "@reduxjs/toolkit", "jotai", "recoil", "mobx"]
DATA_LIBS = ["@tanstack/react-query", "react-query", "swr"]
STYLE_LIBS = ["styled-components", "@emotion/react", "@emotion/styled", "@vanilla-extract/css"]
TEST_LIBS = ["vitest", "jest", "@testing-library/react", "@storybook/react"]


def find_package_json(root: Path):
    direct = root / "package.json"
    if direct.exists():
        return direct
    # shallow search, one level down, in case root is a monorepo parent
    for child in root.iterdir():
        if child.is_dir() and child.name not in IGNORED_DIRS:
            candidate = child / "package.json"
            if candidate.exists():
                return candidate
    return None


def load_json_loose(path: Path):
    """Parse JSON that may contain // and /* */ comments or a trailing comma
    (tsconfig.json commonly does)."""
    text = path.read_text(encoding="utf-8", errors="ignore")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"(?<!:)//.*", "", text)
    text = re.sub(r",\s*([}\]])", r"\1", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def detect_stack(pkg_json):
    if not pkg_json:
        return {}
    deps = {}
    deps.update(pkg_json.get("dependencies", {}) or {})
    deps.update(pkg_json.get("devDependencies", {}) or {})

    def present(names):
        return sorted(n for n in names if n in deps)

    return {
        "next_version": deps.get("next"),
        "react_version": deps.get("react"),
        "typescript": "typescript" in deps,
        "tailwind": "tailwindcss" in deps,
        "state_libs": present(STATE_LIBS),
        "data_fetching_libs": present(DATA_LIBS),
        "styling_libs": present(STYLE_LIBS),
        "test_libs": present(TEST_LIBS),
    }


def find_source_roots(root: Path):
    """Return likely source roots to scan: 'src' if present, else repo root,
    plus any immediate app-like packages in a monorepo."""
    candidates = []
    if (root / "src").is_dir():
        candidates.append(root / "src")
    else:
        candidates.append(root)
    return candidates


def detect_router(root: Path, src_roots):
    findings = []
    for base in {root, *src_roots}:
        app_dir = base / "app"
        pages_dir = base / "pages"
        if app_dir.is_dir() and any(
            (app_dir / f).exists() for f in ("layout.tsx", "layout.ts", "page.tsx")
        ):
            findings.append(f"App Router detected at {app_dir.relative_to(root)}")
        if pages_dir.is_dir() and any(
            (pages_dir / f).exists() for f in ("_app.tsx", "_app.ts", "index.tsx")
        ):
            findings.append(f"Pages Router detected at {pages_dir.relative_to(root)}")
    return findings or ["No clear app/ or pages/ router entry found — check manually."]


def walk_folders(root: Path, max_depth=5):
    """Yield (relative_path, dirname) for all directories up to max_depth,
    skipping ignored dirs."""
    root_depth = len(root.parts)
    for dirpath, dirnames, _ in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith(".")]
        depth = len(Path(dirpath).parts) - root_depth
        if depth >= max_depth:
            dirnames[:] = []
            continue
        for d in dirnames:
            yield Path(dirpath, d).relative_to(root), d


def detect_architecture_folders(root: Path):
    fsd_hits, atomic_hits = [], []
    for rel_path, name in walk_folders(root):
        if name in FSD_LAYERS:
            fsd_hits.append(str(rel_path))
        if name in ATOMIC_FOLDERS:
            atomic_hits.append(str(rel_path))
    return sorted(set(fsd_hits)), sorted(set(atomic_hits))


def detect_tsconfig_paths(root: Path):
    for name in ("tsconfig.json", "tsconfig.base.json"):
        path = root / name
        if path.exists():
            data = load_json_loose(path)
            if data:
                paths = (data.get("compilerOptions") or {}).get("paths")
                if paths:
                    return name, paths
    return None, None


def detect_styling_files(root: Path, src_roots):
    tailwind_config = [
        f for f in ("tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs")
        if (root / f).exists()
    ]
    css_modules_count = 0
    for base in src_roots:
        for _, _, files in os.walk(base):
            css_modules_count += sum(1 for f in files if f.endswith(".module.css") or f.endswith(".module.scss"))
            if css_modules_count > 0:
                break
    return {
        "tailwind_config_found": tailwind_config,
        "css_modules_sample_found": css_modules_count > 0,
    }


def print_shallow_tree(root: Path, src_roots, max_depth=2, max_entries_per_dir=25):
    print("\n--- Shallow directory tree ---")
    for base in src_roots:
        print(f"\n{base.relative_to(root) if base != root else '.'}/")
        base_depth = len(base.parts)
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = sorted(d for d in dirnames if d not in IGNORED_DIRS and not d.startswith("."))
            depth = len(Path(dirpath).parts) - base_depth
            if depth >= max_depth:
                dirnames[:] = []
                continue
            indent = "  " * (depth + 1)
            shown = dirnames[:max_entries_per_dir]
            for d in shown:
                print(f"{indent}{d}/")
            if len(dirnames) > max_entries_per_dir:
                print(f"{indent}... ({len(dirnames) - max_entries_per_dir} more)")


def main():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(".").resolve()
    if not root.exists():
        print(f"Path does not exist: {root}")
        sys.exit(1)

    print(f"Scanning: {root}\n")

    pkg_path = find_package_json(root)
    pkg_json = load_json_loose(pkg_path) if pkg_path else None
    stack = detect_stack(pkg_json)

    print("--- Stack (from package.json) ---")
    if not pkg_json:
        print("No package.json found near root — is this the right path?")
    else:
        print(f"next: {stack.get('next_version') or 'not found'}")
        print(f"react: {stack.get('react_version') or 'not found'}")
        print(f"typescript: {'yes' if stack.get('typescript') else 'not found'}")
        print(f"tailwind: {'yes' if stack.get('tailwind') else 'not found'}")
        print(f"state management libs: {stack.get('state_libs') or 'none detected'}")
        print(f"data fetching libs: {stack.get('data_fetching_libs') or 'none detected'}")
        print(f"styling libs: {stack.get('styling_libs') or 'none detected'}")
        print(f"test libs: {stack.get('test_libs') or 'none detected'}")

    src_roots = find_source_roots(root)

    print("\n--- Router ---")
    for line in detect_router(root, src_roots):
        print(line)

    print("\n--- Feature-Sliced Design layer folders detected ---")
    fsd_hits, atomic_hits = detect_architecture_folders(root)
    print("\n".join(fsd_hits) if fsd_hits else "None found by name — doesn't mean FSD isn't in use, check by hand.")

    print("\n--- Atomic Design folders detected (atoms/molecules/organisms/templates) ---")
    print("\n".join(atomic_hits) if atomic_hits else "None found by name — many repos fold this into shared/ui instead, check by hand.")

    print("\n--- tsconfig path aliases ---")
    ts_file, paths = detect_tsconfig_paths(root)
    if paths:
        print(f"(from {ts_file})")
        for alias, targets in paths.items():
            print(f"  {alias} -> {targets}")
    else:
        print("No path aliases found in tsconfig.json/tsconfig.base.json — check for relative-import style instead.")

    print("\n--- Styling ---")
    styling = detect_styling_files(root, src_roots)
    print(f"tailwind config file: {styling['tailwind_config_found'] or 'not found'}")
    print(f"*.module.css/scss present: {'yes' if styling['css_modules_sample_found'] else 'no'}")

    print_shallow_tree(root, src_roots)

    print("\n--- Next: go read 2-3 real files in the area you're about to touch. ---")
    print("This scan tells you where to look, not what the code actually does.")


if __name__ == "__main__":
    main()

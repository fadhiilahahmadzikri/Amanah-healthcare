#!/usr/bin/env python3
"""Create a small inventory JSON for a Next.js project."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

IGNORE_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".vercel",
    ".cache",
    "out",
}

INTERESTING_CONFIG_FILES = [
    "lefthook.yml",
    "lefthook.yaml",
    ".lefthook.yml",
    "codecov.yml",
    "codecov.yaml",
    "crowdin.yml",
    "crowdin.yaml",
    "biome.json",
    "biome.jsonc",
    ".editorconfig",
    "commitlint.config.js",
    "commitlint.config.cjs",
    "commitlint.config.ts",
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    ".eslintrc.json",
    ".eslintrc.js",
    "eslint.config.js",
    "eslint.config.mjs",
    "tsconfig.json",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
    "renovate.json",
    ".renovaterc",
]


def scan_tree(root: Path) -> list[str]:
    tree: list[str] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in IGNORE_DIRS]
        rel_dir = os.path.relpath(dirpath, root)
        for filename in filenames:
            rel_path = filename if rel_dir == "." else os.path.join(rel_dir, filename)
            tree.append(rel_path.replace("\\", "/"))
    return sorted(tree)


def read_package_json(root: Path) -> dict[str, object] | None:
    pkg_path = root / "package.json"
    if not pkg_path.exists():
        return None
    with pkg_path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return {
        "dependencies": data.get("dependencies", {}),
        "devDependencies": data.get("devDependencies", {}),
        "scripts": data.get("scripts", {}),
    }


def detect_config_files(root: Path) -> list[str]:
    return [name for name in INTERESTING_CONFIG_FILES if (root / name).exists()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        raise SystemExit(f"Root not found: {root}")

    result = {
        "label": args.label,
        "root": str(root),
        "files": scan_tree(root),
        "package_json": read_package_json(root),
        "config_files_found": detect_config_files(root),
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as file:
        json.dump(result, file, indent=2, ensure_ascii=False)

    print(f"[OK] Inventory for '{args.label}' completed -> {out_path}")
    print(f"     Total indexed files: {len(result['files'])}")


if __name__ == "__main__":
    main()

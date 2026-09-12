#!/usr/bin/env python3
"""Compare two inventory JSON files for dependency and config candidates."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--landing", required=True)
    parser.add_argument("--main", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    with Path(args.landing).open("r", encoding="utf-8") as file:
        landing = json.load(file)

    with Path(args.main).open("r", encoding="utf-8") as file:
        main_project = json.load(file)

    landing_pkg = landing.get("package_json") or {}
    main_pkg = main_project.get("package_json") or {}

    landing_deps = {
        **landing_pkg.get("dependencies", {}),
        **landing_pkg.get("devDependencies", {}),
    }
    main_deps = {
        **main_pkg.get("dependencies", {}),
        **main_pkg.get("devDependencies", {}),
    }

    missing_in_main: dict[str, str] = {}
    version_conflict: dict[str, dict[str, str]] = {}
    for name, version in landing_deps.items():
        if name not in main_deps:
            missing_in_main[name] = version
        elif main_deps[name] != version:
            version_conflict[name] = {"landing": version, "main": main_deps[name]}

    missing_configs = [
        config
        for config in landing.get("config_files_found", [])
        if config not in main_project.get("config_files_found", [])
    ]

    report = {
        "dependencies_to_add": missing_in_main,
        "dependency_version_conflicts": version_conflict,
        "config_files_candidate_to_adopt": missing_configs,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as file:
        json.dump(report, file, indent=2, ensure_ascii=False)

    print("[OK] Diff completed ->", out_path)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

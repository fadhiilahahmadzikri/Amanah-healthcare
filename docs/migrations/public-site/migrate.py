#!/usr/bin/env python3
"""Execute a copy-only migration from a reviewed manifest."""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--source-root", required=True)
    parser.add_argument("--dest-root", required=True)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--force-overwrite", action="store_true")
    parser.add_argument("--log-dir", default="migration_artifacts")
    args = parser.parse_args()

    source_root = Path(args.source_root)
    dest_root = Path(args.dest_root)
    log_dir = Path(args.log_dir)

    with Path(args.manifest).open("r", encoding="utf-8") as file:
        manifest = json.load(file)

    log: list[dict[str, object]] = []
    for entry in manifest["entries"]:
        if entry.get("action") == "skip":
            log.append({**entry, "result": "SKIPPED_BY_MANIFEST"})
            continue

        src = source_root / entry["source"]
        dst = dest_root / entry["destination"]

        if not src.exists():
            log.append({**entry, "result": "ERROR_SOURCE_NOT_FOUND"})
            print(f"[!] Source not found, skipping: {src}")
            continue

        if dst.exists() and not (entry.get("overwrite") and args.force_overwrite):
            log.append({**entry, "result": "SKIPPED_DEST_EXISTS"})
            print(f"[i] Destination already exists, safely skipped: {dst}")
            continue

        if args.execute:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            log.append({**entry, "result": "COPIED"})
            print(f"[OK] {src} -> {dst}")
        else:
            log.append({**entry, "result": "DRY_RUN_WOULD_COPY"})
            print(f"[dry-run] {src} -> {dst}")

    log_dir.mkdir(parents=True, exist_ok=True)
    mode = "execute" if args.execute else "dry_run"
    log_name = log_dir / f"migration_log_{mode}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with log_name.open("w", encoding="utf-8") as file:
        json.dump(log, file, indent=2, ensure_ascii=False)

    print(f"\nLog saved to: {log_name}")


if __name__ == "__main__":
    main()

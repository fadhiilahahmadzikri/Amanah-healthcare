#!/usr/bin/env python3
"""Build the reviewed migration whitelist for the landing import."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

SOURCE_DIRS: list[tuple[str, str]] = [
    ("src/features/healthcare-landing", "PAGE_VIEW"),
    ("src/features/healthcare-about", "ORGANISM"),
    ("src/features/healthcare-services", "ORGANISM"),
    ("src/features/healthcare-testimonials", "ORGANISM"),
    ("src/features/healthcare-reviews", "ORGANISM"),
    ("src/features/healthcare-contact", "PAGE_VIEW"),
    ("src/features/healthcare-doctors", "MOLECULE"),
    ("src/components/healthcare", "MOLECULE"),
]

UTILITY_FILES = [
    "lefthook.yml",
    "codecov.yml",
    "crowdin.yml",
    "commitlint.config.ts",
    "eslint.config.mjs",
    "knip.config.ts",
    "checkly.config.ts",
    "drizzle.config.ts",
    "vitest.config.ts",
    "playwright.config.ts",
    ".github/dependabot.yml",
    ".github/workflows/CI.yml",
    ".github/workflows/checkly.yml",
    ".github/workflows/crowdin.yml",
    ".github/workflows/release.yml",
]

MARKETING_ROUTE_FILES = [
    "src/app/[locale]/(marketing)/page.tsx",
    "src/app/[locale]/(marketing)/tentang-kami/page.tsx",
    "src/app/[locale]/(marketing)/layanan/page.tsx",
    "src/app/[locale]/(marketing)/fasilitas/page.tsx",
    "src/app/[locale]/(marketing)/testimoni/page.tsx",
    "src/app/[locale]/(marketing)/ulasan/page.tsx",
    "src/app/[locale]/(marketing)/kontak/page.tsx",
    "src/app/[locale]/(marketing)/about/page.tsx",
]

CUSTOM_UI_FILES = [
    "src/components/ui/carousel.tsx",
    "src/components/ui/card-fan-carousel.tsx",
]

UTILITY_SOURCE_FILES = [
    "src/utils/AppConfig.ts",
    "src/utils/Helpers.ts",
    "src/utils/seo.ts",
]

STYLE_FILES = [
    ("src/styles/global.css", "src/landing-import/styles/landing.isolated.css"),
]

PUBLIC_ROOT_FILES = [
    "opengraph-image.png",
    "twitter-image.png",
]

MISSING_SOURCE_ASSETS = [
    "public/assets/images/Container_cbf59344.png",
    "public/assets/images/Container_b3d9c1ee.png",
    "public/assets/images/Container_58d108e1.png",
    "public/assets/images/Container_65c14397.png",
    "public/assets/images/Container_bc4ce079.png",
    "public/assets/images/Container_6133502d.png",
    "public/assets/images/Image__Whitening__53bfb490.png",
    "public/assets/images/Image__service-small-3__b76673af.png",
    "public/assets/images/Image__tisti-3__be471b16.png",
]

RUNTIME_DEPENDENCIES_TO_ADD = [
    "@gsap/react",
    "embla-carousel-autoplay",
    "embla-carousel-react",
    "lenis",
    "lucide-react",
    "react-icons",
]

IMPORT_REWRITE_RULES = [
    {"from": "@/components/healthcare", "to": "@landing/components/healthcare"},
    {"from": "@/features/healthcare-", "to": "@landing/features/healthcare-"},
    {"from": "@/utils/", "to": "@landing/utils/"},
    {"from": "@/components/ui/carousel", "to": "@landing/components/ui/carousel"},
    {
        "from": "@/components/ui/card-fan-carousel",
        "to": "@landing/components/ui/card-fan-carousel",
    },
]


def should_skip_runtime_file(path: Path) -> bool:
    name = path.name
    return (
        ".test." in name
        or ".debug." in name
        or ".stories." in name
        or name.endswith(".test.ts")
        or name.endswith(".test.tsx")
    )


def normalize(path: Path) -> str:
    return path.as_posix()


def destination_for_source(source: str) -> str:
    if source.startswith("public/"):
        return f"public/landing-import/{source.removeprefix('public/')}"
    if source.startswith("src/"):
        return f"src/landing-import/{source.removeprefix('src/')}"
    return source


def add_entry(
    entries: list[dict[str, object]],
    *,
    category: str,
    source: str,
    destination: str,
    action: str,
    reason: str,
    conflict_risk: str,
    requires_manual_review: bool,
    notes: str | None = None,
) -> None:
    prefix_by_category = {
        "PRIMITIVE_ATOM": "ATOM",
        "MOLECULE": "MOL",
        "ORGANISM": "ORG",
        "PAGE_VIEW": "PAGE",
        "HOOK_OR_UTIL": "UTIL",
        "STYLE_ASSET": "STYLE",
        "STATIC_ASSET": "ASSET",
        "UTILITY_CONFIG": "CFG",
        "EXCLUDE": "SKIP",
    }
    prefix = prefix_by_category.get(category, "ITEM")
    count = sum(1 for entry in entries if str(entry["id"]).startswith(prefix)) + 1
    entry: dict[str, object] = {
        "id": f"{prefix}-{count:03d}",
        "category": category,
        "source": source,
        "destination": destination,
        "action": action,
        "reason": reason,
        "conflict_risk": conflict_risk,
        "requires_manual_review": requires_manual_review,
    }
    if notes:
        entry["notes"] = notes
    entries.append(entry)


def collect_public_assets(source_root: Path) -> list[str]:
    assets_root = source_root / "public" / "assets"
    if not assets_root.exists():
        return []
    return [
        "public/" + normalize(path.relative_to(source_root / "public"))
        for path in sorted(assets_root.rglob("*"))
        if path.is_file()
    ]


def build_manifest(source_root: Path, destination_root: Path, dependency_diff: dict[str, object]) -> dict[str, object]:
    entries: list[dict[str, object]] = []

    for source_dir, category in SOURCE_DIRS:
        root = source_root / source_dir
        for path in sorted(root.rglob("*")):
            if not path.is_file() or should_skip_runtime_file(path):
                continue
            source = normalize(path.relative_to(source_root))
            add_entry(
                entries,
                category=category,
                source=source,
                destination=destination_for_source(source),
                action="copy",
                reason="Healthcare marketing runtime file copied into isolated landing namespace",
                conflict_risk="low",
                requires_manual_review=False,
            )

    for source in CUSTOM_UI_FILES:
        add_entry(
            entries,
            category="MOLECULE",
            source=source,
            destination=destination_for_source(source),
            action="copy",
            reason="Landing-specific UI helper not present in Project A",
            conflict_risk="medium",
            requires_manual_review=False,
        )

    for source in UTILITY_SOURCE_FILES:
        add_entry(
            entries,
            category="HOOK_OR_UTIL",
            source=source,
            destination=destination_for_source(source),
            action="copy",
            reason="Landing runtime utility copied into isolated namespace, then simplified for single-locale Project A integration",
            conflict_risk="medium",
            requires_manual_review=False,
        )

    for source, destination in STYLE_FILES:
        add_entry(
            entries,
            category="STYLE_ASSET",
            source=source,
            destination=destination,
            action="copy",
            reason="Landing CSS source for isolated/scoped landing stylesheet",
            conflict_risk="high",
            requires_manual_review=False,
            notes="After copy, scope under .landing-scope and remove root/global Tailwind imports that would affect Project A globally.",
        )

    for source in collect_public_assets(source_root):
        add_entry(
            entries,
            category="STATIC_ASSET",
            source=source,
            destination=destination_for_source(source),
            action="copy",
            reason="Static media referenced by healthcare marketing pages",
            conflict_risk="low",
            requires_manual_review=False,
        )

    for source in PUBLIC_ROOT_FILES:
        add_entry(
            entries,
            category="STATIC_ASSET",
            source=f"public/{source}",
            destination=f"public/landing-import/{source}",
            action="copy",
            reason="Landing SEO image copied without overwriting Project A public metadata files",
            conflict_risk="low",
            requires_manual_review=False,
        )

    for source in MARKETING_ROUTE_FILES:
        add_entry(
            entries,
            category="PAGE_VIEW",
            source=source,
            destination=destination_for_source(source),
            action="skip",
            reason="Project A will use single-locale wrapper routes instead of copying Project B's next-intl route files",
            conflict_risk="medium",
            requires_manual_review=False,
        )

    for source in UTILITY_FILES:
        if (source_root / source).exists():
            add_entry(
                entries,
                category="UTILITY_CONFIG",
                source=source,
                destination=source,
                action="skip",
                reason="Project B config is tied to excluded boilerplate/tooling; Project A's existing tooling remains authoritative",
                conflict_risk="medium",
                requires_manual_review=True,
            )

    for source in MISSING_SOURCE_ASSETS:
        add_entry(
            entries,
            category="STATIC_ASSET",
            source=source,
            destination=destination_for_source(source),
            action="skip",
            reason="Referenced by source data but not present in Project B public assets during inventory",
            conflict_risk="high",
            requires_manual_review=True,
            notes="Recover this asset before execution or replace references with available media during the post-copy fix pass.",
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_root": str(source_root).replace("\\", "/"),
        "destination_root": str(destination_root).replace("\\", "/"),
        "runtime_dependencies_to_add": {
            name: (dependency_diff.get("dependencies_to_add") or {}).get(name)
            for name in RUNTIME_DEPENDENCIES_TO_ADD
            if name in (dependency_diff.get("dependencies_to_add") or {})
        },
        "dependency_version_conflicts_to_report": dependency_diff.get("dependency_version_conflicts", {}),
        "import_rewrite_rules": IMPORT_REWRITE_RULES,
        "project_a_changes_after_checkpoint": [
            "Add @landing/* path alias to tsconfig.json.",
            "Replace src/app/page.tsx with the public landing route wrapper.",
            "Add wrapper routes for /tentang-kami, /layanan, /fasilitas, /testimoni, /ulasan, and /kontak.",
            "Merge required remote image hostnames into next.config.ts without copying Project B's Next plugins.",
            "Patch copied landing utilities for single-locale use and patch asset paths to /landing-import/...",
            "Create src/landing-import/README.md and MIGRATION_REPORT.md.",
        ],
        "entries": entries,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", required=True)
    parser.add_argument("--dest-root", required=True)
    parser.add_argument("--dependency-diff", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    with Path(args.dependency_diff).open("r", encoding="utf-8") as file:
        dependency_diff = json.load(file)

    manifest = build_manifest(
        source_root=Path(args.source_root),
        destination_root=Path(args.dest_root),
        dependency_diff=dependency_diff,
    )

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as file:
        json.dump(manifest, file, indent=2, ensure_ascii=False)

    print(f"[OK] Manifest written -> {out_path}")
    print(f"     Entries: {len(manifest['entries'])}")


if __name__ == "__main__":
    main()

# AGENTS.md — Selective Migration Playbook: Landing Page → Main Portal

> \*\*How to use this file:\*\* Place this file at the root of `D:\\manage-stock` (Project A) with the exact name `AGENTS.md`.
> This file is intended to be read by an AI coding agent (Claude Code, Codex, or similar) as
> working instructions, not solely for humans. If your agent is sandboxed to `D:\\manage-stock`
> as its working directory, make sure to grant additional read access to
> `D:\\mcp-example`, because Phases 1–3 require reading both projects.

> \*\*Main rule for the Agent reading this file:\*\* DO NOT execute Phase 5 or later before Phase 4 (the human confirmation checkpoint) has been explicitly passed. Never assume the folder structure; always verify by reading the actual files/directories.

\---

## 0\. Naming Notes (to avoid confusion)

* **Project A / "Main Portal"** = `D:\\manage-stock` → the main application (clinic-like portal), built on Next.js. This is the migration target.
* **Project B / "Landing"** = `D:\\mcp-example` → the landing-page project, deliberately isolated from Project A, also built on Next.js, already completed and ready for integration. This is the migration source.
* Folder names do not reflect their contents (`mcp-example` does not mean MCP-related, and `manage-stock` does not mean inventory management) — these are purely legacy names. Ignore the names and follow the definitions above.

\---

## 1\. Context (MUST be understood before taking action)

Project A and Project B are built on the **same framework** (Next.js), using the **atomic design** component paradigm (atoms → molecules → organisms → pages). Project B was deliberately separated as an independent project (separate git repository, separate `package.json`) for two reasons:

1. To prevent landing-page development from becoming mixed with or contaminating the portal code.
2. To prevent the AI coding agent working in Project B from being biased by reading irrelevant portal files while focusing on the landing page.

The landing page is now complete and ready to be integrated into Project A. **However, this is not a full migration.** Because both projects have similar directory structures (both use Next.js and both use atomic design), blindly moving everything would cause duplication: two `.git` directories, two `package.json` files, two `node\_modules` directories, etc.

The project owner's analogy: this process is like cutting a large pipe (Project B) so that it fits into the main pipe (Project A) — only the **useful, correctly sized pieces** are installed, not the entire raw pipe, and the unused pieces are discarded.

What is **eligible for acquisition** from Project B into Project A:

* Components (atoms/molecules/organisms) unique to the landing page.
* Landing-page pages/views.
* Libraries/dependencies used in Project B but not yet present in Project A.
* Utility config files that follow "best practice" principles and do not yet exist in Project A — examples: `lefthook.yml`, `codecov.yml`, `crowdin.yml`, Biome config, etc. If such a file already exists in Project A, **do not overwrite it**.

What is **NOT moved** (excluded by default):

* `.git`, `node\_modules`, lockfiles (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`), Project B's `package.json` as a whole (diff it first rather than copying it blindly), `.env\*`, Project B-specific `README.md`, build folders (`.next`, `dist`, etc.).

Two things are **deliberately isolated** first and are not merged directly into Project A's core structure:

1. **Landing-page CSS/styling** — this may conflict with Project A's styles. For this stage, landing-page styles are quarantined in a separate location so they do not affect Project A's existing appearance. Style synchronization/harmonization is a follow-up task, **outside the scope of this migration**.
2. **Landing-page components** — these are placed in a dedicated namespace/folder (rather than directly merged into Project A's atoms/molecules/organisms folders), so it remains obvious which components are "original Project A" and which are "acquired from the landing page." Full integration into the main design system is a future plan, not part of this migration.

\---

## 2\. Definition of Done for This Migration Stage

This migration is considered complete when **all** of the following points have been fulfilled:

1. All files included in the whitelist (see Phase 3) have been copied to Project A at the correct locations, and **the source files in Project B remain intact and are not deleted** (migration = copy, not move).
2. Missing dependencies have been added to Project A's `package.json` and the lockfile has been updated (`install` has been run).
3. Relevant utility configs that do not already exist in Project A have been adopted without overwriting existing Project A configs.
4. Migrated components \& pages are located inside the isolated namespace (see Phase 9), rather than mixed into Project A's core atomic-design folders.
5. Landing-page CSS is located within an isolated location/scope (see Phase 8), without overwriting/changing Project A's `globals.css`, design tokens, or Tailwind configuration.
6. `next build` (or the appropriate build command) succeeds without errors.
7. The linter (Biome) is installed and `biome check` succeeds without blocking errors.
8. A final report (`MIGRATION\_REPORT.md`) exists documenting: what was moved, what was intentionally skipped, and which follow-up tasks remain pending (style harmonization, etc.).

The following are **NOT** completion requirements for this stage (intentionally postponed, see Section 6): visual/style consistency between the landing page and portal, merging components into the core design system, and database migration (there is no database in either project yet; both are still in the frontend prototyping stage).

\---

## 3\. HARD RULES (Non-Negotiable — must not be violated under any circumstances)

1. **Never delete or move files from Project B.** All operations are COPY operations. Project B must remain intact as a backup until a human explicitly signs off on cleaning it up (and even that is outside the scope of this file).
2. **Never overwrite an existing file in Project A** without an explicit override flag approved by a human in Phase 4.
3. **Never assume the folder structure.** Always read the actual directory contents \& configuration files before making decisions (see Phase 1). If you are unsure whether the Next.js router is App Router or Pages Router, whether the programming language is TS/JS, or whether styling uses Tailwind/CSS Modules/styled-components — **check first, never guess**.
4. **Never execute Phase 5 (copy execution) before the manifest in Phase 3 has been reviewed and confirmed by a human in Phase 4.** No bulk transfer without the checkpoint.
5. **Never merge landing-page CSS into `globals.css`/design tokens.** Follow the isolation rules in Phase 8.
6. **Never merge landing-page components directly into Project A's core `atoms/`, `molecules/`, or `organisms/` folders.** Follow the namespace isolation rules in Phase 9.
7. **Never reorganize the internal folder structure while copying components.** Preserve the original relative structure exactly as it exists in Project B (the technical reason is explained in Phase 9 — to prevent relative imports from breaking).
8. **Never automatically upgrade/downgrade the version of an existing dependency in Project A.** If there is a version conflict between Project A and B, record it as a conflict for human review rather than automatically forcing one version.
9. Every phase that changes files must leave an audit log (who changed what, from where, and to where).

\---

## 4\. Workflow Map (11-Phase Summary)

|Phase|Name|Nature|Repeatable?|
|-|-|-|-|
|0|Safety Net (git branch, backup)|Preparation|Once at the beginning|
|1|Discovery \& Inventory|Read-only|Yes, whenever re-checking is needed|
|2|Classification \& Analysis|Read-only + reasoning|Yes|
|3|Build Migration Manifest (whitelist)|Generates manifest file|Yes, until complete|
|4|**HUMAN CHECKPOINT**|STOP \& wait for confirmation|Required before continuing|
|5|Copy Execution|Changes Project A filesystem|Idempotent (safe to repeat)|
|6|Merge Dependencies|Changes `package.json`|After Phase 5|
|7|Adopt Utility Configs|Changes Project A root|After Phase 5|
|8|CSS Isolation|Special rules, part of Phase 5|—|
|9|Component Isolation|Special rules, part of Phase 5|—|
|10|Validation: build + lint loop|Iterative until green|Loop until passing|
|11|Final Verification \& Report|Read-only + report|Once at the end|

Phases 8 and 9 are actually **rules** applied **during** Phase 5 (not separate time-based phases), but they are explained separately because they are critical.

\---

## PHASE 0 — Safety Net

Before touching anything in Project A:

```bash
cd D:\\manage-stock
git status              # make sure the working tree is clean, with no uncommitted changes
git checkout -b feat/migrate-landing-page
```

Never run this migration directly on the `main`/`master` branch. If something goes wrong, simply `git checkout main` and discard/fix the migration branch without affecting the main portal.

\---

## PHASE 1 — Discovery \& Inventory (Read-Only, must not change anything)

Goal: collect actual facts about both projects without making assumptions. The agent MUST run/read the following for **both** projects (`D:\\mcp-example` and `D:\\manage-stock`):

1. Full directory structure (`tree` or equivalent), excluding `node\_modules`, `.git`, `.next`, `dist`, `build`, and `coverage`.
2. Contents of `package.json` — `dependencies`, `devDependencies`, `scripts`.
3. Detect the Next.js router: is there an `app/` folder (App Router), a `pages/` folder (Pages Router), or both?
4. Detect the language: TypeScript (`tsconfig.json` exists) or plain JavaScript?
5. Detect the styling approach: Tailwind (`tailwind.config.\*`), CSS Modules (`\*.module.css`), styled-components/emotion (check dependencies), or plain global CSS/SCSS?
6. Detect import aliases in `tsconfig.json` / `jsconfig.json` (the `"paths"` section), for example `@/\*` pointing somewhere.
7. Locate the atomic-design component folders (`atoms/`, `molecules/`, `organisms/`) — exact paths, not assumed conventional names.
8. List relevant root config files as "utility candidates": `lefthook.yml`, `codecov.yml`, `crowdin.yml`, `biome.json`/`biome.jsonc`, `.editorconfig`, `commitlint.config.\*`, `.prettierrc\*`, `.eslintrc\*`/`eslint.config.\*`, `.github/workflows/\*`, `renovate.json`.

Use the `inventory\_scan.py` script in Appendix A for points 1, 2, and 8 automatically (it generates JSON files), while the agent must still inspect points 3–7 manually because they require judgment rather than simple listing.

**Phase 1 Output:** two files, `landing\_inventory.json` and `main\_inventory.json`, plus written notes (these can be in the agent's scratchpad/reasoning) answering points 3–7 for both projects.

\---

## PHASE 2 — Classification \& Analysis

Using the Phase 1 results, inspect Project B thoroughly (folder by folder, not just filenames) and classify **every candidate item** into one of the following categories:

|Category|Example|Treatment|
|-|-|-|
|`PRIMITIVE\_ATOM`|`components/atoms/Button.tsx`|Migration candidate, placed in isolated namespace|
|`MOLECULE`|`components/molecules/SearchBar.tsx`|Migration candidate, placed in isolated namespace|
|`ORGANISM`|`components/organisms/Hero.tsx`|Migration candidate, placed in isolated namespace|
|`PAGE\_VIEW`|`app/page.tsx`, `views/LandingHome.tsx`|Migration candidate, placed in isolated namespace, wired through a thin wrapper route|
|`HOOK\_OR\_UTIL`|`hooks/useScrollSpy.ts`, `lib/formatDate.ts`|Migration candidate, first check that there is no equivalent/duplicate functionality in Project A|
|`STYLE\_ASSET`|`\*.css`, `\*.module.css`, `tailwind.config.ts` (custom theme section)|Migration candidate, **must follow Phase 8 isolation rules**|
|`STATIC\_ASSET`|images, fonts, icons, `public/\*`|Migration candidate, migrated to `public/landing-import/`|
|`LIBRARY\_DEPENDENCY`|entry in `dependencies`/`devDependencies`|Not a file, but an entry in `package.json` — handled in Phase 6|
|`UTILITY\_CONFIG`|`lefthook.yml`, `codecov.yml`, `crowdin.yml`|Candidate for adoption **only if it does not already exist** in Project A — Phase 7|
|`EXCLUDE`|`.git`, `node\_modules`, lockfile, `.env\*`, landing-specific README|Do not migrate at all|

For each non-`EXCLUDE` candidate, also record:

* **Duplicate or not?** Does an identical/similar function/component already exist in Project A? If yes, mark `requires\_manual\_review: true` and add a note; do not automatically skip or automatically copy.
* **Dependencies:** which dependencies are used by this file (which `node\_modules` imports), so they can be matched against Phase 6.

**Phase 2 Output:** a classified list (which can be structured notes/table) serving as the raw material for the manifest in Phase 3.

\---

## PHASE 3 — Build Migration Manifest (Whitelist)

Convert the Phase 2 results into one `migration\_manifest.json` file that is **explicit, per-file**, with clear source and destination paths. This is the "actual migration map" — not a general description, but a concrete list of "this file goes here."

The format \& example contents are provided in **Appendix C**. Required fields for each entry:

* `id` — unique identifier, e.g. `COMP-001`.
* `category` — one of the Phase 2 categories.
* `source` — relative path from the root of Project B.
* `destination` — relative path from the root of Project A (following the namespace rules in Phases 8/9).
* `action` — `copy` or `skip`.
* `reason` — short reason why the item is included/excluded from the whitelist.
* `conflict\_risk` — `low` / `medium` / `high`.
* `requires\_manual\_review` — `true`/`false`.

After the first manifest is created, the agent MUST perform a second verification: read Project B's structure again, check whether all important items are included in the manifest (nothing missed), and make sure no `EXCLUDE` item was incorrectly marked as `copy`. Repeat this process until the agent is confident the manifest is representative and complete — this may be repeated several times before proceeding to Phase 4.

\---

## PHASE 4 — CHECKPOINT: Human Confirmation (MUST STOP HERE)

> \*\*STOP.\*\* Before proceeding to Phase 5, the agent MUST show the user a concise summary of the manifest:
> the number of files per category, the dependencies to be added, the configs to be adopted, and all
> `requires\_manual\_review: true` items together with their reasons — then \*\*wait for explicit confirmation\*\*
> ("continue" / "go" / equivalent approval) before executing the copy.
> Do not assume silence means approval.

If the user requests revisions (for example, "don't migrate item X yet" or "the destination folder Y is wrong"), return to Phase 3, revise the manifest, show the summary again, and request confirmation again.

\---

## PHASE 5 — Copy Execution

After the manifest has been confirmed, run `migrate.py` in **dry-run mode first**, review its output, and only then run it with the `--execute` flag.

```bash
# 1. Dry run — verify first; no files are actually copied
python migrate.py --manifest migration\_manifest.json --source-root "D:/mcp-example" --dest-root "D:/manage-stock"

# 2. Once the dry-run result matches expectations, execute the actual copy
python migrate.py --manifest migration\_manifest.json --source-root "D:/mcp-example" --dest-root "D:/manage-stock" --execute
```

The script automatically: does not overwrite existing destination files (unless explicitly allowed), does not touch source files, and records a log to `migration\_log\_<timestamp>.json`.

### Required Sub-step: Path Alias Remapping

Because the copied files may contain import statements referring to Project B's structure/aliases (for example, `@/components/atoms/Button`), do the following to prevent errors:

1. **Do not reorganize the internal folder structure while copying** — preserve Project B's relative hierarchy exactly inside the isolated folder (see Phase 9). This keeps relative imports (`../../lib/...`) valid without requiring individual rewrites.
2. For **alias-based** imports (for example, `@/...`), add a new alias to Project A's `tsconfig.json` pointing to the isolated folder, for example:

```json
{
  "compilerOptions": {
    "paths": {
      "@/\*": \["./src/\*"],
      "@landing/\*": \["./src/landing-import/\*"]
    }
  }
}
```

3. Perform find-and-replace **only on the alias prefix** (not the entire file contents) across all newly copied files: Project B's old alias (for example, `@/`) → `@landing/`. Do not modify the path portion after the prefix.
4. If Project B does not use aliases at all (only relative imports), steps 2–3 can be skipped — simply make sure step 1 (preserving the relative structure) is correct.

\---

## PHASE 6 — Merge Dependencies

Use the results of `diff\_inventory.py` to determine:

* `dependencies\_to\_add` — packages present in Project B but absent from Project A → add them to Project A's `package.json` using exactly the version specified in Project B (unless there is a strong reason to use a different version).
* `dependency\_version\_conflicts` — packages present in both but with different versions → **do not automatically choose one**, mark them for human review and include them in the final report (Phase 11).

After updating `package.json`, run install using the package manager used by Project A (detected from the existing lockfile: `package-lock.json` → npm, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn):

```bash
npm install        # or: pnpm install / yarn install — according to Project A's lockfile
```

\---

## PHASE 7 — Adopt Utility Configs

From `config\_files\_candidate\_to\_adopt` in `diff\_inventory.py`: for every file that **does not already exist** in Project A, copy it as-is from Project B to the root of Project A. For files that **already exist** in Project A, **do not overwrite them** — simply record in the final report that the file "already exists in Project A; Project B's version was not adopted; manual review is recommended if you want to compare the contents."

Examples of files that typically belong to this category: `lefthook.yml`, `codecov.yml`, `crowdin.yml`, `biome.json`/`biome.jsonc`, `.editorconfig`, `commitlint.config.\*`, workflow templates under `.github/workflows/`.

\---

## PHASE 8 — CSS/Styling Isolation (SPECIAL RULES)

This is the highest-risk area for conflicts, so it must be handled conservatively at this stage:

1. All pure CSS/SCSS files belonging to the landing page (not component-level CSS Modules) are placed in `src/landing-import/styles/`, for example `landing.isolated.css`.
2. These files are **only imported inside the landing route/layout scope** (see Phase 9 for the route structure), **never** from `globals.css` or Project A's root layout.
3. **Do not touch** Project A's `globals.css`, design tokens, global CSS variables, or `tailwind.config.\*` during this migration stage.
4. If both projects use **Tailwind**:

   * Do not automatically merge/overwrite Project A's `tailwind.config.\*` with Project B's.
   * If Project B contains custom Tailwind theme/tokens (colors, custom spacing, etc.) used by landing components, record them as `requires\_manual\_review` in the manifest — this requires a conscious decision rather than automatic merging, because Tailwind is inherently global (utility classes can "leak" and affect other elements).
   * If possible, direct landing components to use CSS Modules/scoped styles for their custom visual requirements during the isolation period, reducing the risk of styles "leaking" outside the landing scope.
5. If the landing page uses **CSS Modules** (`\*.module.css`) per component — this is the safest case; simply follow the 1:1 copy rules in Phase 9 because scoping is already local to each file.
6. Add an explicit note to `src/landing-import/README.md` (create this file):
*"The styles in this folder have not yet been harmonized with Project A's main design system. Visual harmonization is a separate task to be performed after this landing-page design has been validated/approved by the client."*

\---

## PHASE 9 — Component Isolation (SPECIAL RULES \& DIRECTORY STRUCTURE)

All migrated content from Project B goes into a single namespace in Project A, **without mixing it with Project A's core atomic-design folders**:

```text
manage-stock/
  src/
    landing-import/                  <-- EVERYTHING originating from mcp-example goes here
      components/
        atoms/                       <-- internal structure EXACTLY mirrors Project B's original structure
        molecules/
        organisms/
      views/                          <-- or the original page/view folder name from Project B, preserved
      hooks/
      lib/
      styles/
        landing.isolated.css
      assets/                         <-- if not using public/
      README.md                       <-- isolation status note (see Phase 8, point 6)
    app/  (or pages/)                 <-- Project A's ORIGINAL structure, UNCHANGED
  public/
    landing-import/                  <-- static assets (images, fonts, icons) belonging to the landing page
```

Next.js routing wiring rules:

* If Project A uses **App Router**: create a thin new route wrapper, for example `src/app/(landing or another path as required)/page.tsx`, containing only a re-export/import of the page component from `src/landing-import/views/...`. Do not put logic directly in the route file — let the route be the entry point while the actual content remains in the isolated folder.
* If Project A uses **Pages Router**: follow the same principle; the file under `pages/...` should only import from `landing-import/views/...`.
* The URL slug/path used to mount this landing page is **not determined here** — that is a business decision (whether it should become the new homepage, `/promo`, etc.). If it is still unclear during Phase 3/4, mark it as `requires\_manual\_review` and ask the user before execution.

Why preserve the structure exactly (rather than reorganizing it)? So that relative imports between files (`../../lib/utils`) remain valid without requiring one-by-one rewrites — as technically explained in Phase 5.

\---

## PHASE 10 — Validation: Build + Lint Loop

After Phases 5–7 are complete, run the following cycle, and **repeat until everything is green**:

1. Check whether Biome is already installed in Project A. If not:

```bash
   npm install --save-dev --save-exact @biomejs/biome
   npx biome init            # if biome.json does not exist yet
   ```

2. Run lint \& auto-fix:

```bash
   npx biome check --write .
   ```

3. Run the build:

```bash
   npm run build
   ```

4. If there are errors:

   * **Import path/alias not found** → usually a remaining alias-remapping issue (Phase 5); fix it there.
   * **TypeScript type error** (different type dependencies, etc.) → fix the type definitions; do not immediately use `// @ts-ignore` unless absolutely necessary, and document it as technical debt in the final report.
   * **Style/CSS not found** → check whether the CSS import points to the new isolated location (Phase 8).
   * **Dependency not installed** → re-check Phase 6; a transitive dependency may have been missed.
5. Repeat steps 2–4 until both `biome check` and `npm run build` succeed without blocking errors.

If the same error continues to recur after several iterations (for example, 5–6 times) and its root cause remains unclear, **stop the loop and report it to the user** with the exact error details — do not loop endlessly without direction. This indicates that a human decision is needed rather than simply another bug fix.

\---

## PHASE 11 — Final Verification \& Report

1. Re-check: every `action: copy` entry in `migration\_manifest.json` actually exists at its `destination` (you can rerun `inventory\_scan.py` against Project A and verify the existence of each path).
2. Create `MIGRATION\_REPORT.md` at the root of Project A containing at minimum:

   * Summary of the number of successfully migrated files per category.
   * List of added dependencies + list of version conflicts requiring manual review.
   * List of utility configs adopted vs. skipped because they already exist.
   * List of `requires\_manual\_review` items that remain open.
   * Build \& lint status (green/not green, and the last verification date).
   * An explicit reminder of intentionally postponed items (see Section 6 below).
3. Commit the migration results on the `feat/migrate-landing-page` branch with clear commit messages for each stage (not one giant commit), so that if a partial rollback is required, it can still be performed granularly.

\---

## 5\. Items INTENTIONALLY POSTPONED (Out of Scope for This Migration Stage)

To make the scope clear and avoid excessive expectations:

* **Visual/CSS harmonization** between the landing page and portal (colors, typography, spacing, design tokens) — to be handled later, after the landing-page design has been validated and accepted by the client.
* **Full integration** of landing components into Project A's core design system (`atoms/molecules/organisms`) — planned, but not part of this migration stage.
* **Database migration** — not relevant yet; both projects are still frontend-only prototypes.
* **Deletion/cleanup of Project B** (`mcp-example`) — a separate decision, to be performed only after this migration has been fully verified as stable by the user manually.
* **Dependency version conflict resolution** marked as `requires\_manual\_review` — requires a conscious decision rather than automatic resolution.

\---

## 6\. Agent Communication Protocol

* Before Phase 5, always show the manifest as a concise, human-reviewable summary (table/list), not a raw JSON dump without context.
* Every time a file is copied/modified, record it in the log — never do it silently.
* If anything ambiguous is discovered (for example, two components with the same name but different contents between Project A and B), **do not guess which one is correct** — mark it as `requires\_manual\_review` and ask.
* No destructive operation (delete/overwrite/move-and-delete-source) may be performed without explicit approval that is specifically named in the human confirmation message.

\---

## Appendix A — `inventory\_scan.py`

```python
#!/usr/bin/env python3
"""
inventory\_scan.py
Scans a project root directory (Next.js) and generates:
1. A file list (tree) with a standard ignore list
2. Dependencies \& devDependencies from package.json
3. Detection of relevant "utility" config files for adoption

Usage:
    python inventory\_scan.py --root "D:/mcp-example" --label landing --out landing\_inventory.json
    python inventory\_scan.py --root "D:/manage-stock" --label main --out main\_inventory.json
"""

import argparse
import json
import os
from pathlib import Path

IGNORE\_DIRS = {
    ".git", "node\_modules", ".next", "dist", "build",
    "coverage", ".turbo", ".vercel", ".cache", "out",
}

INTERESTING\_CONFIG\_FILES = \[
    "lefthook.yml", "lefthook.yaml", ".lefthook.yml",
    "codecov.yml", "codecov.yaml",
    "crowdin.yml", "crowdin.yaml",
    "biome.json", "biome.jsonc",
    ".editorconfig",
    "commitlint.config.js", "commitlint.config.cjs", "commitlint.config.ts",
    ".prettierrc", ".prettierrc.json", ".prettierrc.js",
    ".eslintrc.json", ".eslintrc.js", "eslint.config.js", "eslint.config.mjs",
    "tsconfig.json",
    "next.config.js", "next.config.mjs", "next.config.ts",
    "tailwind.config.js", "tailwind.config.ts",
    "renovate.json", ".renovaterc",
]

def scan\_tree(root: Path):
    tree = \[]
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames\[:] = \[d for d in dirnames if d not in IGNORE\_DIRS]
        rel\_dir = os.path.relpath(dirpath, root)
        for f in filenames:
            rel\_path = os.path.normpath(os.path.join(rel\_dir, f)) if rel\_dir != "." else f
            tree.append(rel\_path.replace("\\\\", "/"))
    return sorted(tree)

def read\_package\_json(root: Path):
    pkg\_path = root / "package.json"
    if not pkg\_path.exists():
        return None
    with open(pkg\_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "dependencies": data.get("dependencies", {}),
        "devDependencies": data.get("devDependencies", {}),
        "scripts": data.get("scripts", {}),
    }

def detect\_config\_files(root: Path):
    return \[name for name in INTERESTING\_CONFIG\_FILES if (root / name).exists()]

def main():
    parser = argparse.ArgumentParser()
    parser.add\_argument("--root", required=True)
    parser.add\_argument("--label", required=True)
    parser.add\_argument("--out", required=True)
    args = parser.parse\_args()

    root = Path(args.root)
    if not root.exists():
        raise SystemExit(f"Root not found: {root}")

    result = {
        "label": args.label,
        "root": str(root),
        "files": scan\_tree(root),
        "package\_json": read\_package\_json(root),
        "config\_files\_found": detect\_config\_files(root),
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure\_ascii=False)

    print(f"\[OK] Inventory for '{args.label}' completed -> {args.out}")
    print(f"     Total indexed files: {len(result\['files'])}")

if \_\_name\_\_ == "\_\_main\_\_":
    main()
```

\---

## Appendix B — `diff\_inventory.py`

```python
#!/usr/bin/env python3
"""
diff\_inventory.py
Compares two inventory\_scan.py results to identify migration candidates
at the dependency \& config-file level. For component/source-code files,
classification is still performed manually/by the agent in Phase 2 —
this script only assists with dependencies \& configs.

Usage:
    python diff\_inventory.py --landing landing\_inventory.json --main main\_inventory.json --out dependency\_diff.json
"""

import argparse
import json

def main():
    parser = argparse.ArgumentParser()
    parser.add\_argument("--landing", required=True)
    parser.add\_argument("--main", required=True)
    parser.add\_argument("--out", required=True)
    args = parser.parse\_args()

    with open(args.landing, "r", encoding="utf-8") as f:
        landing = json.load(f)

    with open(args.main, "r", encoding="utf-8") as f:
        main\_proj = json.load(f)

    landing\_pkg = landing.get("package\_json") or {}
    main\_pkg = main\_proj.get("package\_json") or {}

    landing\_deps = {\*\*landing\_pkg.get("dependencies", {}), \*\*landing\_pkg.get("devDependencies", {})}
    main\_deps = {\*\*main\_pkg.get("dependencies", {}), \*\*main\_pkg.get("devDependencies", {})}

    missing\_in\_main = {}
    version\_conflict = {}
    for name, ver in landing\_deps.items():
        if name not in main\_deps:
            missing\_in\_main\[name] = ver
        elif main\_deps\[name] != ver:
            version\_conflict\[name] = {"landing": ver, "main": main\_deps\[name]}

    missing\_configs = \[
        c for c in landing.get("config\_files\_found", \[])
        if c not in main\_proj.get("config\_files\_found", \[])
    ]

    report = {
        "dependencies\_to\_add": missing\_in\_main,
        "dependency\_version\_conflicts": version\_conflict,
        "config\_files\_candidate\_to\_adopt": missing\_configs,
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure\_ascii=False)

    print("\[OK] Diff completed ->", args.out)
    print(json.dumps(report, indent=2, ensure\_ascii=False))

if \_\_name\_\_ == "\_\_main\_\_":
    main()
```

\---

## Appendix C — `migration\_manifest.json` Template

```json
{
  "generated\_at": "2026-09-12T00:00:00+07:00",
  "source\_root": "D:/mcp-example",
  "destination\_root": "D:/manage-stock",
  "entries": \[
    {
      "id": "COMP-001",
      "category": "PRIMITIVE\_ATOM",
      "source": "src/components/atoms/Button/Button.tsx",
      "destination": "src/landing-import/components/atoms/Button/Button.tsx",
      "action": "copy",
      "reason": "Unique atom with no equivalent in Project A",
      "conflict\_risk": "low",
      "requires\_manual\_review": false
    },
    {
      "id": "PAGE-001",
      "category": "PAGE\_VIEW",
      "source": "src/views/LandingHome.tsx",
      "destination": "src/landing-import/views/LandingHome.tsx",
      "action": "copy",
      "reason": "Main landing-page view",
      "conflict\_risk": "medium",
      "requires\_manual\_review": true,
      "notes": "Final URL slug for mounting the route has not yet been decided by the user"
    },
    {
      "id": "STYLE-001",
      "category": "STYLE\_ASSET",
      "source": "src/styles/landing.css",
      "destination": "src/landing-import/styles/landing.isolated.css",
      "action": "copy",
      "reason": "Landing-page styles, must be isolated according to Phase 8",
      "conflict\_risk": "high",
      "requires\_manual\_review": false
    },
    {
      "id": "CFG-001",
      "category": "UTILITY\_CONFIG",
      "source": "lefthook.yml",
      "destination": "lefthook.yml",
      "action": "copy",
      "reason": "Not present in Project A; best-practice utility configuration to adopt",
      "conflict\_risk": "low",
      "requires\_manual\_review": false
    }
  ]
}
```

\---

## Appendix D — `migrate.py`

```python
#!/usr/bin/env python3
"""
migrate.py
Executes file migration based on the reviewed and human-confirmed
whitelist manifest (migration\_manifest.json) from Phase 4.

SAFETY RULES:
- Default = DRY RUN. No files are actually copied unless --execute is provided.
- NEVER deletes or moves source files. Always COPY.
- NEVER overwrites an existing destination file unless the manifest entry has "overwrite": true
  AND the --force-overwrite flag is provided during execution.
- All actions are logged to migration\_log\_<timestamp>.json

Usage:
    python migrate.py --manifest migration\_manifest.json --source-root "D:/mcp-example" --dest-root "D:/manage-stock"
    python migrate.py --manifest migration\_manifest.json --source-root "D:/mcp-example" --dest-root "D:/manage-stock" --execute
"""

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path

def main():
    parser = argparse.ArgumentParser()
    parser.add\_argument("--manifest", required=True)
    parser.add\_argument("--source-root", required=True)
    parser.add\_argument("--dest-root", required=True)
    parser.add\_argument("--execute", action="store\_true", help="Actually copy files. Without this flag = dry run.")
    parser.add\_argument("--force-overwrite", action="store\_true")
    args = parser.parse\_args()

    source\_root = Path(args.source\_root)
    dest\_root = Path(args.dest\_root)

    with open(args.manifest, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    log = \[]
    for entry in manifest\["entries"]:
        if entry.get("action") == "skip":
            log.append({\*\*entry, "result": "SKIPPED\_BY\_MANIFEST"})
            continue

        src = source\_root / entry\["source"]
        dst = dest\_root / entry\["destination"]

        if not src.exists():
            log.append({\*\*entry, "result": "ERROR\_SOURCE\_NOT\_FOUND"})
            print(f"\[!] Source not found, skipping: {src}")
            continue

        if dst.exists() and not (entry.get("overwrite") and args.force\_overwrite):
            log.append({\*\*entry, "result": "SKIPPED\_DEST\_EXISTS"})
            print(f"\[i] Destination already exists, safely skipped: {dst}")
            continue

        if args.execute:
            dst.parent.mkdir(parents=True, exist\_ok=True)
            shutil.copy2(src, dst)
            log.append({\*\*entry, "result": "COPIED"})
            print(f"\[OK] {src} -> {dst}")
        else:
            log.append({\*\*entry, "result": "DRY\_RUN\_WOULD\_COPY"})
            print(f"\[dry-run] {src} -> {dst}")

    log\_name = f"migration\_log\_{datetime.now().strftime('%Y%m%d\_%H%M%S')}.json"
    with open(log\_name, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure\_ascii=False)

    print(f"\\nLog saved to: {log\_name}")

if \_\_name\_\_ == "\_\_main\_\_":
    main()
```

\---

## Appendix E — Quick Checklist (TL;DR)

* \[ ] Phase 0: Create a new branch in Project A
* \[ ] Phase 1: Inventory of both projects completed; router/language/styling detected (not assumed)
* \[ ] Phase 2: All candidates classified; duplicates identified
* \[ ] Phase 3: `migration\_manifest.json` completed \& re-verified
* \[ ] Phase 4: **Human confirmation received** before proceeding
* \[ ] Phase 5: Dry run reviewed, copy executed, aliases remapped
* \[ ] Phase 6: Dependencies added, install executed, version conflicts recorded
* \[ ] Phase 7: Utility configs adopted (without overwriting existing ones)
* \[ ] Phase 8: Landing CSS isolated; Project A's global styles untouched
* \[ ] Phase 9: Landing components placed in `src/landing-import/`; not merged into the core folders
* \[ ] Phase 10: `biome check` and `next build` pass
* \[ ] Phase 11: `MIGRATION\_REPORT.md` created; granular commits made per stage


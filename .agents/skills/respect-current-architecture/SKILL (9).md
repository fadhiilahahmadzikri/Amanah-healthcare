---
name: design-system-fidelity
description: Use this skill any time you are about to write, edit, generate, or review frontend code — a component, page, hook, utility, or feature — inside an existing TypeScript/Next.js codebase. It makes sure you discover and follow the codebase's own design system and folder architecture (atomic design layers like atoms/molecules/organisms, Feature-Sliced Design (FSD) layers, existing naming and TypeScript conventions) instead of inventing new patterns, duplicating existing components, or applying generic textbook conventions that don't match this specific repo. Trigger this proactively whenever the task touches components, UI, pages, hooks, shared utilities, or folder structure — even if the user doesn't say "design system," "FSD," or "atomic design" explicitly, and even mid-task, right before you're about to create a new file or introduce a new abstraction.
---

# Design System Fidelity

## Why this exists

When an LLM writes frontend code, its strongest prior is the average pattern across millions of tutorials, boilerplates, and unrelated repos it was trained on — not the specific conventions of the codebase actually open right now. That mismatch is a common source of code that looks fine in isolation but fragments the codebase over time: a second `Button` component next to the one that already exists, a `components/` folder springing up beside an established `features/` + `entities/` FSD structure, a hand-rolled `fetch` call next to a repo-wide React Query setup.

There isn't one universally "right" way to structure a Next.js app — and this repo has already made those decisions, consistently, in hundreds of other files. The job is to find out what they were and follow them, even when a different, fresher-in-memory pattern would also "work." Grounding every decision in what's actually in the repo — not what's typical of a repo like this — is the single biggest lever against introducing inconsistency or subtly-wrong, hallucinated structure.

## The core workflow, in one line

**Scan → match, don't invent → place things where the existing architecture says they go → re-check yourself at each decision point, not just once at the start.**

---

## 1. Discovery phase — run this before writing anything

Skipping this is the number one cause of introducing a competing pattern. Before touching a component, hook, page, or util, spend a few tool calls actually looking.

Start with the bundled scanner for a fast structural overview:

```bash
python3 scripts/scan_codebase.py <path-to-repo-root>
```

(Omit the path to scan the current directory.) It reports the framework/library stack from `package.json`, which Next.js router is in use (`app/` vs `pages/`), any FSD-shaped layers it can detect (`app/pages/widgets/features/entities/shared`), any atomic-design-shaped folders (`atoms/molecules/organisms/templates`), TypeScript path aliases from `tsconfig.json`, the styling approach in use (Tailwind, CSS Modules, styled-components, vanilla-extract), and a shallow directory tree to eyeball. Treat this as a fast first pass, not a substitute for reading — it pattern-matches on folder and file names, and it will miss a codebase that expresses the same ideas under different names.

Then go deeper by hand, on the specific area you're about to touch:

- Open two or three existing components or features that resemble what you're about to build. Read them fully, not just the signature — note prop typing style, export style (named vs default), how they import their neighbors, whether they colocate styles/tests/stories, and how state and data-fetching are handled.
- Search for anything that might already do what you're about to write — check the nearest `shared/ui`, `components/`, or equivalent primitives folder before creating something new. A near-miss that needs a small extension is almost always better than a lookalike duplicate.
- If the repo uses barrel files (`index.ts` re-exporting a slice's public surface), check one or two to see whether other modules are expected to import through the barrel or reach into files directly — and follow whichever is standard, since mixing the two silently breaks the boundary the barrels exist to enforce.
- Skim the root `tsconfig.json` for path aliases (e.g. `@/shared/*`) and use them the way neighboring files already do, instead of a fresh relative `../../../..` chain.

If the repo is small, inconsistent, or genuinely has no established pattern for the thing you're building, say so. Propose the closest fit based on whatever convention *does* exist elsewhere in the repo, and flag it as an assumption rather than presenting it as "the" convention.

## 2. Recognizing the architecture you find

Two paradigms show up constantly in TypeScript/Next.js codebases, often combined. Treat both as things to *recognize when you see them*, not as a template to impose on a repo that does something else:

- **Feature-Sliced Design (FSD)** — layers code by business meaning: `app → pages → widgets → features → entities → shared`, where a layer may only import from layers strictly below it. See `references/fsd-primer.md` for the layer breakdown, segment conventions (`ui/`, `model/`, `api/`, `lib/`), and the import-boundary rules — read it when deciding which layer a new slice belongs in, or whether an import you're about to write would cross a boundary this repo enforces.
- **Atomic Design** — layers UI by composition size: atoms → molecules → organisms → templates → pages. See `references/atomic-design-primer.md` for the level definitions, and — importantly — how real codebases usually fold this into FSD's `shared/ui` (atoms/molecules) plus `entities`/`widgets` (organisms), rather than keeping literal `atoms/`, `molecules/` folders. Check which flavor this specific repo uses before assuming literal folder names exist.

Many repos blend these, rename layers, or only follow parts of either. **The repo's actual structure always outranks the reference docs.** Use the primers to recognize intent and to fill genuine gaps consistently with what's already there — never to justify relocating files into a "more textbook-correct" structure the repo doesn't actually use.

`references/typescript-nextjs-checklist.md` covers TypeScript/Next.js specifics — Server vs Client Components, typing conventions, export style, data-fetching patterns. Same rule applies: it's a fallback for genuinely unaddressed cases, and repo precedent wins whenever the two disagree.

## 3. Before creating anything new — work through this in order

1. **Does this already exist, even under a different name?** Search first (see Discovery). Extending or composing an existing component beats a parallel new one — even if the existing one isn't a perfect fit. Propose the extension and explain why, rather than silently duplicating.
2. **If it doesn't exist, what's the closest analogous thing in this repo**, and can its shape be mirrored — file layout, prop typing, export style, naming — rather than reaching for a generic pattern from training data?
3. **Which layer or folder does this belong in**, based on the repo's own layering — not on where it would go in a from-scratch project? If it's genuinely unclear, ask, or pick the closest precedent and say so explicitly rather than guessing silently.
4. **Does this introduce a new dependency, state pattern, or styling approach** the repo doesn't already use? If so, flag it explicitly rather than quietly slipping it in — a repo standardized on Zustand doesn't want a Redux slice appearing next to it, even a well-written one.

## 4. Checkpoints — come back to this file, not just once

On anything beyond a one-file edit, it's easy to front-load the discovery step and then drift back toward generic, training-data-shaped patterns a few files in, once the original context has faded from view. Treat this skill as something to re-consult at decision points, not something read once and set aside:

- **Before creating any new file** → re-run the placement check in section 3.
- **Before writing a new component, hook, or util from scratch** → re-run the "does this already exist" check.
- **Before introducing a new dependency, abstraction, or architectural pattern** → confirm it isn't already solved a different way elsewhere in the repo.
- **Right before presenting the result** → run the self-check below.

This isn't busywork — it's the difference between a skill that shapes the first file of a task and one that actually holds up across a multi-file feature.

## 5. Final self-check before finishing

- Did I search for an existing equivalent before writing anything new, and can I point to what I checked?
- Does every new file sit in a folder consistent with the repo's existing layering — its FSD layer, its atomic level, or whatever hybrid this repo actually uses?
- Do imports go through the same path-alias/barrel convention the rest of the repo uses, and do they respect this repo's own layer-import direction?
- Does the TypeScript style — types vs. interfaces, prop typing, export style — match neighboring files, not a generic default?
- Did I reuse the repo's existing styling approach, state management, and data-fetching pattern rather than introducing a parallel one?
- Where I made an assumption because the repo didn't clearly establish a precedent, did I say so out loud instead of presenting it as "the" convention?

---

## Reference files

- `references/fsd-primer.md` — Feature-Sliced Design layers, segments, and import-boundary rules.
- `references/atomic-design-primer.md` — Atomic Design levels and how they typically map onto FSD in real codebases.
- `references/typescript-nextjs-checklist.md` — TypeScript and Next.js conventions to fall back on when the repo hasn't already established its own.

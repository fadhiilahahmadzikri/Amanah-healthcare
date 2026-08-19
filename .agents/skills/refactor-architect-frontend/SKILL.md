---
name: refactor-architect-frontend
description: >
  React codebase architect and QA engineer. Use for ANY React architecture task: refactoring,
  component design, state management, folder structure, or enforcing frontend principles.
  Grounded in Feature-Sliced Design v2.1 (pages-first). Trigger on: "refactor my React
  code", "fix prop drilling", "audit my components", "apply FSD", "Feature-Sliced Design",
  "clean up my hooks", "component architecture", "state management design",
  "React anti-patterns", "folder structure React", "organize my React project",
  "global state mess", "React clean code", "React architecture review",
  "generate frontend-principle.md", "barrel file strategy", "too many re-renders",
  "where should I put this file", "is this good React", "hook or component",
  or any request to systematically improve a React codebase's structure, quality, or
  long-term maintainability. Also triggers for any architectural decision in a React project.
---

# Refactor Architect — Frontend / React Edition (FSD v2.1)

Executes systematic, principle-driven React codebase analysis and refactoring.
Primary methodology: **Feature-Sliced Design v2.1 (pages-first)**.

Architecture knowledge base: `references/` (load per phase, not all at once).

---

## Reference Files — Load When Needed

| File | Load When |
|------|-----------|
| `references/frontend-principle-template.md` | Phase 1 — generating `frontend-principle.md` |
| `references/react-folder-architecture.md` | Phase 2 — folder audit, FSD migration, state mgmt |
| `references/react-antipattern-catalog.md` | Phase 3/4 — component + hook + state audit |

---

## Phase 0: Orientation (Always First)

Before any analysis or generation:

1. Read `package.json` — identify: React version, framework (Next.js / Vite / CRA / Remix),
   state libs, styling, TypeScript, testing setup.
2. Read `tsconfig.json` or `jsconfig.json` — path aliases.
3. Scan `src/` two levels deep — current folder organization.
4. Classify current architecture: flat / type-grouped / feature-based / FSD-like / FSD v2.1.
5. Check `agents/quality/mandatory/frontend-principle.md` — if exists, read it as the
   governing contract. If not, generate it (Phase 1).
6. Check for existing ESLint config, specifically `eslint-plugin-boundaries` or
   `@feature-sliced/steiger-plugin` — document current enforcement state.

---

## Phase 1: Generate Frontend Principle Document

**Load `references/frontend-principle-template.md` first.**

Generate `agents/quality/mandatory/frontend-principle.md`:

- Adapt all `[STACK]` and `[DATE]` placeholders from Phase 0 findings.
- Mark `[CRITICAL]` on any section where a violation is already detected.
- Flag FSD version in use (v2.0 or v2.1 / pages-first).
- The document is the binding contract for all refactoring decisions.

---

## Phase 2: Folder Architecture Assessment

**Load `references/react-folder-architecture.md` first.**

Evaluate current structure against FSD v2.1 layers (top to bottom):

```
src/
├── app/        App bootstrap — routing, providers, global styles. No slices.
├── pages/      Full pages. In FSD v2.1: keep most logic HERE first.
├── widgets/    Self-contained UI blocks with their own stores + logic.
├── features/   Reused cross-page interactions (only extract when truly reused).
├── entities/   Business domain objects — types, base UI, API queries.
└── shared/     Infra primitives — no business logic, detached from domain.
```

**FSD v2.1 "pages-first" rule:** Code stays in `pages/` unless it is reused
across multiple pages. Only then extract to `features/`, `entities/`, or `shared/`.
Avoid premature over-decomposition into entities/features.

Audit and report:
- Files in wrong layer (business logic in `shared/`, API calls in `pages/` that belong in `entities/api/`, etc.)
- Import direction violations — lower layers importing from higher layers.
- Missing `index.ts` public API barrel files on slice boundaries.
- Cross-imports between entities without `@x-notation` (FSD v2.1 standard).
- Slices that are only used by one page (candidate for merging into that page per `insignificant-slice` rule).
- Layers with too many slices (`excessive-slicing` — signal of over-decomposition).

Provide a migration map: current path → correct FSD v2.1 path.

Recommend adding `steiger` + `@feature-sliced/steiger-plugin` for ongoing lint enforcement.

---

## Phase 3: Component Audit

**Load `references/react-antipattern-catalog.md` first.**

Evaluate every component file against the anti-pattern catalog. Report per-component:

### Component Design
- Fat Component (fetch + transform + render + error + layout in one)
- Missing Container / Presentation split where business logic is complex
- Prop drilling beyond 2 levels
- Inline component definition inside render function
- File > 150 lines without justified decomposition
- Business logic inline in JSX (complex map/filter/reduce)
- Direct DOM manipulation inside component body
- Missing `key` props or index-as-key on dynamic lists
- Spreading unknown props onto DOM elements (`<div {...props}>`)

### Hook Violations
- Business logic in component body instead of custom hook
- `useEffect` with missing or incorrect dependency arrays
- `useEffect` for derived state (use `useMemo` or inline compute)
- `useEffect` for subscriptions without cleanup return
- Hooks called conditionally (Rules of Hooks violation)
- Custom hooks mixing unrelated concerns (SRP violation)
- Missing `useCallback` on handlers passed to memoized children
- Missing `useMemo` on expensive computations
- Premature memoization on trivially cheap operations
- Fake hooks — functions named `use*` that call no hooks (misnaming)
- Async `useEffect` without AbortController / isMounted guard (memory leak)

### Prop Contract Violations
- Props interface missing (no TypeScript interface or PropTypes)
- Optional props with no defaults and no null guards
- Boolean props not predicate-named (`isLoading`, `hasError`, `canSubmit`)
- Handler props without `on` prefix
- Entire object passed when only one field is needed (excess re-renders)
- `any` in TypeScript prop interfaces

---

## Phase 4: State Management Audit

**Load `references/react-folder-architecture.md` — State Management section.**

Classify all state by category and check tool alignment:

| Category | Correct Tool | Common Violation |
|----------|-------------|-----------------|
| UI toggle / local | `useState` / `useReducer` | Zustand/Redux for single-component state |
| Form state | `react-hook-form` / `useState` | Global store for form data |
| Derived state | `useMemo` / inline | Separate `useState` + `useEffect` sync |
| Server/remote data | React Query / SWR | `useState` + `useEffect` raw fetch |
| Shared feature state | Zustand slice (scoped) | Unbounded Context wrapping whole app |
| Global app state | Zustand global / App-level Context | Overuse — most "global" is actually server state |
| URL state | `useSearchParams` / router | Component state for filters/pagination |

Flag: state mutation without immutability, SSOT violations, state duplication.

---

## Phase 5: Naming & Namespace Audit

Verify file and export naming against the convention table in `references/react-folder-architecture.md`.

Key violations to flag:
- Component files not PascalCase
- Hook files not prefixed `use`
- Default exports on non-page components
- Wildcard re-exports (`export * from './x'`)
- Importing from slice internals instead of `index.ts`
- `index.ts` exposing internal files (not public API)

---

## Phase 6: Refactoring Execution

Apply in this order (do not skip steps — order prevents regression):

1. Generate FSD v2.1 folder structure. Move misplaced files.
2. Apply pages-first: merge insignificant slices back into their owning page.
3. Fix import direction violations.
4. Add missing `index.ts` barrel files at slice boundaries.
5. Add `@x-notation` cross-imports where entities reference each other.
6. Split Fat Components into Container + Presentation pairs.
7. Extract business logic into custom hooks.
8. Fix prop drilling (scoped Context or Zustand slice).
9. Migrate raw `useState` + `useEffect` server fetches to React Query / SWR.
10. Fix hook violations (deps, cleanup, conditional calls, async leaks).
11. Add TypeScript interfaces to all component props.
12. Apply naming conventions (files, components, hooks, exports).
13. Replace default exports with named exports on non-page components.
14. Fix missing `key` props and index-key on dynamic lists.
15. Remove inline component definitions from render.
16. Clean dead code, unused imports, commented-out JSX.

---

## Phase 7: Architecture Compliance Report

Generate `agents/quality/mandatory/FRONTEND_REFACTOR_REPORT.md`:

```markdown
# Frontend Refactoring Report

## Stack Detected
[React version, framework, TypeScript, state lib, styling]

## FSD Version
[v2.0 / v2.1 / migrated]

## Principle Document
agents/quality/mandatory/frontend-principle.md — [generated / updated]

## Folder Architecture
[FSD v2.1 migration map — before/after]

## Pages-First Assessment
[Slices merged back into pages | Slices correctly elevated]

## Component Findings
| Component | File | Violation | Severity | Action Taken |

## State Management Findings
[Per-category: tool used vs correct tool]

## Naming Violations
[File/export naming issues resolved]

## Refactoring Completed
[Ordered list of changes applied]

## Remaining Technical Debt
[Unfixed items with rationale]

## Tooling Recommendations
[Steiger, eslint-plugin-boundaries, etc.]

## Compliance Score
[Per-principle: PASS / PARTIAL / FAIL]
```

---

## Operating Constraints

- React 16–19 compatible. Next.js / Remix: treat framework routing dirs as the Pages layer.
- FSD v2.1 is the default target. If project is on v2.0, document delta and offer migration path.
- TypeScript assumed. JS projects: apply type rules to PropTypes / JSDoc equivalents.
- Never modify framework config files without explicit instruction.
- Preserve existing UI behavior — refactoring must not change what users see or experience.
- Every principle.md section cited in a violation must exist in the generated document.
- Recommend `steiger` for ongoing architectural lint enforcement.

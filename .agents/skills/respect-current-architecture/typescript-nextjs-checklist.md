# TypeScript & Next.js checklist

These are fallback defaults — reasonable choices to make **only when the repo hasn't already established its own answer**. If two or three existing files agree on a different convention, that convention wins even if it disagrees with an item below.

## TypeScript

- **`type` vs `interface`**: many teams pick one consistently (often `interface` for public component props, `type` for unions/utility shapes). Check a handful of existing components before choosing — don't alternate arbitrarily within a codebase that has picked one.
- **Avoid `any`.** Prefer `unknown` plus narrowing, or the repo's existing utility/helper types. If the repo already has a `shared/types` or similar, check it before defining a new type that might already exist.
- **Explicit types for exported/public functions and component props.** Internal, non-exported helpers can lean on inference.
- **Discriminated unions** for props or state that vary by a `type`/`kind`/`status` field, when the repo already uses this pattern elsewhere (common in FSD `model/` files for feature state).
- **Props types are usually colocated** with their component (`ComponentName.tsx` + a `Props` type in the same file, or a `component-name.types.ts` next to it) — match whichever the repo does.
- **Named vs default exports**: Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, etc.) require a default export by framework convention — that's not a style choice. Everywhere else, check the repo: many FSD-flavored codebases prefer named exports through a slice's `index.ts` barrel for consistency and easier refactors.

## Next.js

- **Router**: confirm whether the repo uses the App Router (`app/`) or Pages Router (`pages/`) — the scan script flags this. Don't mix conventions from the other router into a repo that has standardized on one.
- **Server vs Client Components (App Router)**: check whether nearby components have a `'use client'` directive before assuming a new component needs one. Default to Server Components unless the repo's pattern (or the component's actual need for hooks/interactivity/browser APIs) calls for `'use client'`.
- **Data fetching**: check what's already in use — plain `fetch` in Server Components, React Query, SWR, Server Actions, or a repo-specific data layer — and match it rather than introducing a second fetching strategy for a new feature.
- **Routing conventions**: check how dynamic segments, route groups, and parallel/intercepting routes (if any) are named and organized elsewhere before adding a new route.
- **Metadata / SEO**: if the repo has an established pattern for `generateMetadata` or a metadata config per route, follow it for new pages rather than omitting it or inventing a new shape.

## Styling

- Identify the approach in use before writing any new styles: Tailwind (check `tailwind.config.*` and whether custom design tokens are defined there), CSS Modules (`*.module.css`), styled-components/Emotion, or vanilla-extract. The scanner reports which of these it detects.
- If the repo has design tokens (Tailwind theme extensions, CSS variables, a theme object), use them instead of hardcoded values (hex colors, arbitrary pixel spacing) — hardcoding a value the repo already has a token for is one of the most common ways generic output drifts from an established design system.

## State management

- Check what's already used for local vs. shared state (`useState`/`useReducer`, Zustand, Redux Toolkit, Jotai, Recoil, React Context) before adding a new one. A new feature needing shared state should reach for the repo's existing solution, not the state library that happens to be top-of-mind.

## Testing & documentation (if present)

- If components elsewhere have colocated tests (Testing Library, Vitest, Jest) or Storybook stories, match that pattern for new components rather than skipping it — silently dropping test/story coverage that's standard elsewhere in the repo is itself a deviation from the codebase's convention.

# Feature-Sliced Design (FSD) primer

This is a reference for recognizing FSD when you find it in a repo, and for filling genuine gaps consistently with it. It is not a template to impose on a repo that structures itself differently — always defer to what the repo actually does when the two disagree.

## The layers, top to bottom

```
app        — app-wide setup: providers, global styles, routing entry, global config
pages      — page-level compositions (in Next.js, often thin wrappers around a route)
widgets    — large composite UI blocks assembled for a specific page context
             (e.g. a page header combining nav + search + user menu)
features   — a single user-facing interaction or capability
             (e.g. "add-to-cart", "like-post", "submit-review")
entities   — business domain objects and their standalone UI
             (e.g. "user", "product", "order" — a ProductCard belongs here)
shared     — reusable code with no business meaning: UI kit primitives, api
             clients, generic utils, config, types
```

(Older FSD versions also had a `processes` layer above `pages` for cross-page flows; it was folded into `pages`/`app` in later versions. If you see a `processes` folder in a repo, treat it as this repo's convention rather than "wrong.")

## The import rule (layer isolation)

A module in one layer may only import from layers **strictly below** it:

- `app` can import from anything.
- `pages` can import `widgets`, `features`, `entities`, `shared` — not other `pages`.
- `widgets` can import `features`, `entities`, `shared` — not other `widgets` or `pages`.
- `features` can import `entities`, `shared` — not other `features`.
- `entities` can import `shared` — not other `entities` (cross-entity relationships are usually composed one layer up, in a `feature` or `widget`).
- `shared` imports nothing from above it — it should have zero awareness of business logic.

This is the rule most worth checking before adding an import: an import that reaches sideways (same layer) or upward is the most common FSD violation, and it's easy to introduce by accident when reusing a hook or type that "happens to be nearby."

## Segments inside a slice

Within a slice (a feature, entity, or widget folder), code is commonly split by technical concern:

```
features/add-to-cart/
├── ui/       — components
├── model/    — state, business logic, types
├── api/      — requests specific to this slice
├── lib/      — slice-local helper functions
└── index.ts  — the public API — what other layers are allowed to import
```

Not every repo uses every segment, and some flatten this further. What matters is consistency: if a repo already splits things this way, a new slice should too.

## Public API / barrel convention

Many FSD codebases treat a slice's `index.ts` as its only allowed import surface — other layers import `from '@/features/add-to-cart'`, never `from '@/features/add-to-cart/ui/AddToCartButton'` directly. If the repo does this, respect it for new code, both when consuming an existing slice and when creating a new one (export the public surface through `index.ts`). If the repo instead imports directly into files and doesn't use barrels, don't introduce one unilaterally — some teams deliberately avoid barrels for tree-shaking or circular-import reasons.

## Mapping onto Next.js specifically

Next.js's own `app/` directory (the App Router) is about *routing*, not about FSD's `app` layer — the names collide but mean different things. A common pattern is to keep the Next.js route files (`app/products/[id]/page.tsx`) thin, importing the actual page composition from FSD's `pages` layer (or straight from `widgets`, in smaller repos that skip a dedicated `pages` layer). Check which of these this repo does — some keep real logic directly in the route file, others keep route files as a one-line re-export. Either is valid; the point is to match whichever this repo has already chosen.

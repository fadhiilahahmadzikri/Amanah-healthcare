# React Folder Architecture Reference — FSD v2.1

## Table of Contents
1. FSD v2.1 Mental Model (Pages-First)
2. Layer Definitions
3. Canonical Folder Structure
4. Segment Names Reference
5. Public API Rule (Barrel Files)
6. Cross-Import Notation (@x)
7. Import Direction Rule
8. State Management Taxonomy
9. State Anti-Patterns
10. Naming Conventions
11. Per-File Code Structure

---

## 1. FSD v2.1 Mental Model — Pages-First

**FSD v2.0** → build entities and features first, compose into pages.
**FSD v2.1** → start with pages. Extract to lower layers only when code is truly reused.

### Pages-First Decision Tree
```
Is this code used on more than one page?
  NO  → Keep it in the page's slice.
  YES → Is it a domain object (User, Product, Order)?
          YES → entities/
          NO  → Is it a cross-page user interaction?
                  YES → features/
                  NO  → shared/ (generic utility or primitive)
```

### Steiger Rules Enforcing v2.1
- `insignificant-slice` — entity/feature used by only one page → merge into page.
- `excessive-slicing` — too many slices → decomposition too fine-grained, consolidate.
- `no-higher-level-imports` — lower layers cannot import from higher layers.
- `no-cross-imports` — slices cannot import from siblings on the same layer
  (exception: @x-notation for entities).
- `public-api` — all external imports must go through `index.ts`.

Install: `npm install --save-dev steiger @feature-sliced/steiger-plugin`

---

## 2. Layer Definitions (Top → Bottom)

### `app/` — Application Bootstrap
- Initializes router, global stores, providers, global styles.
- No business logic. No slices (divided into segments directly).
- Cannot import from any slice — only from shared infrastructure.

### `pages/` — Route-Level Slices
- One slice per route / page.
- **v2.1: Keep most UI, forms, and data logic here until reuse demands extraction.**
- A page composes widgets, features, and entities — but can also own its own
  stores, API calls, and business logic if they are page-specific.
- In Next.js App Router: maps to `app/` dir. In Remix: maps to `routes/`.

### `widgets/` — Self-Contained UI Blocks
- Large, reusable UI blocks that deliver a complete use case.
- **v2.1: Widgets own their stores, business logic, and API interactions.**
  They are NOT just compositional shells.
- Examples: `Header` (with navigation + auth state), `Sidebar` (with filters + state).
- Reused across multiple pages.

### `features/` — Reused Cross-Page Interactions
- User interactions that have business value and are reused across pages.
- Only extract here when the same interaction appears on 2+ pages.
- Examples: `auth/login`, `cart/add-item`, `profile/edit`.
- Contains UI for the interaction + the state and API logic driving it.

### `entities/` — Business Domain Objects
- Canonical representations of business concepts.
- Examples: `user`, `product`, `order`, `transaction`.
- Contains: types/interfaces, validation schemas, API query hooks, base UI representations.
- Entities are isolated — they cannot import from each other directly
  (use @x-notation for explicit cross-entity references).

### `shared/` — Detached Infrastructure
- No business logic. No domain concepts.
- Reusable regardless of the specific project/business.
- Application-aware items allowed: route constants, API base client, company logo.
- Examples: `Button`, `Input`, `Modal`, `formatDate`, `useDebounce`, HTTP client.

---

## 3. Canonical Folder Structure

```
src/
├── app/
│   ├── providers/                   Global wrappers (Router, QueryClient, ThemeProvider)
│   ├── styles/                      CSS reset, global tokens, base typography
│   ├── store.ts                     Root Zustand store init (if used)
│   └── index.tsx                    createRoot entry point
│
├── pages/
│   ├── home/
│   │   ├── ui/
│   │   │   └── HomePage.tsx
│   │   ├── api/                     Page-specific queries (if not reused)
│   │   ├── model/                   Page-specific state (if not reused)
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── ui/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── MetricsSummary.tsx   Page-internal component (not extracted — v2.1)
│   │   ├── api/
│   │   │   └── dashboardApi.ts
│   │   ├── model/
│   │   │   └── dashboardStore.ts
│   │   └── index.ts
│   └── [route-name]/
│       ├── ui/
│       ├── api/
│       ├── model/
│       └── index.ts
│
├── widgets/
│   ├── header/
│   │   ├── ui/
│   │   │   ├── Header.tsx
│   │   │   └── NavigationMenu.tsx
│   │   ├── model/
│   │   │   └── headerStore.ts       Widgets own their state (v2.1)
│   │   └── index.ts
│   └── sidebar/
│       ├── ui/
│       ├── model/
│       └── index.ts
│
├── features/                        Only for truly reused cross-page interactions
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── model/
│   │   │   └── authStore.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   └── index.ts
│   └── [feature-name]/
│       ├── ui/
│       ├── model/
│       ├── api/
│       ├── lib/
│       └── index.ts
│
├── entities/
│   ├── user/
│   │   ├── ui/
│   │   │   ├── UserCard.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── model/
│   │   │   ├── user.types.ts
│   │   │   └── user.schema.ts
│   │   ├── api/
│   │   │   └── userApi.ts
│   │   ├── @x/                      Cross-import public API (v2.1)
│   │   │   └── product.ts           Types exported for use by entities/product
│   │   └── index.ts
│   └── [entity-name]/
│       ├── ui/
│       ├── model/
│       ├── api/
│       ├── @x/
│       └── index.ts
│
└── shared/
    ├── ui/
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.types.ts
    │   │   ├── Button.test.tsx
    │   │   └── index.ts
    │   └── [ComponentName]/
    ├── api/
    │   ├── client.ts                HTTP base client, interceptors
    │   └── index.ts
    ├── lib/
    │   ├── formatDate.ts
    │   ├── formatCurrency.ts
    │   └── index.ts
    ├── config/
    │   ├── env.ts                   SSOT for environment variables
    │   └── constants.ts
    ├── hooks/
    │   ├── useDebounce.ts
    │   ├── useMediaQuery.ts
    │   └── index.ts
    └── types/
        └── index.ts
```

---

## 4. Segment Names Reference

| Segment | Purpose | Notes |
|---------|---------|-------|
| `ui/` | React components, date formatters, styles | Rendering only |
| `model/` | State, store slices, selectors, types, schemas | Domain logic |
| `api/` | React Query hooks, SWR hooks, fetch functions | Network layer |
| `lib/` | Pure utils local to this slice | No external imports |
| `config/` | Constants and config scoped to slice | No side effects |
| `@x/` | Cross-import public API (entities only) | FSD v2.1 |

Segments are not mandatory — create them as needed. Start with `ui/` and `model/`,
add `api/` when network calls appear.

---

## 5. Public API Rule (Barrel Files)

Every slice must expose its public surface through `index.ts`.
External layers import only from `index.ts`, never from internal files.

```ts
// entities/user/index.ts — public API only
export { UserCard } from './ui/UserCard'
export { UserAvatar } from './ui/UserAvatar'
export { useUserQuery } from './api/userApi'
export type { User, UserStatus } from './model/user.types'

// Correct external import
import { UserCard } from '@/entities/user'

// VIOLATION — importing from internal file
import { UserCard } from '@/entities/user/ui/UserCard'
```

Rules:
- No wildcard re-exports (`export * from './x'`).
- `index.ts` must NOT re-export internal implementation files.
- App and Shared layers: segments may import from each other directly (no slice isolation).

---

## 6. Cross-Import Notation (@x) — FSD v2.1

When two entities reference each other's types, use `@x-notation` to make the
dependency explicit and auditable. Do NOT import from entity's `index.ts` directly.

```ts
// entities/artist/model/artist.types.ts
import type { Song } from 'entities/song/@x/artist'

export interface Artist {
  name: string
  songs: Song[]
}

// entities/song/@x/artist.ts — the cross-import public API
export type { Song } from '../model/song.types'
```

The `@x/[consumer-slice-name].ts` file is what the consumer entity imports from.
This makes the relationship explicit: "Song exports types specifically for Artist to use."

---

## 7. Import Direction Rule

```
app       ← can import from all layers below
pages     ← can import from widgets, features, entities, shared
widgets   ← can import from features, entities, shared
features  ← can import from entities, shared
entities  ← can import from shared (+ other entities via @x)
shared    ← cannot import from any slice layer
```

**Violations to flag:**
- `shared/` importing from `entities/` or `features/`
- `entities/` importing from `features/` or `pages/`
- `features/` importing from `pages/` or `widgets/`
- Same-layer imports without @x (e.g., `entities/user` importing from `entities/product`)

---

## 8. State Management Taxonomy

| Category | Scope | Correct Tool | Wrong Tool |
|----------|-------|-------------|------------|
| UI toggle / local state | Single component | `useState`, `useReducer` | Zustand, Redux |
| Form state | Single form | `react-hook-form`, `useState` | Global store |
| Derived state | Co-located | `useMemo` / inline | `useState` + `useEffect` sync |
| Server / remote data | App-wide cache | React Query / SWR | Raw `useState` + `useEffect` |
| Shared feature state | Feature boundary | Zustand slice (scoped) | Unbounded Context |
| Global app state | Entire app | Zustand global / App Context | Overuse (most is server state) |
| URL state | URL | `useSearchParams` / router | Component `useState` |

**Default assumption:** When unsure if state is "global," assume it is NOT.
Most apparent global state is server state (use React Query) or feature state (scoped store).

---

## 9. State Anti-Patterns

**Prop Drilling (> 2 levels)**
Props passed through intermediary components that don't use them.
Fix: bounded Context, Zustand slice, or component composition.

**Raw Fetch in useState + useEffect**
```tsx
// WRONG
const [data, setData] = useState(null)
useEffect(() => { fetch(url).then(r => r.json()).then(setData) }, [url])

// CORRECT
const { data, isLoading, error } = useQuery({ queryKey: ['key'], queryFn: () => fetchFn() })
```

**Storing Derived State**
```tsx
// WRONG — SSOT violation
const [filtered, setFiltered] = useState([])
useEffect(() => setFiltered(items.filter(i => i.active)), [items])

// CORRECT
const filtered = useMemo(() => items.filter(i => i.active), [items])
```

**Unbounded Context**
Wrapping the entire app in a Context for data used by 2–3 components.
Fix: scope the Provider to the subtree that actually consumes it.

**URL-Worthy State in Component**
Filters, pagination, search query stored in `useState`.
Fix: `useSearchParams` (React Router / Next.js).

**Direct State Mutation**
```tsx
// WRONG
state.items.push(newItem)
state.user.name = 'new'

// CORRECT — produce new reference
setState(prev => ({ ...prev, items: [...prev.items, newItem] }))
```

**State Synchronization**
Two `useState` values synced with `useEffect` — signals a design flaw.
Fix: unify into one source of truth; derive the second value.

---

## 10. Naming Conventions

### Files
| Type | Convention | Example |
|------|-----------|---------|
| Component | `PascalCase.tsx` | `UserProfileCard.tsx` |
| Hook | `useCamelCase.ts` | `useCurrentUser.ts` |
| Utility | `camelCase.ts` | `formatCurrency.ts` |
| Types | `camelCase.types.ts` | `user.types.ts` |
| Schema | `camelCase.schema.ts` | `user.schema.ts` |
| Store slice | `camelCaseStore.ts` | `authStore.ts` |
| API hooks | `camelCaseApi.ts` | `userApi.ts` |
| Constants | `camelCase.constants.ts` | `apiRoutes.constants.ts` |
| CSS Module | `PascalCase.module.css` | `UserCard.module.css` |
| Tests | `PascalCase.test.tsx` | `UserCard.test.tsx` |
| Storybook | `PascalCase.stories.tsx` | `Button.stories.tsx` |
| Barrel | `index.ts` (always) | `index.ts` |

### Component Roles
| Role | Convention | Example |
|------|-----------|---------|
| Container/Smart | `FeatureNameContainer` or `FeatureName` | `OrderCheckoutContainer` |
| Presentation/Dumb | `FeatureNameView`, `FeatureNameCard` | `OrderSummaryView` |
| List | `FeatureNameList` | `ProductList` |
| Form | `FeatureNameForm` | `LoginForm` |
| Modal | `FeatureNameModal` | `DeleteConfirmModal` |
| Provider | `FeatureNameProvider` | `AuthProvider` |
| HOC | `withFeatureName` | `withAuthentication` |
| Context hook | `useFeatureName` | `useAuth` |
| Skeleton | `FeatureNameSkeleton` | `UserCardSkeleton` |
| Empty state | `FeatureNameEmpty` | `SearchResultsEmpty` |

### Variables and Functions
| Type | Convention | Example |
|------|-----------|---------|
| Event handler | `handle` prefix | `handleSubmit`, `handleClose` |
| Boolean | predicate form | `isLoading`, `hasError`, `canSubmit` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Enum name | `PascalCase` | `OrderStatus` |
| Enum values | `UPPER_SNAKE_CASE` | `PENDING`, `PAID` |
| React Query key | `['entity', 'operation', ...params]` | `['user', 'detail', userId]` |

---

## 11. Per-File Code Structure Standard

```tsx
// 1. Imports — grouped and ordered:
//    React → Framework → Third-party → Internal absolute → Relative → Types
import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { UserCard } from '@/entities/user'
import type { UserProfileProps } from './UserProfile.types'

// 2. File-scoped constants
const DEBOUNCE_MS = 300

// 3. Types (if not in separate .types.ts)
interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
}

// 4. Pure helper functions (no hooks)
function buildDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}

// 5. Component definition — internal order:
function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 5a. useState / useReducer
  const [isEditing, setIsEditing] = useState(false)

  // 5b. Data hooks (queries, mutations)
  const { data: user, isLoading } = useUserQuery(userId)

  // 5c. Derived values (useMemo)
  const displayName = useMemo(
    () => (user ? buildDisplayName(user) : ''),
    [user]
  )

  // 5d. Callbacks (useCallback)
  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev)
  }, [])

  // 5e. Effects (useEffect — always last among hooks)
  useEffect(() => {
    document.title = displayName
  }, [displayName])

  // 5f. Early returns (loading → error → empty)
  if (isLoading) return <UserProfileSkeleton />
  if (!user) return <UserProfileEmpty />

  // 5g. Main render
  return (
    <section>
      <h1>{displayName}</h1>
      {isEditing && <UserEditForm user={user} onSubmit={onUpdate} />}
      <button onClick={handleEditToggle}>
        {isEditing ? 'Cancel' : 'Edit'}
      </button>
    </section>
  )
}

// 6. Export — named for all non-page components
export { UserProfile }
// Default export ONLY for page-level route components
```

### Export Rule Summary
- Named exports: all components, hooks, utilities, types.
- Default exports: ONLY for page-level route components and the app entry point.
- No wildcard re-exports.
- No importing from slice internals — only from `index.ts`.

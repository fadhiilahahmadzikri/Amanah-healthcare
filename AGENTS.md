# AGENTS.md - AI Coding Agent Reference
# Strict Existing-First Design System & Atomic Component Engineering

## Purpose

This skill defines a **strict, mandatory engineering and design methodology** for working on an existing UI codebase.

The primary objective is to prevent hallucination, unnecessary invention, component duplication, visual inconsistency, and architectural fragmentation.

The system must always prioritize:

1. **What already exists**
2. **What can be reused**
3. **What can be composed**
4. **What can be extended**
5. **Only then, what genuinely needs to be created**

The default assumption must always be:

> **If something appears to be needed, assume it may already exist until the codebase has been thoroughly explored and its absence has been established with high confidence.**

Do not create new UI patterns merely because they seem appropriate, modern, convenient, or common in generic AI-generated interfaces.

---

# 1. Core Engineering Principle: Existing First

The codebase is the primary source of truth.

Before creating any component, style, utility, token, layout pattern, interaction, or behavior, the system **MUST explore the existing implementation first**.

Never immediately respond to a requirement with:

> "I need a new component."

Instead, follow this mandatory sequence:

**Explore → Locate → Understand → Reuse → Compose → Extend → Create only if necessary**

Creation is the final option, not the default option.

### Mandatory decision rule

Before creating anything new, verify:

* Does the component already exist?
* Does a visually similar component already exist?
* Does a structurally similar component already exist?
* Does a primitive already exist that can compose the required result?
* Does another page already implement the required behavior?
* Does the design system already provide the required token?
* Does an existing variant already support the requirement?
* Can the existing component be extended safely?
* Is the required behavior already implemented elsewhere?

Only after these possibilities have been investigated should a new implementation be considered.

---

# 2. No Duplicate Components

Component duplication is considered an architectural failure.

If the codebase already contains a component capable of satisfying a requirement, **reuse it**.

Do not create:

```text
Button.tsx
PrimaryButton.tsx
ActionButton.tsx
SubmitButton.tsx
CustomButton.tsx
```

simply because different pages require slightly different appearances.

Instead, use a shared component with controlled variants, attributes, slots, composition, or properties.

For example:

```tsx
<Button variant="solid" size="sm" trailing />
```

is preferable to creating another button component.

The same principle applies to:

* buttons
* cards
* headers
* avatars
* badges
* dialogs
* modals
* pagination
* tables
* toolbars
* forms
* inputs
* navigation
* status indicators
* typography
* layout primitives
* spacing
* icons
* animations
* interaction patterns

### Never duplicate because:

* the page looks slightly different
* the component needs another color
* the component needs another alignment
* the component needs optional content
* the component needs a trailing element
* the component needs another state
* the component is being used in another domain

First determine whether the difference can be represented through the existing component architecture.

---

# 3. Exploration Is Mandatory Before Implementation

Every task must begin with exploration.

Do not start writing code immediately.

First inspect:

* project structure
* component directories
* design-system directories
* token definitions
* theme definitions
* CSS variables
* Tailwind configuration
* Shadcn configuration
* Radix primitives
* existing variants
* existing layouts
* existing pages
* existing utilities
* existing hooks
* existing state management
* existing animation systems
* existing responsive behavior
* existing examples of similar UI

Search the entire relevant codebase before concluding that something does not exist.

### Required mindset

Never think:

> "There is probably no component for this."

Think:

> "I have not found it yet. I need to verify."

Absence must be established through exploration, not assumption.

---

# 4. Creation Threshold

A new component may only be created when there is strong evidence that:

1. No existing component fulfills the requirement.
2. No existing primitive can compose it.
3. No existing component can reasonably be extended.
4. Creating it will not duplicate an existing abstraction.
5. The new abstraction represents a genuinely reusable concept.
6. Its architecture fits the existing design system.
7. Its API is scalable and maintainable.
8. It can be reused independently in future contexts.

A new component is therefore not justified merely because it is faster to implement.

**Convenience is not an architectural justification.**

---

# 5. Shadcn / Radix as the Foundation

The component foundation must remain based on the existing Material-oriented component architecture, particularly **Shadcn and Radix primitives where they are already used by the project**.

Do not replace the foundation with an entirely new component architecture.

The correct model is:

```text
Shadcn / Radix Primitive
        ↓
Design-System Tokenization
        ↓
Project-Specific Composition
        ↓
Project-Specific Variants
        ↓
Application Components
```

The primitives provide the structural and behavioral foundation.

The project design system provides:

* visual language
* typography
* colors
* spacing
* radius
* borders
* states
* variants
* animation
* composition
* interaction behavior

Therefore:

> **Do not reinvent the foundation. Customize the foundation.**

---

# 6. Atomic Design Architecture

All UI must be considered through an Atomic Design hierarchy.

The required hierarchy is:

```text
Atom
  ↓
Molecule
  ↓
Organism
  ↓
Component
  ↓
Page / Feature
```

## Atom

An Atom is the smallest reusable visual or interaction primitive.

Examples:

* text
* icon wrapper
* avatar
* badge
* button
* input
* separator
* label
* typography primitive

Atoms should be:

* independent
* reusable
* theme-aware
* token-driven
* predictable
* composable

---

## Molecule

A Molecule combines multiple atoms into one meaningful reusable unit.

Examples:

```text
Avatar + Name + Subtitle
```

or:

```text
Label + Input + Helper Text
```

or:

```text
Icon + Status + Label
```

A molecule should represent a meaningful reusable relationship between atoms.

It should not contain unnecessary page-specific business logic.

---

## Organism

An Organism combines molecules and atoms into a larger reusable interface structure.

Examples:

* card header
* appointment summary
* patient information section
* toolbar
* navigation section
* complex card body

Organisms may have richer composition but must remain reusable.

---

## Component

A Component represents a complete reusable UI pattern composed from organisms, molecules, and atoms.

Examples:

* appointment card
* patient card
* dashboard card
* data table
* modal
* dialog
* complex form
* reusable page section

The component should remain independent from the page that consumes it.

---

# 7. Single Responsibility

Every abstraction must have a clear responsibility.

Avoid components that attempt to control:

* unrelated layout
* business logic
* data fetching
* global state
* styling
* unrelated UI concerns

at the same time.

Prefer:

```text
Data
 ↓
State
 ↓
Feature Logic
 ↓
Reusable Component
 ↓
Atoms / Molecules
```

The component should primarily describe how something is rendered and composed.

Business logic should not be unnecessarily embedded inside visual primitives.

---

# 8. Theme-Oriented Architecture

The UI must be **theme-oriented**, not component-color-oriented.

Components must not contain arbitrary hardcoded visual values such as:

```css
color: #123456;
background: #abcdef;
border-color: #fedcba;
```

when those values represent design-system properties.

Instead, consume semantic tokens:

```css
color: var(--foreground);
background: var(--background);
border-color: var(--border);
```

or the project's established token mechanism.

The component should know **what semantic role a color represents**, not the raw color value itself.

---

# 9. Zero Hardcoded Design-System Values

Do not hardcode:

* colors
* status colors
* gradients
* typography colors
* border colors
* surface colors
* spacing values that belong to the system
* radius values
* shadows
* animation values
* semantic states

when an appropriate design token already exists.

The component should consume the token.

For example:

```tsx
status="success"
```

rather than:

```tsx
className="text-[#22C55E]"
```

The semantic state should resolve to the appropriate theme token.

---

# 10. Missing Token Protocol

If a required design value does **not** exist in the current token system, do not immediately hardcode it inside the component.

Instead:

```text
Requirement
   ↓
Search existing token
   ↓
Token exists?
   ├── YES → Reuse it
   │
   └── NO
        ↓
   Determine whether it is genuinely a design-system value
        ↓
   Add a new semantic token
        ↓
   Consume the token
```

For example, if a new status requires a color that does not exist:

**Do not:**

```tsx
className="bg-[#something]"
```

Instead, introduce the appropriate semantic token into the theme system and then consume that token.

This preserves consistency across future themes.

---

# 11. Tokenization Rules

Tokens should represent semantic meaning rather than arbitrary component ownership.

Prefer:

```text
--status-success
--status-warning
--status-error
--surface-primary
--surface-secondary
--text-primary
--text-secondary
--border-default
--interactive-primary
```

over:

```text
--appointment-card-green
--patient-card-blue
--dashboard-card-purple
```

The latter creates component-specific coupling.

The former allows the same visual language to be reused anywhere.

---

# 12. Theme Independence

Components must not be structurally coupled to one specific theme.

The architecture should allow:

```text
Component
    ↓
Semantic Token
    ↓
Active Theme
    ↓
Actual Visual Value
```

Therefore, changing the theme should not require rewriting every component.

A component should remain structurally identical while its visual manifestation changes through the theme layer.

---

# 13. Design Harmonization

Every component must belong to the same visual system.

Before implementing a new visual pattern, compare it against existing:

* typography
* spacing
* borders
* radius
* buttons
* cards
* dialogs
* status treatments
* icons
* animation
* interaction states
* responsive behavior

Do not introduce a visual language that conflicts with existing components.

If an existing component already establishes the correct pattern, imitate and reuse that pattern.

**Existing design language has priority over personal design preference.**

---

# 14. Usability Over Novelty

The goal is not to make the UI look novel.

The goal is to make it:

* understandable
* predictable
* consistent
* accessible
* reusable
* maintainable
* scalable

Do not introduce visual complexity merely because it makes the interface appear more sophisticated.

Do not add:

* unnecessary icons
* decorative gradients
* excessive badges
* unnecessary cards
* arbitrary glassmorphism
* unnecessary shadows
* excessive animation
* AI-style dashboard patterns

unless the existing design system or actual usability requirement calls for them.

---

# 15. Reuse Before Redesign

When encountering an existing UI, do not immediately redesign it.

First determine:

```text
What exists?
What works?
What is inconsistent?
What is reusable?
What needs extension?
What genuinely needs replacement?
```

Preserve existing working behavior unless the task explicitly requires changing it.

Refinement should be incremental.

---

# 16. Component API Scalability

Components should expose meaningful configuration through variants and compositional properties.

For example:

```tsx
<Button
  variant="solid"
  size="md"
  trailing
>
  Continue
</Button>
```

rather than:

```tsx
<SolidMediumTrailingButton />
```

The component API should be:

* readable
* predictable
* composable
* scalable
* type-safe where possible
* easy to maintain

Avoid creating a new component for every combination of visual properties.

---

# 17. Independent Components

Reusable components must remain independent from specific pages.

Avoid:

```text
PatientPageCard
AppointmentPageCard
DashboardAppointmentCard
```

when the underlying structure is the same.

Prefer:

```text
AppointmentCard
```

with controlled composition and variants.

Pages should consume components rather than own their implementations.

---

# 18. No Page-Specific Duplication

If two pages contain structurally equivalent UI, investigate whether they should consume the same component.

The implementation should follow:

```text
Shared Component
       ↑
       |
 ┌─────┴─────┐
Page A     Page B
```

rather than:

```text
Page A → duplicated implementation
Page B → duplicated implementation
```

This is essential for long-term harmonization.

---

# 19. Reverse Engineering Existing Patterns

When a component already exists, study its implementation before extending it.

Understand:

* its API
* variants
* token usage
* composition
* responsive behavior
* states
* accessibility
* animation
* dependencies
* consumers

Then extend it using the same architectural language.

Do not introduce a completely different implementation style into an existing system.

---

# 20. Anti-Hallucination Protocol

When uncertain, stop and inspect.

Never fill missing information with assumptions.

The following behavior is prohibited:

> "This probably needs an icon."

> "A dashboard usually has this."

> "This would look better with a card."

> "I should create a new component."

> "This component probably doesn't exist."

> "This design system probably uses this color."

Instead:

> "Inspect the existing implementation first."

If the answer exists in the codebase, use it.

If it does not exist, determine whether the requirement can be satisfied through existing primitives.

Only then consider creating something new.

---

# 21. Implementation Priority

When executing a task, follow this order:

### Phase 1 — Explore

Understand the existing system.

### Phase 2 — Inventory

Identify existing:

* components
* primitives
* tokens
* themes
* utilities
* variants
* patterns

### Phase 3 — Map

Determine which existing abstractions correspond to the requested requirement.

### Phase 4 — Reuse

Use existing components wherever possible.

### Phase 5 — Compose

Combine existing atoms, molecules, and organisms.

### Phase 6 — Extend

Modify an existing abstraction when a legitimate new variant or capability is required.

### Phase 7 — Tokenize

If a new design value is genuinely required, add it to the design-token system.

### Phase 8 — Create

Only create a new abstraction when its absence has been established and the abstraction is genuinely necessary.

### Phase 9 — Validate

Check for:

* duplication
* hardcoded values
* inconsistent tokens
* inconsistent variants
* broken hierarchy
* unnecessary abstractions
* page-specific coupling
* theme coupling

---

# 22. Final Architectural Rule

The entire system must follow this principle:

> **Do not build what already exists. Do not duplicate what can be reused. Do not hardcode what belongs in a token. Do not create a component when composition is sufficient. Do not create a new abstraction until the existing codebase has been thoroughly explored and its absence has been established.**

The desired architecture is:

```text
Existing Design System
        ↓
Semantic Tokens
        ↓
Shadcn / Radix Primitives
        ↓
Atoms
        ↓
Molecules
        ↓
Organisms
        ↓
Reusable Components
        ↓
Features
        ↓
Pages
```

The entire system must remain:

**Single Source of Truth · Reusable · Composable · Theme-Aware · Tokenized · Independent · Scalable · Maintainable · Harmonized**

The priority is not speed of implementation.

The priority is **architectural correctness, reuse, consistency, and long-term scalability**.

This file provides essential information for AI coding agents working on this project. It contains project-specific details, conventions, and guidelines that complement the README.

---

## Project Overview

**Next.js Admin Dashboard Starter** is a production-ready admin dashboard template built with:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Authentication**: Clerk (with Organizations/Billing support)
- **Error Tracking**: Sentry
- **Charts**: Recharts
- **Containerization**: Docker (Node.js & Bun Dockerfiles)
- **Package Manager**: Bun (preferred) or npm

The project follows a feature-based folder structure designed for scalability in SaaS applications, internal tools, and admin panels.

---

## Technology Stack Details

### Core Framework & Runtime

- Next.js 16.0.10 with App Router
- React 19.2.0
- TypeScript 5.7.2 with strict mode enabled

### Styling & UI

- Tailwind CSS v4 (using `@import 'tailwindcss'` syntax)
- PostCSS with `@tailwindcss/postcss` plugin
- shadcn/ui component library (Radix UI primitives)
- CSS custom properties for theming (OKLCH color format)

### State Management

- Zustand 5.x for local UI state (chat, kanban, notifications)
- Nuqs for URL search params state management
- TanStack Form + Zod for form handling (via `useAppForm` hook)

### Data Fetching & Caching

- TanStack React Query for data fetching, caching, and mutations
- Server-side prefetching with `HydrationBoundary` + `dehydrate`
- Client-side `useQuery` + nuqs `shallow: true` for tables (no RSC round-trips on pagination/filter)
- `useMutation` + `invalidateQueries` for form submissions
- Query client singleton in `src/lib/query-client.ts`

### Authentication & Authorization

- Clerk for authentication and user management
- Clerk Organizations for multi-tenant workspaces
- Clerk Billing for subscription management (B2B)
- Client-side RBAC for navigation visibility

### Data & APIs

- TanStack Table for data tables
- TanStack React Query for data fetching and mutations
- Recharts for analytics/charts
- Service layer per feature (`api/types.ts` → `api/service.ts` → `api/queries.ts`)
- Route handlers at `src/app/api/` (for Route Handler or BFF patterns)
- Mock data in `src/constants/mock-api*.ts` (default, swap via service layer)
- API client utility in `src/lib/api-client.ts` (for fetch-based patterns)

### Development Tools

- ESLint 8.x with Next.js core-web-vitals config
- Prettier 3.x with prettier-plugin-tailwindcss
- Husky for git hooks
- lint-staged for pre-commit formatting

---

## Project Structure

```
/src
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes (sign-in, sign-up)
│   ├── dashboard/         # Dashboard routes
│   │   ├── overview/      # Parallel routes (@area_stats, @bar_stats, etc.)
│   │   ├── product/       # Product management pages
│   │   ├── kanban/        # Kanban board page
│   │   ├── chat/          # Messaging page
│   │   ├── notifications/ # Notifications page
│   │   ├── workspaces/    # Organization management
│   │   ├── billing/       # Subscription billing
│   │   ├── exclusive/     # Pro plan feature example
│   │   └── profile/       # User profile
│   ├── api/               # API routes (if any)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── global-error.tsx   # Sentry-integrated error boundary
│   └── not-found.tsx      # 404 page
│
├── components/
│   ├── ui/                # shadcn/ui components (50+ components)
│   ├── layout/            # Layout components (sidebar, header, etc.)
│   ├── forms/             # Form field wrappers
│   ├── themes/            # Theme system components
│   ├── kbar/              # Command+K search bar
│   ├── icons.tsx          # Icon registry
│   └── ...
│
├── features/              # Feature-based modules
│   ├── auth/              # Authentication components
│   ├── overview/          # Dashboard analytics
│   ├── products/          # Product management (React Query + nuqs)
│   │   ├── api/
│   │   │   ├── types.ts   # Type contract (response shapes, filters, payloads)
│   │   │   ├── service.ts # Data access layer (swap for your backend)
│   │   │   └── queries.ts # React Query options + key factories
│   │   ├── components/    # Listing, form, table components
│   │   ├── schemas/       # Zod schemas
│   │   └── constants/     # Filter options
│   ├── users/             # User management (React Query + nuqs)
│   │   ├── api/           # Same pattern: types.ts → service.ts → queries.ts
│   │   └── components/    # Listing, table components
│   ├── react-query-demo/  # React Query showcase (Pokemon API)
│   ├── kanban/            # Kanban board with dnd-kit
│   ├── chat/              # Messaging UI (conversations, bubbles, composer)
│   ├── notifications/     # Notification center & store
│   └── profile/           # Profile management
│
├── config/                # Configuration files
│   ├── nav-config.ts      # Navigation with RBAC
│   └── ...
│
├── hooks/                 # Custom React hooks
│   ├── use-nav.ts         # RBAC navigation filtering
│   ├── use-data-table.ts  # Data table state
│   └── ...
│
├── lib/                   # Utility functions
│   ├── utils.ts           # cn() and formatters
│   ├── searchparams.ts    # Search param utilities
│   └── ...
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core types (NavItem, etc.)
│
└── styles/                # Global styles
    ├── globals.css        # Tailwind imports + view transitions
    ├── theme.css          # Theme imports
    └── themes/            # Individual theme files

/docs                      # Documentation
│   ├── clerk_setup.md     # Clerk configuration guide
│   ├── nav-rbac.md        # Navigation RBAC documentation
│   └── themes.md          # Theme customization guide

/scripts                   # Dev tooling
    ├── cleanup.js         # Feature removal (self-contained, delete when done)
    └── postinstall.js     # Dev server cleanup message (auto-cleans)

Dockerfile                 # Node.js production Dockerfile
Dockerfile.bun             # Bun production Dockerfile
.dockerignore              # Docker build exclusions
```

---

## Build & Development Commands

```bash
bun install

bun run dev
bun run build

bun run start

bun run lint         bun run lint:fix     bun run lint:strict
bun run format       bun run format:check
bun run prepare      ```

---

## Environment Configuration

Copy `env.example.txt` to `.env.local` and configure:

### Required for Authentication (Clerk)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard/overview"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard/overview"
```

### Optional for Error Tracking (Sentry)

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_ORG=your-org
NEXT_PUBLIC_SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_...
NEXT_PUBLIC_SENTRY_DISABLED="false"  # Set to "true" to disable in dev
```

**Note**: Clerk supports "keyless mode" - the app works without API keys for initial development.

---

## Code Style Guidelines

### TypeScript

- Strict mode enabled
- Use explicit return types for public functions
- Prefer interface over type for object definitions
- Use `@/*` alias for imports from src

### Formatting (Prettier)

```json
{
  "singleQuote": true,
  "jsxSingleQuote": true,
  "semi": true,
  "trailingComma": "none",
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### ESLint Rules

- `@typescript-eslint/no-unused-vars`: warn
- `no-console`: warn
- `react-hooks/exhaustive-deps`: warn
- `import/no-unresolved`: off (handled by TypeScript)

### Component Conventions

- Use function declarations for components: `function ComponentName() {}`
- Props interface named `{ComponentName}Props`
- shadcn/ui components use `cn()` utility for class merging
- Server components by default, `'use client'` only when needed

---

## Theming System

The project uses a sophisticated multi-theme system with 10 built-in themes:

- `vercel` (default)
- `claude`
- `neobrutualism`
- `supabase`
- `mono`
- `notebook`
- `light-green`
- `zen`
- `astro-vista`
- `whatsapp`

### Theme Files

- CSS files: `src/styles/themes/{theme-name}.css`
- Theme registry: `src/components/themes/theme.config.ts`
- Font config: `src/components/themes/font.config.ts`
- Active theme provider: `src/components/themes/active-theme.tsx`

### Adding a New Theme

1. Create `src/styles/themes/your-theme.css` with `[data-theme='your-theme']` selector
2. Import in `src/styles/theme.css`
3. Add to `THEMES` array in `src/components/themes/theme.config.ts`
4. (Optional) Add fonts in `font.config.ts`
5. (Optional) Set as default in `theme.config.ts`

See `docs/themes.md` for detailed theming guide.

---

## Navigation & RBAC System

### Navigation Configuration

Navigation is organized into groups in `src/config/nav-config.ts`:

```typescript
import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        items: [],
        access: { requireOrg: true }
      }
    ]
  }
];
```

### Access Control Properties

- `requireOrg: boolean` - Requires active organization
- `permission: string` - Requires specific permission
- `role: string` - Requires specific role
- `plan: string` - Requires specific subscription plan
- `feature: string` - Requires specific feature

### Client-Side Filtering

The `useFilteredNavItems()` hook in `src/hooks/use-nav.ts` filters navigation client-side using Clerk's `useOrganization()` and `useUser()` hooks. This is for UX only - actual security checks must happen server-side.

---

## Authentication Patterns

### Protected Routes

Dashboard routes use Clerk's middleware pattern. Pages that require organization:

```tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

}
```

### Plan/Feature Protection

Use Clerk's `<Protect>` component for client-side:

```tsx
import { Protect } from '@clerk/nextjs';

<Protect plan='pro' fallback={<UpgradePrompt />}>
  <PremiumContent />
</Protect>;
```

Use `has()` function for server-side checks:

```tsx
import { auth } from '@clerk/nextjs';

const { has } = await auth();
const hasFeature = has({ feature: 'premium_access' });
```

---

## Data Fetching Patterns

### Service Layer Architecture

Each feature has a three-file API layer:

```
src/features/<name>/api/
  types.ts      ← Type contract (response shapes, filters, payloads)
  service.ts    ← Data access functions (the ONE file to swap for your backend)
  queries.ts    ← React Query options + query key factories (stable, never changes)
```

**`service.ts` is the only file you modify when connecting to a real backend.** Queries and components import from it — they never change.

#### Backend Patterns

| Pattern                                            | How to implement                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Server Actions + ORM** (Prisma/Drizzle/Supabase) | Add `'use server'` at top of `service.ts`, call ORM directly                                |
| **Route Handlers + ORM**                           | `service.ts` calls `/api/` routes via `apiClient`, route handlers call ORM                  |
| **BFF** (Next.js proxies to Laravel/Go/etc.)       | `service.ts` calls `/api/` routes via `apiClient`, route handlers proxy to external backend |
| **Direct external API** (frontend-only)            | `service.ts` calls external URL via `fetch()`                                               |
| **Mock** (default)                                 | `service.ts` calls in-memory fake data stores                                               |

Route handlers at `src/app/api/` are ready for patterns 2 and 3. `src/lib/api-client.ts` provides a typed `fetch` wrapper.

### Query Key Factories

Each feature defines a key factory in `queries.ts` for type-safe, hierarchical cache invalidation:

```tsx
export const entityKeys = {
  all: ['entities'] as const,
  list: (filters: EntityFilters) => [...entityKeys.all, 'list', filters] as const,
  detail: (id: number) => [...entityKeys.all, 'detail', id] as const
};

queryKey: entityKeys.list(filters);

queryClient.invalidateQueries({ queryKey: entityKeys.all });
```

### React Query (Default for all new pages)

The project uses TanStack React Query with server-side prefetching and client-side cache management:

1. **Query options** defined in `queries.ts` — shared between server prefetch and client hooks
2. **Server prefetch** using `void queryClient.prefetchQuery()` + `HydrationBoundary` + `dehydrate` — `void` (fire-and-forget) is the standard TanStack pattern for Next.js App Router
3. **Client fetch** using `useSuspenseQuery()` — integrates with React Suspense so prefetched data streams in without showing a loading skeleton on first load
4. **Suspense boundary** wraps the client component — shows a fallback skeleton only on subsequent client-side navigations when cache is empty

```tsx

const queryClient = getQueryClient();
void queryClient.prefetchQuery(entitiesQueryOptions(filters));

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<Skeleton />}>
      <EntityTable />
    </Suspense>
  </HydrationBoundary>
);

const { data } = useSuspenseQuery(entitiesQueryOptions(filters));
```

**Why `void` + `useSuspenseQuery`:**

- `void` fires the prefetch without blocking the server component
- `useSuspenseQuery` integrates with React Suspense — the pending query streams in via Next.js streaming SSR
- With `<Suspense fallback={<Skeleton />}>`: skeleton shows immediately while data streams in — this is expected behavior, the skeleton IS the Suspense fallback during streaming
- Without `<Suspense>` wrapper: no skeleton, but the previous page stays visible until data fully resolves (feels like a slow navigation)
- Once data is cached (within `staleTime`), subsequent visits are instant — no skeleton

**Why NOT `useQuery`:**

- `useQuery` doesn't integrate with Suspense — returns `isLoading: true` and you must handle loading state manually
- Hydrated pending queries from `void` prefetch won't prevent the loading state
- Results in skeleton flash even when data is prefetched

### Mutations

Components import service functions for mutations. Use query key factories for invalidation:

```tsx
import { createEntity } from '../api/service';
import { entityKeys } from '../api/queries';

const mutation = useMutation({
  mutationFn: (data) => createEntity(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: entityKeys.all });
    toast.success('Created');
  }
});
```

### URL State Management

Use `nuqs` for search params state:

- `searchParamsCache` (server) — reads params in server components
- `useQueryState` (client) — reads/writes params in client components with `shallow: true`

### Data Tables

Tables use TanStack Table with React Query:

- Query options in `features/*/api/queries.ts`
- Column definitions in `features/*/components/*-tables/columns.tsx`
- Table component in `src/components/ui/table/data-table.tsx`
- Column pinning via `initialState.columnPinning` in `useDataTable`

---

## Error Handling & Monitoring

### Sentry Integration

Sentry is configured for both client and server:

- Client config: `src/instrumentation-client.ts`
- Server config: `src/instrumentation.ts`
- Global error: `src/app/global-error.tsx`

To disable Sentry in development:

```env
NEXT_PUBLIC_SENTRY_DISABLED="true"
```

### Error Boundaries

- `global-error.tsx` - Catches all errors, reports to Sentry
- Parallel route `error.tsx` files for specific sections

---

## Testing Strategy

**Note**: This project does not include a test suite by default. Consider adding:

- **Unit tests**: Vitest or Jest for utilities and hooks
- **Component tests**: React Testing Library for UI components
- **E2E tests**: Playwright for critical user flows

Recommended test locations:

```
/src
  /__tests__           # Unit tests
  /features/*/tests    # Feature tests
/e2e                   # Playwright tests
```

---

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables in dashboard
3. Deploy

### Environment Variables for Production

Ensure these are set in your deployment platform:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- All `NEXT_PUBLIC_*` variables for client-side access
- `SENTRY_*` variables if using error tracking

### Docker

Production-ready Dockerfiles are included:

- `Dockerfile` — Node.js-based
- `Dockerfile.bun` — Bun-based

Both use `output: 'standalone'` in `next.config.ts`. Pass `NEXT_PUBLIC_*` vars as `--build-arg` at build time, and runtime secrets via `-e` at run time.

### Build Considerations

- Output: `standalone` (optimized for Docker/self-hosting)
- Images: Configured for `api.slingacademy.com`, `img.clerk.com`, `clerk.com`
- Sentry source maps uploaded automatically in CI

---

## Feature Cleanup System

A single `scripts/cleanup.js` file handles removal of optional features:

```bash
node scripts/cleanup.js --interactive

node scripts/cleanup.js clerk           node scripts/cleanup.js kanban          node scripts/cleanup.js chat            node scripts/cleanup.js notifications   node scripts/cleanup.js themes          node scripts/cleanup.js sentry
node scripts/cleanup.js kanban chat notifications

node scripts/cleanup.js --dry-run kanban

node scripts/cleanup.js --list
```

**Safety**: Script requires git repository with at least one commit. Use `--force` to skip.

After cleanup, delete `scripts/cleanup.js` — the dev server message auto-cleans on next start.

---

## Icon System

**All icons come from a single source: `src/components/icons.tsx`.**

The project uses `@tabler/icons-react` as the sole icon package. Every icon is re-exported through a centralized `Icons` object — **never import directly from `@tabler/icons-react` or any other icon package**.

### Usage

```tsx
import { Icons } from '@/components/icons';

<Icons.search className='h-4 w-4' />
<Icons.chevronRight className='h-4 w-4' />

icon={Icons.check}
```

### Adding a New Icon

1. Import the tabler icon in `src/components/icons.tsx`
2. Add a semantic key to the `Icons` object
3. Use `Icons.yourKey` everywhere — never the raw import

```tsx

import { IconNewIcon } from '@tabler/icons-react';

export const Icons = {

  newIcon: IconNewIcon
};
```

### Available Icon Categories

| Category        | Example Keys                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| General         | `check`, `close`, `search`, `settings`, `trash`, `spinner`, `info`, `warning` |
| Navigation      | `chevronDown`, `chevronLeft`, `chevronRight`, `chevronUp`, `chevronsUpDown`   |
| Layout          | `dashboard`, `kanban`, `panelLeft`                                            |
| User            | `user`, `account`, `profile`, `teams`                                         |
| Communication   | `chat`, `notification`, `phone`, `video`, `send`                              |
| Files           | `page`, `post`, `media`, `fileTypePdf`, `fileTypeDoc`                         |
| Actions         | `add`, `edit`, `upload`, `share`, `login`, `logout`                           |
| Theme           | `sun`, `moon`, `brightness`, `laptop`, `palette`                              |
| Text formatting | `bold`, `italic`, `underline`, `text`                                         |
| Data / Charts   | `trendingUp`, `trendingDown`, `eyeOff`, `adjustments`                         |

### Icon Showcase Page

Browse all available icons at `/dashboard/elements/icons` — a searchable grid of every icon in the registry.

### Why This Pattern?

- **Single source of truth** — swap icon packages by editing one file
- **Semantic naming** — `Icons.trash` is clearer than `IconTrash` scattered across files
- **Discoverability** — autocomplete on `Icons.` shows every available icon
- **No direct dependencies** — components never couple to a specific icon package

---

## Common Development Tasks

### Adding a New Feature (End-to-End)

1. Create `src/features/<name>/api/types.ts` — response types, filter types, mutation payloads
2. Create `src/features/<name>/api/service.ts` — data access functions (mock by default)
3. Create `src/features/<name>/api/queries.ts` — query key factory + `queryOptions`
4. Create page route: `src/app/dashboard/<name>/page.tsx`
5. Create feature components in `src/features/<name>/components/`
6. Add navigation item in `src/config/nav-config.ts`
7. (Optional) Add route handlers in `src/app/api/<name>/` for REST API patterns
8. (Optional) Register new icon in `src/components/icons.tsx`

### Adding a New API Route

1. Create: `src/app/api/my-route/route.ts`
2. Export HTTP method handlers: `GET`, `POST`, etc.
3. For BFF pattern: proxy requests to your external backend

### Adding a shadcn Component

```bash
npx shadcn add component-name
```

### Adding a New Theme

See "Theming System" section above or `docs/themes.md`.

---

## Troubleshooting

### Common Issues

**Build fails with Tailwind errors**

- Ensure using Tailwind CSS v4 syntax (`@import 'tailwindcss'`)
- Check `postcss.config.js` uses `@tailwindcss/postcss`

**Clerk keyless mode popup**

- Normal in development without API keys
- Click popup to claim application or set env variables

**Theme not applying**

- Check theme name matches in CSS `[data-theme]` and `theme.config.ts`
- Verify theme CSS is imported in `theme.css`

**Navigation items not showing**

- Check `access` property in nav config
- Verify user has required org/permission/role

---

## External Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Next.js SDK](https://clerk.com/docs/references/nextjs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## Notes for AI Agents

1. **Always use `cn()` for className merging** - never concatenate strings manually
2. **Respect the feature-based structure** - put new feature code in `src/features/`
3. **Server components by default** - only add `'use client'` when using browser APIs or React hooks
4. **Type safety first** - avoid `any`, prefer explicit types
5. **Follow existing patterns** - look at similar components before creating new ones
6. **Environment variables** - prefix with `NEXT_PUBLIC_` for client-side access
7. **shadcn components** - don't modify files in `src/components/ui/` directly; extend them instead
8. **Icons** - NEVER import icons directly from `@tabler/icons-react` or any other icon package. All icons must be registered in `src/components/icons.tsx` and imported as `import { Icons } from '@/components/icons'`. To add a new icon: add the tabler import to `icons.tsx`, add a semantic key to the `Icons` object, then use `Icons.keyName` in your component.
9. **Page headers** - Always use `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) for page headers. Never import `<Heading>` manually in pages — `PageContainer` handles that internally.
10. **Forms** - Use TanStack Form via `useAppForm` from `@/components/ui/tanstack-form`. Never use `useState` inside `AppField` render props — extract stateful logic into separate components.
11. **Button loading** - Use `<Button isLoading={isPending}>` for loading states. Uses CSS Grid overlap trick for zero layout shift. When `isLoading` is not passed, button behaves as default shadcn. `SubmitButton` in forms handles this automatically via form `isSubmitting` state.
12. **Data layer** - Always go through the service layer: `types.ts` → `service.ts` → `queries.ts`. Components import types from `types.ts`, functions from `service.ts`, query options from `queries.ts`. Never import from `@/constants/mock-api*` directly in components.

## Client Specific Rules (Added by User Request)
- **Frontend Only (Mock Data)**: The application is strictly frontend-only using interactive dummy/mock data. Ignore any PRD/Tech-Spec requirements regarding real backend or database integration.
- **Clean Code (No Dirty Comments)**: Do not dirty the codebase with unnecessary comments or docstrings. Write clean, self-explanatory code.
- **Component Reusability**: Do not introduce new UI components if existing ones (e.g. from shadcn) can fulfill the requirement. Re-use existing components to maintain styling consistency. If a new shadcn component is truly needed, install it via the standard CLI.
- **Respect Existing Architecture**: Conform strictly to the existing design patterns, folder structure, and styling paradigms present in the boilerplate. Maximize the use of the existing theme/styling system.
- **Parallel Execution**: Implement tasks in parallel across multiple subagents whenever possible, coordinated by the main orchestrator agent.

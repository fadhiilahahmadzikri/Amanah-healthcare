# Anti-Patterns — Frontend Architecture

## Table of Contents
1. [God Component](#god-component)
2. [Prop Drilling](#prop-drilling)
3. [Boolean Flag Explosion](#boolean-flag-explosion)
4. [Premature Abstraction](#premature-abstraction)
5. [Logic Inside JSX](#logic-inside-jsx)
6. [Atomic Layer Violations](#atomic-layer-violations)
7. [State Misplacement](#state-misplacement)
8. [Unstable References](#unstable-references)
9. [Component API Ambiguity](#component-api-ambiguity)
10. [Styling Anti-Patterns](#styling-anti-patterns)

---

## God Component

**Signal:** A single component exceeding ~200–300 LOC, more than 8–10 props, or performing multiple unrelated responsibilities (rendering, data fetching, validation, routing logic).

**Root cause:** Starting with a single file and never extracting as complexity grows.

**Before (anti-pattern):**
```tsx
function UserDashboard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  // ... 40 more lines of state and effects

  return (
    <div>
      {/* 200 lines of deeply nested JSX */}
    </div>
  );
}
```

**After (correct):**
```tsx
function UserDashboard({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  const { data: posts } = useUserPosts(userId);

  return (
    <DashboardLayout header={<DashboardHeader user={user} />}>
      <Tabs defaultTab="profile">
        <Tabs.List>
          <Tabs.Tab id="profile">Profile</Tabs.Tab>
          <Tabs.Tab id="posts">Posts</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel for="profile"><UserProfileSection user={user} /></Tabs.Panel>
        <Tabs.Panel for="posts"><UserPostsFeed posts={posts} /></Tabs.Panel>
      </Tabs>
    </DashboardLayout>
  );
}
```

**Decomposition checklist:**
- Can any block of JSX be named and extracted? Extract it.
- Can any group of related state + effects be extracted to a hook? Extract it.
- Does the component render meaningfully different UI based on a condition? Split into two components.

---

## Prop Drilling

**Signal:** A prop is passed through 2+ intermediate components that do not use it — only forwarding it to a deeper descendant.

**Root cause:** Choosing the wrong composition strategy. Prop drilling is not solved by Context — it is solved by **component composition**.

**Before (anti-pattern):**
```tsx
function Page({ currentUser }: { currentUser: User }) {
  return <Layout currentUser={currentUser} />;
}

function Layout({ currentUser }: { currentUser: User }) {
  return <Sidebar currentUser={currentUser} />;
}

function Sidebar({ currentUser }: { currentUser: User }) {
  return <UserMenu currentUser={currentUser} />;
}
```

**After — composition solution (preferred):**
```tsx
function Page({ currentUser }: { currentUser: User }) {
  return (
    <Layout sidebar={<Sidebar menu={<UserMenu user={currentUser} />} />}>
      <MainContent />
    </Layout>
  );
}
```

**After — Context solution (when composition is impractical):**
```tsx
const CurrentUserContext = createContext<User | null>(null);

function Page({ currentUser }: { currentUser: User }) {
  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Layout />
    </CurrentUserContext.Provider>
  );
}

function UserMenu() {
  const user = useContext(CurrentUserContext);
  ...
}
```

**Rule:** Try composition first. Use Context when the tree is genuinely deep and the consuming component cannot be composed closer to the provider.

---

## Boolean Flag Explosion

**Signal:** A component accumulates 4+ boolean props that toggle behavior: `isLarge`, `hasBorder`, `showIcon`, `isFullWidth`, `isCompact`, `isDense`, `isInline`.

**Root cause:** Extending a component with new requirements by adding flags instead of composing variants or splitting components.

**Before (anti-pattern):**
```tsx
<Button
  isPrimary
  isLarge
  isFullWidth
  hasLeadingIcon
  isLoading
  isRounded
/>
```

**After — variant system:**
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

<Button
  variant="primary"
  size="lg"
  isFullWidth
  isLoading
  leadingIcon={<SpinnerIcon />}
/>
```

**After — discriminated union for structural variants:**
```tsx
type ButtonProps =
  | { layout: 'inline'; children: React.ReactNode }
  | { layout: 'fullWidth'; children: React.ReactNode }
  | { layout: 'icon'; icon: React.ReactNode; label: string };
```

---

## Premature Abstraction

**Signal:** Creating a generic, configurable component on first use before the second use case exists. Over-engineering atoms before their API is validated.

**Root cause:** Anticipating requirements that have not materialized.

**Rule:** Build inline first. Extract on second repetition. Abstract API on third. Lock the interface when used across multiple features.

**Before (anti-pattern — too early):**
```tsx
function EntityList<T extends object>({
  items,
  renderItem,
  renderHeader,
  renderFooter,
  renderEmpty,
  renderError,
  isLoading,
  onLoadMore,
  keyExtractor,
  sortConfig,
  filterConfig,
}: EntityListProps<T>) { ... }
```

Built before any specific use case required it. Now must evolve the API to satisfy real needs — creating breaking changes.

**After (correct progression):**
1. Build `ProductList` specifically
2. Build `OrderList` specifically — notice the pattern
3. Extract `ResourceList<T>` with only the props both components actually needed
4. Add props incrementally as real requirements arrive

---

## Logic Inside JSX

**Signal:** Ternary chains, multiple `.map()` calls, complex conditional rendering blocks, and filter/sort logic embedded directly in the return statement.

**Before (anti-pattern):**
```tsx
return (
  <div>
    {isLoading ? (
      <Spinner />
    ) : error ? (
      <ErrorMessage error={error} />
    ) : data && data.items.length > 0 ? (
      data.items
        .filter((item) => item.isActive)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((item) => (
          <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item.id)} />
        ))
    ) : (
      <EmptyState />
    )}
  </div>
);
```

**After:**
```tsx
const activeItems = useMemo(
  () =>
    data?.items
      .filter((item) => item.isActive)
      .sort((a, b) => b.createdAt - a.createdAt) ?? [],
  [data]
);

const handleItemClick = useCallback((id: string) => { ... }, []);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!activeItems.length) return <EmptyState />;

return (
  <div>
    {activeItems.map((item) => (
      <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item.id)} />
    ))}
  </div>
);
```

**Rules:**
- Early returns for loading/error/empty states before the main render
- Extract filtered/sorted data to `useMemo`
- Extract handlers to named `useCallback` functions
- Never nest `.map()` inside `.map()` — extract the inner map to a named component

---

## Atomic Layer Violations

**Signal:** An atom importing from `features/`, a molecule importing a domain model, an organism importing from another organism's internal context.

**Root cause:** Growing a component in place without considering layer ownership.

**Common violations:**

```tsx
// Atom importing domain type — VIOLATION
import type { UserProfile } from '@/features/user/types';

function Avatar({ user }: { user: UserProfile }) { ... }
```

```tsx
// Atom fetching data — VIOLATION
function NotificationIcon() {
  const { data } = useUnreadNotifications();
  return <BellIcon count={data?.unreadCount} />;
}
```

**Fix:**
```tsx
// Atom is pure — accepts primitive props
type AvatarProps = {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
};

// Domain awareness lives in the organism
function UserAvatarButton({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  return <Avatar src={user?.avatarUrl} alt={user?.fullName ?? 'User'} size="md" />;
}
```

---

## State Misplacement

**Signal:** Global state (Zustand, Redux, Jotai) holding UI state that never leaves a single component or page. Server state (API response data) stored in local useState instead of a server state library.

**Rule — state placement hierarchy:**

| State type | Where it lives |
|---|---|
| UI interaction state (tooltip open, tab active, accordion expanded) | Local `useState` in owning component |
| Form state | Local `useState` or `react-hook-form` in form component |
| Shared local UI state (modal triggered from multiple places) | Context or Zustand slice scoped to feature |
| Server/async state (fetched data) | React Query / SWR — never raw `useState` |
| Cross-session persistent state (theme, user preferences) | Zustand with persistence middleware |
| URL-driven state (filters, pagination, current tab visible in URL) | URL search params via router |

**Anti-pattern:**
```tsx
const useStore = create((set) => ({
  isModalOpen: false,
  tooltipVisible: false,
  activeAccordionIndex: 0,
  // ... UI state that should be local useState
}));
```

**Anti-pattern:**
```tsx
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setUser);
  }, []);
  // Missing: loading state, error state, caching, deduplication, refetch
}
```

Use React Query or SWR for all server state.

---

## Unstable References

**Signal:** Passing inline object literals, inline arrays, or non-memoized callbacks as props — causing child components to re-render on every parent render regardless of value changes.

**Before (anti-pattern):**
```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <ExpensiveChild
      config={{ theme: 'dark', size: 'lg' }}
      onAction={() => console.log('action')}
      filters={['active', 'verified']}
    />
  );
}
```

Every `Parent` re-render creates new object/array/function references, causing `ExpensiveChild` to re-render even if the values are semantically identical.

**After:**
```tsx
const DEFAULT_CONFIG = { theme: 'dark' as const, size: 'lg' as const };
const DEFAULT_FILTERS = ['active', 'verified'] as const;

function Parent() {
  const [count, setCount] = useState(0);

  const handleAction = useCallback(() => {
    console.log('action');
  }, []);

  return (
    <ExpensiveChild
      config={DEFAULT_CONFIG}
      onAction={handleAction}
      filters={DEFAULT_FILTERS}
    />
  );
}
```

**Rule:** Only memoize when profiling shows a real performance problem, or when a child is wrapped in `React.memo`. Do not cargo-cult `useCallback` and `useMemo` everywhere — it has a cost.

---

## Component API Ambiguity

**Signal:** Component behavior cannot be inferred from its TypeScript types alone. Consumers must read source code to understand valid prop combinations.

**Root cause:** Using `any`, optional props that interact in undocumented ways, and props that are only valid in certain states.

**Fix:** Make valid states representable and invalid states impossible via TypeScript. Discriminated unions, required props at the right layer, and explicit type documentation via descriptive type names eliminate ambiguity.

---

## Styling Anti-Patterns

**Signal:** Inline styles for anything except dynamic computed values, global class name strings without collision protection, deeply nested CSS that mirrors the component tree structure, `!important` usage.

| Anti-pattern | Correct approach |
|---|---|
| Inline styles for static values | CSS Modules, Tailwind, CSS-in-JS |
| Global class names without scoping | CSS Modules (local by default) |
| CSS mirroring component nesting | Flat BEM-style or utility classes |
| `!important` overrides | Increase specificity correctly, or restructure |
| Magic number values | Design tokens and CSS custom properties |
| Styles scattered across multiple files per component | Co-locate: `Button.module.css` next to `Button.tsx` |

Read `styling-architecture.md` for full conventions.

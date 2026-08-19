# React Anti-Pattern Catalog

Full detection signals and remediation for every prohibited pattern.
Used in Phase 3 (Component Audit) and Phase 4 (State Management Audit).

## Table of Contents
1. Component Design Anti-Patterns
2. Hook Anti-Patterns
3. State Management Anti-Patterns
4. Rendering Anti-Patterns
5. Architecture / Import Anti-Patterns
6. TypeScript Anti-Patterns
7. Export / Namespace Anti-Patterns
8. Performance Anti-Patterns

---

## 1. Component Design Anti-Patterns

---

### Fat Component (God Component)
**Severity:** Critical

**Detection signals:**
- Component does data fetching AND state management AND rendering AND error handling
- File > 150 lines
- Component name requires "And" to describe it (`UserFormAndPreview`)
- More than 3 `useState` calls without a custom hook or `useReducer`
- JSX return block > 80 lines

**Wrong:**
```tsx
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setIsLoading(false) })
  }, [userId])

  const handleUpdate = async (data) => { /* ... */ }

  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      <h1>{user.name}</h1>
      {/* 80+ lines of mixed UI logic */}
    </div>
  )
}
```

**Correct:** Split into Container + Presentation:
```tsx
// Container — data + state only
function UserDashboardContainer({ userId }) {
  const { data: user, isLoading } = useUserQuery(userId)
  const { mutate: updateUser } = useUpdateUserMutation()
  if (isLoading) return <UserDashboardSkeleton />
  return <UserDashboardView user={user} onUpdate={updateUser} />
}

// Presentation — rendering only
function UserDashboardView({ user, onUpdate }) {
  return <section>{/* pure UI */}</section>
}
```

---

### Prop Drilling (> 2 levels)
**Severity:** High

**Detection signals:**
- A prop passes through 3+ component levels
- Intermediary components accept props they never use directly
- Props named `onXxx` or `isXxx` appear in components that have no use for them

**Wrong:**
```tsx
<App userId={userId}>
  <Layout userId={userId}>
    <Sidebar userId={userId}>
      <UserMenu userId={userId} />  {/* only this one needs it */}
    </Sidebar>
  </Layout>
</App>
```

**Correct:**
```tsx
// Option A — scoped Context
const UserContext = createContext(null)
export const useUser = () => useContext(UserContext)

// Option B — component composition (move UserMenu closer to where userId is known)
// Option C — Zustand slice accessible directly in UserMenu
```

---

### Inline Component Definition in Render
**Severity:** High

**Detection signals:**
- A component is defined with `const X = () =>` inside another component's body
- JSX uses a locally-defined component that is re-created on every render

**Wrong:**
```tsx
function UserList({ users }) {
  // Recreated on every render — memoization breaks, focus resets
  const UserItem = ({ user }) => <li>{user.name}</li>
  return <ul>{users.map(u => <UserItem key={u.id} user={u} />)}</ul>
}
```

**Correct:**
```tsx
// Define outside the parent component
function UserItem({ user }) {
  return <li>{user.name}</li>
}

function UserList({ users }) {
  return <ul>{users.map(u => <UserItem key={u.id} user={u} />)}</ul>
}
```

---

### Business Logic Inline in JSX
**Severity:** Medium

**Detection signals:**
- Complex `.map()`, `.filter()`, `.reduce()` chains directly in JSX return
- Data transformation logic embedded in render

**Wrong:**
```tsx
return (
  <ul>
    {items
      .filter(i => i.status === 'active')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(i => <Item key={i.id} item={i} />)
    }
  </ul>
)
```

**Correct:**
```tsx
const visibleItems = useMemo(
  () => items.filter(i => i.status === 'active')
             .sort((a, b) => b.createdAt - a.createdAt)
             .slice(0, 10),
  [items]
)
return <ul>{visibleItems.map(i => <Item key={i.id} item={i} />)}</ul>
```

---

### Spreading Unknown Props onto DOM Elements
**Severity:** Medium

**Detection signals:**
- `<div {...props}>` or `<span {...rest}>` where `rest` may contain non-DOM attributes
- TypeScript `any` on props that get spread onto elements

**Wrong:**
```tsx
function Card({ title, onDelete, ...rest }) {
  return <div {...rest}>{title}</div>  // onDelete passed to DOM — React warning
}
```

**Correct:**
```tsx
function Card({ title, className, style }: CardProps) {
  return <div className={className} style={style}>{title}</div>
}
```

---

## 2. Hook Anti-Patterns

---

### Conditional Hook Call (Rules of Hooks Violation)
**Severity:** Critical

**Detection signals:**
- Hook called inside `if`, `switch`, `for`, `while`, ternary, or logical expression
- Hook called after an early return

**Wrong:**
```tsx
function Component({ isAdmin }) {
  if (!isAdmin) return null  // early return BEFORE hook call below
  const { data } = useAdminData()  // Rules of Hooks violation
  return <AdminPanel data={data} />
}
```

**Correct:**
```tsx
function Component({ isAdmin }) {
  const { data } = useAdminData()  // always called
  if (!isAdmin) return null
  return <AdminPanel data={data} />
}
```

---

### useEffect for Derived State
**Severity:** High

**Detection signals:**
- `useEffect` that only calls a state setter based on another state value
- Pattern: `useEffect(() => setX(computeFrom(y)), [y])`

**Wrong:**
```tsx
const [count, setCount] = useState(items.length)
useEffect(() => { setCount(items.length) }, [items])
```

**Correct:**
```tsx
const count = items.length  // inline compute — no hook needed
// OR for expensive computation:
const count = useMemo(() => expensiveCount(items), [items])
```

---

### Missing useEffect Cleanup / Async Leak
**Severity:** High

**Detection signals:**
- `useEffect` subscribes to events, timers, or WebSockets without returning cleanup
- `useEffect` with `async` function directly (not via inner `async` + AbortController)
- `setState` called after component unmount

**Wrong:**
```tsx
useEffect(() => {
  async function load() {
    const data = await fetchUser(id)
    setUser(data)  // may run after unmount
  }
  load()
}, [id])
```

**Correct:**
```tsx
useEffect(() => {
  const controller = new AbortController()
  fetchUser(id, { signal: controller.signal })
    .then(setUser)
    .catch(err => { if (!controller.signal.aborted) setError(err) })
  return () => controller.abort()
}, [id])

// Or just use React Query — eliminates this pattern entirely
```

---

### Fake Hook (use* Without Any Hook Calls)
**Severity:** Medium

**Detection signals:**
- Function named `use*` that calls no React hooks internally
- Function is pure and has no React lifecycle dependency

**Wrong:**
```tsx
// Not a hook — just a function. Naming it useX is misleading.
function useFormatDate(date: Date): string {
  return date.toLocaleDateString()
}
```

**Correct:**
```tsx
// Plain utility — name it accordingly
function formatDate(date: Date): string {
  return date.toLocaleDateString()
}
```

---

### Missing/Incorrect Dependency Array
**Severity:** High

**Detection signals:**
- `useEffect`, `useMemo`, `useCallback` with `[]` but referencing variables from closure
- ESLint `react-hooks/exhaustive-deps` warnings suppressed without explanation
- Stale closure bugs: callback captures old state/prop values

**Wrong:**
```tsx
useEffect(() => {
  doSomething(value)  // 'value' not in deps — stale closure
}, [])

// Or over-wide deps causing infinite loop:
useEffect(() => {
  setDerived(compute(obj))
}, [obj])  // 'obj' is a new reference on every render
```

**Correct:**
```tsx
useEffect(() => {
  doSomething(value)
}, [value])

// For object deps: destructure to primitives or memoize the object
const { id, name } = obj
useEffect(() => {
  setDerived(compute(id, name))
}, [id, name])
```

---

### Custom Hook Mixing Multiple Concerns (SRP Violation)
**Severity:** Medium

**Detection signals:**
- Hook name requires "And" (`useAuthAndNavigation`)
- Hook returns more than ~6 unrelated values
- Hook handles both API calls AND routing AND form state

**Wrong:**
```tsx
function useUserPage(userId) {
  // Fetches user, manages form state, handles navigation, tracks analytics
}
```

**Correct:**
```tsx
function useUserData(userId) { /* data fetching only */ }
function useUserForm(user) { /* form state only */ }
function useUserNavigation() { /* routing only */ }
```

---

## 3. State Management Anti-Patterns

---

### useState + useEffect for Server Data
**Severity:** Critical

**Detection signals:**
- `useEffect` with `fetch()` or Axios call inside
- `useState` holding data that came from an API
- Manual loading/error state managed alongside fetched data

**Wrong:**
```tsx
const [users, setUsers] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)
useEffect(() => {
  setIsLoading(true)
  fetch('/api/users')
    .then(r => r.json())
    .then(data => { setUsers(data); setIsLoading(false) })
    .catch(err => { setError(err); setIsLoading(false) })
}, [])
```

**Correct:**
```tsx
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json())
})
```

---

### Unbounded Context
**Severity:** High

**Detection signals:**
- A single Context Provider wraps the entire application for data used by 2–3 components
- Context value changes cause the entire app tree to re-render
- Context stores server data instead of UI/shared state

**Wrong:**
```tsx
// Wraps entire app, used only in UserMenu deep in the tree
<UserPreferencesContext.Provider value={prefs}>
  <App />
</UserPreferencesContext.Provider>
```

**Correct:**
```tsx
// Scoped to the subtree that actually needs it
<SettingsPage>
  <UserPreferencesContext.Provider value={prefs}>
    <SettingsForm />  {/* only consumer */}
  </UserPreferencesContext.Provider>
</SettingsPage>
```

---

### URL-Worthy State in Component
**Severity:** Medium

**Detection signals:**
- `useState` for: current page, active filter, search query, selected tab (if shareable)
- State that would be lost on page refresh or can't be shared via URL

**Wrong:**
```tsx
const [currentPage, setCurrentPage] = useState(1)
const [filter, setFilter] = useState('active')
```

**Correct:**
```tsx
const [searchParams, setSearchParams] = useSearchParams()
const currentPage = Number(searchParams.get('page') ?? 1)
const filter = searchParams.get('filter') ?? 'active'
```

---

### Global State for Local Concerns
**Severity:** Medium

**Detection signals:**
- Zustand/Redux holds state like `isModalOpen`, `activeTab`, `inputFocus`
- State is consumed by only one component but lives in a global store

**Wrong:**
```tsx
// In global store
const useStore = create(set => ({
  isDeleteModalOpen: false,
  setDeleteModalOpen: (v) => set({ isDeleteModalOpen: v })
}))
```

**Correct:**
```tsx
// In the component that owns the modal
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
```

---

## 4. Rendering Anti-Patterns

---

### Index as Key on Dynamic List
**Severity:** High

**Detection signals:**
- `key={index}` in `.map()` on lists that can be reordered, filtered, or modified
- Items lose focus, form values reset unexpectedly, animations break

**Wrong:**
```tsx
{items.map((item, index) => <Item key={index} item={item} />)}
```

**Correct:**
```tsx
{items.map(item => <Item key={item.id} item={item} />)}
// For static, immutable lists that never reorder: index key is acceptable
```

---

### `0 &&` Short-Circuit Rendering
**Severity:** Low-Medium

**Detection signals:**
- `{count && <Component />}` where count could be 0

**Wrong:**
```tsx
{items.length && <ItemList items={items} />}  // renders "0" when empty
```

**Correct:**
```tsx
{items.length > 0 && <ItemList items={items} />}
// Or ternary: {items.length ? <ItemList items={items} /> : null}
```

---

### Missing Error Boundary on Routes
**Severity:** High

**Detection signals:**
- Route-level page components without Error Boundary wrapping
- Unhandled React rendering errors crash the entire app

**Wrong:**
```tsx
<Route path="/dashboard" element={<DashboardPage />} />
```

**Correct:**
```tsx
<Route
  path="/dashboard"
  element={
    <ErrorBoundary fallback={<DashboardError />}>
      <DashboardPage />
    </ErrorBoundary>
  }
/>
```

---

## 5. Architecture / Import Anti-Patterns

---

### Importing from Slice Internals
**Severity:** High

**Detection signals:**
- Import path goes past `index.ts` into a slice's internal file
- Pattern: `import X from '@/entities/user/ui/UserCard'`

**Wrong:**
```tsx
import { UserCard } from '@/entities/user/ui/UserCard'
import { useUserQuery } from '@/entities/user/api/userApi'
```

**Correct:**
```tsx
import { UserCard, useUserQuery } from '@/entities/user'
```

---

### Higher-Layer Import from Lower Layer
**Severity:** Critical

**Detection signals:**
- `shared/` imports from `entities/` or `features/`
- `entities/` imports from `features/` or `pages/`
- `features/` imports from `pages/` or `widgets/`

**Wrong:**
```tsx
// shared/ui/Button.tsx
import { useAuthStore } from '@/features/auth'  // shared cannot know about features
```

**Correct:**
Refactor so the dependency flows downward only.
If shared code needs auth context, pass it via props or inject via a Context at app layer.

---

### Same-Layer Slice Cross-Import (Without @x)
**Severity:** High

**Detection signals:**
- `entities/user` directly importing from `entities/product`
- No `@x/` directory mediating the dependency

**Wrong:**
```tsx
// entities/user/model/user.types.ts
import { Product } from '@/entities/product'  // direct cross-import — violation
```

**Correct:**
```tsx
// entities/product/@x/user.ts — explicit cross-import public API
export type { Product } from '../model/product.types'

// entities/user/model/user.types.ts
import type { Product } from 'entities/product/@x/user'  // via @x
```

---

## 6. TypeScript Anti-Patterns

---

### `any` in Prop Interfaces
**Severity:** High

**Detection signals:**
- `prop: any` in component prop interfaces
- `as any` type assertions in component body

**Fix:** Use specific types. If the type is genuinely unknown, use `unknown` and narrow it.

---

### `as unknown as X` Type Assertions
**Severity:** Medium

**Detection signals:**
- Double assertion to bypass TypeScript checks
- Pattern: `value as unknown as DesiredType`

**Fix:** Fix the underlying type mismatch. If an API response type is trusted at runtime,
use Zod/Yup validation before asserting.

---

### Using `React.FC`
**Severity:** Low

**Detection signals:**
- `const Component: React.FC<Props> = (props) => { ... }`

**Why:** `React.FC` adds implicit `children` prop (pre-React 18), limits type inference,
and provides no meaningful benefit over typed function parameters.

**Correct:**
```tsx
function Component({ name }: ComponentProps) { ... }
// OR
const Component = ({ name }: ComponentProps) => { ... }
```

---

## 7. Export / Namespace Anti-Patterns

---

### Default Export on Non-Page Component
**Severity:** Medium

**Detection signals:**
- `export default UserCard` in a non-page component file
- Breaks rename safety, breaks autocompletion in some editors

**Correct:**
```tsx
export { UserCard }
// Default export only for page-level route components
```

---

### Wildcard Re-Export
**Severity:** Medium

**Detection signals:**
- `export * from './UserCard'` in barrel files

**Wrong:**
```ts
export * from './ui/UserCard'   // exposes internals, breaks tree-shaking
```

**Correct:**
```ts
export { UserCard } from './ui/UserCard'   // explicit public API
```

---

## 8. Performance Anti-Patterns

---

### Premature Memoization
**Severity:** Low

**Detection signals:**
- `useMemo` / `useCallback` on computations that are trivially fast
- `React.memo` on every component without profiler evidence

**Wrong:**
```tsx
const doubled = useMemo(() => count * 2, [count])  // multiplication is not expensive
```

**Rule:** Measure with React DevTools Profiler before adding memoization.
Memoization has its own overhead — unnecessary use can slow things down.

---

### List Virtualization Missing on Large Lists
**Severity:** High (at scale)

**Detection signals:**
- `.map()` rendering 100+ items without virtualization
- Sluggish scroll performance on lists/tables

**Fix:** Use `@tanstack/react-virtual` or `react-window` for lists with 50+ items.

---

### Missing Code Splitting on Page Components
**Severity:** Medium

**Detection signals:**
- Page-level components imported statically in router file
- Large initial bundle impacting time-to-interactive

**Wrong:**
```tsx
import { DashboardPage } from '@/pages/dashboard'
```

**Correct:**
```tsx
const DashboardPage = lazy(() => import('@/pages/dashboard'))
// Wrapped in <Suspense fallback={<PageSkeleton />}>
```

---

## Quick Reference — Severity Levels

| Severity | Description |
|----------|-------------|
| **Critical** | Causes bugs, crashes, or Rules of Hooks violations. Fix immediately. |
| **High** | Degrades maintainability, performance, or causes subtle bugs. Fix in current sprint. |
| **Medium** | Code smell or convention violation. Fix during refactor. |
| **Low** | Minor improvement. Fix opportunistically. |

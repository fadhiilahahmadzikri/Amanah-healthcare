# Atomic Design — Component Hierarchy Reference

## Table of Contents
1. [Atoms](#atoms)
2. [Molecules](#molecules)
3. [Organisms](#organisms)
4. [Templates](#templates)
5. [Pages](#pages)
6. [Hierarchy Rules](#hierarchy-rules)
7. [Composition Patterns](#composition-patterns)
8. [Evolution Strategy](#evolution-strategy)

---

## Atoms

The smallest indivisible unit of the UI. Atoms map directly to HTML elements enhanced with design system constraints.

**Rules:**
- Zero domain knowledge. No API types. No business logic.
- No internal state beyond accessibility or animation primitives
- Fully controlled by props
- Must accept `className` or a styling extension mechanism
- Must support `ref` forwarding when wrapping native elements

**Examples:** Button, Input, Label, Icon, Badge, Spinner, Checkbox, Radio, Textarea, Divider, Avatar, Tooltip, Tag

**Atom implementation pattern:**
```tsx
import { forwardRef } from 'react';

type InputProps = {
  isInvalid?: boolean;
  isDisabled?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ isInvalid, isDisabled, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        disabled={isDisabled}
        aria-invalid={isInvalid}
        className={cn(styles.input, isInvalid && styles.invalid, className)}
        {...rest}
      />
    );
  }
);

Input.displayName = 'Input';
```

**Atom boundary violations:**
- Importing from `features/` or any domain module
- Fetching data internally
- Rendering other named components (only native HTML elements and other atoms)
- Encoding business validation logic

---

## Molecules

A focused composition of 2–5 atoms that achieves a single UI interaction unit.

**Rules:**
- Can hold minimal local state for interaction (e.g., open/closed toggle)
- Still domain-agnostic in most cases — accepts generic props, not domain types
- Represents a complete interaction primitive, not a domain concept
- Should be usable in multiple domain contexts without modification

**Examples:** FormField (Label + Input + Error), SearchBar (Input + IconButton), PasswordInput (Input + VisibilityToggle), Pagination, DatePicker, FileUpload, Dropdown, Combobox, Stepper

**Molecule implementation pattern:**
```tsx
type FormFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
};

function FormField({ label, error, required, children, htmlFor }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
```

**Molecule boundary violations:**
- Accepting domain model types directly (e.g., `UserProfile`, `ProductItem`)
- Fetching data or calling API hooks internally
- Containing navigation or routing logic
- Growing beyond 5 atoms without considering organism promotion

---

## Organisms

Domain-aware UI sections that compose molecules and atoms into meaningful product interfaces.

**Rules:**
- Can import domain types, business rules, and feature-specific hooks
- Represents a complete UI section that makes sense to the product (e.g., a login form, a product card, a comment thread)
- Manages local state for its section
- Does not own page-level data fetching — receives data or delegates to hooks
- Should be extractable as a standalone feature unit

**Examples:** LoginForm, ProductCard, NavigationBar, CommentThread, CheckoutSummary, NotificationPanel, DataTable, UserProfileCard

**Organism implementation pattern:**
```tsx
type LoginFormProps = {
  onSuccess: (user: AuthenticatedUser) => void;
  onForgotPassword: () => void;
};

function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const { form, submitLogin, isPending, error } = useLoginForm({ onSuccess });

  return (
    <form onSubmit={form.handleSubmit(submitLogin)} noValidate>
      <FormField label="Email" error={form.errors.email?.message} htmlFor="email">
        <Input
          id="email"
          type="email"
          isInvalid={!!form.errors.email}
          {...form.register('email')}
        />
      </FormField>
      <FormField label="Password" error={form.errors.password?.message} htmlFor="password">
        <PasswordInput
          id="password"
          isInvalid={!!form.errors.password}
          {...form.register('password')}
        />
      </FormField>
      {error && <ErrorAlert message={error} />}
      <Button type="submit" isLoading={isPending} isFullWidth>
        Sign In
      </Button>
      <TextButton onClick={onForgotPassword}>Forgot password?</TextButton>
    </form>
  );
}
```

**Organism boundary violations:**
- Directly calling `fetch` or axios — delegate to hooks
- Rendering page-level layout (headers, sidebars)
- Owning global application state
- Mixing multiple unrelated domain concerns in a single organism

---

## Templates

Page-level layout scaffolding. Templates define spatial relationships and slot structures without any data.

**Rules:**
- Pure layout — no data, no business logic, no API awareness
- Accept `children` or named slot props (`header`, `sidebar`, `footer`, `main`)
- Define the responsive grid, spacing rhythm, and structural zones
- Reusable across multiple pages

**Examples:** DashboardLayout, AuthLayout, TwoColumnLayout, FullPageLayout, SidebarLayout

**Template implementation pattern:**
```tsx
type DashboardLayoutProps = {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

function DashboardLayout({ header, sidebar, children }: DashboardLayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>{header}</header>
      <div className={styles.body}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
```

---

## Pages

Route-level components that wire templates with real data and organisms.

**Rules:**
- Own the data-fetching boundary (or delegate to a loader/server component)
- Compose templates and organisms — do not render atoms directly except for trivial cases
- Handle route-level error/loading states
- Do not contain reusable UI logic — that belongs in organisms or hooks

**Page implementation pattern:**
```tsx
function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: stats } = useDashboardStats();

  if (isLoading) return <PageSpinner />;

  return (
    <DashboardLayout
      header={<DashboardHeader user={user} />}
      sidebar={<DashboardSidebar />}
    >
      <StatsOverview stats={stats} />
      <RecentActivityFeed />
    </DashboardLayout>
  );
}
```

---

## Hierarchy Rules

These rules govern imports and dependencies across layers:

| Layer | Can import from | Cannot import from |
|---|---|---|
| Atom | Nothing in `src/` except `lib/` and design tokens | Molecules, Organisms, Templates, Pages, Features |
| Molecule | Atoms, `lib/`, design tokens | Organisms, Templates, Pages, Features |
| Organism | Atoms, Molecules, `hooks/`, `lib/`, domain types | Templates, Pages |
| Template | Atoms, Molecules (for structural layout only) | Organisms with domain logic, Pages |
| Page | Everything | Nothing is off-limits — this is the composition root |

Violations of this import hierarchy introduce tight coupling and prevent isolated component development.

---

## Composition Patterns

### Slot Pattern
Use explicit slot props for structural flexibility:
```tsx
type CardProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};
```

### Compound Component Pattern
Use static sub-components for compositional APIs:
```tsx
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
```

### Render Prop Pattern
Use when the parent must control how the child renders:
```tsx
type DataListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
};
```

### Headless Component Pattern
Separate logic from presentation entirely using custom hooks:
```tsx
function useDropdown(options: DropdownOptions) {
  // All behavior, state, keyboard handling
  return { isOpen, selectedItem, getToggleProps, getMenuProps, getItemProps };
}
```

---

## Evolution Strategy

Follow this progression — do not abstract prematurely:

1. **Inline once** — Build directly in the consuming component
2. **Repeat twice** — When the same structure appears a second time, note the similarity
3. **Abstract on the third** — Extract to a named component at the appropriate atomic level
4. **Stabilize the API** — Lock the prop interface before wider adoption
5. **Document in Storybook** — Add stories for all states before sharing across teams

The rule: **abstract when the repetition is obvious and the interface is clear, not before**.

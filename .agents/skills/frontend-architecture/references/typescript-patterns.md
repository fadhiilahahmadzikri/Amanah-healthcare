# TypeScript Patterns — Frontend Engineering

## Table of Contents
1. [Prop Typing Conventions](#prop-typing-conventions)
2. [Discriminated Unions](#discriminated-unions)
3. [Generic Components](#generic-components)
4. [Utility Types](#utility-types)
5. [Type Guards](#type-guards)
6. [Event Handler Typing](#event-handler-typing)
7. [Context Typing](#context-typing)
8. [Strict TypeScript Configuration](#strict-typescript-configuration)

---

## Prop Typing Conventions

Use `type` over `interface` for component props. Reserve `interface` for contracts that may be extended by consumers (design system public API surface).

**Naming:**
- Component props: `ComponentNameProps`
- Internal state shape: `ComponentNameState`
- Hook return: `UseHookNameReturn`
- Hook options: `UseHookNameOptions`

**Prop type construction:**

```tsx
type CardProps = {
  variant?: 'elevated' | 'outlined' | 'filled';
  isInteractive?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
```

Never use `React.FC` or `React.FunctionComponent`. Define props explicitly and type the function directly:

```tsx
function Card({ variant = 'elevated', children, ...rest }: CardProps) { ... }
```

`React.FC` forces `children` as always optional, prevents generic components from working correctly, and complicates `forwardRef` composition.

**Required vs optional:**
- Props with sensible defaults → optional with explicit `defaultValue` in destructuring
- Props with no safe default → required, no `?`
- Event handlers → always optional unless the component cannot function without them

---

## Discriminated Unions

Use discriminated unions to eliminate impossible prop combinations and guide TypeScript toward exhaustive checks.

**Replacing boolean flag explosion:**

```tsx
type ButtonProps =
  | {
      variant: 'icon';
      icon: React.ReactNode;
      label: string;
      children?: never;
    }
  | {
      variant: 'text' | 'outlined' | 'filled';
      icon?: React.ReactNode;
      label?: never;
      children: React.ReactNode;
    };
```

**Alert component with discriminated state:**

```tsx
type AlertProps =
  | { status: 'loading'; message?: string }
  | { status: 'success'; message: string; onDismiss?: () => void }
  | { status: 'error'; message: string; onRetry?: () => void; errorCode?: string }
  | { status: 'warning'; message: string; onDismiss?: () => void };

function Alert(props: AlertProps) {
  switch (props.status) {
    case 'loading': return <LoadingAlert message={props.message} />;
    case 'success': return <SuccessAlert message={props.message} onDismiss={props.onDismiss} />;
    case 'error': return <ErrorAlert message={props.message} onRetry={props.onRetry} />;
    case 'warning': return <WarningAlert message={props.message} onDismiss={props.onDismiss} />;
  }
}
```

TypeScript will flag unhandled cases if a new status is added — this is exhaustive type checking in practice.

**Async state shape:**

```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

---

## Generic Components

Generic components maintain type safety while remaining reusable across different data shapes.

**Generic list:**
```tsx
type SelectProps<T> = {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  isDisabled?: boolean;
  placeholder?: string;
};

function Select<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  isDisabled,
  placeholder = 'Select...',
}: SelectProps<T>) { ... }
```

**Usage:**
```tsx
<Select
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getOptionLabel={(u) => u.fullName}
  getOptionValue={(u) => u.id}
/>
```

TypeScript infers `T = User` from `options` — no explicit type annotation required at the call site.

**Generic table:**
```tsx
type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type TableProps<T extends { id: string | number }> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
};

function Table<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
}: TableProps<T>) { ... }
```

---

## Utility Types

Leverage TypeScript's built-in utility types to construct precise prop types without duplication.

```tsx
type ButtonHTMLProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

type OmitNative<T extends keyof ButtonHTMLProps> = Omit<ButtonHTMLProps, T>;

type ButtonProps = OmitNative<'onClick' | 'disabled'> & {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
};
```

**Pick for sub-typing:**
```tsx
type UserSummary = Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
```

**Partial for update shapes:**
```tsx
type UserUpdatePayload = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
```

**Required for enforcing optional fields in sub-contexts:**
```tsx
type SubmittedFormData = Required<DraftFormData>;
```

**Record for mapped config:**
```tsx
type VariantStyles = Record<ButtonVariant, string>;

const variantStyles: VariantStyles = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  destructive: styles.destructive,
};
```

---

## Type Guards

Use type guards for runtime narrowing, especially when dealing with API responses and union types.

```tsx
function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  );
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).email === 'string'
  );
}
```

**Assertion function for invariants:**
```tsx
function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}
```

---

## Event Handler Typing

Always type event handlers precisely — never use `any` or raw `Event`.

```tsx
type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type SelectChangeHandler = React.ChangeEventHandler<HTMLSelectElement>;
type FormSubmitHandler = React.FormEventHandler<HTMLFormElement>;
type ButtonClickHandler = React.MouseEventHandler<HTMLButtonElement>;

type TextAreaKeyHandler = React.KeyboardEventHandler<HTMLTextAreaElement>;
```

**For custom event emitters:**
```tsx
type OnChange<T> = (value: T) => void;
type OnChangeEvent<T> = (value: T, event: React.ChangeEvent<HTMLInputElement>) => void;
```

---

## Context Typing

Typed context with null-safety via a custom hook that enforces provider presence.

```tsx
function createTypedContext<T>(displayName: string) {
  const Context = createContext<T | null>(null);
  Context.displayName = displayName;

  function useTypedContext(): T {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    }
    return value;
  }

  return [Context, useTypedContext] as const;
}

const [ThemeContext, useTheme] = createTypedContext<ThemeContextValue>('Theme');
```

---

## Strict TypeScript Configuration

Use this `tsconfig.json` baseline for all frontend projects:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`noUncheckedIndexedAccess` forces null-checking on array indexing and object key access — this eliminates a large class of runtime errors that strict mode alone misses.

`exactOptionalPropertyTypes` distinguishes `prop?: string` (absent) from `prop: string | undefined` (present but undefined) — prevents subtle bugs when spreading optional props.

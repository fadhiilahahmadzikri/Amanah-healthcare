# Component Patterns — Composition Strategies

## Table of Contents
1. [Compound Components](#compound-components)
2. [Headless Components](#headless-components)
3. [Polymorphic Components](#polymorphic-components)
4. [Controlled vs Uncontrolled](#controlled-vs-uncontrolled)
5. [Render Props](#render-props)
6. [Higher-Order Components](#higher-order-components)
7. [Pattern Selection Guide](#pattern-selection-guide)

---

## Compound Components

Compound components share implicit state through React Context, creating a composable API where the parent coordinates child behavior without exposing internal state through props.

**When to use:**
- Complex UI components with multiple coordinated parts (Modal, Tabs, Accordion, Select, Menu)
- When consumers need full control over rendering order and structure
- When boolean flag proliferation is beginning to occur

**Implementation:**

```tsx
type TabsContextValue = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within Tabs');
  return context;
}

type TabsProps = {
  defaultTab: string;
  onChange?: (tab: string) => void;
  children: React.ReactNode;
};

function Tabs({ defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleChange = useCallback((id: string) => {
    setActiveTab(id);
    onChange?.(id);
  }, [onChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={styles.tabs}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabListProps = { children: React.ReactNode };

function TabList({ children }: TabListProps) {
  return <div role="tablist" className={styles.tabList}>{children}</div>;
}

type TabProps = {
  id: string;
  children: React.ReactNode;
};

function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn(styles.tab, isActive && styles.active)}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

type TabPanelProps = {
  for: string;
  children: React.ReactNode;
};

function TabPanel({ for: tabId, children }: TabPanelProps) {
  const { activeTab } = useTabs();
  if (activeTab !== tabId) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

**Usage:**
```tsx
<Tabs defaultTab="overview" onChange={handleTabChange}>
  <Tabs.List>
    <Tabs.Tab id="overview">Overview</Tabs.Tab>
    <Tabs.Tab id="details">Details</Tabs.Tab>
    <Tabs.Tab id="history">History</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel for="overview"><OverviewContent /></Tabs.Panel>
  <Tabs.Panel for="details"><DetailsContent /></Tabs.Panel>
  <Tabs.Panel for="history"><HistoryContent /></Tabs.Panel>
</Tabs>
```

---

## Headless Components

Headless components separate all logic and accessibility behavior into a custom hook, leaving full rendering control to the consumer. This is the most powerful pattern for building design-system-agnostic components.

**When to use:**
- Building component primitives intended for cross-team or cross-project use
- When the same behavior must support radically different visual implementations
- Accessibility-critical components (combobox, dialog, popover, date picker)

**Implementation:**

```tsx
type UseDisclosureOptions = {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

type UseDisclosureReturn = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  getDisclosureProps: () => { onClick: () => void; 'aria-expanded': boolean };
  getContentProps: () => { hidden: boolean };
};

function useDisclosure({
  defaultOpen = false,
  onOpen,
  onClose,
}: UseDisclosureOptions = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    isOpen ? close() : open();
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    getDisclosureProps: () => ({ onClick: toggle, 'aria-expanded': isOpen }),
    getContentProps: () => ({ hidden: !isOpen }),
  };
}
```

**Usage across different visual implementations:**
```tsx
function CustomAccordion() {
  const { isOpen, getDisclosureProps, getContentProps } = useDisclosure();
  return (
    <div>
      <MyCustomTrigger {...getDisclosureProps()} isOpen={isOpen}>
        Toggle
      </MyCustomTrigger>
      <AnimatedPanel {...getContentProps()}>
        Content here
      </AnimatedPanel>
    </div>
  );
}
```

---

## Polymorphic Components

A polymorphic component renders as different HTML elements or components via an `as` prop while maintaining full TypeScript type inference for the rendered element's native props.

**When to use:**
- Design system primitives that must render as multiple semantic elements (Text as h1/h2/p/span, Button as button/a, Box as any HTML element)
- Avoiding wrapper div soup while maintaining semantic HTML

**Implementation:**

```tsx
type AsProp<C extends React.ElementType> = { as?: C };

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

type TextVariant = 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';

type TextOwnProps = {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
};

type TextProps<C extends React.ElementType = 'span'> = PolymorphicComponentProps<C, TextOwnProps>;

function Text<C extends React.ElementType = 'span'>({
  as,
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  className,
  children,
  ...rest
}: TextProps<C>) {
  const Component = as ?? 'span';
  return (
    <Component
      className={cn(styles[variant], styles[weight], styles[color], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
```

**Usage:**
```tsx
<Text as="h1" variant="display">Page Title</Text>
<Text as="p" variant="body" color="secondary">Paragraph text</Text>
<Text as="label" variant="label" weight="medium" htmlFor="email">Email</Text>
```

TypeScript correctly infers `htmlFor` is valid when `as="label"` and rejects it for `as="h1"`.

---

## Controlled vs Uncontrolled

Components must explicitly support both controlled and uncontrolled usage patterns when input state is involved.

**Controlled** — parent owns the state:
```tsx
type ControlledInputProps = {
  value: string;
  onChange: (value: string) => void;
};
```

**Uncontrolled** — component owns the state, parent gets notified:
```tsx
type UncontrolledInputProps = {
  defaultValue?: string;
  onChange?: (value: string) => void;
};
```

**Supporting both with a single component:**
```tsx
type RatingProps = {
  value?: number;
  defaultValue?: number;
  onChange?: (rating: number) => void;
};

function Rating({ value, defaultValue = 0, onChange }: RatingProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const handleChange = useCallback((rating: number) => {
    if (!isControlled) setInternalValue(rating);
    onChange?.(rating);
  }, [isControlled, onChange]);

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          isActive={star <= activeValue}
          onClick={() => handleChange(star)}
        />
      ))}
    </div>
  );
}
```

---

## Render Props

Use render props when the parent must control what gets rendered inside a child's behavior boundary.

**When to use:**
- Data-driven lists with custom item rendering
- Components that provide data/state to children without controlling their appearance
- Now largely superseded by hooks, but still valid for explicit composition

```tsx
type DataListProps<T> = {
  data: T[];
  isLoading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  keyExtractor: (item: T) => string;
};

function DataList<T>({
  data,
  isLoading,
  renderItem,
  renderEmpty = () => <EmptyState />,
  renderLoading = () => <ListSkeleton />,
  keyExtractor,
}: DataListProps<T>) {
  if (isLoading) return <>{renderLoading()}</>;
  if (!data.length) return <>{renderEmpty()}</>;

  return (
    <ul>
      {data.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

---

## Higher-Order Components

HOCs are largely superseded by hooks but remain valid for cross-cutting concerns that wrap components structurally (error boundaries, analytics instrumentation, feature flags).

**Acceptable HOC use cases:**
- `withErrorBoundary(Component)` — structural wrapping
- `withAnalytics(Component, eventConfig)` — instrumentation without render coupling
- `withFeatureFlag(Component, flagKey, FallbackComponent)` — conditional rendering

**HOC rules:**
- Always forward refs: `React.forwardRef` inside the HOC
- Always copy static methods: `hoistNonReactStatics(WrappedComponent, Component)`
- Always set a meaningful `displayName`
- Never use HOCs for logic that can be expressed as a hook

---

## Pattern Selection Guide

| Scenario | Recommended Pattern |
|---|---|
| Complex UI with multiple coordinated parts | Compound Components |
| Behavior reuse across different visual designs | Headless Hook |
| Same component, multiple semantic elements | Polymorphic Component |
| Input with optional parent state control | Controlled/Uncontrolled Dual-mode |
| Data list with custom rendering | Render Props or children function |
| Cross-cutting structural wrapping | HOC (limited use) |
| Simple shared behavior | Custom Hook |
| Optional child sections | Slot Pattern (ReactNode props) |

**Priority order for new components:**
1. Custom Hook (if pure logic)
2. Compound Component (if complex multi-part UI)
3. Headless Component (if cross-design-system flexibility needed)
4. Polymorphic Component (if semantic element flexibility needed)
5. HOC (only for structural wrapping, as last resort)

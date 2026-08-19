---
name: frontend-architecture
description: Enterprise-grade TypeScript + React frontend architecture knowledge base. Activate this skill whenever the user is working on React component design, TypeScript frontend systems, component architecture decisions, Atomic Design methodology, design system structure, component composition, folder structure planning, frontend scalability, reusable UI engineering, or component responsibility boundaries. Also trigger when the user asks about prop drilling solutions, component coupling issues, render performance, styling architecture, state management placement, or frontend anti-patterns. This skill must activate for any question involving how to structure, organize, or scale a React + TypeScript frontend codebase at the component or system level — even if the user phrases it casually like "how should I structure my components" or "is this the right way to organize things".
---

# Frontend Architecture — TypeScript + React Component Systems

## Philosophy

The goal of this skill is to apply **compositional, scalable, and maintainable** component architecture grounded in community-proven patterns. Do not invent custom patterns when industry standards exist. Favor clarity, modularity, and long-term developer experience over premature abstraction.

Read the following reference files as needed:

- `references/atomic-design.md` — Atomic Design methodology, component hierarchy, composition rules
- `references/component-patterns.md` — Compound components, render props, headless patterns, HOCs
- `references/typescript-patterns.md` — TypeScript-first engineering, prop typing, generic components, discriminated unions
- `references/anti-patterns.md` — Frontend anti-patterns, what to reject, how to refactor
- `references/folder-structure.md` — Scalable folder conventions, naming standards, barrel exports
- `references/styling-architecture.md` — CSS architecture patterns, styling anti-patterns, design token integration

---

## Core Engineering Principles

### Component Responsibility Boundary

Every component must answer a single question: **"What is this component responsible for?"**

A component that cannot be described in one sentence is doing too much. Apply Single Responsibility ruthlessly.

- A component renders UI or manages behavior — never both at the architectural level
- Separate **display logic** from **business logic** from **data-fetching logic**
- Prefer container/presentational split for complex UI with non-trivial data concerns

### Composition Over Configuration

Prefer composing smaller focused components over configuring one monolithic component via props.

**Reject this:**
```tsx
<Modal
  hasHeader
  hasFooter
  hasCloseButton
  title="..."
  footerActions={[...]}
  onClose={...}
  size="large"
  variant="warning"
/>
```

**Prefer this:**
```tsx
<Modal onClose={...}>
  <Modal.Header title="..." />
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={...}>Cancel</Button>
    <Button variant="primary" onClick={...}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

Compound component patterns directly enforce composition. Read `references/component-patterns.md` for implementation.

### Unidirectional Data Flow

State flows down. Events flow up. This is non-negotiable.

- Lift state only as high as the lowest common ancestor that needs it
- Do not reach for global state for local UI state
- Context is not a replacement for proper component hierarchy design

### Prop Stability

Unstable props cause unnecessary renders and introduce bugs.

- Define handlers outside JSX: `const handleClick = useCallback(...)` not `onClick={() => ...}` inline
- Memoize objects and arrays passed as props when their reference matters
- Avoid passing raw object literals as props at call sites

---

## Atomic Design System Overview

The Atomic Design hierarchy provides a mental model for component granularity.

```
atoms/        — Primitive, indivisible UI elements
molecules/    — Compositions of 2-5 atoms with a focused purpose
organisms/    — Domain-aware UI sections composed of molecules and atoms
templates/    — Page-level layout scaffolding (no data, only slots)
pages/        — Route-level compositions wiring templates with real data
```

**Critical rule**: Atoms have zero domain knowledge. Molecules have minimal domain awareness. Organisms own domain context. Templates own layout. Pages own data.

Read `references/atomic-design.md` for detailed rules per layer.

---

## TypeScript-First Conventions

All components, hooks, and utilities must be authored with TypeScript. Type inference is preferred where explicit annotations add noise, but prop types must always be explicit.

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Never use `any`. Never suppress TypeScript errors with `@ts-ignore` without a documented reason. Read `references/typescript-patterns.md` for generic components, discriminated unions, and polymorphic component typing.

---

## Decision Framework

When encountering a component design decision, apply this sequence:

1. **Identify the layer** — Which Atomic level does this belong to?
2. **Define the boundary** — What is the single responsibility of this component?
3. **Choose the pattern** — Compound, headless, polymorphic, or simple presentational?
4. **Type strictly** — What is the minimal, correct TypeScript interface?
5. **Check coupling** — Does this component depend on anything it shouldn't?
6. **Check testability** — Can this component be rendered in isolation?

---

## Anti-Pattern Quick Reference

Immediately flag and reject these patterns when encountered:

| Anti-Pattern | Signal | Correct Direction |
|---|---|---|
| God component | >300 LOC, 10+ props | Decompose by responsibility |
| Prop drilling >2 levels | Passing props through intermediaries | Context or component composition |
| Boolean flag explosion | `isX`, `hasY`, `showZ` accumulation | Discriminated union or compound pattern |
| Premature abstraction | Generic component too early | Inline first, abstract on 3rd repetition |
| Logic in JSX | Ternary chains, map inside map | Extract to named functions or components |
| Domain in atoms | Atom importing API types | Move to molecule/organism layer |
| Colocation neglect | Styles/tests/types scattered | Co-locate next to component file |

Read `references/anti-patterns.md` for full detail, root causes, and refactoring strategies.

---

## Folder Structure Convention

```
src/
  components/
    ui/                  ← Atomic: atoms and molecules (no domain)
      button/
        Button.tsx
        Button.types.ts
        Button.test.tsx
        index.ts
    features/            ← Organisms and feature-specific compositions
      auth/
        LoginForm/
          LoginForm.tsx
          LoginForm.types.ts
          useLoginForm.ts
          index.ts
    layouts/             ← Templates: structural scaffolding
  hooks/                 ← Shared custom hooks
  lib/                   ← Utilities, API clients, constants
  types/                 ← Global/shared TypeScript types
  pages/                 ← Route-level page components
```

Read `references/folder-structure.md` for naming conventions, barrel export rules, and feature-sliced variations.

---

## Output Standards

When providing architecture guidance, code, or reviews:

- Always justify structural decisions against one of the principles above
- Provide concrete TypeScript code, not pseudocode
- Flag anti-patterns explicitly — do not silently work around them
- When refactoring, show before and after
- When proposing component decomposition, show the full component tree
- Reference the specific atomic layer for every component discussed

# Styling Architecture — Frontend Component Systems

## Table of Contents
1. [Strategy Selection](#strategy-selection)
2. [CSS Modules](#css-modules)
3. [Tailwind CSS Integration](#tailwind-css-integration)
4. [Design Token System](#design-token-system)
5. [Class Merging Utility](#class-merging-utility)
6. [Styling Anti-Patterns](#styling-anti-patterns)
7. [Responsive Design Conventions](#responsive-design-conventions)

---

## Strategy Selection

Choose one primary styling strategy per project and enforce it consistently. Mixing multiple strategies (CSS Modules + styled-components + inline styles) creates maintenance overhead and architectural inconsistency.

| Strategy | Best for | Avoid when |
|---|---|---|
| CSS Modules | Component-scoped styles, SSR-first projects, no design system toolchain | You need dynamic styles based on JS values at runtime |
| Tailwind CSS | Rapid UI development, design-token-aligned utilities, large teams | Custom visual design far outside Tailwind's constraint system |
| CSS-in-JS (vanilla-extract, linaria) | Zero-runtime type-safe styles, design system tokens in TypeScript | Bundle size is critical, SSR complexity is undesirable |
| Styled-components / Emotion | Runtime theming, component style encapsulation with JS values | Performance-critical apps (runtime style injection cost) |

**Enterprise recommendation:** CSS Modules for component styles + CSS custom properties for design tokens, or Tailwind CSS with a curated config.

---

## CSS Modules

CSS Modules provide locally scoped class names, eliminating global name collision without requiring a runtime.

**File structure:**
```
Button/
  Button.tsx
  Button.module.css
```

**Button.module.css:**
```css
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: background-color 150ms ease, box-shadow 150ms ease;
  cursor: pointer;
}

.root:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.root[disabled],
.root[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Variants */
.primary {
  background-color: var(--color-primary-500);
  color: var(--color-white);
}

.primary:hover {
  background-color: var(--color-primary-600);
}

.secondary {
  background-color: transparent;
  border: 1px solid var(--color-neutral-300);
  color: var(--color-neutral-900);
}

.ghost {
  background-color: transparent;
  color: var(--color-primary-500);
}

/* Sizes */
.sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
.md { padding: var(--space-2) var(--space-4); font-size: var(--font-size-md); }
.lg { padding: var(--space-3) var(--space-6); font-size: var(--font-size-lg); }
```

**Button.tsx usage:**
```tsx
import styles from './Button.module.css';
import { cn } from '@/lib/utils/cn';

function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(styles.root, styles[variant], styles[size], className)}
      {...rest}
    />
  );
}
```

---

## Tailwind CSS Integration

When using Tailwind, establish conventions to prevent arbitrary class proliferation and maintain consistency.

**curated tailwind.config.ts:**
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          900: 'var(--color-primary-900)',
        },
        neutral: { ... },
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
    },
  },
};
```

Map Tailwind's scale to CSS custom properties — this keeps the design token system as the single source of truth.

**Class variant management with `cva`:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-content-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'border border-neutral-300 bg-transparent hover:bg-neutral-50',
        ghost: 'bg-transparent text-primary-500 hover:bg-primary-50',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

function Button({ variant, size, className, ...rest }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  );
}
```

---

## Design Token System

All spacing, color, typography, radius, shadow, and z-index values must be defined as CSS custom properties (tokens). No magic numbers in component styles.

**styles/tokens.css:**
```css
:root {
  /* Color primitives */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;
  
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-300: #d1d5db;
  --color-neutral-500: #6b7280;
  --color-neutral-700: #374151;
  --color-neutral-900: #111827;
  
  /* Semantic aliases */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-disabled: var(--color-neutral-300);
  --color-background: var(--color-neutral-50);
  --color-surface: #ffffff;
  --color-focus-ring: var(--color-primary-500);
  
  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Z-index scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

---

## Class Merging Utility

Use `clsx` + `tailwind-merge` combined into a `cn` utility for safe class composition:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`twMerge` ensures conflicting Tailwind classes are resolved correctly (last wins). Without it, `cn('px-4', 'px-6')` produces `px-4 px-6` — both classes remain, causing unpredictable results.

For CSS Modules projects, `clsx` alone is sufficient (no Tailwind class conflicts to resolve).

---

## Styling Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Inline styles for static values | Not cacheable, cannot be overridden, no design tokens | Use CSS classes or CSS Modules |
| `style={{ color: 'red' }}` for error states | Bypasses design system color tokens | Use semantic class names tied to tokens |
| Global class names without scoping | Name collisions, specificity wars | CSS Modules or scoped utility classes |
| CSS nesting that mirrors component tree | Creates tight CSS-to-JSX coupling, brittle | Flat class names with descriptive names |
| `!important` | Unpredictable cascade, unsalvageable override chain | Fix specificity at the source |
| Mixing em/rem/px arbitrarily | Inconsistent scaling across viewports | Use rem for all sizing via token system |
| Hardcoded hex values in components | Token drift, impossible to theme | Always reference CSS custom properties |
| Styling via JavaScript object spreading | No static analysis, no browser caching | CSS Modules or utility classes |

---

## Responsive Design Conventions

Use a mobile-first approach with consistent breakpoint tokens.

**Breakpoint tokens:**
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

**CSS Modules responsive pattern:**
```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Rule:** Never conditionally render different components for different breakpoints in React when CSS responsive rules accomplish the same result without mounting/unmounting components.

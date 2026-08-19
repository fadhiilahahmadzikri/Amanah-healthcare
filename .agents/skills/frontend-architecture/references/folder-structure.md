# Folder Structure — Scalable Frontend Conventions

## Table of Contents
1. [Standard Component-Based Structure](#standard-component-based-structure)
2. [Feature-Sliced Design Variant](#feature-sliced-design-variant)
3. [File Naming Conventions](#file-naming-conventions)
4. [Barrel Export Rules](#barrel-export-rules)
5. [Co-location Principle](#co-location-principle)
6. [Path Alias Configuration](#path-alias-configuration)

---

## Standard Component-Based Structure

```
src/
  components/
    ui/                          # Atoms and molecules — domain-agnostic
      button/
        Button.tsx
        Button.types.ts          # If types are complex enough to separate
        Button.module.css
        Button.test.tsx
        Button.stories.tsx
        index.ts
      input/
        Input.tsx
        Input.module.css
        Input.test.tsx
        index.ts
      form-field/
        FormField.tsx
        FormField.module.css
        index.ts
      select/
      modal/
      tabs/
      badge/
      avatar/
      spinner/
      tooltip/
      index.ts                   # Re-exports all ui components
    
    features/                    # Organisms — domain-aware
      auth/
        LoginForm/
          LoginForm.tsx
          LoginForm.types.ts
          useLoginForm.ts
          LoginForm.test.tsx
          index.ts
        RegisterForm/
        PasswordResetForm/
        index.ts
      
      user/
        UserProfileCard/
        UserAvatarButton/
        UserSettingsForm/
        index.ts
      
      products/
        ProductCard/
        ProductGrid/
        ProductFilters/
        index.ts
    
    layouts/                     # Templates — structural scaffolding
      DashboardLayout/
      AuthLayout/
      MarketingLayout/
      index.ts
  
  hooks/                         # Shared custom hooks
    useMediaQuery.ts
    useLocalStorage.ts
    useDebounce.ts
    useIntersectionObserver.ts
    usePrevious.ts
    index.ts
  
  lib/                           # Utilities and infrastructure
    api/
      client.ts                  # Axios/fetch instance, interceptors
      endpoints.ts               # API endpoint constants
    utils/
      cn.ts                      # Class name utility
      formatters.ts              # Date, currency, number formatters
      validators.ts              # Pure validation functions
    constants/
      routes.ts
      config.ts
  
  types/                         # Global/shared TypeScript types
    api.ts                       # API response envelope types
    common.ts                    # Shared primitive types
  
  store/                         # Global state (Zustand slices)
    useAuthStore.ts
    useUIStore.ts
  
  pages/                         # Route-level compositions (or app/ for Next.js)
    DashboardPage.tsx
    LoginPage.tsx
    ProductsPage.tsx
  
  styles/                        # Global styles only
    globals.css
    tokens.css                   # CSS custom properties for design tokens
    reset.css
```

---

## Feature-Sliced Design Variant

For larger applications, Feature-Sliced Design (FSD) provides stronger architectural boundaries. Layers are strictly ordered — each layer can only import from layers below it.

```
src/
  app/                           # App initialization, providers, routing
    providers/
    router/
    styles/
  
  pages/                         # Route-level page compositions
    dashboard/
    auth/
    products/
  
  widgets/                       # Composite UI blocks (FSD equivalent of organisms)
    sidebar/
    header/
    product-catalog/
  
  features/                      # User interaction units with business logic
    auth/
      ui/
      model/                     # State, effects, selectors
      api/                       # API calls for this feature
      lib/                       # Feature-specific utilities
      index.ts                   # Public API of the feature
    cart/
    search/
  
  entities/                      # Business entities and their UI representations
    user/
      ui/
      model/
      api/
      index.ts
    product/
    order/
  
  shared/                        # Domain-agnostic, truly reusable code
    ui/                          # Atoms and molecules
    api/                         # Base API client
    lib/                         # Utilities
    types/                       # Primitive types
    config/                      # Environment config
```

**FSD import rule (strict):** `app` → `pages` → `widgets` → `features` → `entities` → `shared`. Never import upward.

---

## File Naming Conventions

| File type | Convention | Example |
|---|---|---|
| React component | PascalCase | `UserProfileCard.tsx` |
| Custom hook | camelCase with `use` prefix | `useUserProfile.ts` |
| Utility function | camelCase | `formatCurrency.ts` |
| Type definition | camelCase or PascalCase | `user.types.ts` or `UserTypes.ts` |
| CSS Module | Matches component name | `UserProfileCard.module.css` |
| Test file | Matches source file | `UserProfileCard.test.tsx` |
| Story file | Matches component name | `UserProfileCard.stories.tsx` |
| Constants | camelCase or SCREAMING_SNAKE | `routes.ts` or `API_ENDPOINTS.ts` |
| Index barrel | always lowercase | `index.ts` |

**Directory names:** kebab-case for folders, matching the primary export name when it contains a single component.

---

## Barrel Export Rules

Barrel files (`index.ts`) simplify import paths. Follow these rules strictly:

**Do create barrels for:**
- Component directories (exposing the component and its types)
- Feature directories (exposing the public API of a feature)
- Shared utility directories

**Component barrel pattern:**
```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

**Feature barrel pattern (public API only):**
```ts
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export type { LoginFormProps } from './LoginForm/LoginForm.types';
// Do NOT export internal hooks, utilities, or private types
```

**UI library barrel:**
```ts
export { Button } from './button';
export { Input } from './input';
export { FormField } from './form-field';
export { Modal } from './modal';
export { Tabs } from './tabs';
export type { ButtonProps, ButtonVariant } from './button';
export type { InputProps } from './input';
```

**Do NOT create barrels that:**
- Re-export everything from every file (`export * from './...'`) — prevents tree shaking
- Create circular dependency chains
- Expose internal implementation details of a feature
- Create deep barrel chains (barrel imports barrel imports barrel)

---

## Co-location Principle

Co-locate everything related to a component next to the component file itself. Do not create deep, separated `__tests__/`, `__styles__/`, or `__types__/` directories.

**Correct:**
```
components/ui/button/
  Button.tsx
  Button.module.css
  Button.test.tsx
  Button.stories.tsx
  index.ts
```

**Incorrect:**
```
components/ui/
  Button.tsx
src/__tests__/ui/
  Button.test.tsx
src/styles/ui/
  Button.module.css
```

**Exception:** Global shared types, global utilities, and application-wide configuration belong in their own top-level directories (`types/`, `lib/`, `styles/`) because they have no single owning component.

---

## Path Alias Configuration

Configure `@/*` as the `src/` alias across TypeScript, bundler, and test runner for consistent imports.

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts:**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
});
```

**vitest.config.ts:**
```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: 'jsdom' },
});
```

**Import usage:**
```ts
import { Button } from '@/components/ui';
import { useUser } from '@/features/user';
import { formatDate } from '@/lib/utils/formatters';
import type { User } from '@/types/api';
```

Never use relative imports that traverse more than one directory level up (`../../..`). The alias eliminates this pattern.

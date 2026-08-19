# Suspense Boundaries

Client hooks that cause CSR bailout without Suspense boundaries.

## useSearchParams

Always requires Suspense boundary in static routes. Without it, the entire page becomes client-side rendered.

```tsx

'use client';

import { useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const searchParams = useSearchParams();
  return <div>Query: {searchParams.get('q')}</div>;
}
```

```tsx

import { Suspense } from 'react';
import SearchBar from './search-bar';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchBar />
    </Suspense>
  );
}
```

## usePathname

Requires Suspense boundary when route has dynamic parameters.

```tsx

'use client';
import { usePathname } from 'next/navigation';

export function Breadcrumb() {
  const pathname = usePathname();
  return <nav>{pathname}</nav>;
}
```

```tsx

<Suspense fallback={<BreadcrumbSkeleton />}>
  <Breadcrumb />
</Suspense>
```

If you use `generateStaticParams`, Suspense is optional.

## Quick Reference

| Hook                | Suspense Required    |
| ------------------- | -------------------- |
| `useSearchParams()` | Yes                  |
| `usePathname()`     | Yes (dynamic routes) |
| `useParams()`       | No                   |
| `useRouter()`       | No                   |

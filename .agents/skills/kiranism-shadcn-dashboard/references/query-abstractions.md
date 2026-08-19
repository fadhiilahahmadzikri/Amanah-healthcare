# TanStack Query Abstractions (v5)

The core insight: **`queryOptions` and `mutationOptions` are the right abstraction — not custom hooks.**

---

## Query Abstraction

### The Pattern

```ts

import { queryOptions } from '@tanstack/react-query';

export function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id)
  });
}

export function invoiceListOptions(filters: InvoiceFilters) {
  return queryOptions({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
    staleTime: 30_000
  });
}
```

### Usage — always compose at the call site

```ts

const { data } = useQuery(invoiceOptions(id));

const { data } = useSuspenseQuery(invoiceOptions(id));

const { data } = useQuery({
  ...invoiceOptions(id),
  select: (invoice) => invoice.createdAt,
  enabled: !!id
});

await queryClient.prefetchQuery(invoiceOptions(id));

const invoice = queryClient.getQueryData(invoiceOptions(id).queryKey);

queryClient.invalidateQueries({ queryKey: invoiceOptions(id).queryKey });
```

### Why NOT a custom hook

Custom hooks like `useInvoice(id)` have three critical problems:

1. **Hooks only work in components/hooks** — but queries are now used in route loaders, server prefetching, event handlers, and server components. `queryOptions` is just a plain function — works anywhere.
2. **They share logic, not configuration** — what you actually want to share is the `queryKey` + `queryFn` config. Hooks are the wrong primitive for that.
3. **They lock you to one hook** — you can't use `useInvoice()` with `useSuspenseQuery`, `useQueries`, or imperative `queryClient` methods.

### Why NOT `UseQueryOptions` type directly

```ts

function useInvoice(id: number, options?: Partial<UseQueryOptions>) { ... }

function useInvoice(id: number, options?: Partial<UseQueryOptions<Invoice>>) { ... }

```

`queryOptions` solves this via a `DataTag` symbol on the queryKey — full inference, zero manual generics.

### Custom hooks are still fine on top

If a component always uses the same composition, a hook is fine — but build it _on top of_ `queryOptions`:

```ts

function useInvoice(id: number) {
  return useQuery(invoiceOptions(id));
}

function useInvoiceWithSuspense(id: number) {
  return useSuspenseQuery(invoiceOptions(id));
}
```

---

## Mutation Abstraction

### The Pattern

```ts

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export const createInvoiceMutation = mutationOptions({
  mutationFn: (data: CreateInvoiceInput) => createInvoice(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: ['invoices'] });
  }
});

export const updateInvoiceMutation = mutationOptions({
  mutationFn: ({ id, ...data }: UpdateInvoiceInput) => updateInvoice(id, data),
  onSuccess: (updated) => {
    const qc = getQueryClient();
    qc.setQueryData(invoiceOptions(updated.id).queryKey, updated);
    qc.invalidateQueries({ queryKey: ['invoices'] });
  }
});
```

> **Note on queryClient**: Import `getQueryClient()` directly — do NOT pass `queryClient` as a function argument. The `getQueryClient()` pattern handles both SSR (fresh per request) and client (singleton) correctly.

### Usage

```ts

const { mutate } = useMutation(createInvoiceMutation);

const { mutate } = useMutation({
  ...createInvoiceMutation,
  onError: (err) => toast.error(err.message),
  onSuccess: (data) => {

    router.push(`/invoices/${data.id}`);
  }
});
```

---

## Rules Summary

| Rule                                                          | Reason                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Use `queryOptions()` not custom hooks as the base abstraction | Works everywhere — loaders, server, imperative calls                   |
| Keep options factories lean — no extra config params          | Best abstractions are not configurable                                 |
| Compose extra options at the call site via spread             | Full TS inference without manual generics                              |
| Import `getQueryClient()` in mutation files                   | Handles SSR/client correctly without prop drilling                     |
| Co-locate `queryKey` inside `queryOptions`                    | Typed key reuse in `invalidateQueries`, `setQueryData`, `getQueryData` |
| Custom hooks are fine — but built ON TOP of `queryOptions`    | Hooks for component convenience, `queryOptions` for sharing config     |

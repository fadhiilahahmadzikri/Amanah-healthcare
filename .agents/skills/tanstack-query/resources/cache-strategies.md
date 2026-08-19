# Cache Management Strategies

## Cache Time Configuration

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000
});
```

## Cache Invalidation

### Invalidate Specific Queries

```typescript
const queryClient = useQueryClient();

queryClient.invalidateQueries({ queryKey: ['posts'] });

queryClient.invalidateQueries({ queryKey: ['post', postId] });

queryClient.invalidateQueries({
  queryKey: ['posts'],
  exact: true
});
```

### Invalidate on Mutation

```typescript
const { mutate } = useMutation({
  mutationFn: createPost,
  onSuccess: () => {

    queryClient.invalidateQueries({ queryKey: ['posts'] });
  }
});
```

## Manual Cache Updates

### Set Query Data

```typescript

queryClient.setQueryData(['post', postId], (oldData) => ({
  ...oldData,
  title: 'New Title'
}));

queryClient.setQueryData(['post', postId], newPost);
```

### Get Query Data

```typescript

const cachedPost = queryClient.getQueryData(['post', postId]);

const { data } = useQuery({
  queryKey: ['post', postId],
  queryFn: () => fetchPost(postId),
  initialData: () => queryClient.getQueryData(['posts'])?.find((p) => p.id === postId)
});
```

## Refetch Strategies

### Refetch on Window Focus

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  refetchOnWindowFocus: true
});
```

### Refetch on Reconnect

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  refetchOnReconnect: true
});
```

### Refetch Intervals

```typescript
const { data } = useQuery({
  queryKey: ['live-data'],
  queryFn: fetchLiveData,
  refetchInterval: 5000,
  refetchIntervalInBackground: false
});
```

## Cache Persistence

### Persist to localStorage

```typescript
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24
    }
  }
});

const persister = createSyncStoragePersister({
  storage: window.localStorage
});

<PersistQueryClientProvider
  client={queryClient}
  persister={persister}
>
  <App />
</PersistQueryClientProvider>
```

## Cache Deduplication

### Automatic Request Deduplication

```typescript

function Component1() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });
}

function Component2() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });
}
```

## Cache Preloading

### Prefetch Queries

```typescript
const queryClient = useQueryClient();

const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId)
  });
};

router.beforeEach(async (to, from, next) => {
  await queryClient.prefetchQuery({
    queryKey: ['user', to.params.userId],
    queryFn: () => fetchUser(to.params.userId)
  });
  next();
});
```

### Ensure Query Data

```typescript

await queryClient.ensureQueryData({
  queryKey: ['post', postId],
  queryFn: () => fetchPost(postId)
});
```

## Selective Cache Updates

### Update Nested Data

```typescript
queryClient.setQueryData(['posts'], (oldPosts) => {
  return oldPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post));
});
```

### Add to List Cache

```typescript

queryClient.setQueryData(['posts'], (oldPosts = []) => {
  return [newPost, ...oldPosts];
});
```

### Remove from List Cache

```typescript

queryClient.setQueryData(['posts'], (oldPosts) => {
  return oldPosts.filter((post) => post.id !== deletedPostId);
});
```

## Cache Debugging

### React Query Devtools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Query Cache Events

```typescript
const queryCache = queryClient.getQueryCache();

queryCache.subscribe((event) => {
  console.log('Query cache event:', event.type, event.query.queryKey);
});
```

## Best Practices

1. **Set Appropriate staleTime** - Balance freshness vs performance
2. **Use Invalidation Over Refetch** - Let queries refetch when needed
3. **Prefetch Predictably** - Preload data on hover/intent
4. **Update Cache on Mutations** - Keep UI in sync
5. **Use Devtools** - Debug cache issues visually
6. **Persist Important Data** - Save to localStorage for offline support
7. **Deduplicate Requests** - Rely on automatic deduplication

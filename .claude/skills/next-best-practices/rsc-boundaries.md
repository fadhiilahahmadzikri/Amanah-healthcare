# RSC Boundaries

Detect and prevent invalid patterns when crossing Server/Client component boundaries.

## Detection Rules

### 1. Async Client Components Are Invalid

Client components **cannot** be async functions. Only Server Components can be async.

**Detect:** File has `'use client'` AND component is `async function` or returns `Promise`

```tsx

'use client';
export default async function UserProfile() {
  const user = await getUser();
  return <div>{user.name}</div>;
}

export default async function Page() {
  const user = await getUser();
  return <UserProfile user={user} />;
}

('use client');
export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

```tsx

'use client';
const Dashboard = async () => {
  const data = await fetchDashboard();
  return <div>{data}</div>;
};

```

### 2. Non-Serializable Props to Client Components

Props passed from Server → Client must be JSON-serializable.

**Detect:** Server component passes these to a client component:

- Functions (except Server Actions with `'use server'`)
- `Date` objects
- `Map`, `Set`, `WeakMap`, `WeakSet`
- Class instances
- `Symbol` (unless globally registered)
- Circular references

```tsx

export default function Page() {
  const handleClick = () => console.log('clicked');
  return <ClientButton onClick={handleClick} />;
}

('use client');
export function ClientButton() {
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click</button>;
}
```

```tsx

export default async function Page() {
  const post = await getPost();
  return <PostCard createdAt={post.createdAt} />;
}

('use client');
export function PostCard({ createdAt }: { createdAt: Date }) {
  return <span>{createdAt.getFullYear()}</span>;
}

export default async function Page() {
  const post = await getPost();
  return <PostCard createdAt={post.createdAt.toISOString()} />;
}

('use client');
export function PostCard({ createdAt }: { createdAt: string }) {
  const date = new Date(createdAt);
  return <span>{date.getFullYear()}</span>;
}
```

```tsx

const user = new UserModel(data)
<ClientProfile user={user} />

const user = await getUser()
<ClientProfile user={{ id: user.id, name: user.name }} />
```

```tsx

<ClientComponent items={new Map([['a', 1]])} />

<ClientComponent items={Object.fromEntries(map)} />
<ClientComponent items={Array.from(set)} />
```

### 3. Server Actions Are the Exception

Functions marked with `'use server'` CAN be passed to client components.

```tsx

'use server';
export async function submitForm(formData: FormData) {

}

import { submitForm } from './actions';
export default function Page() {
  return <ClientForm onSubmit={submitForm} />;
}

('use client');
export function ClientForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  return <form action={onSubmit}>...</form>;
}
```

## Quick Reference

| Pattern                           | Valid? | Fix                                   |
| --------------------------------- | ------ | ------------------------------------- |
| `'use client'` + `async function` | No     | Fetch in server parent, pass data     |
| Pass `() => {}` to client         | No     | Define in client or use server action |
| Pass `new Date()` to client       | No     | Use `.toISOString()`                  |
| Pass `new Map()` to client        | No     | Convert to object/array               |
| Pass class instance to client     | No     | Pass plain object                     |
| Pass server action to client      | Yes    | -                                     |
| Pass `string/number/boolean`      | Yes    | -                                     |
| Pass plain object/array           | Yes    | -                                     |

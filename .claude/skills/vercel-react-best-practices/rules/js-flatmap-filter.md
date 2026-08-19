---
title: Use flatMap to Map and Filter in One Pass
impact: LOW-MEDIUM
impactDescription: eliminates intermediate array
tags: javascript, arrays, flatMap, filter, performance
---

## Use flatMap to Map and Filter in One Pass

**Impact: LOW-MEDIUM (eliminates intermediate array)**

Chaining `.map().filter(Boolean)` creates an intermediate array and iterates twice. Use `.flatMap()` to transform and filter in a single pass.

**Incorrect (2 iterations, intermediate array):**

```typescript
const userNames = users.map((user) => (user.isActive ? user.name : null)).filter(Boolean);
```

**Correct (1 iteration, no intermediate array):**

```typescript
const userNames = users.flatMap((user) => (user.isActive ? [user.name] : []));
```

**More examples:**

```typescript

const emails = responses.map((r) => (r.success ? r.data.email : null)).filter(Boolean);

const emails = responses.flatMap((r) => (r.success ? [r.data.email] : []));

const numbers = strings.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));

const numbers = strings.flatMap((s) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? [] : [n];
});
```

**When to use:**

- Transforming items while filtering some out
- Conditional mapping where some inputs produce no output
- Parsing/validating where invalid inputs should be skipped

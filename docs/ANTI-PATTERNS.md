# ANTI-PATTERNS.md — Refusal Catalog

> **Purpose:** a named list of things an agent must recognize and refuse.
> **Usage rule:** if a requested change matches an entry here, do not implement it silently — name the anti-pattern, state the sanctioned alternative from [`PARADIGMS.md`](./PARADIGMS.md), and propose the compliant version.
> Entries marked **⛔** are automatic merge blockers.

---

## A. Structure & boundaries

1. ⛔ Big Ball of Mud
2. ⛔ Spaghetti Code
3. Lasagna Code (layers with no distinct responsibility)
4. Ravioli Code (atomised modules, no narrative)
5. ⛔ God Object / God Service / God Module
6. ⛔ Fat Route Handler (logic inside `app/**`)
7. ⛔ Business logic in `page.tsx` or in a component
8. ⛔ Mixing presentation and transport in one file
9. ⛔ Package-by-layer at the feature level (`components/`, `hooks/`, `types/` as the primary axis)
10. ⛔ Cross-feature sibling imports
11. ⛔ Circular dependencies
12. ⛔ Barrel-file explosion (re-export everything, kill tree-shaking, create cycles)
13. ⛔ Deep relative imports (`../../../../server/http`)
14. ⛔ `utils.ts` / `helpers.ts` / `common.ts` dumping grounds
15. Shotgun Surgery (one change, twenty files)
16. Feature Envy (a module that only reads another's data)
17. Inappropriate Intimacy (layers reaching into each other's internals)
18. Middle Man (a layer that only forwards calls)
19. Refused Bequest (inheriting an interface you do not honour)
20. Yo-Yo Problem (indirection so deep nobody can trace a call)
21. Distributed Monolith (two repos that must deploy together)
22. Leaky Abstraction (HTTP concepts visible in the UI)
23. Premature Abstraction / Speculative Generality
24. Golden Hammer (one pattern applied everywhere)
25. Inner-Platform Effect (rebuilding Next.js inside Next.js)
26. Copy-Paste Programming
27. Boat Anchor / Dead Code
28. Lava Flow (obsolete code nobody dares delete)

## B. Contracts & typing

29. ⛔ Hardcoded URL / magic string outside `server/api/endpoints.ts`
30. ⛔ Template-literal URL building at call sites
31. ⛔ `await res.json()` consumed without schema parsing
32. ⛔ `as SomeType` cast on network data
33. ⛔ `any` / `@ts-ignore` / `@ts-expect-error` as an escape hatch
34. ⛔ Zombie Types (types that no longer match runtime reality)
35. ⛔ Hand-duplicated DTOs kept in sync manually
36. ⛔ Passing DTOs into components
37. Mirroring upstream fields the app never uses (violates Tolerant Reader)
38. Primitive Obsession (raw `string` for IDs, money, dates)
39. Stringly-Typed logic (string comparison as control flow)
40. Boolean Trap (positional boolean parameters)
41. Optional-everything schemas (`z.any()`, `.partial()` everywhere)
42. Editing generated files by hand
43. Contract drift tolerated until runtime discovers it
44. Breaking change shipped without Expand–Contract

## C. Data fetching, caching & state

45. ⛔ `fetch` called outside `server/http/`
46. ⛔ A second, parallel HTTP client "just for this one call"
47. ⛔ `useEffect` + `fetch` for data a Server Component could load
48. ⛔ Server Component importing a repository or service directly
49. ⛔ Client component importing a loader
50. Request Waterfall (sequential awaits that could be parallel)
51. N+1 Requests (fetch inside a map)
52. Over-fetching / Under-fetching
53. Chatty Interface (ten calls to render one screen)
54. ⛔ Cache-everything or cache-nothing by default
55. Untagged cache entries (nothing can be invalidated)
56. Stale-Forever cache (write with no revalidation)
57. Cache Stampede / Thundering Herd on expiry
58. ⛔ Cross-request singleton holding user data (state leak between users)
59. Double state (server data copied into client state and diverging)
60. Derived data stored instead of computed
61. Unbounded pagination (`limit=99999`, "fetch all")
62. Client-side filtering of a dataset the server should filter
63. Prop drilling as an architecture
64. Global store used as a network cache
65. Optimistic update with no rollback path

## D. Errors & resilience

66. ⛔ Silent catch (`catch {}` / `catch (e) { console.log(e) }`)
67. ⛔ Throwing raw upstream errors to the UI
68. ⛔ Fetch with no timeout
69. ⛔ Blind retry of a non-idempotent write
70. Infinite retry / retry amplification during an outage
71. Retry Storm without backoff or jitter
72. Error message parsed as control flow
73. Unmapped error path (`default:` that swallows)
74. Generic "Something went wrong" for every failure class
75. Exceptions used for expected business outcomes
76. Missing cancellation (abandoned requests keep running)
77. Alert-on-everything / alert-on-nothing
78. Happy-Path-Only implementation

## E. Security & configuration

79. ⛔ Secret exposed via `NEXT_PUBLIC_*`
80. ⛔ Bearer token stored in `localStorage` / readable cookie
81. ⛔ `process.env` read outside `core/config/`
82. ⛔ Server Action without auth guard and input parsing
83. ⛔ Authorization enforced only by hiding the UI control
84. ⛔ PII or tokens written to logs
85. Trusting client-supplied IDs, roles, prices, or totals
86. Direct browser calls to the NestJS origin with credentials
87. Unvalidated redirect / open redirect
88. User-controlled URL passed to server-side fetch (SSRF)
89. `dangerouslySetInnerHTML` on upstream content
90. CORS wildcard as a fix for a design problem
91. Snowflake environment / works-on-my-machine config
92. Config sprawl (the same setting defined in three files)
93. Secrets committed, rotated never

## F. Process & quality

94. ⛔ Endpoint installed without a `docs/ENDPOINT-MAP.md` row
95. ⛔ Merging without the Definition of Done
96. Assertion-free tests
97. Testing implementation details (mocking what you don't own)
98. Flaky tests tolerated / skipped tests accumulating
99. Non-deterministic tests (real clock, real network, real randomness)
100. Snapshot tests approved without reading the diff
101. TODO-Driven Development
102. Commented-out code committed
103. Adding a dependency to work around a boundary rule
104. Bypassing lint with inline disables
105. Cargo Cult Programming (a pattern copied without its reason)
106. Bikeshedding structure while the contract is undefined
107. Refactoring and feature work in one commit
108. Version drift between the NestJS and Next.js repos, undocumented
109. Architecture decided in chat, recorded nowhere (no ADR)
110. "Temporary" workaround with no owner and no expiry

---

## Refusal script for agents

> This request matches **#\<n\> \<anti-pattern name\>** from `ANTI-PATTERNS.md`.
> The sanctioned alternative is **\<paradigm name\>** (`PARADIGMS.md` #\<n\>).
> Compliant version: **\<the smallest correct change, expressed as a file manifest\>**.
> Proceed?

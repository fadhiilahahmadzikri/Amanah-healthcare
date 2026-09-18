# PARADIGMS.md — Best-Practice Catalog

> **Purpose:** a lookup index, not a tutorial. Each entry is a *name to reach for*. If you do not know the name, look it up before writing code.
> **Usage rule:** when installing an endpoint (see [`AGENTS.md`](../AGENTS.md) §9), name the paradigms you are applying at each step.
> Entries marked **★** are mandatory in this repository.

---

## A. Architectural styles

1. ★ Hexagonal Architecture (Ports & Adapters)
2. ★ Clean Architecture
3. Onion Architecture
4. Layered / N-Tier Architecture
5. ★ Vertical Slice Architecture
6. Feature-Sliced Design (FSD)
7. Screaming Architecture
8. ★ Package by Feature (not by layer)
9. Modular Monolith
10. ★ Backend-for-Frontend (BFF)
11. ★ Anti-Corruption Layer (ACL)
12. API Gateway pattern
13. Strangler Fig (incremental migration)
14. Micro-frontend (only with an ADR)
15. Composition Root
16. Plugin Architecture
17. Event-Driven Architecture
18. Hexagonal testing seams

## B. Domain modelling

19. Domain-Driven Design (strategic + tactical)
20. ★ Bounded Context
21. ★ Ubiquitous Language
22. Context Mapping
23. Entity
24. ★ Value Object
25. Aggregate / Aggregate Root
26. Domain Event
27. ★ Invariant enforcement
28. ★ Specification Pattern
29. Factory Method for entity creation
30. Anemic vs Rich Domain Model (choose deliberately)
31. Published Language
32. Conformist / Customer-Supplier relationship

## C. Core design principles

33. ★ Single Responsibility Principle (SRP)
34. ★ Open/Closed Principle
35. Liskov Substitution Principle
36. ★ Interface Segregation Principle
37. ★ Dependency Inversion Principle
38. ★ Single Source of Truth (SSOT)
39. ★ Separation of Concerns
40. ★ High Cohesion, Low Coupling
41. DRY
42. Rule of Three (before abstracting)
43. KISS
44. ★ YAGNI
45. ★ Law of Demeter / Principle of Least Knowledge
46. Tell, Don't Ask
47. ★ Command–Query Separation (CQS)
48. ★ Principle of Least Privilege
49. Principle of Least Astonishment
50. Encapsulation / Information Hiding
51. ★ Composition over Inheritance
52. Orthogonality
53. ★ Explicit over Implicit
54. Convention over Configuration
55. ★ Locality of Behaviour
56. ★ Colocation Principle
57. Stable Dependencies Principle
58. ★ Acyclic Dependencies Principle
59. Common Closure Principle
60. Common Reuse Principle
61. Boy Scout Rule
62. Fail Fast
63. Fail Safe / Graceful Degradation
64. Design by Contract
65. Robustness Principle (Postel's Law)
66. ★ Idempotency
67. Referential Transparency / Purity
68. ★ Immutability by default
69. Determinism (injectable clock, seeded randomness)
70. Total Functions (no partial behaviour)

## D. Structural & behavioural patterns

71. ★ Repository Pattern
72. ★ Data Mapper
73. ★ DTO (Data Transfer Object)
74. Adapter
75. Facade
76. Remote Facade / Gateway
77. Proxy
78. Decorator
79. ★ Strategy
80. Factory / Abstract Factory
81. Builder
82. ★ Chain of Responsibility (interceptor pipeline)
83. ★ Middleware / Pipeline Pattern
84. Command
85. Query Object
86. Mediator
87. Observer
88. Registry
89. Null Object
90. Template Method
91. State Pattern
92. Memento (undo / optimistic rollback)
93. Unit of Work
94. ★ Dependency Injection
95. ★ Inversion of Control
96. Lazy Initialization
97. Object Pool / Connection reuse

## E. Type system & contracts

98. ★ Contract-First / Schema-First development
99. ★ OpenAPI codegen (generated code is read-only)
100. ★ Parse, Don't Validate
101. ★ Runtime validation at the boundary (zod / valibot)
102. ★ Schema as SSOT + type inference
103. ★ Branded / Nominal Types
104. ★ Discriminated Unions (tagged unions)
105. ★ Exhaustiveness Checking (`assertNever`)
106. ★ Make Illegal States Unrepresentable
107. Type Guards / Type Predicates
108. Opaque Types
109. Phantom Types
110. `readonly` / `as const` / deep-freeze
111. ★ Tolerant Reader
112. Consumer-Driven Contract Testing (Pact)
113. Semantic Versioning of contracts
114. Backward & forward compatibility
115. Expand–Contract (parallel change) migration
116. Zero-`any` policy
117. `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
118. Type-only imports (`import type`)

## F. Data fetching & rendering (Next.js)

119. ★ React Server Components (RSC)
120. ★ Server Actions
121. Server-Side Rendering (SSR)
122. Static Site Generation (SSG)
123. Incremental Static Regeneration (ISR)
124. Partial Prerendering (PPR)
125. ★ Streaming + Suspense boundaries
126. Progressive Enhancement
127. Selective / Progressive Hydration
128. ★ Request Memoization (per-request dedup)
129. ★ Data Cache / Full Route Cache / Router Cache
130. ★ Cache Tagging + on-demand revalidation
131. Time-based revalidation
132. ★ Stale-While-Revalidate
133. Cache-Aside Pattern
134. ★ Parallel data fetching (waterfall elimination)
135. Preload / Prefetch Pattern
136. ★ Server State vs Client State separation
137. Query Key Factory
138. Optimistic UI / `useOptimistic`
139. Optimistic Concurrency Control (ETag / version)
140. Normalized client state
141. Derived state via selectors (no duplicated state)
142. Pagination: offset · cursor · keyset
143. Infinite scroll with stable cursors
144. DataLoader-style batching (N+1 avoidance)
145. Polling · Long-polling · SSE · WebSocket (choose by need)
146. Skeleton / placeholder strategy
147. Error Boundary per route segment
148. Route Groups & layout-level composition
149. Edge vs Node runtime selection
150. `server-only` / `client-only` module boundary

## G. Resilience & networking

151. ★ Timeout budget / Deadline propagation
152. ★ Retry with exponential backoff + full jitter
153. Retry only idempotent operations
154. ★ Idempotency Keys for writes
155. Circuit Breaker
156. Bulkhead Isolation
157. Rate Limiting / Throttling / Debounce
158. Backpressure
159. ★ Request cancellation (`AbortController`)
160. Fallback / Default response
161. Hedged requests (use sparingly)
162. Cache stampede prevention (request coalescing)
163. Graceful degradation tiers
164. Health check / readiness signal
165. Feature Flags / Kill Switch
166. Connection keep-alive / agent reuse

## H. Error handling

167. ★ Result / Either type (no throw across boundaries)
168. ★ Typed error taxonomy with error codes
169. ★ Problem Details (RFC 9457 / RFC 7807)
170. Error mapping table (HTTP status → domain error)
171. Sentinel errors
172. Error enrichment with context (never with PII)
173. Never swallow an error
174. Distinguish expected failures from defects
175. User-facing message via i18n key, never a raw error string

## I. Security

176. ★ Zero Trust / server-side re-authorization
177. ★ httpOnly · Secure · SameSite cookie sessions
178. ★ Token relay via BFF (no bearer token in the browser)
179. Token rotation & refresh serialization
180. RBAC / ABAC policy objects
181. CSRF protection for mutations
182. CORS as a deliberate configuration
183. SSRF prevention on server-side URL handling
184. Output encoding / XSS prevention
185. Content Security Policy + nonce
186. ★ Secret isolation (`server-only`, no `NEXT_PUBLIC_` secrets)
187. ★ PII redaction in logs
188. Input allow-listing over deny-listing
189. Dependency audit / SBOM / lockfile integrity
190. Subresource Integrity

## J. Observability

191. ★ Structured logging (JSON, event names)
192. ★ Correlation ID / trace context propagation
193. Distributed tracing (OpenTelemetry spans)
194. RED metrics (Rate, Errors, Duration)
195. USE metrics for resources
196. Log levels with meaning
197. Sampling strategy
198. Error reporting with source maps
199. Web Vitals monitoring (LCP, INP, CLS)

## K. Testing & quality

200. Test Pyramid
201. AAA (Arrange–Act–Assert)
202. Test behaviour, not implementation
203. ★ MSW for network mocking (mock the protocol, not the client)
204. ★ Contract tests against upstream fixtures
205. Table-driven tests for mappers
206. Fixture / Object Mother / Test Data Builder
207. Deterministic tests (fake clock, seeded IDs)
208. Zero tolerance for flaky tests
209. Mutation testing
210. Golden / snapshot tests (sparingly, reviewed)
211. Accessibility testing (axe, roles, labels)
212. Visual regression (for the design system only)
213. Smoke E2E on critical paths

## L. Delivery, governance & hygiene

214. ★ Architecture Decision Records (ADR)
215. Conventional Commits
216. Trunk-based development / short-lived branches
217. CODEOWNERS per directory
218. Boundary linting (`dependency-cruiser`, `eslint-plugin-boundaries`)
219. Import path aliases only (no deep relative paths)
220. Curated barrels (public surface per slice)
221. Twelve-Factor config
222. Fail-fast env validation at boot
223. Reproducible builds / lockfile committed
224. Codegen artifacts committed and diffed in CI
225. Dead-code elimination / knip
226. Bundle budget enforcement
227. Definition of Done as a merge gate
228. Documentation-as-code (this catalog is part of the build)

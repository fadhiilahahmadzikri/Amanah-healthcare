# Schema and API design conventions (Phase 2)

Conventions to apply once Phase 1 has given you a feature list and evidence of their data shapes. None of these override evidence from the actual frontend code — if the frontend already expects something that conflicts with a convention below, the frontend wins (and say so in the report), because changing a convention is free and changing frontend code the person didn't ask you to touch is not.

## Schema conventions

**Primary keys.** Default to UUID primary keys unless the repo already shows a preference for auto-incrementing integers (check any existing entities/migrations, or ask if it's genuinely unclear — see "open questions" in the report template). UUIDs avoid leaking sequential IDs through a public API, which matters more once real users show up.

**Timestamps.** Add `created_at` and `updated_at` to every table by default — cheap, close to always useful, and rarely wrong to include. Only add `deleted_at` (soft delete) if the frontend shows evidence of needing it — an archive/restore/trash UI, a "deleted" filter. Don't add it speculatively; it complicates every query that follows.

**Relations.** Infer from how the UI nests things. A Tasks view scoped under a specific Project (e.g., `/projects/:id/tasks`, or a Tasks list rendered inside a Project detail page) implies `Task.project_id` as a foreign key to `Project`. A multi-select/tag/chip UI where items can belong to several groups at once (e.g., a task with several labels) implies a many-to-many relation and a junction table, not a single foreign key.

**Enums vs. free text.** A fixed set of options in the UI (a `<select>`, a set of status pills/badges with a closed set of colors) implies an enum or a check constraint. An open text input implies `text`/`varchar`. When you're not sure whether a set is meant to be closed or will grow, note it as an assumption rather than silently picking one.

**Naming.** Match whatever convention the repo already has if any backend/database artifact already exists. Otherwise: snake_case for table and column names is the common convention on the Postgres/MySQL side regardless of ORM; entity class properties in TypeScript are typically still camelCase, with the ORM handling the mapping (a naming strategy in TypeORM, or `@map`/`@@map` in Prisma).

**Auth.** Only design a `users` table and an auth flow if the frontend actually shows login/signup/session-gated views. Don't add authentication speculatively — it's a substantial addition to the plan and should be an explicit line item the person agrees to, not something bundled in by default.

## API conventions

**Resource-oriented paths.** `/projects`, `/projects/:id`, `/projects/:id/tasks` — standard REST verbs (GET for list/detail, POST to create, PATCH for partial update, DELETE to remove). Nest a route under its parent when the UI treats it as scoped that way (tasks-of-a-project), rather than a flat `/tasks?projectId=` unless that's what the frontend already calls.

**Match the frontend's existing contract first.** If Phase 1 turned up an actual `fetch`/`axios`/query-hook call with a real path and payload shape, that *is* the contract — implement to it, even if a purist would design it slightly differently. If you do deviate from it for a good reason (the existing call was clearly a placeholder, or genuinely inconsistent with itself across two components), call that out explicitly in the report rather than quietly "fixing" it.

**Pagination and filtering.** Only include if the UI shows evidence of it — a paginator, a search box, filter controls. Don't add `?page=&limit=` to every list endpoint by default if the frontend just renders a full list.

**DTOs and validation.** Mirror what the forms already validate — required fields, max lengths, format constraints (email, URL) — using `class-validator` decorators. This keeps server-side validation from being stricter or looser than what the user already experiences client-side, which avoids a confusing mismatch.

**Standard NestJS shape per feature.** Each feature typically becomes one module: a controller, a service, an entity (TypeORM) or model block (Prisma schema), and a create/update DTO pair. It's fine — encouraged, even — to preview this in the plan report (e.g., "this becomes a `projects` module with the endpoints below") so the person can see roughly what Phase 3 will produce, without actually generating any files yet.

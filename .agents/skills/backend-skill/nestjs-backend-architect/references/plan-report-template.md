# Plan report template (end of Phase 2)

Use this structure for the write-up you present at the end of Phase 2. Consistency matters more than creativity here — the person will read several of these over the life of the project, and a predictable shape is faster to scan and react to.

Fill in every section. If a section is genuinely empty for this project (e.g., no open questions), say so briefly rather than dropping the heading.

---

```markdown
# Backend Plan — <project/repo name>

## What I found

- Repo layout: <monorepo / single app / frontend-only repo with backend to be added, etc.>
- Features detected: <Feature A>, <Feature B>, ...
- Stack: <frontend framework>, <package manager>, existing backend/ORM/Docker: <none found | found: ...>

## Feature → files

| Feature     | Key files                             |
| ----------- | ------------------------------------- |
| <Feature A> | `src/pages/...`, `src/components/...` |

## Proposed database schema

### `table_name`

| Column | Type     | Notes |
| ------ | -------- | ----- |
| id     | uuid, PK |       |
| ...    | ...      | ...   |

Relations: <e.g., "task.project_id → project.id, many-to-one">

_(repeat per table)_

## Proposed API endpoints

### <Feature A>

| Method | Path      | Request          | Response  | Notes |
| ------ | --------- | ---------------- | --------- | ----- |
| GET    | /projects | –                | Project[] |       |
| POST   | /projects | CreateProjectDto | Project   |       |

_(repeat per feature)_

## Evidence & assumptions

- Grounded in: <file paths, or "recovered dummy data at commit `abc1234`, path `src/data/dummyProjects.ts`">
- Assumptions made (flag anything not directly evidenced): ...
- Open questions: <anything genuinely ambiguous or undetectable — e.g., no ORM/Docker setup found, so: which database and ORM do you want?>

## What happens next

If this looks right, I'll set up Docker, generate the schema/migrations, and scaffold the NestJS modules above — I'll need Docker Desktop running and terminal access to this repo for that part.

**Does this plan look right, or is there anything you'd change?**
```

---

A few notes on filling it in:

- Keep the schema and endpoint tables to what's evidenced or clearly necessary (a `users` table only if auth is real, not "just in case"). A shorter accurate plan beats a longer speculative one.
- The "Evidence & assumptions" section is not optional filler — it's what lets the person approve quickly instead of having to re-derive your reasoning themselves. Be specific: "recovered from `src/data/dummyProjects.ts`, deleted in commit `abc1234`" is far more useful than "inferred from context."
- If a feature came out of Phase 1 without any evidence for its data shape, say so here explicitly rather than presenting a guess at the same confidence level as everything else.

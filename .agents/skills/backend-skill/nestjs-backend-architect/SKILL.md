---
name: nestjs-backend-architect
description: Explores an existing repo to reverse-engineer a NestJS backend from already-built frontend code, then plans the database schema and REST endpoints BEFORE touching Docker or writing implementation. Produces a written plan (features found, proposed schema, proposed endpoints, open questions) and stops for explicit approval before generating migrations, scaffolding NestJS modules, or starting Docker containers. Use whenever the user wants to design, plan, scaffold, or build a backend for a project whose frontend already exists — especially right after removing placeholder/dummy/mock data — wants a schema or API surface derived from existing components, pages, hooks, or TypeScript types, mentions pairing a NestJS backend with an existing frontend, asks what tables or endpoints a feature needs, or wants to replace mock data with a real API. Also trigger for exploring a repo's structure and features before building anything backend-related, even without the word "NestJS."
---

# NestJS Backend Architect

You're picking up a project after the frontend is already built — pages, components, forms, and (until recently) some dummy data that's now been deleted to make room for a real backend. Your job is to figure out what backend this frontend actually needs, propose it clearly, and only start building once the person who owns this repo has looked at the plan and said yes.

## The order of operations, and why it's not optional

1. **Explore** the repo until you actually understand it — structure, features, and exactly what data each feature needs.
2. **Plan** a database schema and a set of API endpoints that match what you found, write it up, and **stop**.
3. **Build** — but only after the person has reviewed the plan and approved it, and only once you have working Docker access.

The reason step 2 ends in a full stop instead of flowing into step 3 is that a schema is a commitment. Once you generate a migration, spin up a Postgres container, and scaffold a dozen NestJS files around a particular shape of `Task` or `Project`, undoing a wrong guess costs real time — yours and theirs. A five-minute read of a plan is much cheaper than reverse-engineering a bad schema later. So: no migrations, no `docker compose up`, no `nest g resource`, no entity files — nothing that touches Docker, a database, or generates backend code — until the person has explicitly said the plan looks right. If they ask a clarifying question about the plan instead of approving it, answer it and keep waiting; a question is not a yes.

This applies even when you're confident. Especially then, actually — the plan report exists precisely so a second pair of eyes catches the thing you were sure about but got wrong.

## Phase 1 — Explore

Goal: leave this phase with a clear map of (a) what features exist, (b) which files belong to each feature, and (c) — most important — real evidence of what data shape each feature needs. Guessing the schema from feature names alone ("Projects" probably has a name and description, right?) is exactly what this phase exists to avoid.

Start broad, then narrow:

- Map the directory structure and identify how the project organizes itself (by route, by feature folder, by layer).
- Walk the routes/pages to get the feature list. Each route is usually a feature or a view onto one.
- For each feature, collect its file set: the page/route, the components it renders, any hooks or API-client calls it uses, and the TypeScript types involved.
- Run `scripts/detect_stack.sh` early — a quick, read-only pass that reports the package manager, frontend framework, whether any backend/ORM/Docker setup already exists, and whether the `docker` CLI is even reachable in your environment. No point re-deriving this by hand.

The single best source of truth, when it exists: the dummy data the person just deleted. Until minutes or days ago it was literally what the frontend was built and tested against, which makes it a more reliable spec than inferring shapes from component props alone. Git still remembers it. Run `scripts/find_deleted_sample_data.sh` to locate it, or dig manually — see `references/exploration.md` for the exact commands and for the rest of the tracing techniques (form fields, API-client stubs, state stores, etc.) in more depth than fits here.

Don't move to Phase 2 for a feature until you have at least one concrete, evidence-based source for its data shape — a type definition, recovered dummy data, or an API stub with a payload. If a feature has none of these, that's worth flagging in the plan rather than inventing fields for it.

## Phase 2 — Plan, then stop

Turn what you found into two things:

- A **database schema** — tables, columns, types, relationships — sized to what the frontend actually needs, not a speculative "complete" version of the product.
- A set of **API endpoints** — one per piece of frontend functionality that needs server data, matching the request/response shape the frontend already expects wherever you found evidence of one (an existing `fetch('/api/projects')` call is a stronger signal than REST convention; if you deviate from what the frontend expects because convention pulls the other way, say so explicitly rather than quietly picking one).

Read `references/schema-and-api-design.md` for the conventions to apply (naming, keys, relations, enums vs. free text, pagination, DTO validation) and `references/plan-report-template.md` for exactly how to structure the write-up. Use that template — consistency here makes it fast for the person to scan and react to.

The report should make clear which parts are grounded in something you found (cite the file, or "recovered from git history at commit X") and which parts are assumptions you had to make because the evidence ran out. Assumptions aren't a problem; hiding them is. When the evidence is genuinely ambiguous or missing — you can't tell if `status` is a fixed set of values or free text, or you found no ORM or docker-compose anywhere to indicate a database preference — put it in the report as an open question instead of quietly picking one.

End the report with a direct question asking for approval, and then stop. If they come back with changes, revise the plan and present it again — treat "approved with changes" as another round of Phase 2, not as a green light to build.

## Phase 3 — Build (only after a yes)

Once you have explicit approval and confirmation that Docker access is in place, work through `references/setup-and-implementation.md`: the Docker Compose service, ORM setup, migrations generated from the approved schema, NestJS modules scaffolded per feature, DTOs, and a seed script — ideally reusing the dummy data you recovered in Phase 1, so the frontend has realistic data to develop against again right away instead of nothing.

Build what was approved. If you hit something during implementation that genuinely changes the shape of the plan — a join table you didn't anticipate, a field that needs splitting in two — flag it briefly and keep going once it's acknowledged; that's a normal part of building, not a reason to restart the approval loop. But don't silently redesign a table or drop an endpoint because it seemed cleaner your way.

## A few things worth remembering

- **Adapt to what's already there.** If a `backend/` folder or partial NestJS setup already exists, audit what's built before proposing anything new — extend it, don't propose a duplicate.
- **Don't assume the database engine or ORM if there's no evidence for one.** `detect_stack.sh` will usually tell you if TypeORM, Prisma, or a particular database driver is already a dependency. If it finds nothing, that's an open question for the report, not a coin flip.
- **Nothing destructive without calling it out first** — dropping volumes, overwriting existing migration history, force-pushing. Docker access being granted is permission to build the agreed plan, not blanket permission for anything else.
- **Cite real evidence in the plan** — a file path, a line, a commit hash. It lets the person verify your reasoning in thirty seconds instead of having to trust it blind.

## Reference files

| File                                     | Read it when...                                                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/exploration.md`              | You're in Phase 1 and want the detailed tracing techniques — feature mapping, data-contract tracing, the full dummy-data git archaeology walkthrough. |
| `references/schema-and-api-design.md`    | You're designing the schema/endpoints in Phase 2 and want naming, relation, and REST conventions to apply.                                            |
| `references/plan-report-template.md`     | You're about to write the Phase 2 report — use this structure.                                                                                        |
| `references/setup-and-implementation.md` | You have approval and are moving into Phase 3 — the build checklist.                                                                                  |

`scripts/detect_stack.sh` and `scripts/find_deleted_sample_data.sh` are both read-only and safe to run anytime during Phase 1.

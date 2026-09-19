# Setup and implementation checklist (Phase 3)

Only start this once the person has explicitly approved the Phase 2 plan and confirmed Docker access. Work through it roughly in this order — each step assumes the previous one is in place.

## 1. Pre-flight

- Confirm Docker is actually reachable: `docker info`. If it fails, stop and ask rather than working around it.
- If meaningful time passed since the plan was approved, or the person mentions they've touched the frontend since, do a quick re-scan of anything that changed before generating migrations against a schema that might already be stale.

## 2. Docker Compose

Add (or extend, if one exists) a `docker-compose.yml` with the database service the plan called for — image, exposed port, a named volume so data survives `docker compose down`, and credentials read from environment variables (with sane local-dev defaults, not hardcoded secrets committed as the only option). Use `docker compose` (v2, no hyphen) unless the repo/environment indicates the standalone `docker-compose` binary is what's actually installed — `detect_stack.sh`'s output from Phase 1 will usually tell you which.

## 3. ORM setup

- **TypeORM**: configure the `DataSource` (or `TypeOrmModule.forRoot`/`forRootAsync`) to match the compose service's credentials, one entity file per table from the approved schema.
- **Prisma**: `prisma init` if not already present, write `schema.prisma` to match the approved schema, including relations and any enums.
- Whichever ORM Phase 1 detected (or the person chose, if it was an open question in the plan) — don't switch ORMs mid-project without asking.

## 4. Migrations

Generate the initial migration from the schema you just wrote (`typeorm migration:generate` or `prisma migrate dev`) rather than hand-writing SQL — it keeps the migration and the entity/schema definitions from drifting apart. Review the generated SQL briefly before applying it; auto-generated migrations occasionally do something wider than intended (e.g., dropping a column that just got renamed).

## 5. NestJS modules

Per feature from the plan: `nest g resource <name>` (or the equivalent manual files) to get the module/controller/service/DTO skeleton, then fill in:
- The entity/DTO fields to match the approved schema exactly
- `class-validator` decorators on DTOs matching the constraints from the plan
- Service methods for the approved endpoints, including any feature-specific queries called out in the plan (e.g., "tasks filtered by project")

## 6. Wire up `main.ts`

- Global `ValidationPipe` so DTO validation actually runs
- CORS enabled for the frontend's dev origin
- A base `/api` prefix if that's what the frontend's existing calls expect (check Phase 1's recovered API stubs)

## 7. Seed data

If Phase 1 recovered the deleted dummy data, turn it into a seed script rather than leaving it stranded in the git history it came from. It's a nice continuity: the frontend gets realistic-looking data to develop against again almost immediately, and it doubles as a first sanity check that the schema can actually hold the data it was designed for.

## 8. Environment

`.env.example` documenting every variable the compose file and app config actually read, with placeholder (not real) values.

## 9. Smoke test before declaring done

`docker compose up -d`, run the migration, start Nest in dev mode, and hit at least one endpoint end-to-end (a `curl`, or a note telling the person exactly what to run) — confirming it actually works beats confirming it compiles.

## 10. Report back

Summarize what got built, how to run it (`docker compose up -d`, then whatever starts Nest), and what the frontend needs to point at it (base URL, any env var the frontend should set). If anything deviated from the approved plan during the build — a join table that turned out to be necessary, a field that needed splitting — call it out here specifically rather than letting it blend into the summary.

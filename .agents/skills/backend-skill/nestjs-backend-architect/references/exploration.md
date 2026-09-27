# Exploration techniques (Phase 1)

Detailed techniques for building an accurate picture of the repo before proposing anything. Read this when you're actually doing Phase 1 — SKILL.md has the high-level shape.

## 1. Map the repo, then the features

Start with a directory listing two or three levels deep. Look for the organizing principle: file-based routing (`pages/`, `app/`), a `features/` or `modules/` folder, or a flatter `components/` plus a router config file listing routes by hand. That tells you where to find the feature list.

Once you know the pattern, enumerate features by walking routes/pages rather than by reading every component file — a route is almost always a feature (or a view onto one), and it gives you an entry point to trace outward from.

For each feature, build a file set:

- The route/page component itself
- Components it renders (follow imports one or two levels deep — you don't need the entire component tree, just enough to see what data flows in)
- Any hooks, API client modules, or store slices it pulls from
- Any TypeScript types/interfaces those touch

You don't need to read every line of every file. Skim for shape — prop types, function signatures, JSX that renders a `.map()` over a list — rather than full implementation detail.

## 2. Trace the data contract

This is the part that actually determines the schema. Look for, in rough order of reliability:

**Recovered dummy data** (see section 3 below) — the strongest signal, when it exists, because it's concrete example data the UI was actually built against.

**TypeScript types/interfaces.** Search for `interface` and `type X = {` in the feature's files or a shared `types/`/`models/` folder. A `Project` interface with `id`, `name`, `description`, `ownerId`, `createdAt` is close to a schema already.

**API client stubs.** Grep for `fetch(`, `axios.`, `useQuery`, `useSWR`, `useMutation`, or similar, and look for paths like `/api/projects` or `/projects/:id/tasks`. Even if the call currently throws a "not implemented" error or points at a mock, the path and the shape of what it sends/expects back are exactly the contract the backend needs to fulfill. This is often more reliable than re-deriving REST conventions from scratch, because it's the shape the frontend code was actually written against.

**Forms.** Every controlled input, its `required` attribute, and any client-side validation (a Zod/Yup schema, or manual checks) tells you about a column and its constraints. A form with a `status` `<select>` offering three fixed options implies an enum; a free-text `<textarea>` implies a text column.

**State stores.** Redux slices, Zustand stores, or Context providers that hold domain data often have their own type definitions — sometimes more current than a stale `types/` folder nobody's touched since the dummy-data days.

## 3. Recover deleted dummy data via git

If the dummy data was committed before it was deleted (usually true — it typically lived in the repo for a while during frontend development), git still has it, even though it's gone from the working tree now.

Run `scripts/find_deleted_sample_data.sh` from inside the repo for a fast pass. It searches deleted-file history for paths that look like dummy/mock/sample/fixture data and prints the exact `git show <commit>^:<path>` command to recover each one's last content.

If it comes back empty — the naming pattern didn't match, or the file was never committed — fall back to:

```bash
# Everything ever deleted, so you can eyeball anything the pattern search missed
git log --diff-filter=D --name-only

# Full history of one file you suspect, including its content at each point
git log -p -- path/to/suspected/file.ts
```

If there's genuinely no git history to mine (repo isn't version-controlled, or history was squashed/reset before you got access), that's fine — just lean harder on types, forms, and API stubs, and say in the plan report that this feature's schema is inferred from those rather than from example data.

## 4. Know when you're done

Before moving to Phase 2, you should be able to answer, for every feature:

- What is its short name and its user-facing purpose?
- Which files implement it?
- What does one real (or recovered) example of its data look like?

If a feature is missing that last one — no types, no recovered dummy data, no API stub with a payload — don't invent fields to fill the gap. Note it as a feature where you're working from the UI alone (what's rendered on screen implies _some_ fields, but you're less sure about types, optionality, and anything not currently displayed), and let the plan report flag it as lower-confidence rather than presenting a guess with the same confidence as everything else.

## 5. Run the stack detector

`scripts/detect_stack.sh`, run from the repo root, gives you in one pass: package manager, frontend framework, whether a NestJS backend or ORM already exists anywhere in the repo, any docker-compose/Dockerfile already present, and whether the `docker` CLI resolves in your current environment at all (useful to know early — no point planning around Docker if it's not reachable yet, though that's fine, since Phase 3 doesn't start until access is confirmed anyway). It's read-only and cheap to run early.

# Migration Discovery Notes

Generated for the Phase 1-4 checkpoint before copying any Project B files.

## Project A: Main Portal (`D:/manage-stock`)

- Router: Next.js App Router via `src/app`.
- Language: TypeScript, strict mode enabled in `tsconfig.json`.
- Styling: Tailwind CSS v4 through `src/styles/globals.css`, theme imports through `src/styles/theme.css`, shadcn/Radix primitives in `src/components/ui`.
- Import alias: `@/*` maps to `./src/*`.
- Current branch during discovery: `merge/landing-page`.
- Existing public homepage: `src/app/page.tsx` currently redirects unauthenticated users to Clerk sign-in and authenticated users to `/dashboard/admin`.

## Project B: Landing (`D:/mcp-example`)

- Router: Next.js App Router via `src/app/[locale]`.
- Language: TypeScript.
- Styling: Tailwind CSS v4 through `src/styles/global.css`, with landing-specific Amanah tokens and utilities.
- Import alias: `@/*` maps to `./src/*`, plus `@/public/*`.
- Relevant runtime surface: healthcare marketing features, healthcare shared components, landing-specific carousel helpers, healthcare public media assets.
- Excluded runtime surface: Project B auth/dashboard/database/i18n boilerplate, tests, stories, migrations, env files, lockfiles, and package root files.

## Manifest Verification

- Manifest path: `migration_artifacts/migration_manifest.json`.
- Total entries: 250.
- Copy entries: 218.
- Skip entries: 32.
- Manual-review entries: 24.
- Copy source check: all copy sources exist.
- Destination collision check: no copy destinations currently exist.
- Exclusion check: no `.git`, `node_modules`, `.next`, lockfile, env, package root, auth/dashboard, DB, locale, or test boilerplate is marked for copy.

## Confirmed Product Decisions

- Migrate the full public healthcare marketing site.
- Replace `/` with the landing homepage.
- Keep migration single-locale for this stage; do not adopt Project B `next-intl` routing.
- Keep Project A shadcn primitives as the source of truth and only isolate landing-owned UI helpers.

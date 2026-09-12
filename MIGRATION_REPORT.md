# Landing Migration Report

## Summary

- Migrated the Project B healthcare landing implementation into Project A feature paths:
  - Code: `src/features/public-site`
  - Static media: `public/healthcare`
  - Public routes: `/`, `/tentang-kami`, `/layanan`, `/fasilitas`, `/testimoni`, `/ulasan`, `/kontak`
- Replaced the old root auth redirect page with the landing page wrapper.
- Kept Project A shadcn/Radix primitives as the UI foundation and adapted copied code to those APIs.
- Added a scoped public-site stylesheet at `src/features/public-site/styles/public-site.css`.
- Removed the temporary `@landing/*` alias after integrating imports into the normal `@/features/public-site/*` project path.

## Dependencies Added

Added only the runtime dependencies required by the migrated landing pages:

- `@gsap/react`
- `embla-carousel-autoplay`
- `embla-carousel-react`
- `lenis`
- `lucide-react`
- `react-icons`

Existing Project A versions for Next, React, Radix, Clerk, Sentry, Tailwind, TypeScript, and shared tooling were preserved.

## Intentional Isolation

- Public website code now lives under `src/features/public-site`.
- Landing media remains under `public/healthcare`.
- Project A global styles, theme registry, dashboard components, and shadcn primitives were not replaced.
- The copied landing design has not been harmonized with Project A's main design system. That is intentionally left as a separate client-approval follow-up.

## Adjustments Made After Copy

- Reorganized the rough import namespace into `src/features/public-site/pages`, `components/shared`, `components/ui`, `lib`, and `styles`.
- Rewrote copied imports from the temporary `@landing/*` namespace to normal `@/features/public-site/*` imports.
- Rewrote public media references from `/assets/*` to `/healthcare/assets/*`.
- Moved generated migration audit artifacts to `docs/migrations/public-site`.
- Removed copied `next-intl`, Clerk localization, and source routing assumptions.
- Added single-locale Indonesian config for the public-site feature.
- Added route metadata through the Next Metadata API.
- Added remote image allowlist entries for landing review/avatar media.
- Replaced Project B-only `Avatar size` props with Project A class-based sizing.
- Added captions/labels for migrated video elements and fixed imported interactive card accessibility.
- Replaced nine source data image references that pointed to assets missing from Project B with existing copied healthcare assets.
- Consolidated duplicate home-level `SectionContainer`, `ArrowCtaButton`, and `ReviewsMarqueeSection` bridge files into shared/atomic public-site components.

## Skipped From Project B

- Project B config/tooling files were not adopted, including CI, eslint, vitest, playwright, crowdin, checkly, commitlint, and lefthook configs.
- Project B dependency upgrades/conflicts were not adopted.
- Nine image files listed in the source data were absent from Project B during inventory and were not copied. Active references were remapped to existing copied assets.

## Verification

Passed:

- `bun install`
- `bun run build`
- Targeted public-site lint: `oxlint src/features/public-site ...`
- Targeted public-site format/write: `oxfmt --write src/features/public-site ...`
- Landing public asset existence scan: 80 references checked, all present.

Known repository-level issue:

- Full-repo `oxlint --quiet` still fails outside the migrated landing scope. Examples include pre-existing dashboard accessibility issues, duplicate cases in `src/styles/clinical-tokens.ts`, and generated runtime code under `public/assets/plasma/plasma-scene.runtime.js`.

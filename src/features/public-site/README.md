# Public Site Feature

This folder owns the public-facing Amanah Healthcare website routes.

## Structure

- `pages/` contains route-level public website experiences such as home, about, services, reviews, testimonials, and contact.
- `components/shared/` contains reusable public-site primitives, layout, navigation, FAQ, typography, and brand components.
- `components/ui/` contains public-site-only UI primitives that are not part of the dashboard shadcn layer.
- `lib/` contains public-site metadata, config, SEO helpers, and route helpers.
- `styles/public-site.css` contains scoped public-site styles and is imported once by `src/styles/globals.css` so Tailwind processes the public-site theme tokens and custom utilities.

Public media used by this feature lives under `public/healthcare`.

The public site is now integrated as a Project A feature, but its visual system is still intentionally scoped from the dashboard design system until a dedicated harmonization pass is approved.

# Atomic Design primer

This is a reference for recognizing atomic-design thinking in a repo, not a folder structure to impose. Very few real-world codebases keep literal `atoms/`, `molecules/`, `organisms/` folders long-term — most fold the same idea into whatever architecture (like FSD) they otherwise use. Read this to understand the *composition-size* thinking, then go check how this specific repo expresses it.

## The five levels

```
atoms      — the smallest UI primitives: a Button, an Input, a Label, an Icon.
             No business meaning, highly reusable, usually no internal state
             beyond UI state (e.g. "pressed").
molecules  — a small, purposeful combination of atoms: a SearchBar
             (Input + Button), a FormField (Label + Input + error text).
organisms  — a distinct, self-contained section of UI made of molecules
             and/or atoms: a page Header, a ProductCard, a Navbar.
             Often where business/domain data first enters the UI.
templates  — page-level layout skeletons: where organisms go, with no real
             content — placeholder structure only.
pages      — a template filled with real content and real data for a
             specific route or use case.
```

## How this usually shows up inside FSD (or similar layered architectures)

Rather than literal `atoms/molecules/organisms` folders, a repo combining both paradigms typically maps composition size onto FSD's business-meaning layers like this:

| Atomic level        | Typical FSD home                          |
|----------------------|--------------------------------------------|
| atoms, molecules      | `shared/ui` — no business meaning, pure UI |
| organisms              | `entities/*/ui` or `widgets/*/ui` — composition + business data |
| templates               | `widgets` or `pages` — layout composition |
| pages                     | `pages` (or the Next.js route file that composes them) |

So "where does this Button go" usually resolves to `shared/ui/button/` even in a repo with no folder literally named `atoms`, because a Button has no business meaning and belongs at the bottom of both hierarchies. A `ProductCard`, by contrast, has business meaning (it knows about a "product") and is organism-sized, so it typically belongs in `entities/product/ui/` rather than `shared/ui`, even though visually it might feel like "just a card."

## What to check in a specific repo

- Is there a literal `atoms/molecules/organisms` folder set, or is composition size expressed some other way (naming convention, `shared/ui` vs `entities`, a `ui-kit` package)?
- Are primitives (buttons, inputs) centralized in one place, or duplicated per feature? If centralized, new primitives belong there too.
- Do "organism"-level components live next to the business entity they represent, or in a general `components/` folder? Follow whichever this repo already does — don't introduce the other pattern alongside it.

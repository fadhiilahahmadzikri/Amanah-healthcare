You are a **product-oriented UI/UX engineer, frontend developer, and software engineer** with a strong foundation in building real production systems. Approach this project with the mindset of someone who has spent years translating abstract requirements, product context, and design intent into concrete, maintainable, and production-ready implementations.

Your priorities are **clarity, fidelity, architectural consistency, design-system coherence, and alignment between concept and implementation**. Every decision must be grounded in evidence from the existing codebase rather than assumptions, generic conventions, or invented solutions.

You must operate with an **anti-hallucination, codebase-first mindset**.

Do not assume that a component, layout, style, interaction, token, pattern, abstraction, or implementation does or does not exist before verifying it directly in the codebase. When something is unclear, investigate it. When something already exists, reuse it. When multiple implementations appear possible, prefer the one that is most consistent with the project's existing architecture and design language.

The final implementation must feel as though it has always belonged to the existing application.

---

# Core Objective

I want to create a **reusable form/page implementation** whose content and data structure may change depending on the target context.

The contextual information provided below represents the **data, information architecture, and substantive content that must appear on the target page**.

It is **not a final UI specification**.

For example, if the target page is a **[Data Pasien cakupannya Admin Dashboard]** page, the provided context should be interpreted as the source of truth for:

* what patient information exists,
* what fields need to be represented,
* what information needs to be visible,
* what actions or states are explicitly required,
* and what substantive content the page needs to communicate.

Treat that context as a **data and content mapping resource**, not as an instruction to invent a completely new visual design.

In other words:

> **The provided context determines WHAT the page contains.
> The existing codebase determines HOW the page should look, behave, and be implemented.**

Do not confuse these two responsibilities.

---

# Primary Source of Truth

Before implementing anything, you **MUST first read and follow**:

`D:\manage-stock\.agents\skills\respect-current-architecture\Codebase-First Design System & Architecture Enforcement Skill.md`

This is the highest-priority skill for this task.

Treat its rules as mandatory architectural and design constraints.

Do not merely acknowledge the skill. Read it thoroughly and apply it throughout exploration, planning, implementation, refactoring, and verification.

The fundamental operating sequence must be:

**Explore → Locate → Understand → Compare → Reuse → Compose → Extend → Create only if genuinely necessary**

Do not reverse this process.

Do not start by designing a new page and then attempt to make it resemble the existing application afterward.

Instead, derive the target page from the application's existing system.

---

# Mandatory Codebase Exploration

Before writing implementation code, thoroughly explore the relevant parts of:

`D:\manage-stock`

The goal is to understand how the application already solves comparable UI and architectural problems.

Inspect the existing project structure and identify relevant implementations of:

* pages,
* routes,
* layouts,
* page containers,
* headers,
* sections,
* forms,
* cards,
* tables,
* lists,
* detail views,
* filters,
* search interfaces,
* tabs,
* buttons,
* inputs,
* selects,
* dialogs,
* drawers,
* badges,
* status indicators,
* pagination,
* empty states,
* loading states,
* error states,
* validation,
* typography,
* icons,
* spacing,
* borders,
* radii,
* backgrounds,
* responsive behavior,
* interaction states,
* reusable components,
* shared primitives,
* hooks,
* utilities,
* services,
* schemas,
* types,
* state-management patterns,
* data-fetching patterns,
* form-handling patterns,
* design tokens,
* theme configuration,
* CSS variables,
* Tailwind configuration,
* Shadcn components or configuration when present,
* and any other implementation that can establish the application's existing conventions.

Do not inspect only one convenient page.

Explore enough of the relevant codebase to understand the **recurring system and patterns** behind the application.

A visually similar or structurally similar page elsewhere in the application should be treated as an important reference.

---

# Existing Architecture Takes Priority

The target page must respect the application's current architecture.

Do not introduce a new architectural pattern simply because you personally prefer it or because it is commonly used in modern frontend projects.

Before creating anything new, determine whether the requirement can already be satisfied through:

1. an existing component,
2. an existing component variant,
3. an existing primitive,
4. composition of multiple existing components,
5. extension of an existing component,
6. an existing layout,
7. an existing utility,
8. an existing hook,
9. an existing service,
10. an existing schema or type,
11. or an existing implementation pattern elsewhere in the project.

Only create something new when exploration establishes with high confidence that no appropriate reusable implementation already exists.

**Convenience is not sufficient justification for creating a new abstraction.**

Do not create duplicate components merely because the target page has slightly different content.

---

# Design-System Fidelity

The target page must achieve **high visual fidelity with the current application**.

Do not design the page in isolation.

The surrounding application is the visual source of truth.

Study existing pages and reproduce their established visual grammar, including where applicable:

* font family,
* font sizes,
* font weights,
* line heights,
* letter spacing,
* text hierarchy,
* content width,
* page padding,
* section spacing,
* internal component spacing,
* grid behavior,
* alignment,
* density,
* border treatment,
* border radius,
* surface treatment,
* backgrounds,
* shadows,
* iconography,
* icon sizing,
* button dimensions,
* input dimensions,
* labels,
* helper text,
* badges,
* status treatments,
* hover states,
* focus states,
* disabled states,
* active states,
* transitions,
* responsive breakpoints,
* content rhythm,
* whitespace,
* visual hierarchy,
* and overall UI atmosphere.

The goal is not merely to use approximately similar colors or components.

The page should preserve the application's **ambient visual feel**.

When viewed beside existing pages, it should not feel like a newly generated third-party interface.

It should feel native to the same product.

---

# Pixel-Level Consistency

Aim for the highest practical fidelity to the application's existing UI system.

Where exact values already exist in the codebase, **reuse those values or their corresponding tokens instead of approximating them**.

Do not arbitrarily introduce:

* new spacing values,
* new font sizes,
* new colors,
* new shadows,
* new radii,
* new component dimensions,
* new breakpoint behavior,
* new button styles,
* new input styles,
* or new visual patterns

when equivalent values or patterns already exist.

If the application uses semantic tokens, reuse the semantic tokens.

If it uses shared components, use the shared components.

If it uses predefined variants, use those variants.

If an existing page establishes the correct page shell, reuse or compose that shell instead of manually reproducing it.

Visual similarity should result from **system reuse**, not from manually approximating the appearance.

---

# Reusability

The implementation should be reusable where the existing architecture supports reuse.

If the same form structure, field group, page section, information block, action group, or layout pattern already exists or is clearly shared across multiple contexts, reuse the existing abstraction.

If a genuinely new abstraction is required, it must represent a meaningful reusable concept rather than being created solely for the current page.

Avoid page-specific duplication such as:

```text
PatientButton
PatientCard
PatientInput
PatientModal
```

when the application already has reusable equivalents such as:

```text
Button
Card
Input
Dialog
```

with composition or variants capable of expressing the requirement.

Prefer composition over duplication.

---

# Hyper-Detailed Inspection

Do not stop after identifying that two pages "look similar."

Inspect how the similarity is actually implemented.

For relevant reference pages, determine:

* which layout component is used,
* which container establishes page width,
* where spacing originates,
* which typography classes or tokens are used,
* which components establish borders and surfaces,
* how sections are separated,
* how form fields are composed,
* how actions are aligned,
* how responsive behavior works,
* how loading and error states are handled,
* how data flows into the page,
* how validation is performed,
* how shared components expose variants,
* and how the page integrates with the rest of the application architecture.

Use this evidence to construct the target implementation.

Do not imitate only the screenshot-level appearance while ignoring the underlying system.

---

# Anti-Hallucination Rules

You must not invent information that cannot be established from either:

1. the provided target-page context, or
2. the existing codebase.

Never fabricate:

* fields,
* data,
* business rules,
* user permissions,
* workflows,
* API behavior,
* backend capabilities,
* validation requirements,
* component APIs,
* design tokens,
* routes,
* database fields,
* status values,
* interactions,
* responsive behavior,
* or application conventions.

If something is not specified by the provided context, search the codebase for evidence.

If the codebase does not establish it either, do not silently invent it.

Clearly distinguish:

**Observed → Existing → Required → Unknown**

Unknown information must remain unknown unless it is necessary to proceed. If it is necessary, identify the uncertainty rather than disguising an assumption as fact.

Never use generic AI-generated UI conventions as substitutes for missing evidence.

---

# No Generic AI UI

Do not produce a generic dashboard, generic SaaS page, generic CRUD interface, or generic Shadcn composition simply because those patterns are familiar.

Do not automatically add:

* oversized page titles,
* excessive cards,
* unnecessary gradients,
* decorative shadows,
* arbitrary KPI sections,
* random badges,
* excessive rounded containers,
* redundant descriptions,
* unnecessary icons,
* artificial empty states,
* decorative charts,
* or additional actions

unless they are justified by the provided context or established by the existing application.

The page must be derived from this project's actual design language.

---

# Supporting Skills

In addition to the mandatory `respect-current-architecture` skill, inspect and use the following skills **only where they are relevant to the actual task and compatible with the existing architecture**:

`D:\manage-stock\.agents\skills\3d-web-experience`
`D:\manage-stock\.agents\skills\acceptance-orchestrator`
`D:\manage-stock\.agents\skills\accessibility-compliance-accessibility-audit`
`D:\manage-stock\.agents\skills\agent-evaluation`
`D:\manage-stock\.agents\skills\agent-manager-skill`
`D:\manage-stock\.agents\skills\agent-memory-systems`
`D:\manage-stock\.agents\skills\agent-orchestration-improve-agent`
`D:\manage-stock\.agents\skills\agent-orchestrator`
`D:\manage-stock\.agents\skills\agent-tool-builder`
`D:\manage-stock\.agents\skills\agentflow`
`D:\manage-stock\.agents\skills\boy-scout`
`D:\manage-stock\.agents\skills\brandkit`
`D:\manage-stock\.agents\skills\claude-api`
`D:\manage-stock\.agents\skills\clean-architecture`
`D:\manage-stock\.agents\skills\clean-functions`
`D:\manage-stock\.agents\skills\clean-general`
`D:\manage-stock\.agents\skills\clean-names`
`D:\manage-stock\.agents\skills\cloudflare-dns-cli`
`D:\manage-stock\.agents\skills\compliance-management`
`D:\manage-stock\.agents\skills\design-taste-frontend`
`D:\manage-stock\.agents\skills\design-taste-frontend-v1`
`D:\manage-stock\.agents\skills\feature-sliced-design`
`D:\manage-stock\.agents\skills\find-skills`
`D:\manage-stock\.agents\skills\frontend-architecture`
`D:\manage-stock\.agents\skills\frontend-design`
`D:\manage-stock\.agents\skills\full-output-enforcement`
`D:\manage-stock\.agents\skills\gpt-taste`
`D:\manage-stock\.agents\skills\graphify`
`D:\manage-stock\.agents\skills\gsap-core`
`D:\manage-stock\.agents\skills\gsap-frameworks`
`D:\manage-stock\.agents\skills\gsap-performance`
`D:\manage-stock\.agents\skills\gsap-plugins`
`D:\manage-stock\.agents\skills\gsap-react`
`D:\manage-stock\.agents\skills\gsap-scrolltrigger`
`D:\manage-stock\.agents\skills\gsap-timeline`
`D:\manage-stock\.agents\skills\gsap-utils`
`D:\manage-stock\.agents\skills\hf-cli`
`D:\manage-stock\.agents\skills\high-end-visual-design`
`D:\manage-stock\.agents\skills\image-to-code`
`D:\manage-stock\.agents\skills\imagegen-frontend-mobile`
`D:\manage-stock\.agents\skills\imagegen-frontend-web`
`D:\manage-stock\.agents\skills\industrial-brutalist-ui`
`D:\manage-stock\.agents\skills\interactive-map-tracking`
`D:\manage-stock\.agents\skills\invoice-and-receipt-generator`
`D:\manage-stock\.agents\skills\kent-beck-style`
`D:\manage-stock\.agents\skills\kiranism-shadcn-dashboard`
`D:\manage-stock\.agents\skills\minimalist-ui`
`D:\manage-stock\.agents\skills\next-best-practices`
`D:\manage-stock\.agents\skills\next-cache-components-adoption`
`D:\manage-stock\.agents\skills\next-cache-components-optimizer`
`D:\manage-stock\.agents\skills\next-dev-loop`
`D:\manage-stock\.agents\skills\next-partial-prefetching-adoption`
`D:\manage-stock\.agents\skills\nextjs-turbopack`
`D:\manage-stock\.agents\skills\postgres-pro`
`D:\manage-stock\.agents\skills\react-hooks-patterns`
`D:\manage-stock\.agents\skills\redesign-existing-projects`
`D:\manage-stock\.agents\skills\refactor-architect-frontend`
`D:\manage-stock\.agents\skills\respect-current-architecture`
`D:\manage-stock\.agents\skills\security-assessment`
`D:\manage-stock\.agents\skills\security-documentation`
`D:\manage-stock\.agents\skills\shadcn`
`D:\manage-stock\.agents\skills\skill-creator`
`D:\manage-stock\.agents\skills\solid`
`D:\manage-stock\.agents\skills\stitch-design-taste`
`D:\manage-stock\.agents\skills\tanstack-form`
`D:\manage-stock\.agents\skills\tanstack-query`
`D:\manage-stock\.agents\skills\threat-modeling`
`D:\manage-stock\.agents\skills\ts-quality`
`D:\manage-stock\.agents\skills\typescript-clean-code`
`D:\manage-stock\.agents\skills\vercel-cli-deploy`
`D:\manage-stock\.agents\skills\vercel-composition-patterns`
`D:\manage-stock\.agents\skills\vercel-react-best-practices`
`D:\manage-stock\.agents\skills\web-design-guidelines`

Do not blindly apply every skill.

A skill is not permission to override the current project.

The existing architecture and the `respect-current-architecture` rules remain the primary authority.

Supporting skills should improve implementation quality only when their recommendations are compatible with the project's established patterns.

---

# Harmonization Principle

**Harmonization is the key requirement.**

Suppose the provided context describes a [Data Pasien cakupannya Admin Dashboard] page.

Do not ask:

> "What would a good patient page look like?"

Instead ask:

> "How would THIS application represent [Data Pasien cakupannya Admin Dashboard] using the patterns, components, spacing, typography, interaction conventions, and architecture it already uses?"

That distinction is fundamental.

The target page should inherit the application's visual DNA.

If another existing page already solves a structurally comparable problem, use it as a reference and reuse its architecture wherever appropriate.

For example, if an existing page already contains:

```text
Page Shell
├── Header
├── Toolbar
├── Filter/Search
├── Data Container
│   └── Table
└── Pagination
```

and the target [Data Pasien cakupannya Admin Dashboard] page requires the same structural pattern, do not independently recreate that hierarchy.

Reuse or compose the existing implementation and replace only the domain-specific content where appropriate.

---

# Content vs. Presentation

Maintain a strict distinction between **content truth** and **presentation truth**.

The provided page context is the source of truth for the content.

The existing application is the source of truth for presentation and implementation.

Therefore:

```text
Provided Context
        ↓
Data / Fields / Content / Explicit Requirements

Existing Codebase
        ↓
Components / Layout / Styling / UX / Architecture

        ↓
Target Page
```

Do not derive visual styling from the textual context unless it explicitly contains a requirement that must be honored.

Likewise, do not remove required data merely because an existing reference page does not contain that particular field.

Preserve the target page's substantive requirements while expressing them through the existing UI system.

---

# Implementation Quality

The implementation must be production-oriented.

Maintain:

* clear separation of concerns,
* strong typing,
* clean naming,
* predictable component boundaries,
* minimal duplication,
* reusable composition,
* maintainable state flow,
* appropriate data ownership,
* existing project conventions,
* accessibility,
* responsive behavior,
* and compatibility with the project's current technology stack.

Do not perform unrelated architectural rewrites.

Do not replace working systems merely to make the code conform to another preferred architecture.

Do not introduce dependencies without a concrete requirement.

Do not refactor unrelated areas unless the change is necessary for the requested implementation or a safe reuse opportunity directly requires it.

---

# Verification

Implementation is not complete when the code merely compiles.

After implementation, verify the result against both sources of truth.

### Content verification

Confirm that the page accurately represents the required data and information from the provided target-page context.

Check that nothing required has been accidentally omitted, merged incorrectly, renamed without justification, or invented.

### Architecture verification

Confirm that existing components, primitives, utilities, hooks, types, layouts, and patterns were reused wherever appropriate.

Check that no unnecessary duplicate abstraction was introduced.

### Visual verification

Compare the target page against relevant existing pages and verify consistency in:

* typography,
* spacing,
* dimensions,
* alignment,
* content density,
* surfaces,
* borders,
* radii,
* iconography,
* buttons,
* controls,
* responsive behavior,
* interaction states,
* hierarchy,
* and overall visual atmosphere.

Do not accept "close enough" when the existing codebase provides exact reusable values or components.

### Behavioral verification

Confirm that required interactions work correctly and follow existing application conventions.

Do not declare behavior functional unless it has actually been verified.

---

# Evidence-Based Decision Making

For every meaningful implementation decision, prefer evidence in this order:

```text
1. Existing implementation in this codebase
2. Existing shared component / primitive
3. Existing design-system token or configuration
4. Existing architectural convention
5. Explicit requirement from the provided context
6. Relevant supporting skill
7. New implementation only when necessary
```

Generic assumptions should never outrank codebase evidence.

If evidence conflicts, prioritize compatibility with the existing application unless the explicit task requirement clearly requires a change.

---

# Final Standard

The implementation is successful only when the target page:

* contains the required data and content,
* does not invent unsupported information,
* follows the current architecture,
* maximizes reuse,
* avoids unnecessary duplication,
* respects the existing design system,
* matches neighboring pages with high visual fidelity,
* preserves the application's ambient look and feel,
* uses established typography, spacing, dimensions, and interaction patterns,
* remains maintainable and reusable,
* and appears to be a natural extension of the existing product rather than an independently generated interface.

The final result should create the impression that the target page was designed and implemented by the **same team, using the same design system, architecture, components, and engineering conventions as the rest of the application**.

Do not redesign the product.

Do not impose a new visual language.

Do not guess.

Do not hallucinate.

**Explore first. Establish evidence. Reuse what exists. Preserve the provided content. Match the existing system with the highest practical fidelity.**

---

# Target Page Context

The context supplied below defines the **substantive data and information that must be represented on the target page**. Treat it as a mapping/resource of truth for page content, not as a final UI design.

**[Ini adalah halaman data pasien pada cakupan admin dashboard, tolong dibuatkan halamannya

## Continued Structural UI Analysis — “Data Pasien”

The screenshot shows a **patient-record management page** within a clinic administration application. It contains global navigation, patient summary metrics, search/filter controls, a patient data table, and row-level actions.

The visible hierarchy is:

```text id="wq4k3p"
Data Pasien
│
├── Global Application Header
│   ├── Navigation / Breadcrumb
│   ├── Repository / Git Icon
│   ├── Global Search
│   ├── Utility Controls
│   ├── User Account
│   └── Notifications
│
├── Page Header
│   ├── Page Title
│   ├── Description
│   └── Export Data Action
│
├── Patient Summary Metrics
│   ├── Total Pasien
│   ├── Pasien Aktif
│   └── Pasien Nonaktif
│
├── Patient Search / Filtering Toolbar
│   ├── Search Field
│   ├── Gender Filter
│   ├── Status Akun Filter
│   └── View Control
│
└── Patient Data Table
    ├── Table Header
    └── Patient Rows
        ├── Patient Record 1
        ├── Patient Record 2
        ├── Patient Record 3
        ├── Patient Record 4
        └── Patient Record 5
```

---

# 1. Global Application Header

The top horizontal region provides application-level navigation and utilities.

## 1.1 Left Navigation / Breadcrumb

At the upper-left is a navigation trail consisting of:

* A small navigation/sidebar-style icon
* `Dashboard`
* `/` separator
* `Data-pasien`

The current location is therefore explicitly represented as `Data-pasien`.

Logical structure:

```text id="1b8k2j"
Breadcrumb
├── Navigation Icon
├── Dashboard
├── Separator "/"
└── Current Page
    └── Data-pasien
```

---

## 1.2 Repository / Git Icon

Near the center-right of the header is a standalone GitHub-style icon.

No textual label accompanies it, so its exact function cannot be established solely from the screenshot.

It should therefore be represented structurally as an unlabeled global utility/icon rather than assigning a specific action to it.

---

## 1.3 Global Search

Next to the repository icon is a global search control.

It contains:

* Search icon
* Placeholder: `Search...`
* Keyboard shortcut indicator: `⌘ K`

The visible structure is:

```text id="6ym4j8"
Global Search
├── Search Icon
├── Input
│   └── Placeholder: "Search..."
└── Shortcut Indicator
    └── "⌘ K"
```

The screenshot does not specify which application entities are searchable through this global search.

---

## 1.4 Additional Utility Controls

Two compact controls appear after the search field.

### First utility

A standalone circular/icon-based control is visible.

No textual label is provided, so its exact function cannot be reliably determined.

### Second utility

Another control contains:

* An icon resembling a palette/theme control
* `Admin Custom`
* `TT`
* A downward chevron

The visible structure is:

```text id="h3b5c1"
Customization / Account Control
├── Icon
├── "Admin Custom"
├── "TT"
└── Dropdown Chevron
```

The screenshot does not establish the exact meaning of `TT`, so it should remain an independent displayed value rather than being interpreted.

---

## 1.5 Notification Control

At the far right is a bell icon.

A numeric badge attached to it displays:

`3`

This represents a visible notification count.

```text id="d5k3f9"
Notifications
├── Bell Icon
└── Count: 3
```

---

# 2. Page Header

The primary page content starts with the title area.

## 2.1 Page Title

`Data Pasien`

This is the main page heading.

## 2.2 Description

`Daftar rekam medis dan profil pasien klinik. Klik baris pasien untuk membuka panel inspeksi detail mendalam.`

The description explicitly states that this page contains:

* Patient medical records
* Patient clinic profiles

It also states that clicking a patient row opens a detailed inspection panel.

This is an explicitly visible interaction description rather than an inferred behavior.

---

## 2.3 Export Action

At the upper-right of the page heading is a button:

`Ekspor Data`

It includes an upload/export-style icon.

Logical structure:

```text id="5qf7az"
Export Action
├── Export Icon
└── Label
    └── "Ekspor Data"
```

The screenshot establishes that the interface exposes an export action, but does not establish the export format.

---

# 3. Patient Summary Metrics

Three KPI cards appear horizontally below the page heading.

Each contains a metric label, a large numeric value, and a small icon.

---

## 3.1 Total Patients

### Label

`Total Pasien`

### Value

`35`

### Icon

A person/group icon appears within the card.

Logical mapping:

```text id="9v2f1m"
Patient Metric
├── Metric: Total Pasien
├── Value: 35
└── Icon
```

---

## 3.2 Active Patients

### Label

`Pasien Aktif`

### Value

`29`

### Icon

A person icon appears on the card.

Logical mapping:

```text id="x8j5q2"
Patient Metric
├── Metric: Pasien Aktif
├── Value: 29
└── Icon
```

---

## 3.3 Inactive Patients

### Label

`Pasien Nonaktif`

### Value

`6`

### Icon

A person icon appears on the card.

Logical mapping:

```text id="5xq2w9"
Patient Metric
├── Metric: Pasien Nonaktif
├── Value: 6
└── Icon
```

The three visible values have the direct numerical relationship:

```text
Total Pasien = 35
Pasien Aktif = 29
Pasien Nonaktif = 6
```

The screenshot does not require an additional category beyond these three displayed metrics.

---

# 4. Patient Search and Filter Toolbar

Below the summary cards is the filtering toolbar.

It consists of:

1. Patient search field
2. Gender filter
3. Account-status filter
4. View control

---

## 4.1 Patient Search

The leftmost field contains the placeholder:

`Cari nama, NIK, no. RM, telepon,`

The visible search concepts are therefore:

* Patient name
* NIK
* Medical-record number
* Telephone number

The displayed placeholder ends with a comma, and no additional text should be invented.

Logical structure:

```text id="4j0p3q"
Patient Search
├── Input
└── Placeholder
    ├── nama
    ├── NIK
    ├── no. RM
    └── telepon
```

---

## 4.2 Gender Filter

The next control is:

`Gender`

It has a plus-in-circle icon.

This is a filter control for the gender field.

```text id="w7q1kx"
Gender Filter
├── Filter Icon
└── "Gender"
```

No selected gender value is visible.

---

## 4.3 Account Status Filter

The next control is:

`Status Akun`

It also contains a plus-in-circle icon.

This represents filtering by account status.

```text id="q5j8mb"
Account Status Filter
├── Filter Icon
└── "Status Akun"
```

No specific filter value is visibly selected.

---

## 4.4 View Control

On the right side of the toolbar is a control labeled:

`View`

It contains:

* A settings/sliders-style icon
* `View`
* Up/down chevrons

Logical structure:

```text id="9w3gq2"
View Control
├── View/Settings Icon
├── "View"
└── Up/Down Indicator
```

The screenshot does not establish what view modes are available.

---

# 5. Patient Data Table

The primary data component is a horizontally structured patient table.

The visible table has **seven columns**:

1. ID PASIEN
2. PASIEN
3. GENDER
4. UMUR
5. DIBUAT PADA
6. STATUS AKUN
7. AKSI

Each column header also includes a sort indicator.

---

# 6. Table Column 1 — ID PASIEN

The first column is:

`ID PASIEN`

A sorting indicator appears next to the header.

The field contains patient medical-record identifiers such as:

* `RM-2024-0047`
* `RM-2025-0012`
* `RM-2024-0089`
* `RM-2024-0000`
* `RM-2026-0031`

This is an independently identifiable patient identifier field.

---

# 7. Table Column 2 — PASIEN

The second column is:

`PASIEN`

Each visible row contains two logically separate pieces of information:

* Patient avatar
* Patient name

These should **not** be treated as a single undifferentiated patient field.

Visible records include:

### Row 1

* Avatar
* `Ahmad Fauzi`

### Row 2

* Avatar
* `Budi Kurniawan`

### Row 3

* Avatar
* `Dewi Rahayu`

### Row 4

* Avatar
* `Madonna Sari`

### Row 5

* Avatar
* `Rizky Pratama`

Logical representation:

```text id="0j8s2x"
Patient Column
├── patient_avatar
└── patient_name
```

The avatar is therefore an independent field in the logical patient record.

---

# 8. Table Column 3 — GENDER

The third column is:

`GENDER`

Visible values are:

* `Laki-laki`
* `Laki-laki`
* `Perempuan`
* `Perempuan`
* `Laki-laki`

This is an independently represented gender field.

Visible mapping:

```text id="b3g7m1"
Row 1 → Laki-laki
Row 2 → Laki-laki
Row 3 → Perempuan
Row 4 → Perempuan
Row 5 → Laki-laki
```

---

# 9. Table Column 4 — UMUR

The fourth column is:

`UMUR`

Visible values:

* `41 th`
* `51 th`
* `27 th`
* `36 th`
* `34 th`

The data field is therefore an age value, displayed with the `th` unit.

Logical structure:

```text id="j2c9k5"
age
├── numeric_value
└── unit: "th"
```

Visible patient ages:

```text
Ahmad Fauzi → 41 th
Budi Kurniawan → 51 th
Dewi Rahayu → 27 th
Madonna Sari → 36 th
Rizky Pratama → 34 th
```

---

# 10. Table Column 5 — DIBUAT PADA

The fifth column is:

`DIBUAT PADA`

This represents the record/account creation date.

Visible values:

* `05/03/2024`
* `22/01/2025`
* `18/05/2024`
* `10/01/2024`
* `12/02/2026`

Logical mapping:

```text id="3n7qv2"
created_at
└── displayed_date
```

The screenshot does not explicitly identify whether this date refers to the patient record, account, or another specific database entity beyond the column label `DIBUAT PADA`.

---

# 11. Table Column 6 — STATUS AKUN

The sixth column is:

`STATUS AKUN`

Each row contains a status badge composed of:

* Small circular status indicator
* Status text

Visible statuses are:

### Row 1

`AKTIF`

### Row 2

`NONAKTIF`

### Row 3

`AKTIF`

### Row 4

`AKTIF`

### Row 5

`AKTIF`

Logical field:

```text id="z8m4v1"
account_status
├── status_indicator
└── status_label
```

The status values visible in the table are:

```text
AKTIF
NONAKTIF
```

---

# 12. Table Column 7 — AKSI

The final column is:

`AKSI`

Each visible row contains two independent actions:

1. `Lihat Detail`
2. `Edit`

---

## 12.1 Lihat Detail

Each row has a button labeled:

`Lihat Detail`

It includes an eye icon.

The page description explicitly states that clicking a patient row opens a detailed inspection panel. The button itself visibly provides a separate `Lihat Detail` action.

The screenshot does not establish whether these two mechanisms open exactly the same panel.

---

## 12.2 Edit

Each row also has:

`Edit`

with an edit/pencil-style icon.

This is an independent row-level action.

Logical structure:

```text id="f7p1c8"
Row Actions
├── Lihat Detail
└── Edit
```

---

# 13. Visible Patient Records

The five fully visible table rows can be decomposed into independent logical records.

| ID Pasien    | Patient Avatar | Patient Name   | Gender    | Age   | Created Date | Account Status |
| ------------ | -------------- | -------------- | --------- | ----- | ------------ | -------------- |
| RM-2024-0047 | Present        | Ahmad Fauzi    | Laki-laki | 41 th | 05/03/2024   | AKTIF          |
| RM-2025-0012 | Present        | Budi Kurniawan | Laki-laki | 51 th | 22/01/2025   | NONAKTIF       |
| RM-2024-0089 | Present        | Dewi Rahayu    | Perempuan | 27 th | 18/05/2024   | AKTIF          |
| RM-2024-0000 | Present        | Madonna Sari   | Perempuan | 36 th | 10/01/2024   | AKTIF          |
| RM-2026-0031 | Present        | Rizky Pratama  | Laki-laki | 34 th | 12/02/2026   | AKTIF          |

Every visible row additionally has the two actions:

```text
Lihat Detail
Edit
```

The bottom of the screenshot partially reveals another row, but its complete contents are not visible. Therefore, no additional patient data should be fabricated from the partially visible row.

---

# 14. Logical Patient Record Model

The table supports the following independent record structure:

```text id="5nq0bd"
PatientRecord
├── patient_id
├── patient_avatar
├── patient_name
├── gender
├── age
├── created_at
├── account_status
└── actions
    ├── view_detail
    └── edit
```

This decomposition is important because the visually grouped `PASIEN` column actually contains at least two distinct fields:

```text
PASIEN
├── avatar
└── name
```

Similarly, the `STATUS AKUN` cell contains both:

```text
STATUS AKUN
├── status indicator
└── status value
```

---

# 15. Factory/Faker-Oriented Patient Data

For a repeatable implementation, the visible patient records can be generated using a patient factory with separate fields:

```text id="7m2xqk"
PatientFactory
├── patient_id
├── avatar
├── name
├── gender
├── age
├── created_at
├── account_status
└── actions
```

Synthetic examples following the same structure could be:

```text id="a4n8v2"
Patient
├── patient_id: RM-2026-0148
├── avatar: avatar-001
├── name: Sinta Maharani
├── gender: Perempuan
├── age: 32
├── created_at: 14/04/2026
└── account_status: AKTIF
```

```text id="m8c3x1"
Patient
├── patient_id: RM-2025-0194
├── avatar: avatar-002
├── name: Arif Nugraha
├── gender: Laki-laki
├── age: 45
├── created_at: 08/09/2025
└── account_status: NONAKTIF
```

These are synthetic examples and should not be interpreted as additional records from the screenshot.

---

# 16. Relationship Between Summary Metrics and Table

The page exposes aggregate patient metrics above the table:

```text
Total Pasien = 35
Pasien Aktif = 29
Pasien Nonaktif = 6
```

The visible table is only a **subset of the patient dataset**, because five complete records are visible while the total count is 35.

Therefore, the screenshot does not represent all 35 patients in the table viewport.

The aggregate figures can be represented as:

```text id="3b8q4w"
Patient Summary
├── total_patients: 35
├── active_patients: 29
└── inactive_patients: 6
```

---

# 17. Complete Hierarchical Reconstruction

```text id="6x9q2v"
Data Pasien
│
├── Global Header
│   ├── Navigation Icon
│   ├── Dashboard
│   ├── Separator "/"
│   ├── Data-pasien
│   ├── Git/Repository Icon
│   ├── Global Search
│   │   ├── Search Icon
│   │   ├── "Search..."
│   │   └── "⌘ K"
│   ├── Utility Control
│   ├── Admin Custom Control
│   │   ├── Icon
│   │   ├── "Admin Custom"
│   │   ├── "TT"
│   │   └── Dropdown Chevron
│   └── Notifications
│       ├── Bell
│       └── Count: 3
│
├── Page Header
│   ├── "Data Pasien"
│   ├── Description
│   │   └── "Daftar rekam medis dan profil pasien klinik.
│   │       Klik baris pasien untuk membuka panel inspeksi
│   │       detail mendalam."
│   └── "Ekspor Data"
│
├── Patient Summary
│   ├── Total Pasien
│   │   └── 35
│   ├── Pasien Aktif
│   │   └── 29
│   └── Pasien Nonaktif
│       └── 6
│
├── Search / Filters
│   ├── Patient Search
│   │   └── "Cari nama, NIK, no. RM, telepon,"
│   ├── Gender
│   ├── Status Akun
│   └── View
│
└── Patient Table
    │
    ├── ID PASIEN
    ├── PASIEN
    │   ├── Avatar
    │   └── Name
    ├── GENDER
    ├── UMUR
    ├── DIBUAT PADA
    ├── STATUS AKUN
    │   ├── Indicator
    │   └── Status
    └── AKSI
        ├── Lihat Detail
        └── Edit
```

---

# 18. Observable vs. Undetermined

### Directly observable

* The page is titled `Data Pasien`.
* It contains patient medical-record/profile data.
* The page explicitly states that patient rows can open a detailed inspection panel.
* There are three patient aggregate metrics.
* There is a patient search field.
* Gender and account-status filters are available.
* A view control is present.
* There is an export-data action.
* The table has seven visible columns.
* The `PASIEN` column contains both an avatar and patient name.
* The table displays patient IDs, gender, age, creation dates, account statuses, and row actions.
* Each visible row has `Lihat Detail` and `Edit`.
* Five patient records are fully visible.
* A sixth row is only partially visible at the bottom.

### Not established by the screenshot

* The exact data format produced by `Ekspor Data`.
* The destination or function of the Git/repository icon.
* The exact function of the unlabeled utility controls in the global header.
* The meaning of `TT`.
* The available options inside `View`.
* The filtering interaction model for `Gender` and `Status Akun`.
* Whether sorting is ascending/descending by default; only sortable-column indicators are visible.
* The contents of the detailed inspection panel.
* The fields available when selecting `Edit`.
* The total number of table pages or pagination behavior.
* Any patient fields not visible in the table.
]**


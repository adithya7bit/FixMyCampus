# FixMyCampus — Design system

Professional campus operations software. Trustworthy, calm, precise.
Not a generic SaaS template and not a student-project aesthetic.

---

## Brand

- **Name:** FixMyCampus
- **Tagline:** See it. Report it. Get it fixed.
- **Accent:** Deep teal (`#0F766E`). One confident colour, used for primary
  actions, focus rings, and the student “Report” affordance.
- **Neutrals:** Slate. Light theme default, refined dark mode.
- **Voice:** Direct, respectful, institutional. Short sentences. No slang.

---

## Colour

| Token        | Light                 | Usage                          |
|--------------|-----------------------|--------------------------------|
| brand        | teal-700 `#0F766E`    | Primary buttons, links, logo   |
| ink          | slate-900             | Headings                       |
| body         | slate-600             | Body copy                      |
| muted        | slate-500             | Meta, timestamps               |
| line         | slate-200             | Borders, dividers              |
| canvas       | slate-50              | Page background                |
| surface      | white                 | Cards, sheets                  |

### Status (same everywhere — badges, timeline, pins, charts)

| Status                         | Colour   |
|--------------------------------|----------|
| submitted                      | slate    |
| under_review                   | blue     |
| assigned                       | indigo   |
| in_progress                    | amber    |
| resolved_pending_verification  | violet   |
| closed_verified                | emerald  |
| rejected                       | rose     |
| reopened / returned            | orange   |
| auto_closed                    | stone    |
| merged                         | zinc     |
| emergency (priority)           | red      |
| overdue (flag)                 | red      |

Priority: low = slate, medium = sky, high = amber, emergency = red.

Category hues are used only on maps and charts, never as a second brand.

---

## Typography

- **UI:** Plus Jakarta Sans (400–800). Distinctive but quiet.
- **Stats:** IBM Plex Mono, `font-variant-numeric: tabular-nums`.
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 40. Headlines track tight (`-0.03em`).
- Body line-height 1.55. Do not use light-on-light grey; body is slate-600
  on white (WCAG AA).

---

## Layout & density

- 8px grid. Spacing: 8, 16, 24, 32, 48.
- Cards: 1px slate-200 border, `shadow-sm`, 16px radius. No glassmorphism,
  no oversized blobs, no rainbow gradients.
- Student mobile: bottom nav, 100dvh, `safe-area-inset-*`. Content is never
  hidden behind the nav (`padding-bottom: 4.5rem + safe area`).
- Student desktop: 260px sidebar.
- Admin: denser tables, 240px sidebar, sticky filter bar.
- Max content width for reading: 720px. Dashboards: full width with 32px
  page padding (16px on small screens).

---

## Motion

- 150–200ms ease-out for colour / shadow. 250ms for sheets.
- Respect `prefers-reduced-motion: reduce` (instant).
- No decorative looping animation except a restrained emergency pulse.

---

## Components

- **Buttons:** 40px default, 36px compact (tables), 48px primary on mobile.
  Focus ring 2px teal offset 2px.
- **Inputs:** 44px min height (touch). Visible labels, never placeholder-only.
- **Badges:** 20px height, 999px radius, 11px/600.
- **Empty states:** icon + one sentence + one action.
- **Skeletons:** slate-100 pulse, same shape as content.
- **Toasts:** bottom-right desktop, top on mobile, `aria-live="polite"`.

---

## Map

When a Mapbox token is present, Mapbox GL is loaded from the CDN (kept out of
the main bundle). Otherwise a **stylized campus plan** is used — buildings,
paths, labelled blocks — so location picking never depends on a third party.

Pins share status/category colours. Heatmap is a density layer, not a
decoration.

A building / floor / room form is always available as a non-map fallback.

---

## Auth

Two clearly different experiences.

- **Student:** light, split layout on desktop (campus photography + form).
  Full-screen form on mobile.
- **Admin:** darker ink header, “Admin Portal” labelled in the chrome,
  no signup link. Feels like an operations console.

---

## Accessibility

- Semantic landmarks, skip link, visible focus, ARIA on icon-only controls.
- Status changes announced via `aria-live`.
- Text-size control (md / lg / xl) stored in `localStorage`.
- Contrast AA for text and badges (tinted backgrounds, dark labels).
- Keyboard: trap focus in dialogs, Esc to close, map controls are buttons.

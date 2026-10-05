# FixMyCampus — Architecture

Closed-loop campus complaint platform.

**See it. Report it. Get it fixed.**

A complaint is only truly closed when the student confirms the fix.

---

## 1. System overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Student    │────▶│  React SPA        │────▶│  Supabase       │
│   Admin      │◀────│  Vite + Tailwind  │◀────│  Postgres       │
└─────────────┘     │  React Router     │     │  Auth / Storage │
                    │  Recharts         │     │  Realtime / RLS │
                    └────────┬─────────┘     └─────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  /api (Vercel)   │  Gemini (optional)
                    │  secrets only    │  never on the client
                    └──────────────────┘
```

The frontend is a single React codebase, Capacitor-ready. It talks to Supabase
directly for CRUD, auth, storage and realtime. Anything that needs a secret
(Gemini, privileged admin ops) goes through a serverless function.

If Supabase env vars are missing, the app runs a **full local demo store**
(seeded, persisted to `localStorage`) so the product can be evaluated end-to-end
without a backend. The demo store implements the same domain API as the
Supabase adapter.

---

## 2. Closed loop (status model)

Single source of truth, enforced in one state machine (`src/lib/status.ts`)
and mirrored by a Postgres function `transition_complaint`.

```
submitted
    │
    ▼
under_review ──► rejected
    │
    ▼
assigned
    │
    ▼
in_progress
    │
    ▼
resolved_pending_verification
    │
    ├── student YES ──► closed_verified
    ├── student NO  ──► under_review  (reopen_count++)
    └── timeout N days ► auto_closed
```

Side paths:

- `merged` — absorbed into a parent complaint
- `is_overdue` — **flag**, not a status. Set by SLA job when `now() > sla_due_at`
  and the complaint is not in a terminal state.

Terminal: `closed_verified`, `rejected`, `auto_closed`, `merged`.

Every transition is written to `complaint_events` (who, when, from, to, note,
visibility). Internal notes are never readable by students (RLS).

---

## 3. Roles

| Role          | How created                         | Scope                          |
|---------------|-------------------------------------|--------------------------------|
| `student`     | Self sign-up + email verify         | Own complaints, public map     |
| `admin`       | Super-admin or SQL seed. No signup  | Own department                 |
| `super_admin` | SQL seed / first-run script         | Entire campus                  |
| `worker`      | Admin CRUD. **No login in v1**      | Assigned work (future login)   |

Route guards (`src/components/guards.tsx`) plus RLS. Changing the URL cannot
grant a student admin access.

Workers are first-class records (`workers` table) with department, phone,
specialties and `is_active`. Schema includes nullable `user_id` so worker
logins can be added later without a migration rewrite.

---

## 4. Database

See `supabase/migrations/001_init.sql` for the full schema, indexes, functions,
triggers, storage buckets and RLS.

Key tables: `profiles`, `departments`, `workers`, `complaints`,
`complaint_media`, `complaint_events`, `complaint_supports`, `comments`,
`verifications`, `inspections`, `notifications`, `app_settings`.

Geospatial: lat/lng columns + a SQL `haversine_meters()` function. PostGIS is
optional (`earthdistance` / `postgis`) and documented in the migration; the
app never requires it.

Public IDs: `FMC-YYYY-000123` from a sequence, assigned by trigger.

SLA: `sla_due_at` is set on insert from `app_settings.sla_hours_by_priority`.

---

## 5. Frontend structure

```
src/
  App.tsx                 router + providers
  lib/
    status.ts             typed state machine
    ai.ts                 rule-based fallback + optional /api/suggest
    store.tsx             domain API (demo + supabase)
    supabase.ts           client, typed helpers
    geo.ts                haversine, campus projection
    seed.ts               demo dataset
  components/             design system + map + timeline
  layouts/                student / admin shells
  pages/                  landing, auth, student, admin
```

Student chrome: bottom nav on mobile (Home, Complaints, **Report**, Map,
Profile), sidebar on desktop.

Admin chrome: dense sidebar (Dashboard, Inbox, Map, Workers, Food & Hygiene,
Reports, Settings). Collapsible on mobile.

---

## 6. File-a-complaint flow

Four steps, draft persisted locally until submit.

1. **What** — category, title, description, photos/video (compressed, real
   upload progress).
2. **Where** — Mapbox pin (or stylized campus map fallback), building / floor /
   room as non-map fallback.
3. **Urgency** — AI or rule-based suggestion, student can override.
   Emergency is visually highlighted.
4. **Review** — duplicate check (same category within ~50 m or similar
   description). Student may **+1** an existing open complaint instead.

Rate limit: 10 complaints / student / day (DB function + client guard).

---

## 7. AI layer

Vercel function `api/suggest.ts`. Gemini FREE tier. Never called from the
client with an API key.

Used for: category, priority, duplicate similarity, one-line admin summary.

Rules:

- Suggestions only. Humans decide.
- Cached on the complaint row (`ai_category`, `ai_priority`, `ai_summary`,
  `ai_hash`). Same input is never re-sent.
- If the key is missing or the call fails, `src/lib/ai.ts` rule-based
  fallback runs silently. The app never blocks on AI.

---

## 8. Realtime

Supabase Realtime on `complaints`, `notifications`, `comments`.

Demo adapter simulates this in-process (and across tabs via `storage` events).

---

## 9. Escalation

Priority SLAs (defaults): emergency 4h, high 24h, medium 72h, low 168h.

A scheduled job (`pg_cron` or a Vercel cron hitting `/api/escalate`) marks
overdue, notifies super-admin, and auto-closes unresolved verifications after
`auto_close_days` (default 3).

Setup is documented in README. The client also runs a conservative pass on
load so demos work without cron.

---

## 10. Security

- No service-role key, no Gemini key in the client.
- Private storage bucket `complaint-media`; signed URLs only.
- RLS on every table. Internal events `visibility = 'internal'` are hidden
  from students.
- Reporter identity is never shown on the public map or +1 lists.
- Zod validation on client and in SQL checks / RPCs.
- File type/size limits: images 10 MB pre-compress, video 50 MB.

---

## 11. Hosting

- **Vercel** primary (`vercel.json` SPA rewrites, `/api/*` functions).
- **Netlify** via `netlify.toml`.
- Android later: Capacitor (`capacitor.config.ts`). Camera/file inputs are
  already mobile-friendly; back-button is routed through React Router.

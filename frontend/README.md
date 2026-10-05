# FixMyCampus

**See it. Report it. Get it fixed.**

A closed-loop campus complaint platform. A report is only truly closed when the student who filed it confirms the fix.

```
Student reports → Admin reviews → Assigns worker → Worker fixes
  → Admin marks resolved → Student verifies → Closed
                              ↘ still broken → Reopened
```

---

## Demo (no backend required)

```bash
npm install
npm run dev
```

The app ships with a full in-browser store (seeded campus, 32 complaints, departments, workers). Open two browsers or use logout/login to play both sides.

| Portal  | Email                     | Password |
|---------|---------------------------|----------|
| Student | `priya@meridian.edu`      | `demo1234` |
| Admin   | `admin@meridian.edu`      | `demo1234` |
| Super   | `director@meridian.edu`   | `demo1234` |

Suggested walkthrough (the quality-bar demo):

1. Sign in as Priya. Open **Report**.
2. Pick **Water**, describe a leak in Hostel H1, attach a photo.
3. Drop a pin on Hostel H1. The app suggests **High**.
4. On review, a similar nearby complaint appears — **+1** or continue.
5. Submit; copy the `FMC-2026-…` id.
6. Sign out, sign in as admin, open **Inbox** (it updates live in the same browser store).
7. Assign to **Ramesh Kumar** (Maintenance / plumber).
8. Mark **In progress**, then **Resolved** with a note and after-photo.
9. Sign back in as Priya. Notification: *Is this fixed?*
10. Choose **No, still a problem** — it reopens and the admin is alerted.
11. Admin resolves again; Priya confirms **Yes, it’s fixed**. Status: **Closed (verified)**.
12. Admin dashboard and heatmap update.

Priya already has a library bench waiting for verification, so the dashboard is not empty on first login.

---

## Production setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local`. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/migrations/001_init.sql` in the SQL editor (schema, RLS, storage, realtime, `transition_complaint`, `run_escalation`).
4. Run `supabase/seed.sql` for departments and workers.
5. **Create the first admin** — there is no public admin signup:
   - Authentication → Users → Add user `director@meridian.edu`.
   - Then:
     ```sql
     update public.profiles
        set role = 'super_admin', full_name = 'Dr. Anil Rao'
      where id = (select id from auth.users where email = 'director@meridian.edu');
     ```
   - Further department admins are created from **Settings** (super-admin only) or the same SQL pattern with `role = 'admin'`.
6. Storage: the migration creates a **private** bucket `complaint-media`. The client should upload then request a signed URL.
7. Auth: enable email confirmations and the reset-password template. Redirect URLs: `https://your.app/student/login`.

When those env vars are absent, the SPA keeps using the local demo store so previews never crash.

### Mapbox (optional)

Set `VITE_MAPBOX_TOKEN` and restrict it by URL in the Mapbox dashboard. Without a token the app uses the built-in stylized campus plan (pin drop, heatmap, filters). Building / floor / room fields are always available as a non-map fallback.

### Gemini (optional)

Set `GEMINI_API_KEY` on the **server** (Vercel env). Never prefix it with `VITE_`. The browser calls `/api/suggest`. If the key is missing, keyword rules run silently. The product never blocks on AI.

---

## Deploy

### Vercel (primary)

```bash
npx vercel
```

Set env vars in the project. `vercel.json` rewrites the SPA and exposes `/api/*`.

Add a cron for escalation (every 15 minutes) pointing at `/api/escalate`, or enable pg_cron:

```sql
select cron.schedule('fmc-esc', '*/15 * * * *', $$ select public.run_escalation(); $$);
```

### Netlify

`netlify.toml` is included. Set the same `VITE_*` env vars. Serverless AI will not run on Netlify unless you add a matching function; the rule-based fallback still works.

---

## Security notes

- Service role key and Gemini key never ship to the client.
- RLS on every table. Internal notes (`visibility = 'internal'`) are not selectable by students.
- Reporter identity is hidden on the public map and +1 lists.
- Private storage; signed URLs only.
- 10 complaints / student / day.
- Image 10 MB pre-compress, video 50 MB.
- Status transitions are validated in one state machine (`src/lib/status.ts`) and in `transition_complaint`.

---

## Capacitor (Android later)

`capacitor.config.ts` is ready. Do **not** add the native project until you need a Play build.

```bash
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/android @capacitor/camera
npx cap init FixMyCampus edu.fixmycampus.app
npx cap add android
npm run build && npx cap copy
```

Already in place for a WebView wrap:

- Camera / file inputs with `capture="environment"`.
- `100dvh` + `safe-area-inset-*`. Bottom nav never covers content.
- Escape / back pops the React Router stack on student pages.
- No Mapbox requirement.

---

## Scripts

| Command        | What        |
|----------------|-------------|
| `npm run dev`  | Vite        |
| `npm run build`| Production  |
| `npm run preview` | Preview  |

See `ARCHITECTURE.md` and `DESIGN.md` for the domain model and visual system.

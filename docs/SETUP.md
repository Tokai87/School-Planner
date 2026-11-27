# Rancang+ — Phase 2 Setup Guide

## 1. Install & run
```bash
npm install
cp .env.example .env     # then fill in the two values (step 5)
npm run dev              # http://localhost:5173
npm run build            # type-checks, then builds
npx tsc --noEmit         # type-check only
```

## 2. Create a Supabase project
1. https://supabase.com/dashboard → **New project**.
2. Wait for provisioning. Note the **Project URL** and **publishable (anon) key** under *Project Settings → API*.
   Never use the `service_role` key in this app.

## 3. Run the SQL migration
Dashboard → **SQL Editor** → paste `supabase/migrations/0001_profiles.sql` → **Run**, then do the same for `0002_profiles_grants.sql`, `0003_profiles_gender.sql`, `0004_profile_avatars.sql`, `0005_planner.sql`, `0006_parent_links.sql` and `0007_child_planner.sql`.
Confirm in *Table Editor* that `profiles` exists with RLS enabled and 3 policies (select/insert/update own).
`0005` creates the planner tables (`children`, `subjects`, `timetable_entries`, `tasks`, `exams`, `notes`, `events`), each with RLS (`user_id = auth.uid()`) and grants for `authenticated`.

`0006` adds `parent_links` and `link_invites` plus five security-definer functions (`create_link_code`, `redeem_link_code`, `linked_children`, `linked_parents`, `child_snapshot`). A parent never gets table access to a student's data; the functions return read-only snapshots (no notes, no personal events).

`0007` adds `child_id` to `subjects`, `timetable_entries`, `tasks` and `exams` so a parent can keep a full planner for a child added by hand (rows cascade when the child is deleted; RLS also checks the child belongs to the same user).

After `0004`, *Storage* must list a **private** bucket `avatars` (1 MB limit; JPEG/PNG/WebP) with 4 policies on `storage.objects` (select/insert/update/delete own folder).

## 4. Google OAuth
1. Google Cloud Console → create/select a project → **APIs & Services → OAuth consent screen**
   (External, app name "Rancang+", support email; scopes `email`, `profile`, `openid`).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized redirect URI** — copy it from Supabase: *Authentication → Providers → Google* shows the
   **Callback URL** (`https://<project-ref>.supabase.co/auth/v1/callback`). Paste exactly that.
   (This is Supabase's URL, not your app's.)
4. Copy the generated **Client ID** and **Client Secret**.
5. Supabase → **Authentication → Providers → Google** → enable, paste Client ID + Secret → Save.
   The secret lives only in Supabase, never in this repo.

## 5. Supabase redirect URLs
Supabase → **Authentication → URL Configuration**:
- **Site URL**: your production URL (e.g. `https://app.yourdomain.com`), or `http://localhost:5173` while developing.
- **Redirect URLs** (add all that apply):
  - `http://localhost:5173/auth/callback`
  - `https://app.yourdomain.com/auth/callback`

The app sends `redirectTo = <origin>/auth/callback`; it must match an entry above or Supabase falls back to the Site URL.

## 6. Environment variables
Edit `.env` (git-ignored):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>
```
Restart `npm run dev` after changing `.env`. If either is missing the app shows a "Setup needed" screen.

## 7. While the Google consent screen is in "Testing"
Only emails added under *OAuth consent screen → Test users* can sign in. Publish the app for general use.

## Notes
- Production hosting must serve `index.html` for unknown paths (SPA fallback) so `/auth/callback` works on refresh.
- `/terms` and `/privacy` pages do not exist yet; the Welcome screen shows the wording as plain text.

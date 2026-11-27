# Phase 2 Test Plan & Status

Status legend: **NOT RUN** = written but not executed. Nothing below has been run yet:
the authoring environment had no network access, so dependencies were not installed and no build/browser test was possible.

| # | Scenario | Type | Status |
|---|----------|------|--------|
| 1 | New user signs in with Google | Real OAuth | NOT RUN |
| 2 | New user selects Primary Student | UI | NOT RUN |
| 3 | New user selects Secondary Student | UI | NOT RUN |
| 4 | New user selects Parent | UI | NOT RUN |
| 5 | Complete profile → row in `profiles`, redirect to dashboard | Real DB | NOT RUN |
| 6 | Close/reopen app → still signed in, lands on dashboard | Real OAuth | NOT RUN |
| 7 | Sign in again → no duplicate row (`select count(*) from profiles` stays 1 per user) | Real DB | NOT RUN |
| 8 | Existing user goes straight to correct dashboard | Real OAuth | NOT RUN |
| 9 | Incomplete profile (signed in, no row) → `/onboarding/role` from any protected URL | Real OAuth | NOT RUN |
| 10 | Sign out → session cleared, redirected to `/` | Real OAuth | NOT RUN |
| 11 | RLS: as user A, `select * from profiles where id = '<B>'` returns 0 rows; update/insert for B is rejected | Real DB (SQL editor w/ two users, or supabase-js) | NOT RUN |
| 12 | Invalid form data rejected (empty name, no year, bad phone) | UI | NOT RUN |
| 13 | Callback errors: cancel on Google consent screen; open `/auth/callback` directly; `/auth/callback?error=access_denied` | Real OAuth / UI | NOT RUN |
| 14 | `npm run build` succeeds | Build | NOT RUN |
| 15 | EN/BM toggle on every screen; choice persists after reload; validation messages switch language | UI | NOT RUN |
| 16 | Each category lands on its own dashboard; visiting another category's `/dashboard/*` redirects to own | Real OAuth | NOT RUN |
| 17 | Edit profile (`/profile/edit`) prefilled, saves, returns to `/profile`; category cannot be changed | Real DB | NOT RUN |
| 18 | Layout check at 360 / 390 / 430 px: no horizontal scroll, bottom nav never covers last content, hero never overlaps headings | UI | NOT RUN |

## Profile photo (Phase 3a)
| # | Scenario | Type | Status |
|---|----------|------|--------|
| 19 | Run `0004_profile_avatars.sql`; bucket `avatars` exists, is private, has 4 policies | Real DB | NOT RUN |
| P1 | Run `0005_planner.sql`; 7 tables exist with RLS enabled and a `<table>_own` policy each | Real DB | PASS (applied + RLS verified via SQL) |
| P2 | Student: add subjects, a class, homework, exam, note; toggle homework done; edit and delete each | Mock backend (browser) | PASS (add/edit sheet verified); real login NOT RUN |
| P3 | Parent: add child and events; calendar and dashboard show them; student-only routes redirect | Mock backend (browser) | PARTIAL; real login NOT RUN |
| P4 | All new screens at 390px, EN + BM, male/female/parent: no horizontal overflow | Mock backend (browser) | PASS |
| P5 | Run `0006_parent_links.sql`; code create/redeem/reuse/expired, parent-only/student-only, other parent blocked, direct table read blocked | Real DB (rolled-back SQL test) | PASS |
| P6 | Student creates code in Settings; parent links under Children; linked child page, dashboard card and alerts show data; unlink works | Mock backend (browser) | PASS; two real accounts NOT RUN |
| P7 | Run `0007_child_planner.sql`; child rows scoped by child_id, foreign child blocked by RLS, deleting a child cascades its planner | Real DB (rolled-back SQL test) | PASS |
| P8 | Parent opens a hand-added child: add/edit/delete subjects, classes, homework, exams; dashboard + alerts show them | Mock backend (browser) | PASS; real login NOT RUN |
| 20 | Profile page: tap camera, pick a JPG/PNG -> photo shows; reload -> still shows; row has `avatar_path = <uid>/avatar-<ts>.jpg` | Real DB + Storage | NOT RUN |
| 21 | Replace photo -> new image shows immediately; old object is deleted from the bucket | Real Storage | NOT RUN |
| 22 | Remove photo -> falls back to default artwork; `avatar_path` is null; object deleted | Real Storage | NOT RUN |
| 23 | Non-image file / >12 MB / undecodable file shows a friendly message (EN and BM) | UI | NOT RUN |
| 24 | RLS: user A cannot list/read/write `avatars/<B>/...`; cannot set `avatar_path` to another user's folder (check constraint) | Real DB (two users) | NOT RUN |
| 25 | Photo from a phone camera (rotated EXIF) appears upright; transparent PNG gets a white background | UI | NOT RUN |
| 26 | `npm run build` still succeeds | Build | NOT RUN |

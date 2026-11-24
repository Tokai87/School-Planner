-- Rancang+ — Phase 2: explicit table privileges for profiles.
-- RLS policies only filter rows; the role also needs table-level privileges.
-- Some Supabase projects do not auto-grant these, which causes
-- "permission denied for table profiles" after sign-in.

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

-- Rancang+ — Phase 3a: profile photos.
-- Adds profiles.avatar_path and a PRIVATE Storage bucket "avatars".
-- Each user can only read/write files inside their own folder: avatars/<user id>/...
-- Run in Supabase Dashboard -> SQL Editor (after 0001-0003). Safe to re-run.

alter table public.profiles
  add column if not exists avatar_path text;

-- The stored path must live inside the owner's own folder.
alter table public.profiles
  drop constraint if exists profiles_avatar_path_check;
alter table public.profiles
  add constraint profiles_avatar_path_check
  check (avatar_path is null or (length(avatar_path) <= 200 and avatar_path like (id::text || '/%')));

-- Private bucket, 1 MB limit (the app resizes to 512x512 JPEG, normally < 100 KB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Rancang+ — Phase 5: link a parent account to a student account (read-only for the parent).
-- Flow: student generates a one-time code (24h) -> parent redeems it -> parent can read the student's
-- subjects, timetable, homework and exams through security-definer functions. Notes and calendar events stay private.
-- Run in Supabase Dashboard -> SQL Editor (after 0001-0005). Safe to re-run.

create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id),
  check (parent_id <> child_id)
);

create table if not exists public.link_invites (
  code text primary key,
  child_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz not null default now()
);

alter table public.parent_links enable row level security;
alter table public.link_invites enable row level security;
revoke all on public.parent_links, public.link_invites from anon, authenticated;
grant select, delete on public.parent_links to authenticated;
grant select, delete on public.link_invites to authenticated;   -- rows are created only by create_link_code()

drop policy if exists parent_links_select on public.parent_links;
create policy parent_links_select on public.parent_links for select to authenticated
  using (parent_id = (select auth.uid()) or child_id = (select auth.uid()));
drop policy if exists parent_links_delete on public.parent_links;
create policy parent_links_delete on public.parent_links for delete to authenticated
  using (parent_id = (select auth.uid()) or child_id = (select auth.uid()));

drop policy if exists link_invites_own on public.link_invites;
create policy link_invites_own on public.link_invites for all to authenticated
  using (child_id = (select auth.uid())) with check (child_id = (select auth.uid()));

create index if not exists parent_links_parent_idx on public.parent_links(parent_id);
create index if not exists parent_links_child_idx on public.parent_links(child_id);

-- Student: make a fresh code (replaces any earlier one). Format XXXXX-XXXXX.
create or replace function public.create_link_code()
returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r text; c text;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  select role into r from public.profiles where id = me;
  if r is null or r = 'parent' then raise exception 'students_only'; end if;
  delete from public.link_invites where child_id = me or expires_at < now();
  c := upper(replace(gen_random_uuid()::text, '-', ''));
  c := substr(c, 1, 5) || '-' || substr(c, 6, 5);
  insert into public.link_invites(code, child_id) values (c, me);
  return c;
end $$;

-- Parent: redeem a code. Returns the student's display name.
create or replace function public.redeem_link_code(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r text; inv public.link_invites; n text; k text;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  select role into r from public.profiles where id = me;
  if r is distinct from 'parent' then raise exception 'parents_only'; end if;
  k := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  k := substr(k, 1, 5) || '-' || substr(k, 6, 5);
  select * into inv from public.link_invites where code = k and expires_at > now();
  if not found then raise exception 'invalid_or_expired'; end if;
  insert into public.parent_links(parent_id, child_id) values (me, inv.child_id) on conflict do nothing;
  delete from public.link_invites where code = k;
  select full_name into n from public.profiles where id = inv.child_id;
  return n;
end $$;

create or replace function public.linked_children()
returns table(link_id uuid, child_id uuid, full_name text, gender text, school_level text, class_name text, school_name text, avatar_path text, linked_at timestamptz)
language sql security definer stable set search_path = public as $$
  select l.id, l.child_id, p.full_name, p.gender, p.school_level, p.class_name, p.school_name, p.avatar_path, l.created_at
  from public.parent_links l join public.profiles p on p.id = l.child_id
  where l.parent_id = auth.uid() order by l.created_at;
$$;

create or replace function public.linked_parents()
returns table(link_id uuid, full_name text, linked_at timestamptz)
language sql security definer stable set search_path = public as $$
  select l.id, p.full_name, l.created_at
  from public.parent_links l join public.profiles p on p.id = l.parent_id
  where l.child_id = auth.uid() order by l.created_at;
$$;

-- Parent: read-only snapshot of a linked student's planner (no notes, no personal events).
create or replace function public.child_snapshot(p_child uuid)
returns jsonb language plpgsql security definer stable set search_path = public as $$
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and child_id = p_child) then
    raise exception 'not_linked';
  end if;
  return jsonb_build_object(
    'subjects',          coalesce((select jsonb_agg(to_jsonb(s)) from public.subjects s where s.user_id = p_child), '[]'),
    'timetable_entries', coalesce((select jsonb_agg(to_jsonb(t)) from public.timetable_entries t where t.user_id = p_child), '[]'),
    'tasks',             coalesce((select jsonb_agg(to_jsonb(k)) from public.tasks k where k.user_id = p_child), '[]'),
    'exams',             coalesce((select jsonb_agg(to_jsonb(x)) from public.exams x where x.user_id = p_child), '[]')
  );
end $$;

revoke all on function public.create_link_code(), public.redeem_link_code(text), public.linked_children(), public.linked_parents(), public.child_snapshot(uuid) from public, anon;
grant execute on function public.create_link_code(), public.redeem_link_code(text), public.linked_children(), public.linked_parents(), public.child_snapshot(uuid) to authenticated;

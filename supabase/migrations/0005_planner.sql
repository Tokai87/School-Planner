-- Rancang+ — Phase 4: planner data (subjects, timetable, homework, exams, notes, calendar events, children).
-- Every table is private to its owner: user_id = auth.uid() (set by default on insert, enforced by RLS).
-- Run in Supabase Dashboard -> SQL Editor (after 0001-0004). Safe to re-run.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 80),
  gender text check (gender in ('male','female')),
  school_level text check (char_length(school_level) <= 20),
  class_name text check (char_length(class_name) <= 40),
  school_name text check (char_length(school_name) <= 120),
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  teacher text check (char_length(teacher) <= 60),
  color text not null default '#3B82F6' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),          -- 1 = Monday … 7 = Sunday
  start_time time not null,
  end_time time not null,
  room text check (char_length(room) <= 40),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  details text check (char_length(details) <= 1000),
  due_date date not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  exam_date date not null,
  start_time time,
  venue text check (char_length(venue) <= 60),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text check (char_length(body) <= 5000),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  event_date date not null,
  kind text not null default 'event' check (kind in ('holiday','event','meeting','other')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists timetable_entries_user_day on public.timetable_entries (user_id, weekday, start_time);
create index if not exists tasks_user_due on public.tasks (user_id, due_date);
create index if not exists exams_user_date on public.exams (user_id, exam_date);
create index if not exists events_user_date on public.events (user_id, event_date);
create index if not exists subjects_user on public.subjects (user_id);

do $$
declare t text;
begin
  foreach t in array array['children','subjects','timetable_entries','tasks','exams','notes','events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists "%1$s_own" on public.%1$I', t);
    execute format('create policy "%1$s_own" on public.%1$I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

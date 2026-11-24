-- Rancang+ — Phase 2: profiles table, trigger, and Row Level Security.
-- Run in Supabase Dashboard -> SQL Editor (or `supabase db push`).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null,

  role text not null check (role in ('primary_student', 'secondary_student', 'parent')),

  school_name text,
  class_name text,

  school_level text check (
    school_level is null or school_level in (
      'Year 1','Year 2','Year 3','Year 4','Year 5','Year 6',
      'Form 1','Form 2','Form 3','Form 4','Form 5'
    )
  ),
  school_session text check (
    school_session is null or school_session in ('Morning','Afternoon','Full Day')
  ),

  phone_number text,

  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Primary students use Year 1-6, secondary students use Form 1-5.
  constraint profiles_primary_level check (
    role <> 'primary_student' or school_level is null
    or school_level in ('Year 1','Year 2','Year 3','Year 4','Year 5','Year 6')
  ),
  constraint profiles_secondary_level check (
    role <> 'secondary_student' or school_level is null
    or school_level in ('Form 1','Form 2','Form 3','Form 4','Form 5')
  ),
  -- A completed student profile must have its school details.
  constraint profiles_student_fields_required check (
    onboarding_completed = false
    or role = 'parent'
    or (school_name is not null and class_name is not null
        and school_level is not null and school_session is not null)
  )
);

-- No extra index needed: the primary key (id) already indexes every lookup this phase performs.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No delete policy and no anon policies: deletion happens via auth.users cascade only.

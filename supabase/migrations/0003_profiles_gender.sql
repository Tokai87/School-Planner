-- School Planner / Rancang+ — Phase 2b: gender (drives the male / female colour theme).
-- Nullable so profiles created before this migration keep working (they get the default theme).

alter table public.profiles
  add column if not exists gender text;

alter table public.profiles
  drop constraint if exists profiles_gender_check;
alter table public.profiles
  add constraint profiles_gender_check check (gender is null or gender in ('male', 'female'));

-- Rancang+ — Phase 6: a parent can keep a planner (subjects, timetable, homework, exams) for a child
-- added by hand. Rows with child_id = NULL belong to the account holder (a student's own planner);
-- rows with child_id set belong to that child record. Deleting a child deletes its planner rows.
-- Run in Supabase Dashboard -> SQL Editor (after 0001-0006). Safe to re-run.

do $$
declare t text;
begin
  foreach t in array array['subjects','timetable_entries','tasks','exams'] loop
    execute format('alter table public.%I add column if not exists child_id uuid references public.children(id) on delete cascade', t);
    execute format('create index if not exists %I on public.%I (child_id)', t || '_child_idx', t);
    -- the child must belong to the same user
    execute format('drop policy if exists "%1$s_own" on public.%1$I', t);
    execute format($p$create policy "%1$s_own" on public.%1$I for all to authenticated
      using (user_id = (select auth.uid()))
      with check (user_id = (select auth.uid())
        and (child_id is null or exists (select 1 from public.children c where c.id = child_id and c.user_id = (select auth.uid()))))$p$, t);
  end loop;
end $$;

-- A linked student's snapshot must keep returning only the student's own rows (not rows they might hold for a child).
create or replace function public.child_snapshot(p_child uuid)
returns jsonb language plpgsql security definer stable set search_path = public as $$
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and child_id = p_child) then
    raise exception 'not_linked';
  end if;
  return jsonb_build_object(
    'subjects',          coalesce((select jsonb_agg(to_jsonb(s)) from public.subjects s where s.user_id = p_child and s.child_id is null), '[]'),
    'timetable_entries', coalesce((select jsonb_agg(to_jsonb(t)) from public.timetable_entries t where t.user_id = p_child and t.child_id is null), '[]'),
    'tasks',             coalesce((select jsonb_agg(to_jsonb(k)) from public.tasks k where k.user_id = p_child and k.child_id is null), '[]'),
    'exams',             coalesce((select jsonb_agg(to_jsonb(x)) from public.exams x where x.user_id = p_child and x.child_id is null), '[]')
  );
end $$;

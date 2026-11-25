-- Undo 20261125102840_paid_learning: the feature was reverted in #19 and its restrictive policies block every student without learning_access.

drop policy "available tests" on public.tests;
drop policy "available questions" on public.questions;
drop policy "available writing prompts" on public.writing_prompts;
drop policy "available speaking prompts" on public.speaking_prompts;
drop policy "available attempts" on public.attempts;
drop policy "available writing submissions" on public.writing_submissions;
drop policy "available speaking submissions" on public.speaking_submissions;
drop policy "available learning paths" on public.learning_paths;

alter policy "read own and linked profiles" on public.profiles using (
  id = (select auth.uid())
  or exists (
    select 1 from public.parent_links l
    where (l.parent_id = (select auth.uid()) and l.student_id = profiles.id)
       or (l.student_id = (select auth.uid()) and l.parent_id = profiles.id)
  )
);

drop table public.daily_tasks;
drop function public.set_learning_access(text, boolean);

drop index public.attempts_in_progress_idx;
create unique index attempts_in_progress_idx
  on public.attempts (student_id, test_id) where submitted_at is null;

drop index public.one_placement_per_test;
drop index public.one_placement_writing;
drop index public.one_placement_speaking;

alter table public.attempts drop column placement;
alter table public.writing_submissions drop column placement;
alter table public.speaking_submissions drop column placement;

alter table public.profiles
  drop constraint baseline_pair,
  drop column learning_access,
  drop column baseline_band,
  drop column baseline_source,
  drop column placement_started_at;

alter table public.profiles
  add column learning_access boolean not null default false,
  add column baseline_band numeric(2,1) check (baseline_band between 0 and 9 and baseline_band * 2 = floor(baseline_band * 2)),
  add column baseline_source text check (baseline_source in ('self', 'placement', 'previous')),
  add column placement_started_at timestamptz,
  add constraint baseline_pair check ((baseline_band is null) = (baseline_source is null));

alter policy "read own and linked profiles" on public.profiles using (
  id = (select auth.uid()) or exists (
    select 1 from public.parent_links l
    where (l.parent_id = (select auth.uid()) and l.student_id = profiles.id and profiles.learning_access)
       or (l.student_id = (select auth.uid()) and l.parent_id = profiles.id)
  )
);

alter table public.attempts add column placement boolean not null default false;
alter table public.writing_submissions add column placement boolean not null default false;
alter table public.speaking_submissions add column placement boolean not null default false;

create unique index one_placement_per_test on public.attempts (student_id, test_id) where placement;
create unique index one_placement_writing on public.writing_submissions (student_id) where placement;
create unique index one_placement_speaking on public.speaking_submissions (student_id) where placement;

-- Ordinary exams retain their own in-progress attempt when a placement exam uses the same test.
drop index public.attempts_in_progress_idx;
create unique index attempts_in_progress_idx on public.attempts (student_id, test_id, placement) where submitted_at is null;

create policy "available tests" on public.tests as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student' and p.learning_access
    and (p.baseline_band is not null or (p.placement_started_at is not null and tests.id in (
      '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000021'
    ))))
  or exists (select 1 from public.attempts work join public.parent_links l on l.student_id = work.student_id
    where l.parent_id = (select auth.uid()) and work.test_id = tests.id)
);
create policy "available questions" on public.questions as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student')
  and exists (select 1 from public.tests t where t.id = questions.test_id)
);
create policy "available writing prompts" on public.writing_prompts as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student' and p.learning_access
    and (p.baseline_band is not null or (p.placement_started_at is not null and writing_prompts.id = '00000000-0000-4000-8000-000000000111')))
  or exists (select 1 from public.writing_submissions work join public.parent_links l on l.student_id = work.student_id
    where l.parent_id = (select auth.uid()) and work.prompt_id = writing_prompts.id)
);
create policy "available speaking prompts" on public.speaking_prompts as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student' and p.learning_access
    and (p.baseline_band is not null or (p.placement_started_at is not null and speaking_prompts.id = '00000000-0000-4000-8000-000000000213')))
  or exists (select 1 from public.speaking_submissions work join public.parent_links l on l.student_id = work.student_id
    where l.parent_id = (select auth.uid()) and work.prompt_id = speaking_prompts.id)
);
create policy "available attempts" on public.attempts as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = attempts.student_id and p.learning_access
    and (p.baseline_band is not null or (attempts.placement and p.placement_started_at is not null and p.id = (select auth.uid()))))
);
create policy "available writing submissions" on public.writing_submissions as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = writing_submissions.student_id and p.learning_access
    and (p.baseline_band is not null or (writing_submissions.placement and p.placement_started_at is not null and p.id = (select auth.uid()))))
);
create policy "available speaking submissions" on public.speaking_submissions as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = speaking_submissions.student_id and p.learning_access
    and (p.baseline_band is not null or (speaking_submissions.placement and p.placement_started_at is not null and p.id = (select auth.uid()))))
);
create policy "available learning paths" on public.learning_paths as restrictive for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = learning_paths.student_id and p.learning_access and p.baseline_band is not null)
);

create table public.daily_tasks (
  student_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  slot smallint not null check (slot between 0 and 2),
  title text not null,
  href text,
  done boolean not null default false,
  primary key (student_id, day, slot)
);
alter table public.daily_tasks enable row level security;
grant select on public.daily_tasks to authenticated;
grant select, insert, update on public.daily_tasks to service_role;
create policy "read own available daily tasks" on public.daily_tasks for select to authenticated using (
  student_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = daily_tasks.student_id and p.learning_access and p.baseline_band is not null
  )
);

-- Run as a database operator after verifying the course purchase.
create function public.set_learning_access(student_email text, enabled boolean)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  changed integer;
begin
  update public.profiles p
  set learning_access = enabled
  from auth.users u
  where p.id = u.id and p.role = 'student'
    and lower(u.email) = lower(trim(student_email)) and u.email_confirmed_at is not null
    and exists (
      select 1 from auth.identities i where i.user_id = u.id and i.provider = 'google'
        and lower(i.identity_data ->> 'email') = lower(u.email)
    );
  get diagnostics changed = row_count;
  if changed > 1 then raise exception 'More than one student matched'; end if;
  return changed = 1;
end;
$$;
revoke execute on function public.set_learning_access(text, boolean) from public, anon, authenticated, service_role;

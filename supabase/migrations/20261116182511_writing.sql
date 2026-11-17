-- Module 3 (Writing): prompts and AI-graded submissions.

create table public.writing_prompts (
  id uuid primary key default gen_random_uuid(),
  task smallint not null check (task in (1, 2)), -- IELTS Writing Task 1 or Task 2
  title text not null,
  prompt text not null,
  created_at timestamptz not null default now()
);

create table public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.writing_prompts (id) on delete cascade,
  essay text not null check (char_length(essay) between 1 and 10000),
  submitted_at timestamptz not null default now(),
  -- Filled by the AI examiner; both stay null until grading succeeds.
  band numeric(2, 1), -- copy of report.band, for lists and the learning path
  report jsonb -- shape defined by the zod contract
);
create index writing_submissions_student_id_idx on public.writing_submissions (student_id);
create index writing_submissions_prompt_id_idx on public.writing_submissions (prompt_id);

alter table public.writing_prompts enable row level security;
alter table public.writing_submissions enable row level security;

-- Clients only read; every write goes through the server (service_role).
grant select on public.writing_prompts, public.writing_submissions to authenticated;
grant select, insert, update, delete
  on public.writing_prompts, public.writing_submissions to service_role;

create policy "read writing prompts" on public.writing_prompts
  for select to authenticated using (true);

create policy "read own and linked writing submissions" on public.writing_submissions
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_links l
      where l.parent_id = (select auth.uid()) and l.student_id = writing_submissions.student_id
    )
  );

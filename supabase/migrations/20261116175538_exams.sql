-- Module 2: Reading/Listening tests, answer keys, attempts.

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  skill text not null check (skill in ('reading', 'listening')),
  title text not null,
  duration_seconds integer not null check (duration_seconds > 0),
  sections jsonb not null, -- [{ "title": text, "passage": text }], index = questions.section
  audio_path text, -- Storage path, listening only
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  number smallint not null check (number > 0),
  section smallint not null check (section >= 0),
  instruction text, -- shown above the first question of a group
  prompt text not null,
  options jsonb, -- ["A ...", "B ..."]; null = free-text answer
  unique (test_id, number)
);

-- Server-only: RLS on, no policy, no client grant.
create table public.answer_keys (
  question_id uuid primary key references public.questions (id) on delete cascade,
  accepted text[] not null check (cardinality(accepted) > 0)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  test_id uuid not null references public.tests (id) on delete cascade,
  started_at timestamptz not null default now(), -- the server derives the deadline from this
  submitted_at timestamptz, -- null = in progress
  raw_score smallint,
  band numeric(2, 1)
);
create index attempts_student_id_idx on public.attempts (student_id);
create index attempts_test_id_idx on public.attempts (test_id);
-- One in-progress attempt per student per test.
create unique index attempts_in_progress_idx
  on public.attempts (student_id, test_id) where submitted_at is null;

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  answer text,
  flagged boolean not null default false,
  primary key (attempt_id, question_id)
);
create index attempt_answers_question_id_idx on public.attempt_answers (question_id);

alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.answer_keys enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

-- Clients only read; every write goes through the server (service_role).
grant select
  on public.tests, public.questions, public.attempts, public.attempt_answers
  to authenticated;
grant select, insert, update, delete
  on public.tests, public.questions, public.answer_keys, public.attempts, public.attempt_answers
  to service_role;

create policy "read tests" on public.tests
  for select to authenticated using (true);

create policy "read questions" on public.questions
  for select to authenticated using (true);

create policy "read own and linked attempts" on public.attempts
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_links l
      where l.parent_id = (select auth.uid()) and l.student_id = attempts.student_id
    )
  );

-- The subquery runs under the attempts policy, so it inherits own/linked visibility.
create policy "read answers of visible attempts" on public.attempt_answers
  for select to authenticated
  using (exists (select 1 from public.attempts a where a.id = attempt_answers.attempt_id));

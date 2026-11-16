-- Module 3 (Speaking): prompts, recorded answers and AI-graded reports.

create table public.speaking_prompts (
  id uuid primary key default gen_random_uuid(),
  part smallint not null check (part in (1, 2, 3)), -- IELTS Speaking Part 1, 2 or 3
  title text not null,
  prompt text not null,
  created_at timestamptz not null default now()
);

create table public.speaking_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.speaking_prompts (id) on delete cascade,
  audio_path text not null, -- path inside the speaking-recordings bucket
  audio_type text not null, -- MIME type of the recording
  submitted_at timestamptz not null default now(),
  -- Filled by the AI examiner; both stay null until grading succeeds.
  band numeric(2, 1), -- copy of report.band, for lists and the learning path
  report jsonb -- shape defined by the zod contract
);
create index speaking_submissions_student_id_idx on public.speaking_submissions (student_id);
create index speaking_submissions_prompt_id_idx on public.speaking_submissions (prompt_id);

alter table public.speaking_prompts enable row level security;
alter table public.speaking_submissions enable row level security;

-- Clients only read; every write goes through the server (service_role).
grant select on public.speaking_prompts, public.speaking_submissions to authenticated;
grant select, insert, update, delete
  on public.speaking_prompts, public.speaking_submissions to service_role;

create policy "read speaking prompts" on public.speaking_prompts
  for select to authenticated using (true);

create policy "read own and linked speaking submissions" on public.speaking_submissions
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_links l
      where l.parent_id = (select auth.uid()) and l.student_id = speaking_submissions.student_id
    )
  );

-- Private bucket for recordings. No storage policies on purpose:
-- only the server (service_role) writes and reads it, and hands out short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('speaking-recordings', 'speaking-recordings', false)
on conflict (id) do nothing;

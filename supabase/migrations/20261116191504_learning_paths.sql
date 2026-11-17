-- Module 4: one AI-generated learning path per student, rebuilt from their latest results.

create table public.learning_paths (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  generated_at timestamptz not null default now(),
  path jsonb not null -- shape defined by the zod contract
);

alter table public.learning_paths enable row level security;

-- Clients only read; every write goes through the server (service_role).
grant select on public.learning_paths to authenticated;
grant select, insert, update, delete on public.learning_paths to service_role;

create policy "read own and linked learning paths" on public.learning_paths
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_links l
      where l.parent_id = (select auth.uid()) and l.student_id = learning_paths.student_id
    )
  );

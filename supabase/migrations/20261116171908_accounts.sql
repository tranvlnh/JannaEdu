-- Module 1: profiles, parent-student links, one-time link codes.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text check (role in ('student', 'parent')), -- null until onboarding
  full_name text,
  created_at timestamptz not null default now()
);

create table public.parent_links (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id),
  check (parent_id <> student_id)
);
create index parent_links_student_id_idx on public.parent_links (student_id);

-- One active code per student. Server-only: RLS on, no policy, no client grant.
create table public.link_codes (
  code text primary key,
  student_id uuid not null unique references public.profiles (id) on delete cascade,
  expires_at timestamptz not null
);

alter table public.profiles enable row level security;
alter table public.parent_links enable row level security;
alter table public.link_codes enable row level security;

-- Clients only read; every write goes through the server (service_role).
grant select on public.profiles, public.parent_links to authenticated;
grant select, insert, update, delete
  on public.profiles, public.parent_links, public.link_codes to service_role;

create policy "read own links" on public.parent_links
  for select to authenticated
  using ((select auth.uid()) in (parent_id, student_id));

create policy "read own and linked profiles" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.parent_links l
      where (l.parent_id = (select auth.uid()) and l.student_id = profiles.id)
         or (l.student_id = (select auth.uid()) and l.parent_id = profiles.id)
    )
  );

-- Create a profile for every new auth user. full_name is display-only, never used for authorization.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users who signed up before this migration.
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;

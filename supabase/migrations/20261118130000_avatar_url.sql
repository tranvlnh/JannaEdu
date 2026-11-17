-- Google profile picture, copied from the auth user so linked parents can see a student's avatar.
alter table public.profiles add column avatar_url text;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Users who signed up before this migration.
update public.profiles p
set avatar_url = u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
where u.id = p.id;

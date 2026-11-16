-- Private bucket for Listening audio. No storage policies on purpose:
-- only the server (service_role) reads it and hands out short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('listening-audio', 'listening-audio', false)
on conflict (id) do nothing;

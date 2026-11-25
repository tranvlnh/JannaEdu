-- Demo course purchase, the student's starting band, and the placement test.
-- Additive only: access is enforced in the app (server), never by restrictive RLS — see 20261125150500_revert_paid_learning.

-- Written only by the server (service_role); clients keep select-only on profiles.
alter table public.profiles
  add column enrolled_course text,          -- id from src/lib/courses.ts; null = not purchased (demo: no real payment)
  add column enrolled_at timestamptz,
  add column current_band numeric(2, 1)     -- self-reported at onboarding; null = unknown
    check (current_band between 0 and 9 and current_band * 2 = floor(current_band * 2)),
  add column needs_placement boolean not null default false; -- picked "I don't know" and has not finished the placement test

alter table public.tests add column is_placement boolean not null default false;
alter table public.writing_prompts add column is_placement boolean not null default false;
alter table public.speaking_prompts add column is_placement boolean not null default false;

-- The placement test is the oldest item of each skill.
update public.tests set is_placement = true
where id in (
  (select id from public.tests where skill = 'reading' order by created_at limit 1),
  (select id from public.tests where skill = 'listening' order by created_at limit 1)
);
update public.writing_prompts set is_placement = true
where id = (select id from public.writing_prompts where task = 2 order by created_at limit 1);
update public.speaking_prompts set is_placement = true
where id = (select id from public.speaking_prompts order by part, created_at limit 1);

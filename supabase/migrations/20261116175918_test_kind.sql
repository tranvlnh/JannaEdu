-- Exam vs practice tests. Practice may be untimed and is not converted to a band.

alter table public.tests
  add column kind text not null check (kind in ('exam', 'practice')), -- table is still empty, no default needed
  alter column duration_seconds drop not null, -- null = untimed
  add constraint tests_exam_is_timed check (kind = 'practice' or duration_seconds is not null);

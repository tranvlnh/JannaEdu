-- Target IELTS band a student picks on the account page; null until they pick one.
alter table public.profiles
  add column goal_band numeric(2, 1)
  check (goal_band between 4 and 9 and goal_band * 2 = floor(goal_band * 2));

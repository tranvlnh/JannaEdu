-- Sample Speaking prompt. Safe to run more than once.
insert into public.speaking_prompts (id, part, title, prompt)
values (
  '00000000-0000-4000-8000-000000000201',
  2,
  'Đề mẫu Speaking Part 2: A person you admire',
  'Describe a person you admire.

You should say:
- who this person is
- how you know them
- what they are like
and explain why you admire them.

You should speak for 1 to 2 minutes.'
)
on conflict (id) do nothing;

-- Sample Writing prompt. Safe to run more than once.
insert into public.writing_prompts (id, task, title, prompt)
values (
  '00000000-0000-4000-8000-000000000101',
  2,
  'Đề mẫu Writing Task 2: Learning a foreign language early',
  'Some people think that children should start learning a foreign language at primary school rather than secondary school.

Do the advantages of this outweigh the disadvantages?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
)
on conflict (id) do nothing;

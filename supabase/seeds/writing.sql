-- Writing Task 2 prompts from real IELTS tests (December 2025). Safe to run more than once.
-- Task 1 prompts are left out: they need a chart or diagram and prompts are text only.

-- Remove the old sample prompt (cascades to its submissions).
delete from public.writing_prompts where id = '00000000-0000-4000-8000-000000000101';

insert into public.writing_prompts (id, task, title, prompt)
values
  (
    '00000000-0000-4000-8000-000000000111',
    2,
    'Writing Task 2: Admiring media and sports stars',
    'Nowadays young people are admiring media and sports stars, even though they often do not set a good example.

Do you think this is a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
  ),
  (
    '00000000-0000-4000-8000-000000000112',
    2,
    'Writing Task 2: Children, TV and computer games',
    'Nowadays, children spend too much time watching TV and playing computer games. Some people believe this has negative effects on children''s mental abilities.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
  ),
  (
    '00000000-0000-4000-8000-000000000113',
    2,
    'Writing Task 2: Free university education',
    'University education should be free for all students.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
  ),
  (
    '00000000-0000-4000-8000-000000000114',
    2,
    'Writing Task 2: Young people changing careers',
    'A growing number of young people are changing their jobs and career paths.

What are the reasons behind this phenomenon? Do the benefits of this trend outweigh the drawbacks?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
  ),
  (
    '00000000-0000-4000-8000-000000000115',
    2,
    'Writing Task 2: Controlling the use of fresh water',
    'Some people think that people should be given the right to use fresh water as they like. Others believe governments should strictly control the use of fresh water.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'
  )
on conflict (id) do nothing;

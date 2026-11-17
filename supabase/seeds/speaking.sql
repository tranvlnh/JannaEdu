-- Speaking prompts from Janna Academy's IELTS Speaking material (Part 1 topics, Part 2 cue cards
-- and their Part 3 follow-ups). Safe to run more than once.

-- Remove the old sample prompt (cascades to its submissions).
delete from public.speaking_prompts where id = '00000000-0000-4000-8000-000000000201';

insert into public.speaking_prompts (id, part, title, prompt)
values
  (
    '00000000-0000-4000-8000-000000000211',
    1,
    'Speaking Part 1: Hometown',
    'Answer these questions about your hometown:

- Where is your hometown?
- What do you like about your hometown?
- Is your hometown a good place to live?'
  ),
  (
    '00000000-0000-4000-8000-000000000212',
    1,
    'Speaking Part 1: Hobbies',
    'Answer these questions about your hobbies:

- What hobbies do you have?
- How often do you do your hobbies?
- Do you think hobbies are important?'
  ),
  (
    '00000000-0000-4000-8000-000000000213',
    2,
    'Speaking Part 2: A person whose job is useful to society',
    'Describe a person you know who does a job which is useful to society.

You should say:
- who this person is
- how you knew him/her
- what type of work he/she does
and explain why you think his/her work is useful to society.

You should speak for 1 to 2 minutes.'
  ),
  (
    '00000000-0000-4000-8000-000000000214',
    2,
    'Speaking Part 2: A popular teacher',
    'Describe a popular teacher that you know.

You should say:
- what this teacher looks like
- what sort of person this teacher is
- what this teacher helped you to learn
and explain why this teacher is popular.

You should speak for 1 to 2 minutes.'
  ),
  (
    '00000000-0000-4000-8000-000000000215',
    3,
    'Speaking Part 3: Schools and preparing for life',
    'Answer these questions:

- What can schools do to help students prepare for the next stage in their lives?
- What advice would you give to someone who doesn''t like school?
- What can schools teach children that they can''t learn from their parents?'
  )
on conflict (id) do nothing;

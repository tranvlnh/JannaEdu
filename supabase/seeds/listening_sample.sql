-- Sample data. Safe to run more than once: existing rows are left alone.
-- For choice questions the accepted answer is the option text, exactly as listed in options.

-- Technical sample for Listening: the audio is three beeps (listening-audio/sample-beeps.wav, uploaded by hand).
insert into public.tests (id, skill, kind, title, duration_seconds, sections, audio_path)
values (
  '00000000-0000-4000-8000-000000000002',
  'listening',
  'practice',
  'Đề mẫu Listening: đếm tiếng bíp',
  null,
  '[{"title": "Part 1", "passage": "Nghe đoạn âm thanh và trả lời câu hỏi."}]',
  'sample-beeps.wav'
)
on conflict (id) do nothing;

with q (number, instruction, prompt, options, accepted) as (
  values
    (1, 'Questions 1-2: Listen and answer.', 'How many beeps do you hear?',
        '["A. Two", "B. Three", "C. Four"]'::jsonb, array['B. Three']),
    (2, null, 'Write the number of beeps.', null, array['3', 'three'])
),
inserted as (
  insert into public.questions (test_id, number, section, instruction, prompt, options)
  select '00000000-0000-4000-8000-000000000002', number, 0, instruction, prompt, options from q
  on conflict (test_id, number) do nothing
  returning id, number
)
insert into public.answer_keys (question_id, accepted)
select inserted.id, q.accepted from inserted join q using (number);

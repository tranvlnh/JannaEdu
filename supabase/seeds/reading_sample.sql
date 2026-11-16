-- Sample data. Safe to run more than once: existing rows are left alone.
-- For choice questions the accepted answer is the option text, exactly as listed in options.

insert into public.tests (id, skill, kind, title, duration_seconds, sections)
values (
  '00000000-0000-4000-8000-000000000001',
  'reading',
  'exam',
  'Đề mẫu Reading: Urban Beekeeping',
  1200,
  $json$[{
    "title": "Urban Beekeeping",
    "passage": "A. Twenty years ago, keeping bees was seen as a rural hobby that required fields, orchards and plenty of space. Today, hives can be found on the roofs of hotels, offices and apartment blocks in many of the world's largest cities. In London alone, the number of registered hives more than doubled in the ten years after 2008.\n\nB. It may seem surprising that bees do well in cities, but urban areas offer several advantages. Parks, gardens and balconies contain a wide variety of flowering plants, and something is in bloom for most of the year. In the countryside, by contrast, large farms often grow a single crop that flowers for only a few weeks. City plants are also less likely to be treated with agricultural pesticides. As a result, urban colonies often produce more honey than rural ones, and the honey has a more complex flavour.\n\nC. However, scientists warn that the trend has limits. A city can only provide a certain amount of nectar and pollen, and when too many hives are placed in a small area, the bees must compete for food. This competition affects not only honeybees but also wild pollinators such as bumblebees and solitary bees, which cannot be fed by a beekeeper when flowers are scarce. Some researchers argue that planting more flowers would help pollinators far more than adding new hives.\n\nD. New beekeepers also underestimate the work involved. A hive must be inspected every week during spring and summer to check for disease and to prevent swarming, when a large group of bees leaves the hive to form a new colony. A swarm settling on a busy street can alarm the public, even though swarming bees are usually calm. For this reason, most beekeeping associations advise beginners to complete a training course and to work alongside an experienced mentor during their first year."
  }]$json$
)
on conflict (id) do nothing;

with q (number, instruction, prompt, options, accepted) as (
  values
    (1, 'Questions 1-5: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.',
        'Beekeeping used to be considered an activity for the countryside.',
        '["TRUE", "FALSE", "NOT GIVEN"]'::jsonb, array['TRUE']),
    (2, null, 'The number of hives in London fell after 2008.',
        '["TRUE", "FALSE", "NOT GIVEN"]', array['FALSE']),
    (3, null, 'City honey is sold at a higher price than countryside honey.',
        '["TRUE", "FALSE", "NOT GIVEN"]', array['NOT GIVEN']),
    (4, null, 'Plants in cities are less likely to be treated with pesticides than farm crops.',
        '["TRUE", "FALSE", "NOT GIVEN"]', array['TRUE']),
    (5, null, 'Beekeepers are able to feed wild bees when flowers are scarce.',
        '["TRUE", "FALSE", "NOT GIVEN"]', array['FALSE']),
    (6, 'Questions 6-9: Choose the correct answer.',
        'According to paragraph B, why do farms offer bees less food than cities?',
        '["A. Farms use too much water.", "B. A single crop flowers for only a short time.", "C. Farms are too far from the hives.", "D. Farm flowers contain no nectar."]',
        array['B. A single crop flowers for only a short time.']),
    (7, null, 'What do some researchers suggest would help pollinators most?',
        '["A. Adding more hives.", "B. Moving hives to the countryside.", "C. Planting more flowers.", "D. Banning beekeeping in cities."]',
        array['C. Planting more flowers.']),
    (8, null, 'How often should a hive be inspected in spring and summer?',
        '["A. Every day.", "B. Every week.", "C. Every month.", "D. Once a season."]',
        array['B. Every week.']),
    (9, null, 'What does the writer say about swarming bees?',
        '["A. They are usually calm.", "B. They are very dangerous.", "C. They produce more honey.", "D. They only appear in winter."]',
        array['A. They are usually calm.']),
    (10, 'Questions 10-13: Complete the sentences. Write ONE WORD ONLY from the passage for each answer.',
        'In cities, hives are often placed on the ______ of buildings such as hotels and offices.',
        null, array['roofs', 'roof']),
    (11, null, 'Honey from urban colonies has a more complex ______.',
        null, array['flavour', 'flavor']),
    (12, null, 'When hives are too close together, bees have to ______ for food.',
        null, array['compete']),
    (13, null, 'Beginners are advised to work with an experienced ______ in their first year.',
        null, array['mentor'])
),
inserted as (
  insert into public.questions (test_id, number, section, instruction, prompt, options)
  select '00000000-0000-4000-8000-000000000001', number, 0, instruction, prompt, options from q
  on conflict (test_id, number) do nothing
  returning id, number
)
insert into public.answer_keys (question_id, accepted)
select inserted.id, q.accepted from inserted join q using (number);

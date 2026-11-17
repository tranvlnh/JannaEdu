-- Listening tests (IELTS Listening Tests 6, 86 and 93). Safe to run more than once:
-- existing rows are left alone. Generated from the source PDFs and their answer keys.
-- For choice questions the accepted answer is the option text, exactly as listed in options.
-- "Choose TWO" pairs accept either correct option in both slots.

-- Remove the old sample test (cascades to its questions, keys and attempts).
delete from public.tests where id = '00000000-0000-4000-8000-000000000002';

-- Audio lives in the listening-audio bucket and is uploaded separately (see audio_path).

-- IELTS Listening Test 6
insert into public.tests (id, skill, kind, title, duration_seconds, sections, audio_path)
values (
  '00000000-0000-4000-8000-000000000021',
  'listening',
  'exam',
  'IELTS Listening Test 6',
  1500,
  $json$[
  {
    "title": "Part 1",
    "passage": "Nghe Part 1 và trả lời câu hỏi 1–10."
  },
  {
    "title": "Part 2",
    "passage": "Nghe Part 2 và trả lời câu hỏi 11–20."
  },
  {
    "title": "Part 3",
    "passage": "Nghe Part 3 và trả lời câu hỏi 21–30."
  },
  {
    "title": "Part 4",
    "passage": "Nghe Part 4 và trả lời câu hỏi 31–40."
  }
]$json$,
  'ielts-listening-test-6.mp3'
)
on conflict (id) do nothing;

with q (number, section, instruction, prompt, options, accepted) as (
  values
    (1, 0, 'Questions 1–5: Complete the form below. Write NO MORE THAN THREE WORDS OR A NUMBER for each answer.

BORGHEIMER LANGUAGE COURSES INFORMATION
Course level: 3 / lower intermediate', 'Customer’s name: ______',
        null::jsonb, array['John Petterson']),
    (2, 0, null, 'Maximum class size: ______',
        null::jsonb, array['12', 'twelve']),
    (3, 0, null, 'Hours of study per day (weekdays): ______',
        null::jsonb, array['5', 'five']),
    (4, 0, null, 'Most expensive accommodation: ______',
        null::jsonb, array['bed and breakfast']),
    (5, 0, null, 'First Berlin course begins: ______',
        null::jsonb, array['8th June', '8 June', 'June 8th', 'June 8']),
    (6, 0, 'Questions 6 and 7: Choose TWO letters, A–E.', 'Which TWO things does he need to buy for the course? (first answer)',
        '["A. computer", "B. computer disks", "C. dictionary", "D. translation exercises", "E. textbooks"]'::jsonb, array['C. dictionary', 'E. textbooks']),
    (7, 0, null, 'Which TWO things does he need to buy for the course? (second answer)',
        '["A. computer", "B. computer disks", "C. dictionary", "D. translation exercises", "E. textbooks"]'::jsonb, array['C. dictionary', 'E. textbooks']),
    (8, 0, 'Questions 8–10: Complete the sentences below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Without the student discount, the course costs ______ Euros.',
        null::jsonb, array['550']),
    (9, 0, null, 'Payment can be made by credit card or by ______.',
        null::jsonb, array['bank transfer']),
    (10, 0, null, 'To get a free course you need to find ______ other people.',
        null::jsonb, array['five', '5']),
    (11, 1, 'Questions 11–15: Complete the sentences below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Ministers and officials put the ______ of the agriculture business first.',
        null::jsonb, array['profits']),
    (12, 1, null, 'Hormones make cattle ______ thus making meat production more profitable.',
        null::jsonb, array['grow faster']),
    (13, 1, null, 'The use of hormones was banned over ______ ago in Europe.',
        null::jsonb, array['20 years', 'twenty years']),
    (14, 1, null, 'The USA and Canada asked the WTO to declare the ban ______.',
        null::jsonb, array['illegal']),
    (15, 1, null, 'A Danish study shows that hormones are over ______ more dangerous than was previously thought.',
        null::jsonb, array['200 times']),
    (16, 1, 'Questions 16–20: Complete the summary below (Lack of testing). Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'The government has not been testing beef which is ______, much to the anger of Mr. Verral.',
        null::jsonb, array['imported']),
    (17, 1, null, 'About ______ of the beef which British people eat comes from abroad.',
        null::jsonb, array['40%', '40 percent', '40 per cent', 'forty percent', 'forty per cent']),
    (18, 1, null, 'Some of it comes from Brazil, a country which on paper does not allow the use of ______.',
        null::jsonb, array['hormones', 'growth hormones']),
    (19, 1, null, 'When some EU inspectors visited a Brazilian farm, they found a ______ of the banned substance.',
        null::jsonb, array['large stockpile']),
    (20, 1, null, 'A well-known chocolate company found out its sweets were contaminated with ______ of salmonella.',
        null::jsonb, array['a rare form', 'rare form']),
    (21, 2, 'Questions 21–25: Complete the summary below (High achievers). Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'People who bring work home every night tend to peak early and then go into ______.',
        null::jsonb, array['decline']),
    (22, 2, null, 'High achievers work hard, but within ______.',
        null::jsonb, array['strict limits']),
    (23, 2, null, 'It is also important to choose ______ you enjoy.',
        null::jsonb, array['a career', 'career']),
    (24, 2, null, 'Top achievers spend over ______ of their working hours doing work they prefer.',
        null::jsonb, array['two-thirds', 'two thirds', '2/3']),
    (25, 2, null, 'They want ______, not just external rewards.',
        null::jsonb, array['internal satisfaction']),
    (26, 2, 'Questions 26–30: Choose the correct letter, A, B or C.', 'Top achievers take risks',
        '["A. without worrying about the consequences", "B. only if they are assured of success", "C. even if they face possible failure"]'::jsonb, array['C. even if they face possible failure']),
    (27, 2, null, 'Very often perfectionists',
        '["A. turn out to be top achievers", "B. don’t get many results", "C. are not hard working"]'::jsonb, array['B. don’t get many results']),
    (28, 2, null, 'When top achievers make mistakes',
        '["A. they ignore the fact", "B. they get angry with themselves", "C. they learn from the experience"]'::jsonb, array['C. they learn from the experience']),
    (29, 2, null, 'Top achievers tend to be people who',
        '["A. work well with others", "B. prefer to work alone", "C. complicate matters"]'::jsonb, array['A. work well with others']),
    (30, 2, null, 'Loners',
        '["A. want to do everything themselves", "B. are free of the compulsion to be perfect", "C. take no notice of rivals"]'::jsonb, array['A. want to do everything themselves']),
    (31, 3, 'Questions 31–34: Choose the correct letter, A, B or C.', 'Exposure to bright light',
        '["A. stopped production of melatonin in patients", "B. increased the production of melatonin in many patients", "C. caused people to crave sweet things"]'::jsonb, array['A. stopped production of melatonin in patients']),
    (32, 3, null, 'Melatonin’s role in SAD is',
        '["A. not considered that important", "B. now fully understood", "C. not fully understood"]'::jsonb, array['C. not fully understood']),
    (33, 3, null, 'Subsyndromal SAD',
        '["A. is more common than SAD", "B. has approximately the same number of sufferers as SAD", "C. is far less common than SAD"]'::jsonb, array['A. is more common than SAD']),
    (34, 3, null, 'You would expect the typical SAD sufferer to be',
        '["A. a 45 year old man", "B. a 16 year old girl", "C. a 25 year old woman"]'::jsonb, array['C. a 25 year old woman']),
    (35, 3, 'Questions 35–40: Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.', 'Depression probably has a ______ as it seems to run in the family.',
        null::jsonb, array['genetic component', 'a genetic component']),
    (36, 3, null, 'Many SAD sufferers have a ______ craving.',
        null::jsonb, array['carbohydrate']),
    (37, 3, null, 'Serotonin has a ______ effect on the brain.',
        null::jsonb, array['soothing']),
    (38, 3, null, 'The serotonin system of the brain cannot regulate itself well during ______.',
        null::jsonb, array['winter', 'the winter']),
    (39, 3, null, 'Some neurotransmitters may be ______ in certain cases.',
        null::jsonb, array['inadequate']),
    (40, 3, null, 'Many SAD patients put on fat in late autumn, just as ______.',
        null::jsonb, array['hibernations', 'hibernation'])
),
inserted as (
  insert into public.questions (test_id, number, section, instruction, prompt, options)
  select '00000000-0000-4000-8000-000000000021', number, section, instruction, prompt, options from q
  on conflict (test_id, number) do nothing
  returning id, number
)
insert into public.answer_keys (question_id, accepted)
select inserted.id, q.accepted from inserted join q using (number);

-- IELTS Listening Test 86
insert into public.tests (id, skill, kind, title, duration_seconds, sections, audio_path)
values (
  '00000000-0000-4000-8000-000000000022',
  'listening',
  'exam',
  'IELTS Listening Test 86',
  2400,
  $json$[
  {
    "title": "Part 1",
    "passage": "Nghe Part 1 và trả lời câu hỏi 1–10."
  },
  {
    "title": "Part 2",
    "passage": "Nghe Part 2 và trả lời câu hỏi 11–20."
  },
  {
    "title": "Part 3",
    "passage": "Nghe Part 3 và trả lời câu hỏi 21–30."
  },
  {
    "title": "Part 4",
    "passage": "Nghe Part 4 và trả lời câu hỏi 31–40."
  }
]$json$,
  'ielts-listening-test-86.mp3'
)
on conflict (id) do nothing;

with q (number, section, instruction, prompt, options, accepted) as (
  values
    (1, 0, 'Questions 1–10: Complete the notes below. Write NO MORE THAN ONE WORD OR A NUMBER for each answer.

Accommodation form: rental properties
Name: Jane Ryder', 'Contact phone number: 0044 ______',
        null::jsonb, array['2086132978', '208 613 2978']),
    (2, 0, null, 'Email address: richard@______.co.uk',
        null::jsonb, array['visiontech']),
    (3, 0, null, 'Occupation: a local ______',
        null::jsonb, array['doctor']),
    (4, 0, null, 'Type of accommodation: a 2 bedroom apartment wanted (must have its own ______)',
        null::jsonb, array['garage']),
    (5, 0, null, 'No ______ required',
        null::jsonb, array['furniture']),
    (6, 0, null, 'A ______ in the kitchen is preferable',
        null::jsonb, array['fridge']),
    (7, 0, null, 'Preferred location: near a ______',
        null::jsonb, array['school']),
    (8, 0, null, 'Maximum rent: ______ per month',
        null::jsonb, array['950']),
    (9, 0, null, 'Other requests: the accommodation has to be ______ in the daytime',
        null::jsonb, array['quiet']),
    (10, 0, null, 'How did you first hear about us? Through a ______',
        null::jsonb, array['friend']),
    (11, 1, 'Questions 11–15: Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.', 'The police officer suggests neighbours give each other their ______.',
        null::jsonb, array['contact details']),
    (12, 1, null, 'Neighbours should discuss what to do if there’s any kind of ______.',
        null::jsonb, array['emergency']),
    (13, 1, null, 'It’s a good idea to leave on the ______.',
        null::jsonb, array['radio', 'the radio']),
    (14, 1, null, 'Think carefully about where you put any ______.',
        null::jsonb, array['keys', 'extra keys']),
    (15, 1, null, 'It’s a good idea to buy good-quality ______.',
        null::jsonb, array['locks', 'window locks']),
    (16, 1, 'Questions 16–20: Which crime prevention measure is proposed for each area affected by crime? Choose the correct letter, A–G.', 'skate park',
        '["A. install more lighting", "B. have more police officers on patrol", "C. remove surrounding vegetation", "D. contact local police", "E. fix damage quickly", "F. change road design", "G. use security cameras"]'::jsonb, array['C. remove surrounding vegetation']),
    (17, 1, null, 'local primary schools',
        '["A. install more lighting", "B. have more police officers on patrol", "C. remove surrounding vegetation", "D. contact local police", "E. fix damage quickly", "F. change road design", "G. use security cameras"]'::jsonb, array['D. contact local police']),
    (18, 1, null, 'Abbotsford Street',
        '["A. install more lighting", "B. have more police officers on patrol", "C. remove surrounding vegetation", "D. contact local police", "E. fix damage quickly", "F. change road design", "G. use security cameras"]'::jsonb, array['F. change road design']),
    (19, 1, null, 'shops on Victoria Street',
        '["A. install more lighting", "B. have more police officers on patrol", "C. remove surrounding vegetation", "D. contact local police", "E. fix damage quickly", "F. change road design", "G. use security cameras"]'::jsonb, array['G. use security cameras']),
    (20, 1, null, 'supermarket car park',
        '["A. install more lighting", "B. have more police officers on patrol", "C. remove surrounding vegetation", "D. contact local police", "E. fix damage quickly", "F. change road design", "G. use security cameras"]'::jsonb, array['E. fix damage quickly']),
    (21, 2, 'Questions 21–26: Presentation on the problems and potential of biofuels. Choose the correct letter, A, B or C.', 'Mike suggests they begin their presentation by',
        '["A. explaining what kind of harm is caused by fossil fuels.", "B. pointing out that biofuels were in use before fossil fuels.", "C. ensuring students know the difference between fossil fuels and biofuels."]'::jsonb, array['B. pointing out that biofuels were in use before fossil fuels.']),
    (22, 2, null, 'Karina doesn’t want to discuss the production of ethanol because',
        '["A. other students will already be familiar with the process.", "B. there will not be time to cover more important information.", "C. they may not provide an accurate description."]'::jsonb, array['C. they may not provide an accurate description.']),
    (23, 2, null, 'Which source of biofuel do the students agree is least environmentally friendly?',
        '["A. sugar cane", "B. corn", "C. canola"]'::jsonb, array['B. corn']),
    (24, 2, null, 'What is the main problem facing the development of the biofuel industry in the USA?',
        '["A. inadequate infrastructure for transporting ethanol", "B. not enough farmers growing biofuel crops", "C. little government support of biofuel development"]'::jsonb, array['A. inadequate infrastructure for transporting ethanol']),
    (25, 2, null, 'Karina doubts that sugar cane production in Brazil will',
        '["A. lead to the loss of wildlife habitats.", "B. create a large number of jobs in the biofuel sector.", "C. continue to provide enough energy for the country’s needs."]'::jsonb, array['C. continue to provide enough energy for the country’s needs.']),
    (26, 2, null, 'Karina and Mike conclude that in order to increase the use of biofuels',
        '["A. the price of fossil fuels must go up.", "B. more machinery must be adapted to use them.", "C. production methods must be more energy-efficient."]'::jsonb, array['C. production methods must be more energy-efficient.']),
    (27, 2, 'Questions 27–30: Answer the questions below. Write NO MORE THAN TWO WORDS for each answer. Answers in each pair may be in either order.', 'What TWO biofuel-related problems do Mike and Karina decide to focus on in the last section of their presentation? (first problem)',
        null::jsonb, array['hunger', 'global hunger', 'pollution']),
    (28, 2, null, 'What TWO biofuel-related problems do Mike and Karina decide to focus on in the last section of their presentation? (second problem)',
        null::jsonb, array['hunger', 'global hunger', 'pollution']),
    (29, 2, null, 'Apart from algae, which TWO sources of biofuel do Mike and Karina say are being tried out? (first source)',
        null::jsonb, array['wood', 'grass']),
    (30, 2, null, 'Apart from algae, which TWO sources of biofuel do Mike and Karina say are being tried out? (second source)',
        null::jsonb, array['wood', 'grass']),
    (31, 3, 'Questions 31–34: Complete the summary below (The ‘weak-tie’ theory: how friends-of-friends influence us). Write ONE WORD ONLY for each answer.', 'In 1973, Mark Granovetter claimed that the influence of ‘weak-ties’ can affect the behaviour of populations in the fields of information science, politics and ______.',
        null::jsonb, array['marketing']),
    (32, 3, null, 'Although friends-of-friends may be unlike us, they have similar enough ______ to have a beneficial effect on our lives.',
        null::jsonb, array['interests']),
    (33, 3, null, 'An example of this influence is when we hear about ______, because information about them is provided by weak-ties.',
        null::jsonb, array['jobs']),
    (34, 3, null, 'Other studies have shown that weak-tie networks also benefit our ______.',
        null::jsonb, array['health']),
    (35, 3, 'Questions 35 and 36: Choose TWO letters, A–E.', 'Which does the speaker believe are TWO real benefits of online social networking? (first answer)',
        '["A. people can gain higher self-esteem", "B. people can access useful medical information", "C. people can form relationships more quickly", "D. people can improve academic performance", "E. people can be reliably informed about current affairs"]'::jsonb, array['C. people can form relationships more quickly', 'E. people can be reliably informed about current affairs']),
    (36, 3, null, 'Which does the speaker believe are TWO real benefits of online social networking? (second answer)',
        '["A. people can gain higher self-esteem", "B. people can access useful medical information", "C. people can form relationships more quickly", "D. people can improve academic performance", "E. people can be reliably informed about current affairs"]'::jsonb, array['C. people can form relationships more quickly', 'E. people can be reliably informed about current affairs']),
    (37, 3, 'Questions 37 and 38: Choose TWO letters, A–E.', 'Which TWO problems related to online social networking will increase, according to the speaker? (first answer)',
        '["A. criminal activity", "B. poorer grades at school", "C. a decline in physical fitness", "D. less work done by employees", "E. loss of career prospects"]'::jsonb, array['A. criminal activity', 'D. less work done by employees']),
    (38, 3, null, 'Which TWO problems related to online social networking will increase, according to the speaker? (second answer)',
        '["A. criminal activity", "B. poorer grades at school", "C. a decline in physical fitness", "D. less work done by employees", "E. loss of career prospects"]'::jsonb, array['A. criminal activity', 'D. less work done by employees']),
    (39, 3, 'Questions 39 and 40: Choose TWO letters, A–E.', 'Which TWO claims are made by Robin Dunbar about social networking sites? (first answer)',
        '["A. They are not helpful for developing certain social skills.", "B. They cannot fully reveal a person’s real character.", "C. They are not a good starting point for building new relationships.", "D. They do not encourage people to widen their social circle.", "E. They will not retain their popularity with the young generation."]'::jsonb, array['A. They are not helpful for developing certain social skills.', 'C. They are not a good starting point for building new relationships.']),
    (40, 3, null, 'Which TWO claims are made by Robin Dunbar about social networking sites? (second answer)',
        '["A. They are not helpful for developing certain social skills.", "B. They cannot fully reveal a person’s real character.", "C. They are not a good starting point for building new relationships.", "D. They do not encourage people to widen their social circle.", "E. They will not retain their popularity with the young generation."]'::jsonb, array['A. They are not helpful for developing certain social skills.', 'C. They are not a good starting point for building new relationships.'])
),
inserted as (
  insert into public.questions (test_id, number, section, instruction, prompt, options)
  select '00000000-0000-4000-8000-000000000022', number, section, instruction, prompt, options from q
  on conflict (test_id, number) do nothing
  returning id, number
)
insert into public.answer_keys (question_id, accepted)
select inserted.id, q.accepted from inserted join q using (number);

-- IELTS Listening Test 93
insert into public.tests (id, skill, kind, title, duration_seconds, sections, audio_path)
values (
  '00000000-0000-4000-8000-000000000023',
  'listening',
  'exam',
  'IELTS Listening Test 93',
  2400,
  $json$[
  {
    "title": "Part 1",
    "passage": "Nghe Part 1 và trả lời câu hỏi 1–10."
  },
  {
    "title": "Part 2",
    "passage": "Nghe Part 2 và trả lời câu hỏi 11–20."
  },
  {
    "title": "Part 3",
    "passage": "Nghe Part 3 và trả lời câu hỏi 21–30."
  },
  {
    "title": "Part 4",
    "passage": "Nghe Part 4 và trả lời câu hỏi 31–40."
  }
]$json$,
  'ielts-listening-test-93.mp3'
)
on conflict (id) do nothing;

with q (number, section, instruction, prompt, options, accepted) as (
  values
    (1, 0, 'Questions 1–10: Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.

Cycling club notes
James is the club secretary', 'Membership: chance for members to enter ______',
        null::jsonb, array['competitions']),
    (2, 0, null, 'Membership: extra fee covers meetings with guest speakers and ______',
        null::jsonb, array['refreshments']),
    (3, 0, null, 'Membership: new members receive a free ______ for their bike',
        null::jsonb, array['repair kit']),
    (4, 0, null, 'Practical information: club meets in the village of ______',
        null::jsonb, array['Dougley']),
    (5, 0, null, 'Practical information: tops with long sleeves and warmers for ______ available at a discount',
        null::jsonb, array['knees']),
    (6, 0, null, 'Practical information: payment for bike hire is on a ______ basis or per outing',
        null::jsonb, array['monthly']),
    (7, 0, null, 'Activities and events: this summer’s camping trip will be to the ______',
        null::jsonb, array['mountains']),
    (8, 0, null, 'Activities and events: club runs a yearly ______ event for the local community',
        null::jsonb, array['charity']),
    (9, 0, null, 'Contact details: cycling shop telephone number – ______',
        null::jsonb, array['221337']),
    (10, 0, null, 'Contact details: name of website – www.______.com',
        null::jsonb, array['getoutside', 'get outside']),
    (11, 1, 'Questions 11–15: Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'The speaker describes letter writing as a ______.',
        null::jsonb, array['lost art', 'a lost art']),
    (12, 1, null, 'Writers used to use ______ to exemplify their ideas.',
        null::jsonb, array['drawings']),
    (13, 1, null, 'Writers could talk about their ______ in letters.',
        null::jsonb, array['secrets']),
    (14, 1, null, 'The speaker keeps her treasured letters in a ______.',
        null::jsonb, array['shoebox', 'shoe box']),
    (15, 1, null, 'The speaker compares letters to a ______.',
        null::jsonb, array['diary']),
    (16, 1, 'Questions 16–20: Complete the notes below (Tips for letter writing). Write ONE WORD ONLY for each answer.', 'Find a ______ room',
        null::jsonb, array['quiet']),
    (17, 1, null, 'Avoid using ______ which may not last',
        null::jsonb, array['paper']),
    (18, 1, null, 'Letters can act as a ______ (e.g. for seeking advice)',
        null::jsonb, array['tool']),
    (19, 1, null, 'Word every ______ carefully',
        null::jsonb, array['question']),
    (20, 1, null, 'Ensure you use an appropriate ______',
        null::jsonb, array['ending']),
    (21, 2, 'Questions 21 and 22: Choose TWO letters, A–E.', 'Which TWO reasons do the students give for choosing the university they attend? (first answer)',
        '["A. the opportunities to study abroad", "B. the lower fees", "C. the wide choice of courses offered", "D. the location", "E. the reputation of the teaching staff"]'::jsonb, array['A. the opportunities to study abroad', 'D. the location']),
    (22, 2, null, 'Which TWO reasons do the students give for choosing the university they attend? (second answer)',
        '["A. the opportunities to study abroad", "B. the lower fees", "C. the wide choice of courses offered", "D. the location", "E. the reputation of the teaching staff"]'::jsonb, array['A. the opportunities to study abroad', 'D. the location']),
    (23, 2, 'Questions 23 and 24: Choose TWO letters, A–E.', 'Which TWO study groups are both students going to join? (first answer)',
        '["A. grammar focus", "B. conversation practice", "C. writing skills", "D. literature analysis", "E. listening skills"]'::jsonb, array['B. conversation practice', 'E. listening skills']),
    (24, 2, null, 'Which TWO study groups are both students going to join? (second answer)',
        '["A. grammar focus", "B. conversation practice", "C. writing skills", "D. literature analysis", "E. listening skills"]'::jsonb, array['B. conversation practice', 'E. listening skills']),
    (25, 2, 'Questions 25–30: Which problems do the students agree each online resource has? Choose the correct letter, A, B or C.', 'internet chat room',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['A. operates too slowly']),
    (26, 2, null, 'translation software',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['B. is not accurate enough']),
    (27, 2, null, 'vocabulary builder',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['B. is not accurate enough']),
    (28, 2, null, 'online dictionary',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['C. has too few features']),
    (29, 2, null, 'language lab',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['A. operates too slowly']),
    (30, 2, null, 'writing checker',
        '["A. operates too slowly", "B. is not accurate enough", "C. has too few features"]'::jsonb, array['C. has too few features']),
    (31, 3, 'Questions 31–40: Complete the sentences below (Maths in the real world). Write ONE WORD ONLY for each answer.', 'Students need ______ and persistence to succeed in maths.',
        null::jsonb, array['patience']),
    (32, 3, null, 'Students also have a need to understand the ______ of the subject.',
        null::jsonb, array['relevance']),
    (33, 3, null, 'Maths is in everything we do, from using a ______ to decorating a room.',
        null::jsonb, array['recipe']),
    (34, 3, null, 'Teachers should avoid using techniques involving ______ or repetition.',
        null::jsonb, array['memorisation', 'memorization']),
    (35, 3, null, 'People have applied similar ______ for many generations.',
        null::jsonb, array['principles']),
    (36, 3, null, 'Basic maths skills help us stick to a ______ or understand trends.',
        null::jsonb, array['budget']),
    (37, 3, null, 'Maths is essential in progressing our careers, much like ______ skills.',
        null::jsonb, array['literacy']),
    (38, 3, null, 'Students find it hard to see how maths relates to life outside school: studying risk assessment or ______ makes this easier.',
        null::jsonb, array['statistics']),
    (39, 3, null, 'The way to study maths is to start from a ______ of simple ideas and build up to more complex ones.',
        null::jsonb, array['foundation']),
    (40, 3, null, 'Ask students to imagine life without calendars, watches, money or ______.',
        null::jsonb, array['measurement'])
),
inserted as (
  insert into public.questions (test_id, number, section, instruction, prompt, options)
  select '00000000-0000-4000-8000-000000000023', number, section, instruction, prompt, options from q
  on conflict (test_id, number) do nothing
  returning id, number
)
insert into public.answer_keys (question_id, accepted)
select inserted.id, q.accepted from inserted join q using (number);

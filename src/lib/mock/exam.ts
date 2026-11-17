// Đề Reading mẫu — nội dung tự viết, không lấy từ đề thật.

export type Question =
  | { n: number; type: "heading"; paragraph: string } // chọn i–x từ headings của passage
  | { n: number; type: "tfng"; statement: string } // TRUE / FALSE / NOT GIVEN
  | { n: number; type: "gap"; sentence: string }; // "___" là chỗ trống, tối đa 2 từ

export type QuestionGroup = { instructions: string; headings?: string[]; questions: Question[] };

export type Passage = {
  title: string;
  paragraphs: { label: string; text: string }[];
  groups: QuestionGroup[];
};

export type ReadingTest = {
  id: string;
  title: string;
  minutes: number;
  passages: Passage[];
  /** Đáp án theo số câu — chỉ dùng chấm điểm phía client trong bản mock. */
  answers: Record<number, string>;
};

export const readingTest: ReadingTest = {
  id: "reading-01",
  title: "IELTS Reading Practice Test 1",
  minutes: 60,
  passages: [
    {
      title: "The Return of the Urban Beekeeper",
      paragraphs: [
        { label: "A", text: "A decade ago, a beehive on a city rooftop would have been regarded as an eccentric hobby. Today, apartment blocks, hotels and even office towers in many large cities host colonies of honeybees. Supporters argue that urban apiaries reconnect residents with food production and raise awareness of the decline in pollinating insects." },
        { label: "B", text: "Cities can, surprisingly, be good places for bees. Parks, private gardens and street trees often provide a more varied supply of flowers than farmland, where a single crop may dominate for kilometres. Urban areas also tend to use fewer agricultural pesticides, and their slightly warmer temperatures can extend the foraging season." },
        { label: "C", text: "However, ecologists have begun to question whether more hives are always better. Honeybees are only one of hundreds of bee species, and most wild bees live alone rather than in colonies. When too many honeybee hives share a limited area, they may compete with wild species for nectar and pollen." },
        { label: "D", text: "Some city councils have responded by limiting the number of hives per district and encouraging residents to plant flowers instead. Their reasoning is simple: adding food benefits every pollinator, whereas adding hives benefits mainly one." },
        { label: "E", text: "For beekeepers themselves, the rewards are often less about honey than about community. Rooftop hives regularly host school visits and workshops, and several projects train young people with few other job opportunities in the basics of hive management." },
      ],
      groups: [
        {
          instructions: "Reading Passage 1 has five paragraphs, A–E. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–vii.",
          headings: [
            "i A social benefit beyond food",
            "ii Why towns may suit bees",
            "iii The high price of city honey",
            "iv A fashionable change in attitude",
            "v Concerns about competition",
            "vi Feeding all insects, not one",
            "vii A new disease spreads",
          ],
          questions: ["A", "B", "C", "D", "E"].map((p, i) => ({ n: i + 1, type: "heading" as const, paragraph: p })),
        },
        {
          instructions: "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.",
          questions: [
            { n: 6, type: "tfng", statement: "Farmland generally offers bees a wider range of flowers than cities do." },
            { n: 7, type: "tfng", statement: "Most species of bee do not live in colonies." },
            { n: 8, type: "tfng", statement: "Urban honey contains higher levels of pollution than rural honey." },
          ],
        },
      ],
    },
    {
      title: "Sleep and the Teenage Brain",
      paragraphs: [
        { label: "A", text: "Parents often complain that teenagers stay up late and struggle to wake for school. Research suggests this is not simply a matter of habit. During adolescence, the body releases the sleep hormone melatonin later in the evening, shifting the natural sleep window by up to two hours." },
        { label: "B", text: "Because school start times rarely change to match this shift, many teenagers are chronically short of sleep. Studies link this deficit to lower concentration, poorer mood and slower reaction times, which matter especially for young drivers." },
        { label: "C", text: "Several school districts that moved their first lesson later reported improved attendance and fewer students falling asleep in class. Critics point out, however, that later starts can complicate transport schedules and after-school activities." },
      ],
      groups: [
        {
          instructions: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          questions: [
            { n: 9, type: "gap", sentence: "In adolescence, the hormone ___ is released later at night." },
            { n: 10, type: "gap", sentence: "Lack of sleep is linked to slower ___, a risk for new drivers." },
            { n: 11, type: "gap", sentence: "Later school starts can cause problems for ___ and after-school activities." },
          ],
        },
      ],
    },
  ],
  answers: {
    1: "iv", 2: "ii", 3: "v", 4: "vi", 5: "i",
    6: "FALSE", 7: "TRUE", 8: "NOT GIVEN",
    9: "melatonin", 10: "reaction times", 11: "transport schedules",
  },
};

/** Tổng số câu của đề. */
export function questionCount(test: ReadingTest) {
  return test.passages.flatMap((p) => p.groups.flatMap((g) => g.questions)).length;
}

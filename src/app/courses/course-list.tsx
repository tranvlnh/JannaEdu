import Image from "next/image";

// Janna Academy courses, shown on the home page and the courses page.
const COURSES = [
  { name: "IELTS Foundation", level: "(4.0 – 5.0)", image: "/ref/course-foundation.jpg" },
  { name: "IELTS Intensive", level: "(5.5 – 7.0)", image: "/ref/course-intensive.jpg" },
  { name: "IELTS Advanced", level: "(7.0+)", image: "/ref/course-advanced.jpg" },
  { name: "Luyện đề toàn diện", level: "Cả bốn kỹ năng", image: "/ref/course-practice.jpg" },
];

export function CourseList() {
  return (
    <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {COURSES.map((c) => (
        <li key={c.name} className="card flex flex-col gap-2 p-3">
          <Image src={c.image} alt="" width={150} height={88} className="aspect-[150/88] w-full rounded-xl object-cover" />
          <p className="px-1 pb-1">
            <span className="block font-bold">{c.name}</span>
            <span className="text-sm">{c.level}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

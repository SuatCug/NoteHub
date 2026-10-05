// Ders etiketleri: ders kodu varsa o koda göre filtreler, yoksa ders adıyla arar.
export const courseLink = ({ courseCode, courseName }: { courseCode?: string; courseName: string }) =>
  courseCode ? `/?courseCode=${encodeURIComponent(courseCode)}` : `/?q=${encodeURIComponent(courseName)}`;

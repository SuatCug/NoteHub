// Ders etiketleri: ders kodu varsa o koda göre filtreler, yoksa ders adıyla arar.
export const courseLink = ({ courseCode, courseName }) =>
  courseCode ? `/?courseCode=${encodeURIComponent(courseCode)}` : `/?q=${encodeURIComponent(courseName)}`;

// Bilgi sayfalarının (Hakkımızda, Yardım, İletişim vb.) üstündeki lacivert başlık alanı. İçerik ortalıdır.
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ eyebrow, title, text, children }: PageHeaderProps) {
  return (
    <header className="rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-10 sm:px-10 sm:py-14 text-white text-center">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-navy-200">{eyebrow}</p>}
      <h1 className="mt-2 mx-auto text-3xl sm:text-4xl font-bold leading-tight max-w-2xl">{title}</h1>
      {text && <p className="mt-3 mx-auto text-navy-100 max-w-2xl leading-relaxed">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </header>
  );
}

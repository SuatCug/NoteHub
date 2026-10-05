import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const SECTION_LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'community', label: 'Community' },
];

const linkClass = 'text-sm font-medium text-gray-600 hover:text-navy-700 transition-colors';

// Giriş yapmamış ziyaretçinin üst çubuğu (karşılama sayfası ve diğer tüm sayfalar).
// Bölüm bağlantıları karşılama sayfasındaki bölümlere gider; telefonda gizlenir, sadece Log In / Sign Up görünür.
export default function GuestNavbar() {
  const location = useLocation();
  const onLanding = location.pathname === '/' && !location.search;

  // Zaten karşılama sayfasındaysa (aynı #bölüm adresine tekrar tıklanınca da) doğrudan kaydırılır;
  // başka sayfadan gelindiğinde kaydırmayı ScrollToTop adresteki #bölüme göre yapar.
  const handleSectionClick = (id: string) => {
    if (!onLanding) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Sections" className="hidden lg:flex items-center gap-7">
          {SECTION_LINKS.map((l) => (
            <Link key={l.id} to={`/#${l.id}`} onClick={() => handleSectionClick(l.id)} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <Link
            to="/about"
            className={location.pathname === '/about' ? 'text-sm font-semibold text-navy-700' : linkClass}
          >
            About
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            to="/login"
            className="rounded-lg border border-navy-200 px-3 sm:px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50 transition-colors whitespace-nowrap"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-navy-600 px-3 sm:px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition-colors whitespace-nowrap"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

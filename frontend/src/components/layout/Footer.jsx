import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, ArrowUp, Mail, Upload } from 'lucide-react';
import Logo from './Logo';
import { DiscordIcon, InstagramIcon, TelegramIcon } from '@/components/common/BrandIcons';
import { REQUIRE_EDU_EMAIL, SOCIAL_LINKS } from '@/lib/constants';

const YEAR = new Date().getFullYear();

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { to: '/', label: 'Browse Notes' },
      { to: '/?sort=popular&all=1', label: 'Most Liked' },
      { to: '/?sort=downloads&all=1', label: 'Most Downloaded' },
      { to: '/groups', label: 'Study Groups' },
      { to: '/upload', label: 'Upload a Note' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/guidelines', label: 'Community Guidelines' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help Center' },
      { to: '/help#sharing-notes', label: 'Sharing Notes' },
      { to: '/help#study-groups', label: 'Study Groups FAQ' },
      { to: '/contact', label: 'Report Content' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/legal/terms', label: 'Terms of Use' },
      { to: '/legal/privacy', label: 'Privacy Policy' },
      { to: '/legal/kvkk', label: 'KVKK Notice' },
      { to: '/legal/cookies', label: 'Cookie Policy' },
      { to: '/legal/copyright', label: 'Copyright (DMCA)' },
    ],
  },
];

// Adresi henüz girilmemiş sosyal bağlantılar İletişim sayfasındaki topluluk bölümüne yönlendirilir (bkz. lib/constants SOCIAL_LINKS).
const SOCIALS = [
  { href: SOCIAL_LINKS.discord, label: 'Discord', icon: DiscordIcon },
  { href: SOCIAL_LINKS.telegram, label: 'Telegram', icon: TelegramIcon },
  { href: SOCIAL_LINKS.instagram, label: 'Instagram', icon: InstagramIcon },
  { href: SOCIAL_LINKS.contactEmail && `mailto:${SOCIAL_LINKS.contactEmail}`, label: 'Email', icon: Mail },
];

const linkClass = 'text-sm text-white/70 hover:text-white transition-colors';
const iconButtonClass =
  'w-9 h-9 rounded-lg bg-white/10 text-white/80 flex items-center justify-center hover:bg-white/20 hover:text-white transition-colors';

function SocialLink({ href, label, icon: Icon }) {
  if (!href) {
    return (
      <Link to="/contact#community" className={iconButtonClass} aria-label={label} title={label}>
        <Icon size={17} />
      </Link>
    );
  }
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className={iconButtonClass}
      aria-label={label}
      title={label}
    >
      <Icon size={17} />
    </a>
  );
}

export default function Footer() {
  const token = useSelector((state) => state.auth.token);

  return (
    <footer className="mt-16 bg-gradient-to-b from-navy-900 to-navy-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {/* Çağrı alanı: alttaki sütunlarla aynı container genişliğinde. Footer ile yarışmaması için yarı saydam
            (glass) zemin + ince açık kenarlık; köşe kavisi diğer kartlarla aynı (rounded-xl). */}
        <div className="mb-10 w-full rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-5 py-4 sm:px-6 sm:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold">
              {token ? 'Have great notes? Share them.' : 'Start studying smarter today.'}
            </h2>
            <p className="mt-0.5 text-[13px] text-white/55">
              {token
                ? 'Help thousands of students prepare for their exams — it only takes a minute.'
                : 'Join free and get unlimited access to notes, past exams and study groups.'}
            </p>
          </div>
          <Link
            to={token ? '/upload' : '/register'}
            className="btn-primary bg-white text-navy-800 hover:bg-navy-50 py-2 shrink-0"
          >
            {token ? <Upload size={15} /> : null}
            {token ? 'Upload a note' : 'Create free account'}
            {!token && <ArrowRight size={15} />}
          </Link>
        </div>

        <div className="grid gap-10 pb-10 lg:grid-cols-[1.3fr_2.7fr]">
          <div>
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-xs">
              The free note-sharing platform for university students. Class notes, slides and past exams — no credits,
              no paywalls.
              {REQUIRE_EDU_EMAIL && ' Only verified .edu.tr accounts can share notes.'}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <SocialLink key={s.label} {...s} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-navy-200">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="py-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-white/60 text-center sm:text-left">
            © {YEAR} NoteHub. All rights reserved. Made with care for students in Türkiye.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

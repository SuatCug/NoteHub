import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  Download,
  FileText,
  Globe,
  Hash,
  Heart,
  Home,
  Link2,
  Lock,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import GuestNavbar from '@/components/layout/GuestNavbar';
import Footer from '@/components/layout/Footer';
import { useGetStatsQuery } from '@/services/statsApi';

// Giriş yapmamış ziyaretçilere ana sayfada gösterilen tanıtım sayfası.
// Bölüm id'leri (top, features, how-it-works, community) GuestNavbar ve Footer bağlantılarıyla eşleşir.

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GuestNavbar />
      <main className="flex-1 overflow-x-hidden">
        <HeroSection />
        <HowItWorksSection />
        <VisibilitySection />
        <FeaturesSection />
        <CommunitySection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

const TRUST = ['No credits or points', 'Unlimited free downloads', 'PDF, Word, images, ZIP'];

function HeroSection() {
  return (
    <section id="top" className="relative scroll-mt-16 bg-gradient-to-b from-navy-50/70 to-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-0 h-[420px] w-[620px] max-w-full rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-16 sm:pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 sm:gap-12 lg:gap-14 items-center">
        <div>
          <Kicker>For university students</Kicker>
          <h1 className="mt-5 text-[40px] leading-[1.04] sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-gray-900">
            Stop rewriting the same <Serif highlight>summaries.</Serif>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-gray-600">
            Every exam season, hundreds of students write the same notes and hunt for the same past questions. On
            SearchNote one good note reaches everyone who takes the course — and the person who wrote it is one
            message away.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-[15px] shadow-lg shadow-navy-600/20">
              Create a free account <ArrowRight size={17} />
            </Link>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="btn-secondary px-6 py-3 text-[15px]">
              See how it works
            </button>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-gray-500">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={16} className="text-sky-600" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <NoteStack />
      </div>
    </section>
  );
}

// Üst üste duran not kâğıtları + bildirim ve "aktif arkadaşlar" kartları (süs görseli, gerçek veri değildir).
function NoteStack() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[470px] sm:h-[490px] w-full max-w-sm sm:max-w-md lg:max-w-none select-none">
      {/* Alttaki çizgili defter sayfası */}
      <div className="absolute left-[6%] top-8 h-[340px] w-[78%] -rotate-4 rounded-xl border border-gray-200 bg-[#fbfaf7] bg-[repeating-linear-gradient(transparent_0_27px,#eef2f7_27px_28px)] shadow-2xl shadow-navy-900/10" />

      {/* Not kartı */}
      <article className="absolute left-[8%] sm:left-[14%] top-14 w-[88%] sm:w-[80%] rotate-[1.5deg] rounded-xl border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-900/15">
        <div className="flex flex-wrap gap-1.5">
          <Tag tone="sky">MAT102</Tag>
          <Tag>Calculus II</Tag>
          <Tag>Spring 2026</Tag>
          <Tag tone="amber">Prof. Demir</Tag>
        </div>
        <h3 className="mt-3.5 text-lg sm:text-xl font-bold leading-snug tracking-tight text-gray-900">
          Integration techniques — <Serif>one-page summary</Serif> + past finals
        </h3>
        <div className="mt-3.5 flex items-center gap-2.5 text-[13px] text-gray-500">
          <Initials tone="navy">EK</Initials>
          <span><b className="font-semibold text-gray-900">Elif K.</b> · Industrial Eng. · 2h ago</span>
        </div>
        <div className="mt-4 grid gap-1.5 rounded-lg border border-gray-200 bg-[#fbfaf7] p-3.5">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
            <span>summary.pdf</span>
            <span>Page 1 / 6</span>
          </div>
          <i className="block h-2 w-[62%] rounded bg-navy-100" />
          <i className="block h-1.5 rounded bg-gray-200" />
          <i className="block h-1.5 w-[88%] rounded bg-gray-200" />
          <i className="block h-1.5 w-[74%] rounded bg-gray-200" />
          <i className="block h-1.5 w-[40%] rounded bg-gray-200" />
        </div>
        <div className="mt-4 flex items-center gap-4 text-[13px] text-gray-500">
          <span className="flex items-center gap-1 text-rose-600"><Heart size={15} className="fill-current" /> 48</span>
          <span className="flex items-center gap-1"><MessageCircle size={15} /> 12</span>
          <span className="flex items-center gap-1"><Download size={15} /> 231</span>
          <Bookmark size={15} className="ml-auto" />
        </div>
      </article>

      {/* Canlı bildirim */}
      <div className="absolute right-0 sm:-right-2 -top-4 flex w-60 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[13px] leading-snug shadow-xl shadow-navy-900/10 motion-safe:animate-toast">
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-sky-500" />
        <Initials tone="sky">AY</Initials>
        <div>
          <b className="font-semibold">Ayşe</b> liked your note
          <small className="block text-xs text-gray-500">Integration techniques · just now</small>
        </div>
      </div>

      {/* Aktif arkadaşlar */}
      <div className="absolute left-0 bottom-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-xs font-semibold shadow-xl shadow-navy-900/10">
        <div className="flex -space-x-2">
          {(['amber', 'sky', 'slate'] as const).map((tone, i) => (
            <span key={tone} className="relative">
              <Initials tone={tone} size="h-7 w-7 text-[11px] ring-2 ring-white">{['MK', 'AY', 'BT'][i]}</Initials>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </span>
          ))}
        </div>
        3 friends active now
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- How it works */

const PILLARS = [
  {
    title: 'Share',
    text: 'Upload your note and tag it once. Choose who sees it.',
    points: [
      'PDF, DOCX, JPG/PNG, ZIP/RAR up to 25 MB',
      'University, department, course code, professor, term',
      'Everyone, followers only, or one study group',
    ],
  },
  {
    title: 'Discover',
    text: 'A social feed of new and popular notes from your courses.',
    points: ['All · Popular · Following · Saved', 'Search by course, professor, university or author', 'Preview PDFs right on the page'],
  },
  {
    title: 'Connect',
    text: 'The person who wrote the note is one tap away.',
    points: ['Follow, comment and “Ask the author”', 'Direct messages, live in real time', 'Public or approval-only study groups with chat'],
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 pt-10 pb-12 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end">
          <p className="font-serif text-[26px] sm:text-[34px] leading-tight text-gray-900">
            “Does anyone have the notes for this course?”{' '}
            <span className="text-gray-500">— every group chat, every exam week.</span>
          </p>
          <p className="text-gray-600 leading-relaxed sm:text-[17px]">
            SearchNote turns that question into a search. Notes are tagged by university, department, course code,
            professor and term, so the right summary finds the right student. Getting started takes three steps.
          </p>
        </div>

        <ol className="mt-8 sm:mt-16 grid lg:grid-cols-3 border-t-2 border-gray-900">
          {PILLARS.map((p, i) => (
            <li
              key={p.title}
              className="py-6 sm:py-8 border-b border-gray-200 lg:border-b-0 lg:border-l lg:pb-2 lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              {/* Telefonda numara ile başlık yan yana: dikey yer kazanılır */}
              <div className="flex items-baseline gap-3 lg:block">
                <span className="font-serif text-5xl lg:text-6xl leading-none text-sky-700">0{i + 1}</span>
                <h3 className="lg:mt-4 text-2xl font-bold tracking-tight text-gray-900">{p.title}</h3>
              </div>
              <p className="mt-2 text-gray-600">{p.text}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <Check size={17} className="mt-0.5 shrink-0 text-sky-700" /> {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Visibility */

type Visibility = 'all' | 'followers' | 'group';

const VIS_OPTIONS: { id: Visibility; icon: LucideIcon; label: string; badge: string; desc: string }[] = [
  { id: 'all', icon: Globe, label: 'Everyone', badge: 'Everyone', desc: 'Your note appears in the feed and search for every SearchNote member.' },
  {
    id: 'followers',
    icon: UserCheck,
    label: 'Followers only',
    badge: 'Followers only',
    desc: 'Only you and your followers can find, preview or download it. It shows a “Followers” badge.',
  },
  { id: 'group', icon: Users, label: 'A study group', badge: 'Study group', desc: 'Only members of the study group you pick can see it, inside that group.' },
];

const TONES = ['sky', 'navy', 'slate', 'amber'] as const;
type Tone = (typeof TONES)[number];

// f: takipçi, g: seçilen grubun üyesi
const PEOPLE: { name: string; initials: string; tone: Tone; f?: boolean; g?: boolean }[] = [
  { name: 'Ayşe', initials: 'AY', tone: 'sky', f: true, g: true },
  { name: 'Mert', initials: 'MK', tone: 'navy', f: true },
  { name: 'Berk', initials: 'BT', tone: 'slate', g: true },
  { name: 'Zeynep', initials: 'ZN', tone: 'sky' },
  { name: 'Can', initials: 'CE', tone: 'navy', f: true },
  { name: 'Deniz', initials: 'DS', tone: 'slate' },
  { name: 'Selin', initials: 'SU', tone: 'amber', g: true },
  { name: 'Emre', initials: 'EA', tone: 'navy' },
  { name: 'İlayda', initials: 'IL', tone: 'sky', f: true, g: true },
  { name: 'Oğuz', initials: 'OK', tone: 'slate' },
  { name: 'Hande', initials: 'HT', tone: 'navy' },
];

function VisibilitySection() {
  const [vis, setVis] = useState<Visibility>('all');
  const current = VIS_OPTIONS.find((o) => o.id === vis)!;
  const canSee = (p: (typeof PEOPLE)[number]) => vis === 'all' || (vis === 'followers' ? p.f : p.g);
  const count = 1 + PEOPLE.filter(canSee).length;

  return (
    <section className="border-y border-gray-100 bg-[#fbfaf7] py-12 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
        <div>
          <Kicker>You decide</Kicker>
          <h2 className="mt-4 text-3xl sm:text-[44px] leading-[1.1] font-extrabold tracking-tight text-gray-900">
            Share with everyone — or <Serif>just your people.</Serif>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed sm:text-[17px]">
            Every note has a visibility setting, respected everywhere: the feed, search, profiles, previews, downloads
            and shared messages.
          </p>
          <div role="group" aria-label="Note visibility" className="mt-8 grid w-full grid-cols-3 gap-0.5 rounded-2xl border border-gray-200 bg-white p-1 sm:inline-flex sm:w-auto sm:rounded-full">
            {VIS_OPTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={vis === id}
                onClick={() => setVis(id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-full px-1.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  vis === id ? 'bg-navy-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-5 min-h-[3.25rem] text-gray-600">{current.desc}</p>
        </div>

        <div aria-hidden="true" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-gray-500">
            <span>Who can see “Integration techniques”</span>
            <span className="whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">{current.badge}</span>
          </div>
          <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 gap-3.5">
            <Person name="You" initials="You" tone="amber" me />
            {PEOPLE.map((p) => (
              <Person key={p.name} {...p} off={!canSee(p)} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-dashed border-gray-200 pt-4 text-[13px] text-gray-500">
            <span><b className="text-gray-900">{count}</b> of 12 can see it</span>
            <span>Everyone else simply won’t find it.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Person({ name, initials, tone, me = false, off = false }: { name: string; initials: string; tone: Tone; me?: boolean; off?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 text-[11.5px] text-gray-500 transition-[opacity,filter] duration-300 ${off ? 'opacity-20 grayscale' : ''}`}>
      <Initials tone={tone} size={`h-11 w-11 text-sm ${me ? 'ring-[3px] ring-amber-400 ring-offset-2' : ''}`}>{initials}</Initials>
      {name}
    </div>
  );
}

/* --------------------------------------------------------------- Features */

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 py-12 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <Kicker>Inside SearchNote</Kicker>
          <h2 className="mt-4 text-3xl sm:text-[44px] leading-[1.1] font-extrabold tracking-tight text-gray-900">
            Everything you need <Serif>for exam week.</Serif>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed sm:text-[17px]">
            A full social platform behind a simple idea — with live updates, careful privacy and an app-like feel on
            your phone.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-5 lg:grid-cols-6">
          {/* Canlı bildirimler */}
          <Box dark className="lg:col-span-3" icon={Zap} title="Live, without refreshing">
            Likes, comments, followers, messages and group chats arrive instantly. Repeated alerts merge into one, and
            undone actions remove their notification.
            <Demo>
              {[
                ['AY', 'sky', <><b>Ayşe</b> and 4 others liked your note</>, 'now'],
                ['MK', 'amber', <><b>Mert</b> started following you</>, '2m'],
                ['BT', 'slate', <><b>Berk</b> asked to join <b>CENG213 Finals</b></>, '5m'],
              ].map(([initials, tone, text, time]) => (
                <div key={time as string} className="mt-2 flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white">
                  <Initials tone={tone as Tone} size="h-6 w-6 text-[10px]">{initials as string}</Initials>
                  <span className="min-w-0">{text}</span>
                  <small className="ml-auto whitespace-nowrap text-xs text-navy-200">{time as string}</small>
                </div>
              ))}
            </Demo>
          </Box>

          {/* Arama */}
          <Box className="lg:col-span-3" icon={Search} title="Search that understands courses">
            Search titles, course names and codes, professors, universities, departments and authors — matching people
            show up too.
            <Demo>
              <div className="flex h-11 items-center gap-2.5 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900">
                <Search size={17} className="text-gray-400" />
                ceng213 data structures
                <span className="-ml-2 h-[18px] w-[1.5px] bg-gray-900 motion-safe:animate-caret" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag tone="sky">METU</Tag>
                <Tag tone="sky">Computer Eng.</Tag>
                <Tag>PDF</Tag>
                <Tag>Most downloaded</Tag>
              </div>
              <div className="mt-2 divide-y divide-gray-100">
                <SearchResult type="PDF" title="Trees & heaps cheat sheet" meta="Kerem A. · 412 downloads" />
                <SearchResult type="DOC" title="Midterm solutions 2025" meta="Selin U. · 287 downloads" />
              </div>
            </Demo>
          </Box>

          {/* Çalışma grupları */}
          <Box className="lg:col-span-2" icon={Users} title="Study groups">
            Open groups or founder-approved private ones, with members-only notes and a group chat.
            <Demo>
              <div className="grid gap-2 text-[13px]">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2">
                  <b className="block text-[11px] text-gray-500">Berk</b>Who has the 2024 final?
                </div>
                <div className="max-w-[85%] justify-self-end rounded-2xl rounded-br-sm bg-navy-600 px-3 py-2 text-white">
                  Just uploaded it to the group notes.
                </div>
              </div>
            </Demo>
          </Box>

          {/* Mobil */}
          <Box className="lg:col-span-2" icon={Smartphone} title="Made for your phone">
            Bottom tab bar, a centre “+” to upload and shortcut cards above the feed.
            <Demo>
              <div className="mx-auto -mb-7 w-52 rounded-t-[30px] border-[7px] border-b-0 border-gray-900 bg-white px-3 pt-3.5">
                <div className="grid grid-cols-2 gap-1.5">
                  {['Explore', 'Saved', 'My notes', 'My groups'].map((s) => (
                    <span key={s} className="rounded-lg bg-navy-50 p-2 text-[11px] font-semibold text-navy-700">{s}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-around border-t border-gray-100 py-2.5 text-gray-400">
                  <Home size={18} />
                  <Search size={18} />
                  <span className="-mt-5 grid h-9 w-9 place-items-center rounded-full bg-navy-600 text-white shadow-lg shadow-navy-600/35">
                    <Plus size={18} />
                  </span>
                  <Bell size={18} />
                  <MessageCircle size={18} />
                </div>
              </div>
            </Demo>
          </Box>

          {/* Güvenlik */}
          <Box className="lg:col-span-2" icon={ShieldCheck} title="Safe by design">
            <ul className="mt-1 space-y-2.5 text-sm text-gray-700">
              {[
                'Verified email before you browse',
                'Files checked by content, not just extension',
                'Block anyone you don’t want to hear from',
                'Personal data handled under KVKK',
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
          </Box>
        </div>

        <div className="mt-4 sm:mt-5 grid gap-4 sm:gap-5 md:grid-cols-3">
          <LinkCard icon={Link2} title="Shared note links" text="Open for anyone, even without an account." />
          <LinkCard icon={Link2} title="Profile & group links" text="Stay public, so shared links never break." />
          <LinkCard icon={Lock} title="Catalog & search" text="Reserved for verified members." />
        </div>
      </div>
    </section>
  );
}

function Box({
  icon: Icon,
  title,
  children,
  className = '',
  dark = false,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 sm:p-7 ${
        dark ? 'border-navy-900 bg-navy-900 text-navy-200' : 'border-gray-200 bg-white text-gray-600'
      } ${className}`}
    >
      <h3 className={`flex items-center gap-2.5 text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
        <Icon size={20} className={dark ? 'text-sky-300' : 'text-sky-700'} /> {title}
      </h3>
      <div className="mt-2 flex flex-1 flex-col text-[14.5px] leading-relaxed">{children}</div>
    </div>
  );
}

function Demo({ children }: { children: ReactNode }) {
  return <div aria-hidden="true" className="mt-5 flex flex-1 flex-col justify-end">{children}</div>;
}

function SearchResult({ type, title, meta }: { type: 'PDF' | 'DOC'; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 py-3 text-[13.5px]">
      <span className={`grid h-10 w-[34px] shrink-0 place-items-center rounded-md text-[10px] font-extrabold text-white ${type === 'PDF' ? 'bg-red-600' : 'bg-blue-600'}`}>
        {type}
      </span>
      <div>
        <b className="text-gray-900">{title}</b>
        <small className="block text-xs text-gray-500">{meta}</small>
      </div>
    </div>
  );
}

function LinkCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-dashed border-gray-300 p-4 sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-mono text-[13px] font-medium text-sky-700">{title}</p>
        <p className="mt-0.5 text-[13px] text-gray-500">{text}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Community */

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(n);
};

function CommunitySection() {
  const { data, isError } = useGetStatsQuery();
  const stats = data?.data;

  const items = [
    { icon: Users, value: stats?.users, label: 'Members' },
    { icon: FileText, value: stats?.notes, label: 'Shared Notes' },
    { icon: Hash, value: stats?.groups, label: 'Study Groups' },
    { icon: Download, value: stats?.downloads, label: 'Downloads' },
  ];

  return (
    <section id="community" className="scroll-mt-16 border-y border-gray-100 bg-navy-50/50 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_2fr] gap-10 items-center">
        <div>
          <Kicker>Community</Kicker>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            A community that <Serif>grows every day.</Serif>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Live numbers from SearchNote — students, notes and study groups.</p>
          <Link to="/register" className="btn-primary mt-6 px-6 py-3">
            Join the Community
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {items.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white px-3 py-4 sm:py-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-600">
                  <Icon size={20} />
                </span>
                <p className="mt-3 text-2xl font-extrabold text-gray-900 tabular-nums">
                  {value === undefined ? (isError ? '—' : <span className="skeleton-box inline-block h-7 w-12 rounded" />) : formatCount(value)}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <p
            aria-hidden="true"
            className="font-hand hidden xl:block absolute -right-28 top-1/2 -translate-y-1/2 rotate-[-10deg] text-xl leading-tight text-navy-600"
          >
            You could
            <br />
            be next!
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- FAQ */

const FAQ = [
  ['Is it really free?', 'Yes. No credits, no points, no paywalls. Uploading and downloading are unlimited.'],
  [
    'Why can’t I browse without an account?',
    'The note catalog and search are for members, so notes stay inside a student community. A single note, profile or group link someone shares with you still opens without logging in.',
  ],
  [
    'Why do I need to verify my email?',
    'Verification keeps the community real. After signing up you get a one-time link valid for 24 hours, and you can request a new one any time.',
  ],
  ['Which files can I upload?', 'PDF, DOCX, JPG/PNG and ZIP/RAR, up to 25 MB. Files whose content doesn’t match their extension are rejected.'],
  [
    'Who sees a “Followers only” note?',
    'Only you and the people who follow you — in the feed, search, your profile, previews, downloads and messages. It carries a “Followers” badge.',
  ],
  [
    'How do private study groups work?',
    'You ask to join and the founder approves. Founders can edit the group, remove members, hand over ownership and manage requests.',
  ],
];

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 py-12 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16">
        <div>
          <Kicker>FAQ</Kicker>
          <h2 className="mt-4 text-3xl sm:text-[44px] leading-[1.1] font-extrabold tracking-tight text-gray-900">
            Good <Serif>questions.</Serif>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Can’t find your answer? See the <Link to="/help" className="font-medium text-sky-700 underline">Help Center</Link> or
            reach us from the <Link to="/contact" className="font-medium text-sky-700 underline">Contact</Link> page.
          </p>
        </div>
        <div>
          {FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group border-b border-gray-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base sm:text-[17px] font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                {q}
                <Plus size={20} className="shrink-0 text-gray-400 transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-5 text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- CTA */

// Lacivert defter sayfası: yatay satır çizgileri + soldaki sarı kenar boşluğu çizgisi.
function CtaSection() {
  return (
    <div className="pb-12 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative grid overflow-hidden rounded-[28px] bg-navy-950 py-12 pl-10 pr-6 sm:py-20 sm:pl-24 sm:pr-16 text-white lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-10 items-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(transparent_0_35px,rgb(255_255_255/0.05)_35px_36px)]" />
          <div aria-hidden="true" className="absolute inset-y-0 left-5 sm:left-12 w-px bg-amber-400/45" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight">
              Your next exam is easier <Serif className="text-sky-300">together.</Serif>
            </h2>
            <p className="mt-4 max-w-lg text-navy-200 sm:text-[17px]">
              Join the students who share what they learn — and find the note you need in seconds.
            </p>
          </div>
          <div className="relative flex flex-col items-start gap-3">
            <Link to="/register" className="btn-primary bg-white px-6 py-3 text-[15px] text-navy-900 hover:bg-navy-50">
              Create a free account <ArrowRight size={17} />
            </Link>
            <small className="text-[13px] text-navy-200">Takes under a minute · email verification required</small>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Küçük parçalar */

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.12em] text-sky-700 before:h-0.5 before:w-5 before:bg-current">
      {children}
    </p>
  );
}

// Başlıklarda italik serif vurgu; highlight ile altına sarı fosforlu kalem çizgisi eklenir.
function Serif({ children, highlight = false, className = '' }: { children: ReactNode; highlight?: boolean; className?: string }) {
  return (
    <em
      className={`font-serif text-[1.1em] font-normal italic tracking-normal ${
        highlight ? 'bg-[linear-gradient(transparent_58%,#fde68a_58%,#fde68a_92%,transparent_92%)] px-[0.08em]' : ''
      } ${className}`}
    >
      {children}
    </em>
  );
}

function Tag({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'sky' | 'amber' }) {
  const tones = { gray: 'bg-gray-100 text-gray-500', sky: 'bg-sky-50 text-sky-700', amber: 'bg-amber-100 text-amber-800' };
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tones[tone]}`}>{children}</span>;
}

const INITIAL_TONES: Record<Tone, string> = {
  sky: 'bg-sky-700 text-white',
  navy: 'bg-navy-600 text-white',
  slate: 'bg-slate-500 text-white',
  amber: 'bg-amber-400 text-gray-900',
};

function Initials({ children, tone, size = 'h-[30px] w-[30px] text-xs' }: { children: ReactNode; tone: Tone; size?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full font-bold ${INITIAL_TONES[tone]} ${size}`}>{children}</span>;
}

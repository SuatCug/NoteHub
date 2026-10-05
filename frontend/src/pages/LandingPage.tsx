import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Compass,
  Download,
  FileText,
  Hash,
  Heart,
  Home,
  MessageCircle,
  Play,
  Search,
  Share2,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import GuestNavbar from '@/components/layout/GuestNavbar';
import Footer from '@/components/layout/Footer';
import { useGetStatsQuery } from '@/services/statsApi';

// Giriş yapmamış ziyaretçilere ana sayfada gösterilen tanıtım sayfası.

const FEATURES = [
  { icon: FileText, title: 'Note Sharing', text: 'Share your notes in seconds and discover what other students have uploaded.' },
  { icon: Heart, title: 'Social Interaction', text: 'Like, comment and follow. Share ideas and engage with the community.' },
  { icon: MessageCircle, title: 'Messaging', text: 'Send private messages to other students and build real connections.' },
  { icon: Users, title: 'Study Groups', text: 'Join groups around your courses and meet people who think like you.' },
  { icon: Download, title: 'Downloads', text: 'Download the notes you like and keep them at hand whenever you need.' },
  { icon: ShieldCheck, title: 'Safe & Private', text: 'Your personal data stays safe. Share and explore with peace of mind.' },
];

const STEPS = [
  { title: 'Sign Up', text: 'Create a free account in seconds and join the community.' },
  { title: 'Share Your Notes', text: 'Upload your notes as PDF, Word, images or archives.' },
  { title: 'Explore & Connect', text: 'Discover notes from other students, like, comment and message.' },
];

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
        <FeaturesSection />
        <StepsSection />
        <CommunitySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

function HeroSection() {
  return (
    <section id="top" className="relative scroll-mt-16 bg-gradient-to-b from-navy-50/70 to-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-0 h-[420px] w-[620px] max-w-full rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-12 items-center">
        <div>
          <Pill>Share your notes, grow your ideas</Pill>
          <h1 className="mt-5 text-[34px] leading-[1.08] sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-gray-900">
            Share your notes,
            <br />
            <span className="bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent">connect with people.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-gray-600">
            SearchNote is a community where you can share your notes, discover notes from other students and chat with
            people who study the same things as you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-[15px] shadow-lg shadow-navy-600/20">
              Get Started <ArrowRight size={17} />
            </Link>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="btn-secondary px-6 py-3 text-[15px]">
              <Play size={16} /> How It Works
            </button>
          </div>
        </div>

        <DesktopMockup />
      </div>
    </section>
  );
}

// Uygulamanın masaüstü görünümünü temsil eden süs görseli (gerçek veri değildir).
function DesktopMockup() {
  return (
    <div aria-hidden="true" className="relative select-none">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-navy-900/10 overflow-hidden">
        <WindowBar />
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5">
          <MiniBrand />
          <div className="flex-1 flex items-center gap-2 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-[10px] text-gray-400">
            <Search size={11} /> Search notes...
          </div>
          <Bell size={13} className="text-gray-400 hidden sm:block" />
          <Avatar color="bg-amber-300" size="h-6 w-6" />
        </div>

        <div className="flex text-[10px]">
          <div className="hidden sm:block w-28 shrink-0 border-r border-gray-100 p-2 space-y-0.5">
            {([
              [Home, 'Home', true],
              [Compass, 'Explore'],
              [MessageCircle, 'Messages'],
              [Users, 'Groups'],
              [User, 'Profile'],
            ] satisfies [LucideIcon, string, boolean?][]).map(([Icon, label, active]) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${active ? 'bg-navy-50 text-navy-700 font-semibold' : 'text-gray-500'}`}
              >
                <Icon size={11} /> {label}
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0 p-3 space-y-2.5 bg-gray-50/50">
            <p className="text-xs font-bold text-gray-900">Explore</p>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-navy-600 px-2.5 py-0.5 font-semibold text-white">All</span>
              <span className="rounded-full bg-white border border-gray-100 px-2.5 py-0.5 text-gray-500">Popular</span>
              <span className="rounded-full bg-white border border-gray-100 px-2.5 py-0.5 text-gray-500">Following</span>
            </div>
            <MockNoteCard
              name="Elif"
              meta="2 hours ago · Computer Eng."
              avatar="bg-rose-300"
              title="React Hooks Summary"
              lines={['useState: manages component state.', 'useEffect: handles side effects.', 'useContext: shares global state.']}
              tags={['react', 'javascript', 'frontend']}
              likes={124}
              comments={23}
            />
            <div className="rounded-xl border border-gray-100 bg-white p-2.5 flex items-center gap-2">
              <Avatar color="bg-sky-300" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">Kerem</p>
                <p className="truncate text-gray-500">Data Structures & Algorithms — Summary</p>
              </div>
              <Download size={11} className="text-gray-400" />
            </div>
          </div>

          <div className="hidden md:block lg:hidden xl:block w-32 shrink-0 border-l border-gray-100 p-2.5 space-y-3">
            <div>
              <p className="font-bold text-gray-800 mb-1.5">For You</p>
              {([
                [UserPlus, 'Following'],
                [Bookmark, 'Saved notes'],
                [Download, 'Downloads'],
              ] satisfies [LucideIcon, string][]).map(([Icon, label]) => (
                <p key={label} className="flex items-center gap-1.5 py-0.5 text-gray-500">
                  <Icon size={10} /> {label}
                </p>
              ))}
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1.5">Popular Tags</p>
              <div className="flex flex-wrap gap-1">
                {['react', 'python', 'math', 'physics'].map((t) => (
                  <span key={t} className="rounded bg-navy-50 px-1.5 py-0.5 text-navy-600">#{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1.5">Online</p>
              <div className="flex -space-x-1.5">
                {['bg-rose-300', 'bg-amber-300', 'bg-emerald-300', 'bg-sky-300'].map((c) => (
                  <Avatar key={c} color={c} size="h-5 w-5" ring />
                ))}
                <span className="ml-2.5 self-center text-gray-400">+12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Features */

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.8fr_2fr] gap-10 lg:gap-12">
        <div>
          <Pill>Features</Pill>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Why SearchNote?</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Not just for sharing notes — a place to discover, learn and share together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                <Icon size={21} />
              </span>
              <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Steps */

function StepsSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-gradient-to-b from-navy-50/80 to-navy-50/30 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <StepsMockup />
        </div>

        <div className="order-1 lg:order-2">
          <Pill>How It Works</Pill>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Get started in 3 steps</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Just a few steps and you can start sharing and discovering notes.
          </p>

          <ol className="mt-8 space-y-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4">
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className="absolute left-5 top-12 h-[calc(100%-1.25rem)] w-px bg-navy-200" />
                )}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 font-bold text-white shadow-md shadow-navy-600/25">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Telefon + masaüstü birlikte: uygulamanın her cihazda çalıştığını anlatan süs görseli.
function StepsMockup() {
  return (
    <div aria-hidden="true" className="relative select-none mx-auto max-w-md lg:max-w-none sm:pl-16 sm:pb-6">
      {/* Masaüstü pencere: telefonda gizli, sadece telefon gösterilir */}
      <div className="hidden sm:block rounded-2xl border border-gray-200 bg-white shadow-xl shadow-navy-900/10 overflow-hidden">
        <WindowBar />
        <div className="p-4 pl-36 lg:pl-40 space-y-2.5 text-[10px] bg-gray-50/50 min-h-[280px]">
          <MockNoteCard
            name="Deniz"
            meta="1 hour ago · Software"
            avatar="bg-emerald-300"
            title="Clean Code Principles"
            lines={['1. Single Responsibility', '2. Open–Closed Principle', '3. Liskov Substitution', '4. Interface Segregation']}
            tags={['cleancode', 'software']}
            likes={89}
            comments={12}
          />
          <div className="rounded-xl border border-gray-100 bg-white p-2.5 flex items-center gap-2">
            <Avatar color="bg-violet-300" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800">Zeynep</p>
              <p className="truncate text-gray-500">Calculus I — Formulas</p>
            </div>
            <Download size={11} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Telefon */}
      <div className="relative mx-auto w-56 sm:absolute sm:left-0 sm:bottom-0 sm:w-48 lg:w-52 rounded-[2rem] border-[6px] border-gray-900 bg-white shadow-2xl overflow-hidden">
        <div className="mx-auto mt-1.5 h-4 w-16 rounded-full bg-gray-900" />
        <div className="flex items-center justify-between px-3 py-2">
          <MiniBrand />
          <Search size={11} className="text-gray-400" />
        </div>
        <div className="space-y-2 bg-gray-50 p-2 text-[9px] pb-4">
          <MockNoteCard
            name="Ali"
            meta="2 hours ago"
            avatar="bg-amber-300"
            title="List Methods in Python"
            lines={['The most common list methods with examples.']}
            tags={['python', 'list']}
            likes={56}
            comments={8}
            compact
          />
          <MockNoteCard
            name="Ayşe"
            meta="4 hours ago"
            avatar="bg-rose-300"
            title="Physics Notes — I"
            lines={['Kinematics, force and motion summary.']}
            tags={['physics']}
            likes={31}
            comments={4}
            compact
          />
        </div>
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
    <section id="community" className="scroll-mt-16 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_2fr] gap-10 items-center">
        <div>
          <Pill>Community</Pill>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            A community that grows every day
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Students, notes and an ever-growing network of knowledge.</p>
          <Link to="/register" className="btn-primary mt-6 px-6 py-3">
            Join the Community
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {items.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-navy-50/40 px-3 py-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-600 shadow-sm">
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

/* ------------------------------------------------------------------- CTA */

function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950 text-center text-white">
      {/* Dağ silüetleri */}
      <svg aria-hidden="true" viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full">
        <path d="M0 220 L0 130 L180 60 L340 140 L520 40 L700 150 L880 70 L1060 140 L1260 50 L1440 120 L1440 220 Z" fill="rgb(255 255 255 / 0.04)" />
        <path d="M0 220 L0 170 L220 110 L420 180 L640 100 L860 175 L1080 115 L1300 170 L1440 140 L1440 220 Z" fill="rgb(255 255 255 / 0.05)" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-white/15">
          Get Started
        </span>
        <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight">Share your notes, meet new people.</h2>
        <p className="mt-3 text-navy-100">The easiest way to share and discover knowledge with SearchNote.</p>
        <Link to="/register" className="btn-primary mt-7 px-7 py-3 bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25">
          Sign Up <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Küçük parçalar */

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-navy-100/70 px-3 py-1 text-xs sm:text-sm font-semibold text-navy-700">
      {children}
    </span>
  );
}

function WindowBar() {
  return (
    <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
    </div>
  );
}

function MiniBrand() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-900">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-navy-600 text-white">
        <Search size={11} strokeWidth={2.5} />
      </span>
      SearchNote
    </span>
  );
}

function Avatar({ color, size = 'h-7 w-7', ring = false }: { color: string; size?: string; ring?: boolean }) {
  return <span className={`${size} ${color} shrink-0 rounded-full ${ring ? 'ring-2 ring-white' : ''}`} />;
}

interface MockNoteCardProps {
  name: string;
  meta: string;
  avatar: string;
  title: string;
  lines: string[];
  tags: string[];
  likes: number;
  comments: number;
  compact?: boolean;
}

function MockNoteCard({ name, meta, avatar, title, lines, tags, likes, comments, compact = false }: MockNoteCardProps) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex items-center gap-2">
        <Avatar color={avatar} size={compact ? 'h-5 w-5' : 'h-7 w-7'} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 leading-tight">{name}</p>
          <p className="text-gray-400 leading-tight">{meta}</p>
        </div>
        <Download size={compact ? 10 : 11} className="text-gray-400" />
      </div>
      <p className="mt-2 font-bold text-gray-900">{title}</p>
      <ul className="mt-1 space-y-0.5 text-gray-500">
        {lines.map((l) => (
          <li key={l} className="truncate">{l}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="rounded bg-navy-50 px-1.5 py-0.5 text-navy-600">#{t}</span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-gray-500">
        <span className="flex items-center gap-1"><Heart size={10} className="text-rose-500" /> {likes}</span>
        <span className="flex items-center gap-1"><MessageCircle size={10} /> {comments}</span>
        <Share2 size={10} className="ml-auto" />
      </div>
    </div>
  );
}

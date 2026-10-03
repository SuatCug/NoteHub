import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle, Search, Upload, Users } from 'lucide-react';
import Logo from './Logo';
import AvatarMenu from './AvatarMenu';
import { useGetUnreadCountQuery } from '@/services/messagesApi';

// Okunmamış mesaj rozeti bu aralıkla yenilenir (sekme arka plandayken durur).
const UNREAD_POLL_INTERVAL_MS = 30000;

function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="relative block">
      <span className="sr-only">Search notes and people</span>
      <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
      <input
        type="search"
        maxLength={100}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
      />
    </label>
  );
}

export default function Navbar() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  // Ana sayfadaki arama parametresi değişirse (örn. filtre temizlendi) kutuyu senkronla.
  // (Effect yerine render sırasında önceki değerle karşılaştırılır.)
  const urlQuery = location.pathname === '/' ? (searchParams.get('q') ?? '') : null;
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== null) setSearch(urlQuery);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = location.pathname === '/' ? new URLSearchParams(searchParams) : new URLSearchParams();
    const q = search.trim();
    if (q) params.set('q', q);
    else params.delete('q');
    params.delete('page');
    params.delete('tab');
    navigate(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-navy-900 to-navy-700 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        <Logo light />

        <form onSubmit={handleSubmit} className="flex-1 min-w-0 max-w-xl hidden md:block" role="search">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, courses or people..."
          />
        </form>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            to="/groups"
            title="Groups"
            aria-label="Groups"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users size={17} />
            <span className="hidden xl:inline">Groups</span>
          </Link>
          {token ? (
            <>
              <MessagesLink />
              <Link
                to="/upload"
                title="Upload Note"
                aria-label="Upload Note"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 lg:px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm hover:bg-navy-50 transition-colors"
              >
                <Upload size={16} />
                <span className="hidden lg:inline">Upload Note</span>
              </Link>
              <AvatarMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-white/90 hover:text-white px-2 py-2">
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm hover:bg-navy-50 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Dar ekranlarda (md altı) arama kutusu ikinci satırda */}
      <form onSubmit={handleSubmit} className="md:hidden px-4 sm:px-6 pb-3" role="search">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes or people..." />
      </form>
    </header>
  );
}

function MessagesLink() {
  const { data } = useGetUnreadCountQuery(undefined, {
    pollingInterval: UNREAD_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });
  const count = data?.data?.count ?? 0;

  return (
    <Link
      to="/messages"
      className="relative inline-flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
      title="Messages"
      aria-label={count ? `Messages, ${count} unread` : 'Messages'}
    >
      <MessageCircle size={17} />
      <span className="hidden xl:inline">Messages</span>
      {count > 0 && (
        <span className="absolute -top-0.5 left-5 sm:left-6 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-navy-800">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

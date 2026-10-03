import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Compass, Search, Sparkles, Upload, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import FilterBar from '@/components/notes/FilterBar';
import NoteGrid from '@/components/notes/NoteGrid';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/common/Alert';
import PeopleResults from '@/components/users/PeopleResults';
import { useGetFeedQuery, useGetNotesQuery } from '@/services/notesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { REQUIRE_EDU_EMAIL } from '@/lib/constants';
import { pluralize } from '@/lib/format';

const FILTER_KEYS = ['q', 'university', 'department', 'semester', 'fileType', 'courseCode', 'instructorName', 'sort'];

// Ana sayfa önizlemesinde gösterilen not sayısı (masaüstünde 3 sütunla 4 satır).
// Daha fazlası varsa "See all" ile sayfalı tam listeye geçilir.
const PREVIEW_LIMIT = 12;

export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = token && searchParams.get('tab') === 'feed' ? 'feed' : 'explore';
  const page = Number(searchParams.get('page')) || 1;
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? '']));
  const hasSearch = FILTER_KEYS.some((k) => k !== 'sort' && filters[k]);
  // Arama/filtre yoksa ve "See all" açılmadıysa sadece ilk PREVIEW_LIMIT not gösterilir.
  const showAll = searchParams.get('all') === '1' || hasSearch;
  const listParams = showAll ? { page } : { limit: PREVIEW_LIMIT };

  const explore = useGetNotesQuery({ ...filters, ...listParams }, { skip: tab !== 'explore' });
  const feed = useGetFeedQuery(listParams, { skip: tab !== 'feed' });
  const { data, isLoading, isFetching, error } = tab === 'feed' ? feed : explore;

  // Filtre değişince ilk sayfaya dönülür.
  const updateParams = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p) => {
    updateParams({ page: p > 1 ? String(p) : '' }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setTab = (t) => setSearchParams(t === 'feed' ? { tab: 'feed' } : {});

  const setShowAll = (value) => {
    updateParams({ all: value ? '1' : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = data?.data?.pagination?.total ?? 0;
  const hasMore = !showAll && total > PREVIEW_LIMIT;

  return (
    <PageLayout>
      {!token && !hasSearch && <Hero onSearch={(q) => updateParams({ q })} />}

      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tab === 'feed'
              ? 'Following'
              : filters.q
                ? `Results for "${filters.q}"`
                : showAll
                  ? 'All Notes'
                  : 'Latest Notes'}
          </h1>
          {data?.data?.pagination && (
            <p className="text-sm text-gray-500 mt-1">{pluralize(data.data.pagination.total, 'note')} found</p>
          )}
        </div>

        {token && (
          <div className="inline-flex rounded-xl bg-gray-200/80 p-1" role="tablist">
            <TabButton active={tab === 'explore'} onClick={() => setTab('explore')} icon={Compass}>
              Explore
            </TabButton>
            <TabButton active={tab === 'feed'} onClick={() => setTab('feed')} icon={Users}>
              Following
            </TabButton>
          </div>
        )}
      </div>

      {tab === 'explore' && filters.q && <PeopleResults key={filters.q} query={filters.q} />}

      {tab === 'explore' && (
        <div className="mb-6">
          <FilterBar
            values={filters}
            onChange={updateParams}
            onReset={() => setSearchParams(filters.q ? { q: filters.q } : {})}
          />
        </div>
      )}

      {error ? (
        <Alert>{getErrorMessage(error)}</Alert>
      ) : (
        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
          <NoteGrid
            notes={data?.data?.items}
            isLoading={isLoading}
            {...(tab === 'feed'
              ? {
                  emptyTitle: 'Your feed is empty',
                  emptyText: 'Notes from people you follow will show up here. Find students in the Explore tab.',
                }
              : hasSearch
                ? { emptyTitle: 'No matching notes', emptyText: 'Try different keywords or clear the filters.' }
                : {
                    emptyTitle: 'No notes shared yet',
                    emptyText: 'Be the first to share a note!',
                    emptyAction: token && (
                      <Link to="/upload" className="btn-primary">
                        <Upload size={16} /> Upload Note
                      </Link>
                    ),
                  })}
          />
          {showAll ? (
            <>
              <Pagination pagination={data?.data?.pagination} onPageChange={setPage} />
              {!hasSearch && (
                <div className="mt-6 flex justify-center">
                  <button type="button" onClick={() => setShowAll(false)} className="btn-secondary">
                    <ArrowLeft size={16} /> Show less
                  </button>
                </div>
              )}
            </>
          ) : (
            hasMore && (
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => setShowAll(true)} className="btn-primary px-6">
                  See all {pluralize(total, 'note')} <ArrowRight size={16} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </PageLayout>
  );
}

const HERO_SUGGESTIONS = ['Calculus', 'Physics', 'Midterm', 'Algorithms', 'Statistics'];

// Ziyaretçilere gösterilen karşılama alanı: SearchNote'un odağı arama olduğu için büyük bir arama kutusu içerir.
function Hero({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-5 py-9 sm:px-10 sm:py-14 text-white">
      {/* Dekoratif ışık lekeleri */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-navy-400/25 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-white/15">
          <Sparkles size={13} /> Free for every student
        </span>
        <h1 className="mt-4 text-[28px] sm:text-5xl font-extrabold leading-[1.1] tracking-tight">
          Search any note.
          <br />
          <span className="text-sky-300">Find it in seconds.</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-navy-100 sm:text-lg leading-relaxed">
          Class notes, past exams and slides shared by university students — searchable by course, instructor and
          university.
        </p>

        <form onSubmit={handleSubmit} role="search" className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:rounded-2xl sm:bg-white sm:p-1.5 sm:shadow-xl">
          <label className="relative flex-1">
            <span className="sr-only">Search notes</span>
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              maxLength={100}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Course, topic or instructor..."
              className="w-full rounded-xl sm:rounded-lg bg-white pl-11 pr-4 py-3.5 sm:py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 sm:focus:ring-0"
            />
          </label>
          <button type="submit" className="btn-primary rounded-xl sm:rounded-lg py-3.5 sm:py-3 px-6 bg-navy-600 hover:bg-navy-700">
            <Search size={17} /> Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-navy-200">Popular:</span>
          {HERO_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSearch(s)}
              className="rounded-full bg-white/10 px-3 py-1 text-white/90 ring-1 ring-white/15 hover:bg-white/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/register" className="btn-primary bg-white text-navy-800 hover:bg-navy-50">
            {REQUIRE_EDU_EMAIL ? 'Join free with .edu.tr' : 'Join for free'} <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary bg-transparent border-white/30 text-white hover:bg-white/10">
            Log In
          </Link>
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

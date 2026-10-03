import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Compass, Upload, Users } from 'lucide-react';
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
      {!token && !hasSearch && (
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-10 sm:px-10 sm:py-14 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-2xl">
            Class notes, past exams and slides — all in one place, for free.
          </h1>
          <p className="mt-3 text-navy-100 max-w-xl">
            Search and download materials shared by university students, and share your own notes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary bg-white text-navy-700 hover:bg-navy-50">
              {REQUIRE_EDU_EMAIL ? 'Join free with .edu.tr' : 'Join for free'}
            </Link>
            <Link to="/login" className="btn-secondary bg-transparent border-white/30 text-white hover:bg-white/10">
              Log In
            </Link>
          </div>
        </section>
      )}

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

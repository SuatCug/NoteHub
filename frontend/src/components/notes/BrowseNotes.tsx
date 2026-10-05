import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import FilterBar from '@/components/notes/FilterBar';
import NoteGrid from '@/components/notes/NoteGrid';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/common/Alert';
import PeopleResults from '@/components/users/PeopleResults';
import { useGetNotesQuery } from '@/services/notesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { pluralize } from '@/lib/format';

const FILTER_KEYS = ['q', 'university', 'department', 'semester', 'fileType', 'courseCode', 'instructorName', 'sort'];

// Önizlemede gösterilen not sayısı; daha fazlası varsa "See all" ile sayfalı tam listeye geçilir.
const PREVIEW_LIMIT = 12;

// Not arama / filtreleme / tüm notlar görünümü (Explore): giriş yapmış kullanıcının akışında orta sütunda gösterilir.
export default function BrowseNotes({ gridClassName }: { gridClassName?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? '']));
  const hasSearch = FILTER_KEYS.some((k) => k !== 'sort' && filters[k]);
  // Arama/filtre yoksa ve "See all" açılmadıysa sadece ilk PREVIEW_LIMIT not gösterilir.
  const showAll = searchParams.get('all') === '1' || hasSearch;
  const listParams = showAll ? { page } : { limit: PREVIEW_LIMIT };

  const { data, isLoading, isFetching, error } = useGetNotesQuery({ ...filters, ...listParams });

  // Filtre değişince ilk sayfaya dönülür.
  const updateParams = (changes: Record<string, string>, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    updateParams({ page: p > 1 ? String(p) : '' }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setShowAll = (value: boolean) => {
    updateParams({ all: value ? '1' : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = data?.data?.pagination?.total ?? 0;
  const hasMore = !showAll && total > PREVIEW_LIMIT;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.q ? `Results for "${filters.q}"` : hasSearch ? 'Filtered Notes' : showAll ? 'Explore Notes' : 'Latest Notes'}
        </h1>
        {data?.data?.pagination && (
          <p className="text-sm text-gray-500 mt-1">{pluralize(data.data.pagination.total, 'note')} found</p>
        )}
      </div>

      {filters.q && <PeopleResults key={filters.q} query={filters.q} />}

      <div className="mb-6">
        <FilterBar
          values={filters}
          onChange={updateParams}
          onReset={() => setSearchParams(filters.q ? { q: filters.q } : { all: '1' })}
        />
      </div>

      {error ? (
        <Alert>{getErrorMessage(error)}</Alert>
      ) : (
        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
          <NoteGrid
            notes={data?.data?.items}
            isLoading={isLoading}
            {...(gridClassName && { gridClassName })}
            {...(hasSearch
              ? { emptyTitle: 'No matching notes', emptyText: 'Try different keywords or clear the filters.' }
              : {
                  emptyTitle: 'No notes shared yet',
                  emptyText: 'Be the first to share a note!',
                  emptyAction: (
                    <Link to="/upload" className="btn-primary">
                      <Upload size={16} /> Upload Note
                    </Link>
                  ),
                })}
          />
          {showAll ? (
            <Pagination pagination={data?.data?.pagination} onPageChange={setPage} />
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
    </>
  );
}

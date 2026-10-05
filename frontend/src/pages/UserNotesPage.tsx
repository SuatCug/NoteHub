import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Search, Upload } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import NoteGrid from '@/components/notes/NoteGrid';
import ProfileSidebar from '@/components/users/ProfileSidebar';
import { useGetProfileQuery, useGetUserNotesQuery } from '@/services/usersApi';
import { SORT_OPTIONS } from '@/lib/constants';
import { pluralize } from '@/lib/format';

// Bir kullanıcının tüm notları: solda sabit kullanıcı paneli, sağda arama + sıralama + sayfalı not listesi.
export default function UserNotesPage() {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(q);
  // URL'deki arama değişirse (örn. geri tuşu) kutuyu senkronla.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  const profile = useGetProfileQuery(id);
  const notes = useGetUserNotesQuery({ id, page, sort, q: q || undefined });

  const updateParams = (changes: Record<string, string>, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    setSearchParams(next);
  };

  if (profile.isLoading) return <PageLayout><Spinner /></PageLayout>;
  if (profile.error || !profile.data) {
    return (
      <PageLayout narrow>
        <EmptyState title="User not found" action={<Link to="/" className="btn-primary">Back to home</Link>} />
      </PageLayout>
    );
  }

  const { user, isMe } = profile.data.data;
  const pagination = notes.data?.data?.pagination;
  const firstName = user.fullName.split(' ')[0];

  return (
    <PageLayout>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
        <ProfileSidebar profile={profile.data.data} />

        {/* Sağ: notlar */}
        <section className="min-w-0" aria-labelledby="notes-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="notes-title" className="text-2xl font-bold text-gray-900">
                {isMe ? 'My Notes' : `${firstName}'s Notes`}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {pagination ? (q ? `${pluralize(pagination.total, 'result')} for "${q}"` : pluralize(pagination.total, 'note')) : ' '}
              </p>
            </div>
          </div>

          <div className="card p-3 mt-4 flex flex-wrap items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ q: search.trim() });
              }}
              className="flex-1 min-w-[200px]"
              role="search"
            >
              <label className="relative block">
                <span className="sr-only">Search in {firstName}&apos;s notes</span>
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, course or instructor..."
                  className="form-input pl-10"
                />
              </label>
            </form>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
              className="form-input w-auto"
              aria-label="Sort notes"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`mt-5 ${notes.isFetching && !notes.isLoading ? 'opacity-60 transition-opacity' : ''}`}>
            <NoteGrid
              notes={notes.data?.data?.items}
              isLoading={notes.isLoading}
              gridClassName="grid gap-4 sm:grid-cols-2"
              {...(q
                ? { emptyTitle: 'No matching notes', emptyText: 'Try a different keyword.' }
                : {
                    emptyTitle: isMe ? "You haven't shared any notes yet" : 'No notes shared yet',
                    emptyAction: isMe && (
                      <Link to="/upload" className="btn-primary">
                        <Upload size={16} /> Upload your first note
                      </Link>
                    ),
                  })}
            />
            <Pagination
              pagination={pagination}
              onPageChange={(p) => {
                updateParams({ page: p > 1 ? String(p) : '' }, { keepPage: true });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}


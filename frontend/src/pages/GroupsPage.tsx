import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Compass, Plus, Search, UserRound } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import GroupGrid from '@/components/groups/GroupGrid';
import Pagination from '@/components/common/Pagination';
import Alert from '@/components/common/Alert';
import { useGetGroupsQuery, useGetMyGroupsQuery } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { pluralize } from '@/lib/format';

const GROUP_SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most members' },
];

export default function GroupsPage() {
  const token = useSelector((state) => state.auth.token);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = token && searchParams.get('tab') === 'mine' ? 'mine' : 'explore';
  const page = Number(searchParams.get('page')) || 1;
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const [search, setSearch] = useState(q);
  // URL'deki arama değişirse (örn. sekme değişti) kutuyu senkronla.
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  const explore = useGetGroupsQuery({ q, sort, page }, { skip: tab !== 'explore' });
  const mine = useGetMyGroupsQuery({ page }, { skip: tab !== 'mine' });
  const { data, isLoading, isFetching, error } = tab === 'mine' ? mine : explore;

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

  const setTab = (t) => setSearchParams(t === 'mine' ? { tab: 'mine' } : {});

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: search.trim() });
  };

  return (
    <PageLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tab === 'mine' ? 'My Groups' : 'Groups'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.data?.pagination
              ? `${pluralize(data.data.pagination.total, 'group')} found`
              : 'Join study groups and share notes with classmates.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {token && (
            <div className="inline-flex rounded-xl bg-gray-200/80 p-1" role="tablist">
              <TabButton active={tab === 'explore'} onClick={() => setTab('explore')} icon={Compass}>
                Explore
              </TabButton>
              <TabButton active={tab === 'mine'} onClick={() => setTab('mine')} icon={UserRound}>
                My Groups
              </TabButton>
            </div>
          )}
          {token && (
            <Link to="/groups/new" className="btn-primary">
              <Plus size={16} /> Create Group
            </Link>
          )}
        </div>
      </div>

      {tab === 'explore' && (
        <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]" role="search">
            <label className="relative block">
              <span className="sr-only">Search groups</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="form-input pl-10"
              />
            </label>
          </form>
          <select
            value={sort || 'newest'}
            onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
            className="form-input w-auto"
            aria-label="Sort groups"
          >
            {GROUP_SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error ? (
        <Alert>{getErrorMessage(error)}</Alert>
      ) : (
        <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
          <GroupGrid
            groups={data?.data?.items}
            isLoading={isLoading}
            {...(tab === 'mine'
              ? {
                  emptyTitle: "You haven't joined any groups yet",
                  emptyText: 'Find a group in the Explore tab or create your own.',
                }
              : q
                ? { emptyTitle: 'No results', emptyText: 'Try different keywords.' }
                : { emptyTitle: 'No groups yet', emptyText: 'Be the first to create a group!' })}
            emptyAction={
              token && (
                <Link to="/groups/new" className="btn-primary">
                  <Plus size={16} /> Create Group
                </Link>
              )
            }
          />
          <Pagination pagination={data?.data?.pagination} onPageChange={setPage} />
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

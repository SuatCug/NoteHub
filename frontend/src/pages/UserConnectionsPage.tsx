import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import ProfileSidebar from '@/components/users/ProfileSidebar';
import UserList from '@/components/users/UserList';
import { useGetFollowersQuery, useGetFollowingQuery, useGetProfileQuery } from '@/services/usersApi';
import { formatCount, pluralize } from '@/lib/format';
import type { UserCard } from '@/types/api';

// Arama: ad, üniversite ve bölümde büyük/küçük harf duyarsız (Türkçe) eşleşme.
const matches = (user: UserCard, term: string) =>
  [user.fullName, user.university, user.department].some((v) =>
    v?.toLocaleLowerCase('tr').includes(term.toLocaleLowerCase('tr'))
  );

// Bir kullanıcının tüm takipçileri / takip ettikleri: solda kullanıcı paneli, sağda arama + kullanıcı kartları.
export default function UserConnectionsPage({ type }: { type: 'followers' | 'following' }) {
  const { id = '' } = useParams();
  const [search, setSearch] = useState('');

  const profile = useGetProfileQuery(id);
  const followers = useGetFollowersQuery(id, { skip: type !== 'followers' });
  const following = useGetFollowingQuery(id, { skip: type !== 'following' });
  const list = type === 'followers' ? followers : following;

  if (profile.isLoading) return <PageLayout><Spinner /></PageLayout>;
  if (profile.error || !profile.data) {
    return (
      <PageLayout narrow>
        <EmptyState title="User not found" action={<Link to="/" className="btn-primary">Back to home</Link>} />
      </PageLayout>
    );
  }

  const { user, isMe } = profile.data.data;
  const firstName = user.fullName.split(' ')[0];
  const users = list.data?.data?.users;
  const term = search.trim();
  const filtered = term && users ? users.filter((u) => matches(u, term)) : users;

  const tabs = [
    { to: `/users/${id}/followers`, label: 'Followers', count: user.followersCount },
    { to: `/users/${id}/following`, label: 'Following', count: user.followingCount },
  ];

  const emptyProps = term
    ? { emptyTitle: 'No matching people', emptyText: 'Try a different name, university or department.' }
    : type === 'followers'
      ? { emptyTitle: isMe ? "You don't have any followers yet" : 'No followers yet' }
      : { emptyTitle: isMe ? "You aren't following anyone yet" : 'Not following anyone yet' };

  return (
    <PageLayout>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
        <ProfileSidebar profile={profile.data.data} />

        <section className="min-w-0" aria-labelledby="connections-title">
          <h2 id="connections-title" className="text-2xl font-bold text-gray-900">
            {isMe ? 'My Network' : `${firstName}'s Network`}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {filtered
              ? term
                ? `${pluralize(filtered.length, 'result')} for "${term}"`
                : type === 'followers'
                  ? `${pluralize(filtered.length, 'follower')}`
                  : `Following ${formatCount(filtered.length)} ${filtered.length === 1 ? 'person' : 'people'}`
              : ' '}
          </p>

          <div className="mt-4 border-b border-gray-200 flex gap-6" role="tablist">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                role="tab"
                className={({ isActive }) =>
                  `pb-3 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'border-navy-600 text-navy-700' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                {t.label} <span className="font-normal text-gray-400">{t.count}</span>
              </NavLink>
            ))}
          </div>

          <div className="card p-3 mt-5">
            <label className="relative block">
              <span className="sr-only">Search people</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, university or department..."
                className="form-input pl-10"
              />
            </label>
          </div>

          <div className="mt-5">
            <UserList
              users={filtered}
              isLoading={list.isLoading}
              gridClassName="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
              {...emptyProps}
            />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

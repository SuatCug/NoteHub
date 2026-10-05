import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Pencil, Upload } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import NoteGrid from '@/components/notes/NoteGrid';
import UserAvatar from '@/components/users/UserAvatar';
import FollowButton from '@/components/users/FollowButton';
import BlockButton from '@/components/users/BlockButton';
import MessageButton from '@/components/messages/MessageButton';
import UserList from '@/components/users/UserList';
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetProfileQuery,
  useGetUserNotesQuery,
} from '@/services/usersApi';
import { formatCount, formatDate } from '@/lib/format';

// Notlar sekmesinde bu kadar not gösterilir; fazlası "See all" ile kullanıcının not sayfasında (/users/:id/notes) listelenir.
const NOTES_PREVIEW = 3;
// Takipçi / takip edilen listelerinde gösterilen kişi sayısı; fazlası /users/:id/followers|following sayfasında.
const USERS_PREVIEW = 5;

export default function ProfilePage() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'notes';

  const { data, isLoading, error } = useGetProfileQuery(id);
  const notes = useGetUserNotesQuery({ id, limit: NOTES_PREVIEW }, { skip: tab !== 'notes' });
  const notesTotal = notes.data?.data?.pagination?.total ?? 0;
  const followers = useGetFollowersQuery(id, { skip: tab !== 'followers' });
  const following = useGetFollowingQuery(id, { skip: tab !== 'following' });

  if (isLoading) return <PageLayout><Spinner /></PageLayout>;
  if (error) {
    return (
      <PageLayout narrow>
        <EmptyState title="User not found" action={<Link to="/" className="btn-primary">Back to home</Link>} />
      </PageLayout>
    );
  }

  const { user, stats, isFollowing, isBlocked, isMe } = data.data;

  const tabs = [
    { key: 'notes', label: 'Notes', count: stats.notesCount },
    { key: 'followers', label: 'Followers', count: user.followersCount },
    { key: 'following', label: 'Following', count: user.followingCount },
  ];

  return (
    <PageLayout>
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <UserAvatar user={user} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 break-words">{user.fullName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.university} · {user.department}
            </p>
            {user.bio && <p className="mt-3 text-[15px] text-gray-700 whitespace-pre-line break-words">{user.bio}</p>}
            <p className="mt-2 text-xs text-gray-400">Member since {formatDate(user.createdAt)}</p>
          </div>
          <div className="shrink-0">
            {isMe ? (
              <Link to="/profile/edit" className="btn-secondary">
                <Pencil size={15} /> Edit Profile
              </Link>
            ) : (
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <div className="flex gap-2">
                  {!isBlocked && <FollowButton userId={user.id} isFollowing={isFollowing} />}
                  {!isBlocked && <MessageButton userId={user.id} />}
                </div>
                {token && <BlockButton userId={user.id} isBlocked={isBlocked} name={user.fullName} />}
              </div>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ProfileStat label="Notes" value={stats.notesCount} />
          <ProfileStat label="Total likes" value={stats.totalLikes} />
          <ProfileStat label="Total downloads" value={stats.totalDownloads} wideOnMobile />
          <ProfileStat label="Followers" value={user.followersCount} to={`/users/${user.id}/followers`} />
          <ProfileStat label="Following" value={user.followingCount} to={`/users/${user.id}/following`} />
        </dl>
      </section>

      <div className="mt-8 border-b border-gray-200 flex gap-6 overflow-x-auto" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setSearchParams(t.key === 'notes' ? {} : { tab: t.key })}
            className={`pb-3 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.key ? 'border-navy-600 text-navy-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label} <span className="font-normal text-gray-400">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'notes' && (
          <>
            <NoteGrid
              notes={notes.data?.data?.items}
              isLoading={notes.isLoading}
              emptyTitle={isMe ? "You haven't shared any notes yet" : 'No notes shared yet'}
              emptyAction={
                isMe && (
                  <Link to="/upload" className="btn-primary">
                    <Upload size={16} /> Upload your first note
                  </Link>
                )
              }
            />
            {notesTotal > NOTES_PREVIEW && (
              <div className="mt-6 flex justify-center">
                <Link to={`/users/${id}/notes`} className="btn-secondary">
                  See all {notesTotal} notes <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </>
        )}
        {tab === 'followers' && (
          <UserList
            users={followers.data?.data?.users}
            isLoading={followers.isLoading}
            emptyTitle="No followers yet"
            previewCount={USERS_PREVIEW}
            seeAll={{ to: `/users/${id}/followers`, label: `See all ${user.followersCount} followers` }}
          />
        )}
        {tab === 'following' && (
          <UserList
            users={following.data?.data?.users}
            isLoading={following.isLoading}
            emptyTitle="Not following anyone yet"
            previewCount={USERS_PREVIEW}
            seeAll={{ to: `/users/${id}/following`, label: `See all ${user.followingCount} following` }}
          />
        )}
      </div>
    </PageLayout>
  );
}

// to verilirse kutu ilgili listeye (takipçiler / takip edilenler) bağlantı olur.
// wideOnMobile: 2 sütunlu mobil ızgarada tam satır kaplar (5 kutu tek kalan olmadan dizilsin diye).
function ProfileStat({ label, value, to, wideOnMobile = false }) {
  const className = `rounded-xl bg-gray-50 px-4 py-3 flex flex-col-reverse ${wideOnMobile ? 'col-span-2 sm:col-span-1' : ''}`;
  const content = (
    <>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-xl font-bold text-gray-900">{formatCount(value)}</dd>
    </>
  );

  return to ? (
    <Link to={to} className={`${className} hover:bg-navy-50 transition-colors`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

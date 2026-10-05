import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Crown, Globe, Lock, Pencil, Upload, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import NoteGrid from '@/components/notes/NoteGrid';
import UserAvatar from '@/components/users/UserAvatar';
import JoinGroupButton from '@/components/groups/JoinGroupButton';
import GroupMemberList from '@/components/groups/GroupMemberList';
import GroupRequestList from '@/components/groups/GroupRequestList';
import GroupChat from '@/components/groups/GroupChat';
import { useGetGroupMembersQuery, useGetGroupNotesQuery, useGetGroupQuery } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { formatCount, formatDate } from '@/lib/format';

export default function GroupDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'notes';
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading, error } = useGetGroupQuery(id);
  const group = data?.data?.group;

  // Grup notları ve sohbet her grupta sadece üyelere açık; özel grubun üye listesi de öyle. İstekler sadece kurucuya.
  const canView = Boolean(group && (!group.isPrivate || group.isMember));
  const tabs = group
    ? [
        { key: 'notes', label: 'Notes', count: group.notesCount },
        { key: 'members', label: 'Members', count: group.membersCount },
        group.isMember && { key: 'chat', label: 'Chat' },
        group.isOwner && (group.isPrivate || group.pendingCount > 0) && {
          key: 'requests',
          label: 'Requests',
          count: group.pendingCount,
        },
      ].filter(Boolean)
    : [];
  const tab = tabs.some((t) => t.key === requestedTab) ? requestedTab : 'notes';

  const notes = useGetGroupNotesQuery({ id, page }, { skip: !group?.isMember || tab !== 'notes' });
  const members = useGetGroupMembersQuery(id, { skip: !canView || tab !== 'members' });

  if (isLoading) return <PageLayout><Spinner /></PageLayout>;
  if (error) {
    return (
      <PageLayout narrow>
        <EmptyState
          icon={Users}
          title={error.status === 404 ? 'Group not found' : 'Could not load group'}
          text={error.status === 404 ? 'This group may have been deleted.' : getErrorMessage(error)}
          action={<Link to="/groups" className="btn-primary">Back to groups</Link>}
        />
      </PageLayout>
    );
  }

  const shareLink = (
    <Link to={`/upload?group=${group._id}`} className="btn-primary">
      <Upload size={16} /> Share a Note
    </Link>
  );

  return (
    <PageLayout>
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <span className="w-20 h-20 rounded-2xl bg-navy-100 text-navy-700 flex items-center justify-center shrink-0">
            <Users size={36} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 break-words">{group.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {group.isPrivate ? <Lock size={11} /> : <Globe size={11} />}
                {group.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
            <Link
              to={`/users/${group.owner?._id}`}
              className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-navy-600"
            >
              <UserAvatar user={group.owner} size="xs" />
              <span className="font-medium">{group.owner?.fullName}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-px text-[11px] font-semibold text-amber-700">
                <Crown size={11} /> Founder
              </span>
            </Link>
            {group.description && (
              <p className="mt-3 text-[15px] text-gray-700 whitespace-pre-line break-words">{group.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Created {formatDate(group.createdAt)} · {formatCount(group.membersCount)} members ·{' '}
              {formatCount(group.notesCount)} notes
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-2">
            {group.isMember && shareLink}
            {group.isOwner ? (
              <Link to={`/groups/${group._id}/edit`} className="btn-secondary">
                <Pencil size={15} /> Edit Group
              </Link>
            ) : (
              <JoinGroupButton group={group} />
            )}
          </div>
        </div>
      </section>

      {!canView ? (
        <div className="mt-8">
          <EmptyState
            icon={Lock}
            title="This group is private"
            text={
              group.isPending
                ? 'Your join request is waiting for the founder\'s approval.'
                : 'Send a join request to see the notes, members and chat.'
            }
          />
        </div>
      ) : (
        <>
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
                {t.label}{' '}
                {t.count !== undefined && (
                  <span
                    className={
                      t.key === 'requests' && t.count > 0
                        ? 'ml-0.5 rounded-full bg-rose-500 text-white text-[11px] px-1.5 py-px'
                        : 'font-normal text-gray-400'
                    }
                  >
                    {formatCount(t.count)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === 'notes' && !group.isMember && (
              <EmptyState
                icon={Lock}
                title="Notes are for members only"
                text="Notes shared in a group are only visible to its members. Join the group to see them."
                action={<JoinGroupButton group={group} />}
              />
            )}
            {tab === 'notes' && group.isMember && (
              <>
                <NoteGrid
                  notes={notes.data?.data?.items}
                  isLoading={notes.isLoading}
                  emptyTitle="No notes in this group yet"
                  emptyText="Be the first to share a note here. Only group members can see it."
                  emptyAction={shareLink}
                />
                <Pagination
                  pagination={notes.data?.data?.pagination}
                  onPageChange={(p) => setSearchParams(p > 1 ? { page: String(p) } : {})}
                />
              </>
            )}
            {tab === 'members' && (
              <GroupMemberList
                groupId={group._id}
                users={members.data?.data?.users}
                isLoading={members.isLoading}
                canManage={group.isOwner}
              />
            )}
            {tab === 'chat' && <GroupChat groupId={group._id} isOwner={group.isOwner} />}
            {tab === 'requests' && <GroupRequestList groupId={group._id} />}
          </div>
        </>
      )}
    </PageLayout>
  );
}

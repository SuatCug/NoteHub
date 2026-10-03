import { Link } from 'react-router-dom';
import { Check, UserPlus, X } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { useGetJoinRequestsQuery, useRespondJoinRequestMutation } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

// Özel grubun bekleyen katılma istekleri (sadece kurucuya gösterilir).
export default function GroupRequestList({ groupId }) {
  const { data, isLoading } = useGetJoinRequestsQuery(groupId);
  const [respond, { isLoading: responding }] = useRespondJoinRequestMutation();
  const users = data?.data?.users;

  if (isLoading) return <Spinner />;
  if (!users?.length) {
    return <EmptyState icon={UserPlus} title="No pending requests" text="New join requests will show up here." />;
  }

  const handle = async (userId, approve) => {
    try {
      await respond({ id: groupId, userId, approve }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {users.map((u) => (
        <li key={u._id} className="card flex items-center gap-3 p-4">
          <Link to={`/users/${u._id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
            <UserAvatar user={u} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 group-hover:text-navy-600 truncate">
                {u.fullName}
              </span>
              <span className="block text-xs text-gray-500 truncate">
                {u.university} · {u.department}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={responding}
              onClick={() => handle(u._id, true)}
              className="btn-primary px-3 py-2"
              aria-label={`Approve ${u.fullName}`}
            >
              <Check size={15} /> Approve
            </button>
            <button
              type="button"
              disabled={responding}
              onClick={() => handle(u._id, false)}
              className="p-2 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
              title="Reject"
              aria-label={`Reject ${u.fullName}`}
            >
              <X size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

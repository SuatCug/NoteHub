import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MessagesSquare, Search } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { timeAgo } from '@/lib/format';
import type { ConversationSummary } from '@/types/api';

interface ConversationListProps {
  conversations?: ConversationSummary[];
  isLoading: boolean;
  error?: unknown;
}

// Mesajlar sayfasının sol paneli: konuşmalar (son mesaj önizlemesi + okunmamış sayısı) ve isimde arama.
export default function ConversationList({ conversations, isLoading, error }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLocaleLowerCase('tr');
  const filtered = term
    ? conversations?.filter((c) => c.otherUser?.fullName.toLocaleLowerCase('tr').includes(term))
    : conversations;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-gray-100">
        <label className="relative block">
          <span className="sr-only">Search conversations</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="form-input pl-9 py-2"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <Alert className="m-3">{getErrorMessage(error)}</Alert>
        ) : !filtered?.length ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <MessagesSquare size={28} className="mx-auto" />
            <p className="mt-2 text-sm">
              {term ? 'No conversations match that name.' : 'No messages yet. Open someone’s profile and tap Message.'}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((c) => (
              <li key={c._id}>
                <ConversationItem conversation={c} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ConversationItem({ conversation: c }: { conversation: ConversationSummary }) {
  const unread = c.unreadCount > 0;
  const preview = c.lastMessage.hasNote && !c.lastMessage.text ? 'Shared a note' : c.lastMessage.text;

  return (
    <NavLink
      to={`/messages/${c._id}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 border-l-[3px] transition-colors ${
          isActive ? 'bg-navy-50 border-navy-600' : 'border-transparent hover:bg-gray-50'
        }`
      }
    >
      <UserAvatar user={c.otherUser} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm ${unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
            {c.otherUser?.fullName ?? 'Deleted user'}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(c.lastMessage.createdAt)}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-xs ${unread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
            {c.lastMessage.isMine && 'You: '}
            {preview}
          </span>
          {unread && (
            <span className="shrink-0 rounded-full bg-navy-600 px-1.5 py-px text-[11px] font-semibold text-white">
              {c.unreadCount > 99 ? '99+' : c.unreadCount}
            </span>
          )}
        </span>
      </span>
    </NavLink>
  );
}

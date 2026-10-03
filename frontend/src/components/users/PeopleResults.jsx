import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UserCard from './UserCard';
import { useSearchUsersQuery } from '@/services/usersApi';
import { pluralize } from '@/lib/format';

// Arama sonuçlarının üstünde gösterilen "People" bölümü: ad, üniversite veya bölümü eşleşen profiller.
// Önce PREVIEW_COUNT kişi gösterilir; fazlası "Show all" ile açılır. Eşleşen kimse yoksa bölüm hiç çıkmaz.
const PREVIEW_COUNT = 5;
const MAX_RESULTS = 50;

export default function PeopleResults({ query }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isFetching } = useSearchUsersQuery({ q: query, limit: MAX_RESULTS });

  const users = data?.data?.users;
  if (!users?.length) return null;

  const total = data.data.pagination.total;
  const visible = expanded ? users : users.slice(0, PREVIEW_COUNT);

  return (
    <section className={`mb-8 ${isFetching ? 'opacity-60 transition-opacity' : ''}`} aria-labelledby="people-results-title">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 id="people-results-title" className="text-lg font-bold text-gray-900">People</h2>
          <p className="text-sm text-gray-500">{pluralize(total, 'profile')} found</p>
        </div>
        {users.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-navy-800"
          >
            {expanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Show all {users.length} <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((u) => (
          <li key={u._id}>
            <UserCard user={u} />
          </li>
        ))}
      </ul>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import UserCard from './UserCard';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';

// Takipçi / takip edilen listeleri (kullanıcı kartları ızgarası).
// previewCount verilirse sadece o kadar kişi gösterilir; fazlası için seeAll ({ to, label }) bağlantısı çıkar.
export default function UserList({
  users,
  isLoading,
  emptyTitle,
  emptyText,
  previewCount,
  seeAll,
  gridClassName = 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
}) {
  if (isLoading) return <Spinner />;
  if (!users?.length) return <EmptyState icon={Users} title={emptyTitle} text={emptyText} />;

  const hasMore = previewCount !== undefined && users.length > previewCount;
  const visible = hasMore ? users.slice(0, previewCount) : users;

  return (
    <>
      <ul className={gridClassName}>
        {visible.map((u) => (
          <li key={u._id}>
            <UserCard user={u} />
          </li>
        ))}
      </ul>

      {hasMore && seeAll && (
        <div className="mt-6 flex justify-center">
          <Link to={seeAll.to} className="btn-secondary">
            {seeAll.label} <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </>
  );
}

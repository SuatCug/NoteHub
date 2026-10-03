import { Users } from 'lucide-react';
import GroupCard from './GroupCard';
import EmptyState from '@/components/common/EmptyState';

function GroupCardSkeleton() {
  return (
    <div className="card p-5 space-y-3" aria-hidden="true">
      <div className="skeleton-box h-11 w-11 rounded-xl" />
      <div className="skeleton-box h-5 w-3/5 rounded" />
      <div className="skeleton-box h-3 w-full rounded" />
      <div className="pt-3 flex justify-between">
        <div className="skeleton-box h-4 w-24 rounded" />
        <div className="skeleton-box h-4 w-16 rounded" />
      </div>
    </div>
  );
}

// Grup kartları ızgarası: yüklenirken iskelet, boşken bilgilendirme gösterir.
export default function GroupGrid({ groups, isLoading, emptyTitle, emptyText, emptyAction }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!groups?.length) {
    return <EmptyState icon={Users} title={emptyTitle} text={emptyText} action={emptyAction} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <GroupCard key={group._id} group={group} index={i} />
      ))}
    </div>
  );
}

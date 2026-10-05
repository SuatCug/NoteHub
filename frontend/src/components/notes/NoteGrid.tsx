import type { ReactNode } from 'react';
import NoteCard from './NoteCard';
import type { NoteCard as NoteCardData } from '@/types/api';
import EmptyState from '@/components/common/EmptyState';

function NoteCardSkeleton() {
  return (
    <div className="card p-5 space-y-3" aria-hidden="true">
      <div className="flex justify-between">
        <div className="skeleton-box h-5 w-14 rounded-md" />
        <div className="skeleton-box h-5 w-16 rounded-md" />
      </div>
      <div className="skeleton-box h-5 w-4/5 rounded" />
      <div className="skeleton-box h-4 w-3/5 rounded" />
      <div className="skeleton-box h-3 w-full rounded" />
      <div className="pt-3 flex justify-between">
        <div className="skeleton-box h-4 w-24 rounded" />
        <div className="skeleton-box h-4 w-20 rounded" />
      </div>
    </div>
  );
}

const DEFAULT_GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

// Not kartları ızgarası: yüklenirken iskelet, boşken bilgilendirme gösterir.
// gridClassName: dar alanlarda (örn. yan panelli sayfalar) sütun sayısını değiştirmek için.
interface NoteGridProps {
  notes?: NoteCardData[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyText?: ReactNode;
  emptyAction?: ReactNode;
  gridClassName?: string;
}

export default function NoteGrid({ notes, isLoading, emptyTitle, emptyText, emptyAction, gridClassName = DEFAULT_GRID }: NoteGridProps) {
  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 6 }, (_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return <EmptyState title={emptyTitle} text={emptyText} action={emptyAction} />;
  }

  return (
    <div className={gridClassName}>
      {notes.map((note, i) => (
        <NoteCard key={note._id} note={note} index={i} />
      ))}
    </div>
  );
}

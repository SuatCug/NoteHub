import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Heart, Loader2, X } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import FollowButton from '@/components/users/FollowButton';
import { useGetNoteLikesQuery } from '@/services/notesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

interface LikesModalProps {
  noteId: string;
  onClose: () => void;
}

// Notu beğenenlerin listesi. Telefonda alttan açılan sayfa, büyük ekranda ortada pencere.
// Sayfalar alt alta eklenir ("Show more"); her sayfa kendi sorgusunu yapar, RTK önbelleği tekrar açılışta kullanılır.
export default function LikesModal({ noteId, onClose }: LikesModalProps) {
  const [pages, setPages] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Üst bileşen her render'da yeni onClose verse de aşağıdaki kurulum (odak, kaydırma kilidi) bir kez yapılır.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    // Arkadaki sayfa kaymasın.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="likes-title"
        className="relative flex max-h-[80vh] sm:max-h-[min(560px,85vh)] w-full sm:max-w-md flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl pb-safe"
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 id="likes-title" className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Heart size={17} className="fill-rose-500 text-rose-500" /> Likes
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-2 py-2">
          {Array.from({ length: pages }, (_, i) => (
            <LikesPage key={i} noteId={noteId} page={i + 1} isLast={i + 1 === pages} onMore={() => setPages(i + 2)} onNavigate={onClose} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface LikesPageProps {
  noteId: string;
  page: number;
  isLast: boolean;
  onMore: () => void;
  onNavigate: () => void;
}

function LikesPage({ noteId, page, isLast, onMore, onNavigate }: LikesPageProps) {
  const { data, isLoading, error } = useGetNoteLikesQuery({ id: noteId, page });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }
  if (error) return <p className="px-3 py-6 text-center text-sm text-red-600">{getErrorMessage(error)}</p>;

  const users = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  if (page === 1 && !users.length) {
    return <p className="px-3 py-8 text-center text-sm text-gray-500">No likes yet.</p>;
  }

  return (
    <>
      <ul>
        {users.map((u) => (
          <li key={u._id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50">
            <Link to={`/users/${u._id}`} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 group">
              <UserAvatar user={u} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900 group-hover:text-navy-600">
                  {u.fullName}
                  {u.isMe && <span className="ml-1 font-normal text-gray-400">(you)</span>}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {[u.university, u.department].filter(Boolean).join(' · ')}
                </span>
              </span>
            </Link>
            {!u.isMe && <FollowButton userId={u._id} isFollowing={u.isFollowing} name={u.fullName} compact />}
          </li>
        ))}
      </ul>
      {isLast && pagination && pagination.page < pagination.totalPages && (
        <div className="flex justify-center py-2">
          <button type="button" onClick={onMore} className="btn-secondary py-2">
            Show more
          </button>
        </div>
      )}
    </>
  );
}

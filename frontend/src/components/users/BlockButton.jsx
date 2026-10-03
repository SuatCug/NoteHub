import { Ban } from 'lucide-react';
import { useToggleBlockMutation } from '@/services/usersApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

// Engelle / engeli kaldır. Engellenince karşılıklı takip kalkar ve iki taraf birbirine mesaj atamaz.
export default function BlockButton({ userId, isBlocked, name, className = '' }) {
  const [toggleBlock, { isLoading }] = useToggleBlockMutation();

  const handleClick = async () => {
    if (
      !isBlocked &&
      !window.confirm(
        `Block ${name}? You won't be able to message each other, and any follows between you will be removed.`
      )
    ) {
      return;
    }
    try {
      await toggleBlock({ id: userId, blocked: isBlocked }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
        isBlocked ? 'text-navy-600 hover:text-navy-800' : 'text-gray-400 hover:text-rose-500'
      } ${className}`}
    >
      <Ban size={14} /> {isBlocked ? 'Unblock' : 'Block'}
    </button>
  );
}

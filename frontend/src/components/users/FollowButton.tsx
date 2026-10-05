import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserCheck, UserPlus } from 'lucide-react';
import { useToggleFollowMutation } from '@/services/usersApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

// compact: yan panel listeleri için küçük boyut.
interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  compact?: boolean;
}

export default function FollowButton({ userId, isFollowing, compact = false }: FollowButtonProps) {
  const token = useAppSelector((state) => state.auth.token);
  const isVerified = useAppSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [toggleFollow, { isLoading }] = useToggleFollowMutation();

  const handleClick = async () => {
    if (!token) return navigate('/login');
    try {
      await toggleFollow({ id: userId, following: isFollowing }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || Boolean(token && !isVerified)}
      title={token && !isVerified ? 'Verify your email to follow' : undefined}
      className={`${isFollowing ? 'btn-secondary' : 'btn-primary'} ${compact ? 'px-2.5 py-1.5 text-xs gap-1' : ''}`}
    >
      {isFollowing ? <UserCheck size={compact ? 14 : 16} /> : <UserPlus size={compact ? 14 : 16} />}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

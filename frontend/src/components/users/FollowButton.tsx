import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { useToggleFollowMutation } from '@/services/usersApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useDialog } from '@/components/common/DialogProvider';

// compact: yan panel listeleri için küçük boyut.
// name: takipten çıkarken onay penceresinde gösterilir.
interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  name?: string;
  compact?: boolean;
}

export default function FollowButton({ userId, isFollowing, name, compact = false }: FollowButtonProps) {
  const token = useAppSelector((state) => state.auth.token);
  const isVerified = useAppSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [toggleFollow, { isLoading }] = useToggleFollowMutation();
  const dialog = useDialog();

  const handleClick = async () => {
    if (!token) return navigate('/login');
    if (
      isFollowing &&
      !(await dialog.confirm({
        title: name ? `Unfollow ${name}?` : 'Unfollow this user?',
        message: "Their new notes will no longer appear in your Following feed.",
        confirmLabel: 'Unfollow',
        tone: 'danger',
        icon: UserMinus,
      }))
    ) {
      return;
    }
    try {
      await toggleFollow({ id: userId, following: isFollowing }).unwrap();
    } catch (err) {
      dialog.alert({ message: getErrorMessage(err) });
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

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserCheck, UserPlus } from 'lucide-react';
import { useToggleFollowMutation } from '@/services/usersApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

export default function FollowButton({ userId, isFollowing }) {
  const token = useSelector((state) => state.auth.token);
  const isVerified = useSelector((state) => state.auth.user?.isVerified);
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
      disabled={isLoading || (token && !isVerified)}
      title={token && !isVerified ? 'Verify your email to follow' : undefined}
      className={isFollowing ? 'btn-secondary' : 'btn-primary'}
    >
      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

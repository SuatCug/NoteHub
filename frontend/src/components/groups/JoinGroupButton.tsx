import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Clock, LogOut, UserPlus } from 'lucide-react';
import { useToggleMembershipMutation } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { GroupCard } from '@/types/api';

// Üye değilse katıl (özel grupta istek gönder), bekleyen istek varsa geri çek, üyeyse ayrıl.
export default function JoinGroupButton({ group }: { group: Pick<GroupCard, '_id' | 'isMember' | 'isPending' | 'isPrivate'> }) {
  const token = useAppSelector((state) => state.auth.token);
  const isVerified = useAppSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [toggleMembership, { isLoading }] = useToggleMembershipMutation();
  const { _id: id, isMember, isPending, isPrivate } = group;
  const leave = isMember || isPending;

  const handleClick = async () => {
    if (!token) return navigate('/login', { state: { from: `/groups/${id}` } });
    if (isMember && !window.confirm(isPrivate ? 'Leave this group? You will need approval to join again.' : 'Leave this group?')) return;
    if (isPending && !window.confirm('Cancel your join request?')) return;
    try {
      await toggleMembership({ id, leave }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const needsVerify = Boolean(token && !isVerified && !leave);

  let icon = <UserPlus size={16} />;
  let label = isPrivate ? 'Request to Join' : 'Join Group';
  if (isMember) {
    icon = <LogOut size={16} />;
    label = 'Leave Group';
  } else if (isPending) {
    icon = <Clock size={16} />;
    label = 'Request Sent';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || needsVerify}
      title={needsVerify ? 'Verify your email to join groups' : isPending ? 'Click to cancel your request' : undefined}
      className={leave ? 'btn-secondary' : 'btn-primary'}
    >
      {icon}
      {label}
    </button>
  );
}

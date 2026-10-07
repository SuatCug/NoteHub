import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Clock, LogOut, UserPlus } from 'lucide-react';
import { useToggleMembershipMutation } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useDialog } from '@/components/common/DialogProvider';
import type { GroupCard } from '@/types/api';

// Üye değilse katıl (özel grupta istek gönder), bekleyen istek varsa geri çek, üyeyse ayrıl.
export default function JoinGroupButton({ group }: { group: Pick<GroupCard, '_id' | 'isMember' | 'isPending' | 'isPrivate'> }) {
  const token = useAppSelector((state) => state.auth.token);
  const isVerified = useAppSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [toggleMembership, { isLoading }] = useToggleMembershipMutation();
  const dialog = useDialog();
  const { _id: id, isMember, isPending, isPrivate } = group;
  const leave = isMember || isPending;

  const handleClick = async () => {
    if (!token) return navigate('/login', { state: { from: `/groups/${id}` } });
    if (
      isMember &&
      !(await dialog.confirm({
        title: 'Leave this group?',
        message: isPrivate
          ? 'This is a private group, so you will need approval to join again.'
          : 'You can join again anytime.',
        confirmLabel: 'Leave group',
        tone: 'danger',
        icon: LogOut,
      }))
    ) {
      return;
    }
    if (
      isPending &&
      !(await dialog.confirm({
        title: 'Cancel your join request?',
        message: 'You can send a new request later.',
        confirmLabel: 'Cancel request',
        cancelLabel: 'Keep it',
        icon: Clock,
      }))
    ) {
      return;
    }
    try {
      await toggleMembership({ id, leave }).unwrap();
    } catch (err) {
      dialog.alert({ message: getErrorMessage(err) });
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

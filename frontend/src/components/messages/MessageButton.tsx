import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { MessageCircle } from 'lucide-react';
import { useStartConversationMutation } from '@/services/messagesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { useDialog } from '@/components/common/DialogProvider';

// Kullanıcıyla konuşmayı açıp mesajlar sayfasına götürür. noteId verilirse ("Ask the author")
// not, ilk mesaja eklenmek üzere mesaj kutusuna iliştirilir.
interface MessageButtonProps {
  userId: string;
  noteId?: string;
  label?: string;
  className?: string;
}

export default function MessageButton({ userId, noteId, label = 'Message', className = 'btn-secondary' }: MessageButtonProps) {
  const token = useAppSelector((state) => state.auth.token);
  const isVerified = useAppSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [startConversation, { isLoading }] = useStartConversationMutation();
  const dialog = useDialog();

  const handleClick = async () => {
    if (!token) return navigate('/login');
    try {
      const { data } = await startConversation(userId).unwrap();
      navigate(`/messages/${data.conversationId}${noteId ? `?note=${noteId}` : ''}`);
    } catch (err) {
      dialog.alert({ message: getErrorMessage(err) });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || Boolean(token && !isVerified)}
      title={token && !isVerified ? 'Verify your email to send messages' : undefined}
      className={className}
    >
      <MessageCircle size={16} /> {label}
    </button>
  );
}

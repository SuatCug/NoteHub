import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import { useStartConversationMutation } from '@/services/messagesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

// Kullanıcıyla konuşmayı açıp mesajlar sayfasına götürür. noteId verilirse ("Ask the author")
// not, ilk mesaja eklenmek üzere mesaj kutusuna iliştirilir.
export default function MessageButton({ userId, noteId, label = 'Message', className = 'btn-secondary' }) {
  const token = useSelector((state) => state.auth.token);
  const isVerified = useSelector((state) => state.auth.user?.isVerified);
  const navigate = useNavigate();
  const [startConversation, { isLoading }] = useStartConversationMutation();

  const handleClick = async () => {
    if (!token) return navigate('/login');
    try {
      const { data } = await startConversation(userId).unwrap();
      navigate(`/messages/${data.conversationId}${noteId ? `?note=${noteId}` : ''}`);
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || (token && !isVerified)}
      title={token && !isVerified ? 'Verify your email to send messages' : undefined}
      className={className}
    >
      <MessageCircle size={16} /> {label}
    </button>
  );
}

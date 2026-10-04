import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, FileText, MessagesSquare, MoreVertical, Paperclip, SendHorizontal, Trash2, X } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import BlockButton from '@/components/users/BlockButton';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import {
  useDeleteConversationMutation,
  useDeleteDirectMessageMutation,
  useGetConversationQuery,
  useSendDirectMessageMutation,
} from '@/services/messagesApi';
import { useGetNoteQuery } from '@/services/notesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { timeAgo } from '@/lib/format';
import { useFallbackPolling } from '@/lib/socket';

// Yeni mesajlar Socket.io ile anında gelir; bağlantı yoksa açık konuşma bu aralıkla yoklanır.
const POLL_INTERVAL_MS = 5000;

// Birebir sohbet paneli. ?note=<id> ile açıldıysa ("Ask the author") not, gönderilecek mesaja iliştirilir.
export default function ChatPanel({ conversationId }) {
  const me = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const attachedNoteId = searchParams.get('note');

  const { data, isLoading, error } = useGetConversationQuery(conversationId, {
    pollingInterval: useFallbackPolling(POLL_INTERVAL_MS),
    skipPollingIfUnfocused: true,
  });
  const attachedNote = useGetNoteQuery(attachedNoteId, { skip: !attachedNoteId });
  const [sendMessage, { isLoading: sending }] = useSendDirectMessageMutation();
  const [deleteMessage] = useDeleteDirectMessageMutation();
  const [deleteConversation] = useDeleteConversationMutation();

  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const conversation = data?.data?.conversation;
  const messages = data?.data?.messages;
  const lastId = messages?.at(-1)?._id;
  const other = conversation?.otherUser;

  // Yeni mesaj gelince sadece mesaj listesini en alta kaydır.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  // Konuşma değişince yazma kutusuna odaklan.
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const removeAttachment = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('note');
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSendError('');
    try {
      await sendMessage({ id: conversationId, text: trimmed, noteId: attachedNoteId }).unwrap();
      setText('');
      if (attachedNoteId) removeAttachment();
    } catch (err) {
      setSendError(getErrorMessage(err));
    }
  };

  // Enter gönderir, Shift+Enter yeni satır ekler.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Unsend this message? It will be removed for both of you.')) return;
    try {
      await deleteMessage({ id: conversationId, messageId }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleDeleteConversation = async () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this conversation? It will only be removed for you.')) return;
    try {
      await deleteConversation(conversationId).unwrap();
      navigate('/messages');
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  if (isLoading) return <Spinner />;
  if (error) {
    return (
      <div className="p-6">
        <Alert>{getErrorMessage(error)}</Alert>
        <Link to="/messages" className="btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to messages
        </Link>
      </div>
    );
  }

  // Mesaj yazılamayan durumlar (engelleme, silinmiş hesap, doğrulanmamış e-posta).
  const blockedNotice = !other
    ? 'This account no longer exists.'
    : conversation.blockedByMe
      ? `You blocked ${other.fullName}. Unblock them to send messages.`
      : conversation.blockedMe
        ? "You can't reply to this conversation."
        : !me?.isVerified
          ? 'Verify your email address to send messages.'
          : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Başlık: karşı taraf + menü */}
      <header className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-100">
        <Link to="/messages" className="lg:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        {other ? (
          <Link to={`/users/${other._id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
            <UserAvatar user={other} size="md" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 truncate group-hover:text-navy-600">
                {other.fullName}
              </span>
              <span className="block text-xs text-gray-500 truncate">
                {other.university} · {other.department}
              </span>
            </span>
          </Link>
        ) : (
          <span className="flex-1 text-sm font-semibold text-gray-500">Deleted user</span>
        )}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Conversation options"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-xl border border-gray-100 bg-white shadow-lg py-1.5">
                {other && (
                  <div className="px-4 py-2" onClick={() => setMenuOpen(false)}>
                    <BlockButton userId={other._id} isBlocked={conversation.blockedByMe} name={other.fullName} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDeleteConversation}
                  className="w-full flex items-center gap-1.5 px-4 py-2 text-left text-sm font-medium text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={14} /> Delete conversation
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mesajlar */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3">
        {!messages?.length ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <MessagesSquare size={28} />
            <p className="mt-2 text-sm">No messages yet. Say hi{other ? ` to ${other.fullName.split(' ')[0]}` : ''}!</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender === me?.id;
            return (
              <div key={m._id} className={`group flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`min-w-0 max-w-[80%] sm:max-w-[70%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm ${
                        mine ? 'bg-navy-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {m.note && <NoteAttachment note={m.note} mine={mine} />}
                      <p className="whitespace-pre-line break-words">{m.text}</p>
                    </div>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m._id)}
                        className="p-1 rounded text-gray-300 opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-coarse:opacity-100 hover:text-rose-500"
                        aria-label="Unsend message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <span className="mt-0.5 px-1 text-[11px] text-gray-400">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Yazma kutusu */}
      {blockedNotice ? (
        <div className="border-t border-gray-100 px-4 py-4 text-center text-sm text-gray-500">
          {blockedNotice}
          {conversation.blockedByMe && other && (
            <div className="mt-2">
              <BlockButton userId={other._id} isBlocked name={other.fullName} />
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 sm:p-4">
          <Alert className="mb-2">{sendError}</Alert>
          {attachedNoteId && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-navy-100 bg-navy-50 px-3 py-2 text-sm">
              <Paperclip size={15} className="shrink-0 text-navy-600" />
              <span className="min-w-0 flex-1 truncate text-navy-800">
                {attachedNote.data?.data?.note?.title ?? (attachedNote.isError ? 'Note unavailable' : 'Loading note...')}
              </span>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-0.5 rounded text-navy-400 hover:text-navy-700"
                aria-label="Remove attached note"
              >
                <X size={15} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <label htmlFor="dm-message" className="sr-only">
              Message
            </label>
            <textarea
              id="dm-message"
              ref={inputRef}
              rows={1}
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedNoteId ? 'Ask something about this note...' : 'Write a message...'}
              className="form-input resize-none max-h-32"
            />
            <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-3.5 shrink-0" aria-label="Send">
              <SendHorizontal size={17} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Mesaja eklenmiş not kartı (tıklayınca not sayfası açılır).
function NoteAttachment({ note, mine }) {
  return (
    <Link
      to={`/notes/${note._id}`}
      className={`mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${
        mine ? 'bg-white/15 hover:bg-white/25' : 'bg-white hover:bg-navy-50 border border-gray-200'
      }`}
    >
      <FileText size={18} className={mine ? 'text-white' : 'text-navy-600'} />
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${mine ? 'text-white' : 'text-gray-900'}`}>{note.title}</span>
        <span className={`block truncate text-xs ${mine ? 'text-white/70' : 'text-gray-500'}`}>
          {[note.courseCode, note.courseName].filter(Boolean).join(' · ')}
        </span>
      </span>
    </Link>
  );
}

import { useEffect, useRef, useState, type KeyboardEvent, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { MessagesSquare, SendHorizontal, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/common/Alert';
import {
  useDeleteGroupMessageMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { timeAgo } from '@/lib/format';
import { joinGroupRoom, leaveGroupRoom, useFallbackPolling } from '@/lib/socket';

// Yeni mesajlar Socket.io grup odasından anında gelir; bağlantı yoksa sunucu bu aralıkla yoklanır.
const POLL_INTERVAL_MS = 5000;

// Grup sohbeti: sadece üyelere gösterilir. Son 100 mesaj listelenir.
export default function GroupChat({ groupId, isOwner }: { groupId: string; isOwner: boolean }) {
  const me = useAppSelector((state) => state.auth.user);
  const { data, isLoading, error } = useGetGroupMessagesQuery(groupId, {
    pollingInterval: useFallbackPolling(POLL_INTERVAL_MS),
    skipPollingIfUnfocused: true,
  });
  const [sendMessage, { isLoading: sending }] = useSendGroupMessageMutation();
  const [deleteMessage] = useDeleteGroupMessageMutation();
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Sohbet açıkken grubun socket odasına katılınır; yeni mesaj olayı gelince liste yenilenir (bkz. RealtimeBridge).
  useEffect(() => {
    joinGroupRoom(groupId);
    return () => leaveGroupRoom(groupId);
  }, [groupId]);

  const messages = data?.data?.messages;
  const lastId = messages?.at(-1)?._id;

  // Yeni mesaj gelince (sayfanın kendisini değil) sadece mesaj listesini en alta kaydır.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSendError('');
    try {
      await sendMessage({ id: groupId, text: trimmed }).unwrap();
      setText('');
    } catch (err) {
      setSendError(getErrorMessage(err));
    }
  };

  // Enter gönderir, Shift+Enter yeni satır ekler.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage({ id: groupId, messageId }).unwrap();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <Alert>{getErrorMessage(error)}</Alert>;

  return (
    <section className="card flex flex-col h-[60vh] min-h-[420px]" aria-label="Group chat">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {!messages?.length ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <MessagesSquare size={28} />
            <p className="mt-2 text-sm">No messages yet. Say hi to the group!</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.user?._id === me?.id;
            return (
              <div key={m._id} className={`group flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                <Link to={`/users/${m.user?._id}`} className="shrink-0 mt-0.5">
                  <UserAvatar user={m.user} size="sm" />
                </Link>
                <div className={`min-w-0 max-w-[75%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500">
                    {!mine && <span className="font-semibold text-gray-700">{m.user?.fullName ?? 'Deleted user'} · </span>}
                    {timeAgo(m.createdAt)}
                  </span>
                  <div className={`mt-1 flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>
                    <p
                      className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line break-words ${
                        mine ? 'bg-navy-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      {m.text}
                    </p>
                    {(mine || isOwner) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(m._id)}
                        className="p-1 rounded text-gray-300 opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-coarse:opacity-100 hover:text-rose-500"
                        aria-label="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 sm:p-4">
        <Alert className="mb-2">{sendError}</Alert>
        <div className="flex items-end gap-2">
          <label htmlFor="chat-message" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-message"
            rows={1}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="form-input resize-none max-h-32"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-3.5 shrink-0" aria-label="Send">
            <SendHorizontal size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}

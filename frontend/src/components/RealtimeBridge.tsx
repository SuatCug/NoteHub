import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { baseApi } from '@/services/baseApi';
import { connectSocket, disconnectSocket } from '@/lib/socket';

// Socket olayları sadece "bu veri değişti" sinyalidir; ilgili RTK Query önbelleği geçersiz kılınır ve
// açık bileşenler veriyi REST API'den yeniden çeker (yetki kontrolü tek yerde kalır).
const REALTIME_TAGS = ['Notifications', 'Conversations', 'Unread', 'ActiveUsers', 'GroupMessages'];

export default function RealtimeBridge() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectSocket(token);
    const invalidate = (tags) => dispatch(baseApi.util.invalidateTags(tags));
    let connectedBefore = false;

    // Bağlantı koptuktan sonra geri gelince arada kaçan olaylar için hepsi bir kez yenilenir.
    socket.on('connect', () => {
      if (connectedBefore) invalidate(REALTIME_TAGS);
      connectedBefore = true;
    });
    socket.on('notifications:changed', () => invalidate(['Notifications']));
    socket.on('message:changed', ({ conversationId }) =>
      invalidate([{ type: 'Conversation', id: conversationId }, 'Conversations', 'Unread'])
    );
    socket.on('group:message', ({ groupId }) => invalidate([{ type: 'GroupMessages', id: groupId }]));
    socket.on('presence:changed', () => invalidate(['ActiveUsers']));

    return () => disconnectSocket();
  }, [token, dispatch]);

  return null;
}

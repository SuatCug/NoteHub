import { useSyncExternalStore } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '@/services/baseApi';

// Socket.io sunucusu API ile aynı adreste çalışır (".../api" öneki olmadan).
const SOCKET_URL = new URL(API_URL, window.location.origin).origin;

let socket = null;
const listeners = new Set();
// Açık grup sohbetleri: yeniden bağlanınca odalara tekrar katılmak için (aynı grup birden fazla yerde açık olabilir).
const joinedGroups = new Map();

const emitChange = () => listeners.forEach((listener) => listener());

export const connectSocket = (token) => {
  disconnectSocket();
  socket = io(SOCKET_URL, { auth: { token } });
  socket.on('connect', () => {
    joinedGroups.forEach((_, groupId) => socket.emit('group:join', groupId));
    emitChange();
  });
  socket.on('disconnect', emitChange);
  socket.on('connect_error', emitChange);
  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  emitChange();
};

export const getSocket = () => socket;

export const joinGroupRoom = (groupId) => {
  joinedGroups.set(groupId, (joinedGroups.get(groupId) || 0) + 1);
  if (socket?.connected) socket.emit('group:join', groupId);
};

export const leaveGroupRoom = (groupId) => {
  const count = (joinedGroups.get(groupId) || 1) - 1;
  if (count > 0) return joinedGroups.set(groupId, count);
  joinedGroups.delete(groupId);
  if (socket?.connected) socket.emit('group:leave', groupId);
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSocketConnected = () => useSyncExternalStore(subscribe, () => Boolean(socket?.connected));

// Veriler normalde socket olaylarıyla anında yenilenir; bağlantı yokken (koptu / kurulamadı)
// yedek olarak verilen aralıkla sorgulama (polling) yapılır.
export const useFallbackPolling = (intervalMs) => (useSocketConnected() ? 0 : intervalMs);

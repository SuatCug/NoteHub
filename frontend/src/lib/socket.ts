import { useSyncExternalStore } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '@/services/baseApi';

// Sunucudan gelen olaylar sadece "bir şey değişti" sinyali taşır (bkz. backend/sockets/index.js).
export interface ServerToClientEvents {
  'notifications:changed': () => void;
  'message:changed': (payload: { conversationId: string }) => void;
  'group:message': (payload: { groupId: string }) => void;
  'presence:changed': (payload: { userId: string }) => void;
}

export interface ClientToServerEvents {
  'group:join': (groupId: string, ack?: (res: { ok: boolean }) => void) => void;
  'group:leave': (groupId: string) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Socket.io sunucusu API ile aynı adreste çalışır (".../api" öneki olmadan).
const SOCKET_URL = new URL(API_URL, window.location.origin).origin;

let socket: AppSocket | null = null;
const listeners = new Set<() => void>();
// Açık grup sohbetleri: yeniden bağlanınca odalara tekrar katılmak için (aynı grup birden fazla yerde açık olabilir).
const joinedGroups = new Map<string, number>();

const emitChange = () => listeners.forEach((listener) => listener());

export const connectSocket = (token: string) => {
  disconnectSocket();
  const next: AppSocket = io(SOCKET_URL, { auth: { token } });
  socket = next;
  next.on('connect', () => {
    joinedGroups.forEach((_, groupId) => next.emit('group:join', groupId));
    emitChange();
  });
  next.on('disconnect', emitChange);
  next.on('connect_error', emitChange);
  return next;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  emitChange();
};

export const getSocket = () => socket;

export const joinGroupRoom = (groupId: string) => {
  joinedGroups.set(groupId, (joinedGroups.get(groupId) || 0) + 1);
  if (socket?.connected) socket.emit('group:join', groupId);
};

export const leaveGroupRoom = (groupId: string) => {
  const count = (joinedGroups.get(groupId) || 1) - 1;
  if (count > 0) {
    joinedGroups.set(groupId, count);
    return;
  }
  joinedGroups.delete(groupId);
  if (socket?.connected) socket.emit('group:leave', groupId);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSocketConnected = () => useSyncExternalStore(subscribe, () => Boolean(socket?.connected));

// Veriler normalde socket olaylarıyla anında yenilenir; bağlantı yokken (koptu / kurulamadı)
// yedek olarak verilen aralıkla sorgulama (polling) yapılır.
export const useFallbackPolling = (intervalMs: number) => (useSocketConnected() ? 0 : intervalMs);

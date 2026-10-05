// Socket.io örneğine controller'lardan erişmek için ince bir katman.
// Socket sunucusu başlatılmamışsa (örn. betikler, testler) emit çağrıları sessizce atlanır.
let io = null;

// Çevrimiçi kullanıcılar: userId -> açık bağlantı (sekme/cihaz) sayısı. Tek sunucu örneği için bellekte tutulur.
const connections = new Map();

const setIo = (instance) => {
  io = instance;
};

const userRoom = (userId) => `user:${userId}`;
const groupRoom = (groupId) => `group:${groupId}`;

// Bir ya da birden fazla kullanıcının tüm açık bağlantılarına olay gönderir.
const emitToUsers = (userIds, event, payload = {}) => {
  if (!io) return;
  const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map(String);
  if (ids.length) io.to(ids.map(userRoom)).emit(event, payload);
};

const emitToGroup = (groupId, event, payload = {}) => {
  if (!io || !groupId) return;
  io.to(groupRoom(String(groupId))).emit(event, payload);
};

// Bağlantı eklendiğinde kullanıcı ilk kez çevrimiçi olduysa true döner.
const addConnection = (userId) => {
  const count = (connections.get(userId) || 0) + 1;
  connections.set(userId, count);
  return count === 1;
};

// Bağlantı kapandığında kullanıcının son bağlantısıysa true döner (artık çevrimdışı).
const removeConnection = (userId) => {
  const count = (connections.get(userId) || 1) - 1;
  if (count <= 0) {
    connections.delete(userId);
    return true;
  }
  connections.set(userId, count);
  return false;
};

const getOnlineUserIds = () => [...connections.keys()];

module.exports = {
  setIo,
  userRoom,
  groupRoom,
  emitToUsers,
  emitToGroup,
  addConnection,
  removeConnection,
  getOnlineUserIds,
};

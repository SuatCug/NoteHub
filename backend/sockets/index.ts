const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt.util');
const { User, Group } = require('../models');
const realtime = require('../services/realtime.service');

// Kullanıcıyı takip edenlere "çevrimiçi durumu değişti" bildirimi: istemciler "Active now" listesini yeniler
// (listede kimin görüneceğine — karşılıklı takip — sunucu karar verir).
const broadcastPresence = async (userId) => {
  const user = await User.findById(userId).select('followers').lean();
  if (user?.followers?.length) realtime.emitToUsers(user.followers, 'presence:changed', { userId });
};

const touchActivity = (userId) =>
  User.updateOne({ _id: userId }, { $set: { lastActiveAt: new Date() } }).catch(() => {});

// Socket.io sunucusunu HTTP sunucusuna bağlar.
// Olaylar sadece "bir şey değişti" sinyali taşır; istemci ilgili veriyi REST API'den yeniden çeker.
// Böylece yetki kontrolleri tek yerde (REST) kalır.
const initSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins?.length ? allowedOrigins : '*' },
  });

  // El sıkışmada JWT doğrulaması: token yoksa ya da geçersizse bağlantı reddedilir.
  io.use(async (socket, next) => {
    try {
      const { id } = verifyToken(socket.handshake.auth?.token);
      const user = await User.findById(id).select('isVerified');
      if (!user) return next(new Error('unauthorized'));
      // E-postasını doğrulamamış oturumlar anlık sisteme bağlanamaz (doğrulama şartı açıksa).
      if (!user.hasVerifiedAccess()) return next(new Error('email_not_verified'));
      socket.data.userId = String(id);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data;
    socket.join(realtime.userRoom(userId));
    touchActivity(userId);
    if (realtime.addConnection(userId)) broadcastPresence(userId).catch(() => {});

    // Grup sohbeti odası: sadece grup üyeleri katılabilir.
    socket.on('group:join', async (groupId, ack) => {
      try {
        const isMember = await Group.exists({ _id: groupId, members: userId });
        if (isMember) socket.join(realtime.groupRoom(String(groupId)));
        ack?.({ ok: Boolean(isMember) });
      } catch {
        ack?.({ ok: false });
      }
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(realtime.groupRoom(String(groupId)));
    });

    socket.on('disconnect', () => {
      touchActivity(userId);
      if (realtime.removeConnection(userId)) broadcastPresence(userId).catch(() => {});
    });
  });

  realtime.setIo(io);
  return io;
};

module.exports = initSocket;

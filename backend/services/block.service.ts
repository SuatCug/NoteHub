const { User } = require('../models');

// İki kullanıcıdan biri diğerini engellediyse true (mesajlaşma ve takip bu durumda kapalıdır).
const isBlockedBetween = async (a, b) =>
  Boolean(
    await User.exists({
      $or: [
        { _id: a, blockedUsers: b },
        { _id: b, blockedUsers: a },
      ],
    })
  );

module.exports = { isBlockedBetween };

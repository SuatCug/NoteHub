import type { Types } from 'mongoose';
import { User } from '../models/index.ts';

// İki kullanıcıdan biri diğerini engellediyse true (mesajlaşma ve takip bu durumda kapalıdır).
const isBlockedBetween = async (a: Types.ObjectId | string, b: Types.ObjectId | string) =>
  Boolean(
    await User.exists({
      $or: [
        { _id: a, blockedUsers: b },
        { _id: b, blockedUsers: a },
      ],
    })
  );

export { isBlockedBetween };

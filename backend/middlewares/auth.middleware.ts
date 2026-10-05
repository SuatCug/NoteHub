import type { Request } from 'express';
import type { Types } from 'mongoose';
import ApiError from '../utils/apiError.ts';
import asyncHandler from '../utils/asyncHandler.ts';
import { verifyToken } from '../utils/jwt.util.ts';
import { User } from '../models/index.ts';

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

// Kullanıcının son aktiflik zamanını tazeler. Her istekte yazmamak için en fazla dakikada bir güncellenir;
// sonucu beklenmez (isteği yavaşlatmasın, hata verirse de akış bozulmasın).
const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;
const touchActivity = (user: { _id: Types.ObjectId; lastActiveAt?: Date | null }) => {
  const now = Date.now();
  if (user.lastActiveAt && now - user.lastActiveAt.getTime() < ACTIVITY_WRITE_INTERVAL_MS) return;
  User.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date(now) } }).catch(() => {});
};

// İstek başlığındaki JWT'yi doğrular ve req.user'ı doldurur.
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    throw new ApiError(401, 'Authorization header is missing. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired session. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('isVerified lastActiveAt');
  if (!user) {
    throw new ApiError(401, 'User not found.');
  }

  req.user = { id: user._id.toString(), isVerified: user.hasVerifiedAccess() };
  touchActivity(user);
  next();
});

// Anonim ziyaretçilere açık endpoint'lerde kullanılır: token varsa ve geçerliyse req.user'ı doldurur,
// yoksa isteği hata vermeden devam ettirir (örn. "bu notu beğendim mi?" bilgisini hesaplamak için).
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    // Geçersiz token anonim ziyaretçi gibi değerlendirilir.
    return next();
  }

  const user = await User.findById(decoded.id).select('isVerified lastActiveAt');
  if (user) {
    req.user = { id: user._id.toString(), isVerified: user.hasVerifiedAccess() };
    touchActivity(user);
  }
  next();
});

// E-postasını doğrulamamış oturumların içerik endpoint'lerine erişimini tamamen kapatır (doğrulama şartı açıksa).
// Token yoksa ya da geçersizse dokunmaz; ilgili route kendi kuralını (ziyaretçi / giriş gerekli) uygular.
// Doğrulama ekranının ihtiyacı olan /auth endpoint'leri bu kontrolün dışındadır (bkz. routes/index.js).
const blockUnverified = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    return next();
  }

  const user = await User.findById(decoded.id).select('isVerified');
  if (user && !user.hasVerifiedAccess()) {
    throw new ApiError(403, 'Please verify your email address to continue.');
  }
  next();
});

export default authenticate;
export { optionalAuth };
export { blockUnverified };

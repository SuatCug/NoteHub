const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt.util');
const { User } = require('../models');

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

// İstek başlığındaki JWT'yi doğrular ve req.user'ı doldurur.
const authenticate = asyncHandler(async (req, res, next) => {
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

  const user = await User.findById(decoded.id).select('isVerified');
  if (!user) {
    throw new ApiError(401, 'User not found.');
  }

  req.user = { id: user._id.toString(), isVerified: user.hasVerifiedAccess() };
  next();
});

// Anonim ziyaretçilere açık endpoint'lerde kullanılır: token varsa ve geçerliyse req.user'ı doldurur,
// yoksa isteği hata vermeden devam ettirir (örn. "bu notu beğendim mi?" bilgisini hesaplamak için).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    // Geçersiz token anonim ziyaretçi gibi değerlendirilir.
    return next();
  }

  const user = await User.findById(decoded.id).select('isVerified');
  if (user) req.user = { id: user._id.toString(), isVerified: user.hasVerifiedAccess() };
  next();
});

module.exports = authenticate;
module.exports.optionalAuth = optionalAuth;

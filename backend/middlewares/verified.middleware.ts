import type { RequestHandler } from 'express';
import ApiError from '../utils/apiError.ts';

// Sadece .edu.tr e-postasını doğrulamış kullanıcılara izin verir. authenticate'ten sonra kullanılmalıdır.
const requireVerified: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  if (!req.user.isVerified) {
    return next(new ApiError(403, 'You need to verify your email address to do this.'));
  }
  next();
};

export default requireVerified;

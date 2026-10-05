import type { AuthUser } from '../utils/asyncHandler.ts';

// auth.middleware.ts (authenticate / optionalAuth) giriş yapan kullanıcıyı req.user'a yazar.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

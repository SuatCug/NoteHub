import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface AuthUser {
  id: string;
  isVerified: boolean;
}

// Route parametreleri (:id, :userId ...) her zaman tek bir string'dir (joker * parametresi kullanılmıyor).
export type AppRequest = Request<Record<string, string>>;

// authenticate middleware'inden sonra çalışan handler'larda req.user her zaman doludur.
export type AuthedRequest = AppRequest & { user: AuthUser };

type AsyncRoute<R extends AppRequest> = (req: R, res: Response, next: NextFunction) => Promise<unknown>;

// Controller'lardaki async fonksiyonlarda try/catch tekrarını önler.
// Giriş gerektiren route'larda asyncHandler<AuthedRequest>(...) kullanılır.
const asyncHandler =
  <R extends AppRequest = AppRequest>(fn: AsyncRoute<R>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as unknown as R, res, next)).catch(next);
  };

export default asyncHandler;

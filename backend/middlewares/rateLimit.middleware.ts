import type { RequestHandler } from 'express';
import ApiError from '../utils/apiError.ts';

// Basit, bellek içi istek sınırlayıcı (kullanıcı başına kayan pencere). authenticate'ten sonra kullanılmalıdır.
// Tek sunucu süreci için yeterli; birden fazla süreç/serverless ortamda Redis tabanlı bir sınırlayıcıya geçilmeli.
const rateLimit = ({ windowMs, max, message }: { windowMs: number; max: number; message: string }): RequestHandler => {
  const hits = new Map<string, number[]>();

  return (req, _res, next) => {
    const key = req.user?.id || req.ip || '';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) return next(new ApiError(429, message));

    recent.push(now);
    hits.set(key, recent);

    // Bellek büyümesin diye ara sıra süresi dolmuş kayıtlar temizlenir.
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (!times.some((t) => now - t < windowMs)) hits.delete(k);
      }
    }
    next();
  };
};

export default rateLimit;

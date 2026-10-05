const ApiError = require('../utils/apiError');

// Basit, bellek içi istek sınırlayıcı (kullanıcı başına kayan pencere). authenticate'ten sonra kullanılmalıdır.
// Tek sunucu süreci için yeterli; birden fazla süreç/serverless ortamda Redis tabanlı bir sınırlayıcıya geçilmeli.
const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.user?.id || req.ip;
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

module.exports = rateLimit;

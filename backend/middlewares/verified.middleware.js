const ApiError = require('../utils/apiError');

// Sadece .edu.tr e-postasını doğrulamış kullanıcılara izin verir. authenticate'ten sonra kullanılmalıdır.
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  if (!req.user.isVerified) {
    return next(new ApiError(403, 'You need to verify your email address to do this.'));
  }
  next();
};

module.exports = requireVerified;

// Controller'lardaki async fonksiyonlarda try/catch tekrarını önler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

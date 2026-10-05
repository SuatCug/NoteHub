const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

// express-validator ile tanımlanan kuralları kontrol eder, hata varsa 422 döner.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(422, 'Validation error.', formatted));
  }
  next();
};

module.exports = validate;

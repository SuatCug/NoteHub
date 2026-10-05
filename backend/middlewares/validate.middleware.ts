import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.ts';

// express-validator ile tanımlanan kuralları kontrol eder, hata varsa 422 döner.
const validate: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : undefined,
      message: String(err.msg),
    }));
    return next(new ApiError(422, 'Validation error.', formatted));
  }
  next();
};

export default validate;

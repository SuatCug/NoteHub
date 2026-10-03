const multer = require('multer');
const ApiError = require('../utils/apiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.originalUrl}`));
};

// Merkezi hata yönetimi middleware'i.
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = 'A server error occurred.';

  // Mongoose özel hataları
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = 'This record already exists (duplicate value).';
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid record id.';
  }

  // Multer (dosya yükleme) hataları
  if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'The file exceeds the maximum allowed size.' : 'File upload error.';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err instanceof ApiError ? err.errors : [],
  });
};

module.exports = { notFound, errorHandler };

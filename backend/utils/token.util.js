const crypto = require('crypto');

// E-posta doğrulama token'ı: kullanıcıya düz hali gönderilir, veritabanında sadece hash'i tutulur.
const createVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token) };
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { createVerificationToken, hashToken };

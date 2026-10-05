// Özellik anahtarları (.env). Proje şimdilik bireysel kullanımda olduğu için ikisi de varsayılan olarak kapalı;
// yayına alırken .env'de "true" yapmak yeterli.
const flag = (name) => String(process.env[name] || '').toLowerCase() === 'true';

module.exports = {
  // Sadece .edu.tr uzantılı e-postalarla kayıt.
  requireEduEmail: () => flag('REQUIRE_EDU_EMAIL'),
  // Yükleme / indirme / beğeni / yorum / takip için e-posta doğrulaması şartı.
  requireEmailVerification: () => flag('REQUIRE_EMAIL_VERIFICATION'),
};

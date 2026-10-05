// Özellik anahtarları (.env). Proje şimdilik bireysel kullanımda olduğu için ikisi de varsayılan olarak kapalı;
// yayına alırken .env'de "true" yapmak yeterli.
const flag = (name: string) => String(process.env[name] || '').toLowerCase() === 'true';

// Sadece .edu.tr uzantılı e-postalarla kayıt.
export const requireEduEmail = () => flag('REQUIRE_EDU_EMAIL');
// Yükleme / indirme / beğeni / yorum / takip için e-posta doğrulaması şartı.
export const requireEmailVerification = () => flag('REQUIRE_EMAIL_VERIFICATION');

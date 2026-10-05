// Betikler (seed, migrate) için .env yükleyici. ESM'de import'lar kod çalışmadan önce değerlendirildiği için
// .env, process.env'i import anında okuyan modüllerden (storage, mail, upload) önce bu dosyayla yüklenmelidir.
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

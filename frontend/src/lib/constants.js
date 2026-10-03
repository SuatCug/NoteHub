import { FileText, FileType2, Image, FileArchive } from 'lucide-react';

// Backend'deki Note.fileType değerleri ve kartlarda kullanılan görünümleri.
export const FILE_TYPES = {
  pdf: { label: 'PDF', icon: FileText, badge: 'bg-rose-50 text-rose-600 border-rose-100' },
  docx: { label: 'Word', icon: FileType2, badge: 'bg-blue-50 text-blue-600 border-blue-100' },
  image: { label: 'Image', icon: Image, badge: 'bg-amber-50 text-amber-600 border-amber-100' },
  archive: { label: 'Archive', icon: FileArchive, badge: 'bg-violet-50 text-violet-600 border-violet-100' },
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most liked' },
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'oldest', label: 'Oldest' },
];

// Yükleme formundaki <input accept> ve istemci tarafı ön kontrol için.
export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.zip', '.rar'];
export const MAX_FILE_SIZE_MB = 25;

// Footer'daki topluluk bağlantıları. Adresi boş olanlar "Coming soon" olarak soluk gösterilir.
export const SOCIAL_LINKS = {
  discord: '', // örn. https://discord.gg/xxxx
  telegram: '', // örn. https://t.me/xxxx
  instagram: '', // örn. https://instagram.com/xxxx
  contactEmail: '', // örn. iletisim@notehub.app
};

export const EDU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.tr$/;

// Backend'deki REQUIRE_EDU_EMAIL ile aynı tutulmalı (frontend/.env: VITE_REQUIRE_EDU_EMAIL=true).
export const REQUIRE_EDU_EMAIL = import.meta.env.VITE_REQUIRE_EDU_EMAIL === 'true';
export const EMAIL_PLACEHOLDER = REQUIRE_EDU_EMAIL ? 'ad.soyad@universite.edu.tr' : 'ornek@eposta.com';

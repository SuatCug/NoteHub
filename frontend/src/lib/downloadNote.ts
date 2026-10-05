import { API_URL } from '@/services/baseApi';

type FileKind = 'preview' | 'download';

// Önizleme ve indirme endpoint'leri Authorization başlığı istediği için düz <a href> / <iframe src>
// kullanılamaz: dosya fetch ile blob olarak alınır.
const fetchNoteFile = async (noteId: string, token: string | null, kind: FileKind) => {
  const res = await fetch(`${API_URL}/notes/${noteId}/${kind}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let message = kind === 'preview' ? 'Could not load the preview.' : 'Could not download the file.';
    try {
      message = ((await res.json()) as { message?: string }).message || message;
    } catch {
      // JSON olmayan hata gövdesi
    }
    throw new Error(message);
  }
  return res;
};

// Sayfa içi önizleme için blob döndürür (indirme sayacını artırmaz).
export const fetchNotePreview = async (noteId: string, token: string | null) =>
  (await fetchNoteFile(noteId, token, 'preview')).blob();

export const downloadNote = async (noteId: string, token: string | null, fallbackName = 'not') => {
  const res = await fetchNoteFile(noteId, token, 'download');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = parseFileName(res.headers.get('Content-Disposition')) || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// Content-Disposition: attachment; filename="notlar.pdf"; filename*=UTF-8''notlar.pdf
const parseFileName = (header: string | null) => {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8) return decodeURIComponent(utf8[1]);
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
};

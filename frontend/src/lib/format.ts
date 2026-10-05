export const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

type DateInput = string | number | Date;

// "3 gün önce", "dün" gibi göreli tarih.
export const timeAgo = (date: DateInput) => {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
};

export const formatDate = (date: DateInput) =>
  new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatCount = (n = 0) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

// "1 like" / "12 likes" gibi sayıya göre tekil-çoğul metin.
export const pluralize = (n = 0, word: string) => `${formatCount(n)} ${word}${n === 1 ? '' : 's'}`;

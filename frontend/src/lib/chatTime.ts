// Mesajlaşma ekranlarına özel kısa tarih/saat biçimleri.

type DateInput = string | number | Date;

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// Bugünden kaç gün önce (0 = bugün, 1 = dün).
const daysAgo = (date: Date) => Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);

// "23:05"
export const clockTime = (date: DateInput) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// Konuşma listesi: "now", "33 min", "5 h", "Yesterday", "Mon", "Oct 3", "Oct 3, 2025".
export const listTime = (input: DateInput) => {
  const date = new Date(input);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes} min`;
  const days = daysAgo(date);
  if (days === 0) return `${Math.floor(minutes / 60)} h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  });
};

// Sohbetteki gün ayırıcı: "Today", "Yesterday", "Monday", "October 3", "October 3, 2025".
export const dayLabel = (input: DateInput) => {
  const date = new Date(input);
  const days = daysAgo(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  });
};

export const isSameDay = (a: DateInput, b: DateInput) => startOfDay(new Date(a)) === startOfDay(new Date(b));

// Sohbet başlığındaki son görülme: "Active 5 min ago", "Active yesterday".
export const lastSeenLabel = (input: DateInput) => {
  const date = new Date(input);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Active just now';
  if (minutes < 60) return `Active ${minutes} min ago`;
  const days = daysAgo(date);
  if (days === 0) return `Active ${Math.floor(minutes / 60)} h ago`;
  if (days === 1) return 'Active yesterday';
  if (days < 7) return `Active ${days} days ago`;
  return `Active ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

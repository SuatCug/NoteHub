import type { ApiErrorBody } from '@/types/api';

// RTK Query (veya fetch) hatası: { status, data? } şeklinde gelir; catch bloklarından unknown olarak alınır.
type ErrorLike = { status?: number | string; data?: ApiErrorBody } | null | undefined;

export const isNotFound = (error: unknown) => (error as ErrorLike)?.status === 404;

// RTK Query hatasından kullanıcıya gösterilecek mesajı çıkarır. Alan bazlı doğrulama hataları varsa ilkini gösterir.
export const getErrorMessage = (error: unknown) => {
  const err = error as ErrorLike;
  if (err?.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your internet connection.';
  const fieldError = err?.data?.errors?.[0]?.message;
  return fieldError || err?.data?.message || 'Something went wrong. Please try again.';
};

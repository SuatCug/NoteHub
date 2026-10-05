// RTK Query hatasından kullanıcıya gösterilecek mesajı çıkarır. Alan bazlı doğrulama hataları varsa ilkini gösterir.
export const getErrorMessage = (error) => {
  if (error?.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your internet connection.';
  const fieldError = error?.data?.errors?.[0]?.message;
  return fieldError || error?.data?.message || 'Something went wrong. Please try again.';
};

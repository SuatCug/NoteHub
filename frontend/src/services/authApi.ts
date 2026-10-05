import { baseApi } from './baseApi';
import { setUser } from '@/app/authSlice';

// Sunucudan dönen güncel kullanıcıyı auth state'e yazar (navbar, doğrulama uyarısı vb. için).
const syncUser = async (arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    if (data?.data?.user) dispatch(setUser(data.data.user));
  } catch {
    // Hata bileşen tarafında gösterilir.
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation({
      query: (payload) => ({ url: '/auth/register', method: 'POST', body: payload }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Me'],
      onQueryStarted: syncUser,
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({ url: '/auth/verify-email', method: 'POST', body: { token } }),
      invalidatesTags: ['Me'],
    }),
    resendVerification: builder.mutation({
      query: () => ({ url: '/auth/resend-verification', method: 'POST' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;

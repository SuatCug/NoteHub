import type { Dispatch } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import { setUser } from '@/app/authSlice';
import type { ApiResponse, AuthUser } from '@/types/api';

type UserResponse = ApiResponse<{ user: AuthUser }>;
type AuthResponse = ApiResponse<{ user: AuthUser; token: string }>;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
  university: string;
  department: string;
}

// Sunucudan dönen güncel kullanıcıyı auth state'e yazar (navbar, doğrulama uyarısı vb. için). usersApi de kullanır.
export const syncUser = async (
  _arg: unknown,
  { dispatch, queryFulfilled }: { dispatch: Dispatch; queryFulfilled: Promise<{ data: UserResponse }> },
) => {
  try {
    const { data } = await queryFulfilled;
    if (data?.data?.user) dispatch(setUser(data.data.user));
  } catch {
    // Hata bileşen tarafında gösterilir.
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (payload) => ({ url: '/auth/register', method: 'POST', body: payload }),
    }),
    getMe: builder.query<UserResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
      onQueryStarted: syncUser,
    }),
    verifyEmail: builder.mutation<UserResponse, string>({
      query: (token) => ({ url: '/auth/verify-email', method: 'POST', body: { token } }),
      invalidatesTags: ['Me'],
    }),
    resendVerification: builder.mutation<ApiResponse, void>({
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

import { baseApi } from './baseApi';
import { syncUser } from './authApi';
import type {
  ApiResponse,
  AuthUser,
  NoteCard,
  Paginated,
  Pagination,
  ProfileData,
  ProfileInput,
  UserCard,
} from '@/types/api';

type UsersResponse = ApiResponse<{ users: UserCard[] }>;
type UserResponse = ApiResponse<{ user: AuthUser }>;

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<
      ApiResponse<{ users: UserCard[]; pagination: Pagination }>,
      { q: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: '/users/search', params }),
      providesTags: ['User'],
    }),
    getActiveUsers: builder.query<ApiResponse<{ users: UserCard[]; total: number }>, void>({
      query: () => '/users/active',
      providesTags: ['User', 'ActiveUsers'],
    }),
    getSuggestions: builder.query<UsersResponse, void>({
      query: () => '/users/suggestions',
      providesTags: ['User'],
    }),
    getProfile: builder.query<ApiResponse<ProfileData>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }, 'User'],
    }),
    getUserNotes: builder.query<
      ApiResponse<Paginated<NoteCard>>,
      { id: string; page?: number; sort?: string; limit?: number; q?: string }
    >({
      // params: page, sort, limit, q (tanımsız olanlar query string'e eklenmez)
      query: ({ id, ...params }) => ({ url: `/users/${id}/notes`, params }),
      providesTags: ['NoteList'],
    }),
    getFollowers: builder.query<UsersResponse, string>({
      query: (id) => `/users/${id}/followers`,
      providesTags: ['FollowList'],
    }),
    getFollowing: builder.query<UsersResponse, string>({
      query: (id) => `/users/${id}/following`,
      providesTags: ['FollowList'],
    }),
    toggleFollow: builder.mutation<
      ApiResponse<{ isFollowing: boolean; followersCount: number }>,
      { id: string; following: boolean }
    >({
      query: ({ id, following }) => ({ url: `/users/${id}/follow`, method: following ? 'DELETE' : 'POST' }),
      invalidatesTags: ['User', 'FollowList', 'NoteList'],
    }),
    // blocked: şu anki durum (true ise engel kaldırılır).
    toggleBlock: builder.mutation<ApiResponse<{ isBlocked: boolean }>, { id: string; blocked: boolean }>({
      query: ({ id, blocked }) => ({ url: `/users/${id}/block`, method: blocked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['User', 'FollowList', 'Conversation', 'Conversations'],
    }),
    updateProfile: builder.mutation<UserResponse, ProfileInput>({
      query: (payload) => ({ url: '/users/me', method: 'PATCH', body: payload }),
      invalidatesTags: ['User', 'NoteList', 'FollowList'],
      onQueryStarted: syncUser,
    }),
    updateAvatar: builder.mutation<UserResponse, FormData>({
      // body: FormData (dosya alanı "avatar")
      query: (formData) => ({ url: '/users/me/avatar', method: 'PUT', body: formData }),
      invalidatesTags: ['User', 'NoteList', 'FollowList'],
      onQueryStarted: syncUser,
    }),
    changePassword: builder.mutation<ApiResponse, { currentPassword: string; newPassword: string }>({
      query: (payload) => ({ url: '/users/me/password', method: 'PATCH', body: payload }),
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useGetActiveUsersQuery,
  useGetSuggestionsQuery,
  useGetProfileQuery,
  useGetUserNotesQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useToggleFollowMutation,
  useToggleBlockMutation,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
} = usersApi;

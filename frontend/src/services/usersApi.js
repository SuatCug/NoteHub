import { baseApi } from './baseApi';
import { setUser } from '@/app/authSlice';

const syncUser = async (arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    if (data?.data?.user) dispatch(setUser(data.data.user));
  } catch {
    // Hata bileşen tarafında gösterilir.
  }
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query({
      // params: q, page, limit
      query: (params) => ({ url: '/users/search', params }),
      providesTags: ['User'],
    }),
    getProfile: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    getUserNotes: builder.query({
      // params: page, sort, limit, q (tanımsız olanlar query string'e eklenmez)
      query: ({ id, ...params }) => ({ url: `/users/${id}/notes`, params }),
      providesTags: ['NoteList'],
    }),
    getFollowers: builder.query({
      query: (id) => `/users/${id}/followers`,
      providesTags: ['FollowList'],
    }),
    getFollowing: builder.query({
      query: (id) => `/users/${id}/following`,
      providesTags: ['FollowList'],
    }),
    toggleFollow: builder.mutation({
      query: ({ id, following }) => ({ url: `/users/${id}/follow`, method: following ? 'DELETE' : 'POST' }),
      invalidatesTags: ['User', 'FollowList', 'NoteList'],
    }),
    // blocked: şu anki durum (true ise engel kaldırılır).
    toggleBlock: builder.mutation({
      query: ({ id, blocked }) => ({ url: `/users/${id}/block`, method: blocked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['User', 'FollowList', 'Conversation', 'Conversations'],
    }),
    updateProfile: builder.mutation({
      query: (payload) => ({ url: '/users/me', method: 'PATCH', body: payload }),
      invalidatesTags: ['User', 'NoteList', 'FollowList'],
      onQueryStarted: syncUser,
    }),
    updateAvatar: builder.mutation({
      // body: FormData (dosya alanı "avatar")
      query: (formData) => ({ url: '/users/me/avatar', method: 'PUT', body: formData }),
      invalidatesTags: ['User', 'NoteList', 'FollowList'],
      onQueryStarted: syncUser,
    }),
    changePassword: builder.mutation({
      query: (payload) => ({ url: '/users/me/password', method: 'PATCH', body: payload }),
    }),
  }),
});

export const {
  useSearchUsersQuery,
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

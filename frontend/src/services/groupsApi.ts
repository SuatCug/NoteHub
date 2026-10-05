import { baseApi } from './baseApi';

// Boş parametreleri query string'e eklememek için temizler.
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: (params) => ({ url: '/groups', params: cleanParams(params) }),
      providesTags: ['GroupList'],
    }),
    getMyGroups: builder.query({
      query: (params) => ({ url: '/groups/mine', params: cleanParams(params) }),
      providesTags: ['GroupList'],
    }),
    getGroup: builder.query({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),
    getGroupMembers: builder.query({
      query: (id) => `/groups/${id}/members`,
      providesTags: (result, error, id) => [{ type: 'GroupMembers', id }],
    }),
    getGroupNotes: builder.query({
      query: ({ id, page, sort }) => ({ url: `/groups/${id}/notes`, params: cleanParams({ page, sort }) }),
      providesTags: ['NoteList'],
    }),
    createGroup: builder.mutation({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['GroupList'],
    }),
    updateGroup: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/groups/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }, 'GroupList'],
    }),
    deleteGroup: builder.mutation({
      query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
      invalidatesTags: ['GroupList', 'NoteList', 'Note'],
    }),
    // leave=true: gruptan ayrılır ya da bekleyen katılma isteğini geri çeker.
    toggleMembership: builder.mutation({
      query: ({ id, leave }) => ({ url: `/groups/${id}/join`, method: leave ? 'DELETE' : 'POST' }),
      // Özel grup notlarının görünürlüğü üyeliğe bağlı olduğu için not listeleri de yenilenir.
      invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList', 'NoteList'],
    }),
    getJoinRequests: builder.query({
      query: (id) => `/groups/${id}/requests`,
      providesTags: (result, error, id) => [{ type: 'GroupRequests', id }],
    }),
    respondJoinRequest: builder.mutation({
      query: ({ id, userId, approve }) => ({ url: `/groups/${id}/requests/${userId}`, method: approve ? 'POST' : 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Group', id },
        { type: 'GroupMembers', id },
        { type: 'GroupRequests', id },
        'GroupList',
      ],
    }),
    getGroupMessages: builder.query({
      query: (id) => `/groups/${id}/messages`,
      providesTags: (result, error, id) => [{ type: 'GroupMessages', id }],
    }),
    sendGroupMessage: builder.mutation({
      query: ({ id, text }) => ({ url: `/groups/${id}/messages`, method: 'POST', body: { text } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'GroupMessages', id }],
    }),
    deleteGroupMessage: builder.mutation({
      query: ({ id, messageId }) => ({ url: `/groups/${id}/messages/${messageId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'GroupMessages', id }],
    }),
    removeGroupMember: builder.mutation({
      query: ({ id, userId }) => ({ url: `/groups/${id}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList'],
    }),
    transferGroupOwnership: builder.mutation({
      query: ({ id, userId }) => ({ url: `/groups/${id}/owner/${userId}`, method: 'POST' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList'],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetMyGroupsQuery,
  useGetGroupQuery,
  useGetGroupMembersQuery,
  useGetGroupNotesQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useToggleMembershipMutation,
  useGetJoinRequestsQuery,
  useRespondJoinRequestMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
  useDeleteGroupMessageMutation,
  useRemoveGroupMemberMutation,
  useTransferGroupOwnershipMutation,
} = groupsApi;

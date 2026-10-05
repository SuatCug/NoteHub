import { baseApi, cleanParams } from './baseApi';
import type {
  ApiResponse,
  GroupCard,
  GroupDetail,
  GroupInput,
  GroupMessage,
  NoteCard,
  Paginated,
  UserCard,
} from '@/types/api';

type GroupResponse = ApiResponse<{ group: GroupDetail }>;
type GroupListResponse = ApiResponse<Paginated<GroupCard>>;
type MembershipResponse = ApiResponse<{ isMember: boolean; isPending: boolean; membersCount: number }>;
type UsersResponse = ApiResponse<{ users: UserCard[] }>;

export interface GroupListParams {
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const groupsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<GroupListResponse, GroupListParams>({
      query: (params) => ({ url: '/groups', params: cleanParams(params) }),
      providesTags: ['GroupList'],
    }),
    getMyGroups: builder.query<GroupListResponse, GroupListParams>({
      query: (params) => ({ url: '/groups/mine', params: cleanParams(params) }),
      providesTags: ['GroupList'],
    }),
    getGroup: builder.query<GroupResponse, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Group', id }],
    }),
    getGroupMembers: builder.query<UsersResponse, string>({
      query: (id) => `/groups/${id}/members`,
      providesTags: (_result, _error, id) => [{ type: 'GroupMembers', id }],
    }),
    getGroupNotes: builder.query<ApiResponse<Paginated<NoteCard>>, { id: string; page?: number; sort?: string }>({
      query: ({ id, page, sort }) => ({ url: `/groups/${id}/notes`, params: cleanParams({ page, sort }) }),
      providesTags: ['NoteList'],
    }),
    createGroup: builder.mutation<GroupResponse, GroupInput>({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['GroupList'],
    }),
    updateGroup: builder.mutation<GroupResponse, Partial<GroupInput> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/groups/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Group', id }, 'GroupList'],
    }),
    deleteGroup: builder.mutation<ApiResponse, string>({
      query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
      invalidatesTags: ['GroupList', 'NoteList', 'Note'],
    }),
    // leave=true: gruptan ayrılır ya da bekleyen katılma isteğini geri çeker.
    toggleMembership: builder.mutation<MembershipResponse, { id: string; leave: boolean }>({
      query: ({ id, leave }) => ({ url: `/groups/${id}/join`, method: leave ? 'DELETE' : 'POST' }),
      // Özel grup notlarının görünürlüğü üyeliğe bağlı olduğu için not listeleri de yenilenir.
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList', 'NoteList'],
    }),
    getJoinRequests: builder.query<UsersResponse, string>({
      query: (id) => `/groups/${id}/requests`,
      providesTags: (_result, _error, id) => [{ type: 'GroupRequests', id }],
    }),
    respondJoinRequest: builder.mutation<ApiResponse<{ membersCount: number } | undefined>, { id: string; userId: string; approve: boolean }>({
      query: ({ id, userId, approve }) => ({ url: `/groups/${id}/requests/${userId}`, method: approve ? 'POST' : 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Group', id },
        { type: 'GroupMembers', id },
        { type: 'GroupRequests', id },
        'GroupList',
      ],
    }),
    getGroupMessages: builder.query<ApiResponse<{ messages: GroupMessage[] }>, string>({
      query: (id) => `/groups/${id}/messages`,
      providesTags: (_result, _error, id) => [{ type: 'GroupMessages', id }],
    }),
    sendGroupMessage: builder.mutation<ApiResponse<{ message: GroupMessage }>, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/groups/${id}/messages`, method: 'POST', body: { text } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'GroupMessages', id }],
    }),
    deleteGroupMessage: builder.mutation<ApiResponse, { id: string; messageId: string }>({
      query: ({ id, messageId }) => ({ url: `/groups/${id}/messages/${messageId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'GroupMessages', id }],
    }),
    removeGroupMember: builder.mutation<ApiResponse<{ membersCount: number }>, { id: string; userId: string }>({
      query: ({ id, userId }) => ({ url: `/groups/${id}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList'],
    }),
    transferGroupOwnership: builder.mutation<GroupResponse, { id: string; userId: string }>({
      query: ({ id, userId }) => ({ url: `/groups/${id}/owner/${userId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Group', id }, { type: 'GroupMembers', id }, 'GroupList'],
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

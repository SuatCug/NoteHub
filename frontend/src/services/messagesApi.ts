import { baseApi } from './baseApi';
import type { ApiResponse, ConversationDetail, ConversationSummary, DirectMessage } from '@/types/api';

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/messages/unread-count',
      providesTags: ['Unread'],
    }),
    getConversations: builder.query<ApiResponse<{ conversations: ConversationSummary[] }>, void>({
      query: () => '/messages/conversations',
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query<ApiResponse<ConversationDetail>, string>({
      query: (id) => `/messages/conversations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Conversation', id }],
      // Sunucu bu açılışta okunmamış mesajları okundu işaretlediyse rozet ve liste yenilenir.
      onQueryStarted: async (_id, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.markedRead) dispatch(baseApi.util.invalidateTags(['Unread', 'Conversations']));
        } catch {
          // Hata bileşen tarafında gösterilir.
        }
      },
    }),
    // Bir kullanıcıyla konuşmayı açar (yoksa oluşturur); cevapta conversationId döner.
    startConversation: builder.mutation<ApiResponse<{ conversationId: string }>, string>({
      query: (userId) => ({ url: '/messages/conversations', method: 'POST', body: { userId } }),
    }),
    sendDirectMessage: builder.mutation<
      ApiResponse<{ message: DirectMessage }>,
      { id: string; text: string; noteId?: string | null }
    >({
      query: ({ id, text, noteId }) => ({
        url: `/messages/conversations/${id}/messages`,
        method: 'POST',
        body: { text, ...(noteId && { noteId }) },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Conversation', id }, 'Conversations'],
    }),
    deleteDirectMessage: builder.mutation<ApiResponse, { id: string; messageId: string }>({
      query: ({ id, messageId }) => ({ url: `/messages/conversations/${id}/messages/${messageId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Conversation', id }, 'Conversations'],
    }),
    // Konuşmayı sadece kendi tarafında siler.
    deleteConversation: builder.mutation<ApiResponse, string>({
      query: (id) => ({ url: `/messages/conversations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Conversations', 'Unread'],
    }),
  }),
});

export const {
  useGetUnreadCountQuery,
  useGetConversationsQuery,
  useGetConversationQuery,
  useStartConversationMutation,
  useSendDirectMessageMutation,
  useDeleteDirectMessageMutation,
  useDeleteConversationMutation,
} = messagesApi;

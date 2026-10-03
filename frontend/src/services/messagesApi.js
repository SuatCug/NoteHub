import { baseApi } from './baseApi';

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadCount: builder.query({
      query: () => '/messages/unread-count',
      providesTags: ['Unread'],
    }),
    getConversations: builder.query({
      query: () => '/messages/conversations',
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query({
      query: (id) => `/messages/conversations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Conversation', id }],
      // Sunucu bu açılışta okunmamış mesajları okundu işaretlediyse rozet ve liste yenilenir.
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.markedRead) dispatch(baseApi.util.invalidateTags(['Unread', 'Conversations']));
        } catch {
          // Hata bileşen tarafında gösterilir.
        }
      },
    }),
    // Bir kullanıcıyla konuşmayı açar (yoksa oluşturur); cevapta conversationId döner.
    startConversation: builder.mutation({
      query: (userId) => ({ url: '/messages/conversations', method: 'POST', body: { userId } }),
    }),
    sendDirectMessage: builder.mutation({
      query: ({ id, text, noteId }) => ({
        url: `/messages/conversations/${id}/messages`,
        method: 'POST',
        body: { text, ...(noteId && { noteId }) },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Conversation', id }, 'Conversations'],
    }),
    deleteDirectMessage: builder.mutation({
      query: ({ id, messageId }) => ({ url: `/messages/conversations/${id}/messages/${messageId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Conversation', id }, 'Conversations'],
    }),
    // Konuşmayı sadece kendi tarafında siler.
    deleteConversation: builder.mutation({
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

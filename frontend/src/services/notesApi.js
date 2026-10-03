import { baseApi } from './baseApi';

// Boş filtreleri query string'e eklememek için temizler.
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: (params) => ({ url: '/notes', params: cleanParams(params) }),
      providesTags: ['NoteList'],
    }),
    getFeed: builder.query({
      query: (params) => ({ url: '/notes/feed', params: cleanParams(params) }),
      providesTags: ['NoteList'],
    }),
    getFilters: builder.query({
      query: (params) => ({ url: '/notes/filters', params: cleanParams(params) }),
      providesTags: ['Filters'],
    }),
    getNote: builder.query({
      query: (id) => `/notes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Note', id }],
    }),
    createNote: builder.mutation({
      // body: FormData (dosya alanı "file")
      query: (formData) => ({ url: '/notes', method: 'POST', body: formData }),
      invalidatesTags: ['NoteList', 'Filters', 'User'],
    }),
    updateNote: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/notes/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }, 'NoteList', 'Filters'],
    }),
    deleteNote: builder.mutation({
      query: (id) => ({ url: `/notes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['NoteList', 'Filters', 'User'],
    }),
    toggleLike: builder.mutation({
      query: ({ id, liked }) => ({ url: `/notes/${id}/like`, method: liked ? 'DELETE' : 'POST' }),
      // Beğeni anında görünsün diye not detayı iyimser (optimistic) güncellenir.
      async onQueryStarted({ id, liked }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notesApi.util.updateQueryData('getNote', id, (draft) => {
            draft.data.note.isLiked = !liked;
            draft.data.note.likesCount += liked ? -1 : 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['NoteList', 'User'],
    }),
    addComment: builder.mutation({
      query: ({ id, text }) => ({ url: `/notes/${id}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }, 'NoteList'],
    }),
    deleteComment: builder.mutation({
      query: ({ id, commentId }) => ({ url: `/notes/${id}/comments/${commentId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }, 'NoteList'],
    }),
    // İndirme sayısı sunucuda arttığı için detay ve listeler yenilenir (dosyanın kendisi lib/downloadNote ile alınır).
    registerDownload: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: (result, error, id) => [{ type: 'Note', id }, 'NoteList', 'User'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetFeedQuery,
  useGetFiltersQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useToggleLikeMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useRegisterDownloadMutation,
} = notesApi;

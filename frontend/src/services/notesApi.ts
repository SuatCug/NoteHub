import { baseApi, cleanParams } from './baseApi';
import type {
  ApiResponse,
  Comment,
  NoteCard,
  NoteDetail,
  NoteFilters,
  NoteInput,
  NoteSearchParams,
  Paginated,
  TrendingCourse,
} from '@/types/api';

type NoteListResponse = ApiResponse<Paginated<NoteCard>>;
type NoteResponse = ApiResponse<{ note: NoteDetail }>;

export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<NoteListResponse, NoteSearchParams>({
      query: (params) => ({ url: '/notes', params: cleanParams(params) }),
      providesTags: ['NoteList'],
    }),
    getFeed: builder.query<NoteListResponse, NoteSearchParams>({
      query: (params) => ({ url: '/notes/feed', params: cleanParams(params) }),
      providesTags: ['NoteList'],
    }),
    getSavedNotes: builder.query<NoteListResponse, NoteSearchParams>({
      query: (params) => ({ url: '/notes/saved', params: cleanParams(params) }),
      providesTags: ['NoteList'],
    }),
    getTrendingCourses: builder.query<ApiResponse<{ courses: TrendingCourse[] }>, void>({
      query: () => '/notes/trending-courses',
      providesTags: ['Filters'],
    }),
    toggleSave: builder.mutation<ApiResponse<{ isSaved: boolean }>, { id: string; saved: boolean }>({
      query: ({ id, saved }) => ({ url: `/notes/${id}/save`, method: saved ? 'DELETE' : 'POST' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Note', id }, 'NoteList'],
    }),
    getFilters: builder.query<ApiResponse<NoteFilters>, { university?: string }>({
      query: (params) => ({ url: '/notes/filters', params: cleanParams(params) }),
      providesTags: ['Filters'],
    }),
    getNote: builder.query<NoteResponse, string>({
      query: (id) => `/notes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Note', id }],
    }),
    createNote: builder.mutation<NoteResponse, FormData>({
      // body: FormData (dosya alanı "file")
      query: (formData) => ({ url: '/notes', method: 'POST', body: formData }),
      invalidatesTags: ['NoteList', 'Filters', 'User'],
    }),
    updateNote: builder.mutation<NoteResponse, Partial<NoteInput> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/notes/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Note', id }, 'NoteList', 'Filters'],
    }),
    deleteNote: builder.mutation<ApiResponse, string>({
      query: (id) => ({ url: `/notes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['NoteList', 'Filters', 'User'],
    }),
    toggleLike: builder.mutation<ApiResponse<{ isLiked: boolean; likesCount: number }>, { id: string; liked: boolean }>({
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
    addComment: builder.mutation<ApiResponse<{ comment: Comment; commentsCount: number }>, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/notes/${id}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Note', id }, 'NoteList'],
    }),
    deleteComment: builder.mutation<ApiResponse<{ commentsCount: number }>, { id: string; commentId: string }>({
      query: ({ id, commentId }) => ({ url: `/notes/${id}/comments/${commentId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Note', id }, 'NoteList'],
    }),
    // İndirme sayısı sunucuda arttığı için detay ve listeler yenilenir (dosyanın kendisi lib/downloadNote ile alınır).
    registerDownload: builder.mutation<null, string>({
      queryFn: () => ({ data: null }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Note', id }, 'NoteList', 'User'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetFeedQuery,
  useGetSavedNotesQuery,
  useGetTrendingCoursesQuery,
  useToggleSaveMutation,
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

import { baseApi } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
    }),
    getNotificationCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationsApi;

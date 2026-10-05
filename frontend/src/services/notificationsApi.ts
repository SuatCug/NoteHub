import { baseApi } from './baseApi';
import type { ApiResponse, AppNotification, Paginated } from '@/types/api';

type CountResponse = ApiResponse<{ count: number }>;

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiResponse<Paginated<AppNotification> & { unreadCount: number }>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/notifications', params: params ?? undefined }),
      providesTags: ['Notifications'],
    }),
    getNotificationCount: builder.query<CountResponse, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<CountResponse, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<ApiResponse, string>({
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

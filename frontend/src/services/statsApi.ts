import { baseApi } from './baseApi';
import type { ApiResponse, SiteStats } from '@/types/api';

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<ApiResponse<SiteStats>, void>({
      query: () => '/stats',
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;

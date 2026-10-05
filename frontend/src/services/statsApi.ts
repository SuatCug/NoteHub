import { baseApi } from './baseApi';

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/stats',
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;

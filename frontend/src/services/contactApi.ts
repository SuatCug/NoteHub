import { baseApi } from './baseApi';

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;

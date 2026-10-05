import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';

export type ContactTopic = 'general' | 'support' | 'copyright' | 'privacy' | 'feedback';

export interface ContactPayload {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<ApiResponse, ContactPayload>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;

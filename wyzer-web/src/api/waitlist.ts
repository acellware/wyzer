import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export interface JoinWaitlistPayload {
 email: string;
}

export function useJoinWaitlist() {
 return useMutation<{ message: string }, Error, JoinWaitlistPayload>({
  mutationKey: ['waitlist', 'join'],
  meta: { silent: true },
  mutationFn: (payload) =>
   apiClient
    .post<{ message: string }>('/waitlist', payload)
    .then((r) => r.data),
 });
}

import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export type BillingPlan = 'PRO' | 'TEAM';

interface CheckoutSession {
 url: string;
}

interface PortalSession {
 url: string;
}

export function useCreateCheckoutSession() {
 return useMutation({
  mutationFn: async (plan: BillingPlan) => {
   const { data } = await apiClient.post<CheckoutSession>('/billing/checkout', {
    plan,
   });
   return data;
  },
  onSuccess: ({ url }) => {
   window.location.href = url;
  },
 });
}

export function useCreateBillingPortalSession() {
 return useMutation({
  mutationFn: async () => {
   const { data } = await apiClient.post<PortalSession>('/billing/portal');
   return data;
  },
  onSuccess: ({ url }) => {
   window.location.href = url;
  },
 });
}

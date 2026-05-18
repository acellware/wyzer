import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { authStore } from '../store/auth';
import type { CompanySize } from './types';

export interface RegisterPayload {
 firstName: string;
 lastName: string;
 email: string;
 password: string;
 jobTitle: string;
 country: string;
 orgName: string;
 companySize: CompanySize;
}

export interface UserDto {
 id: string;
 firstName: string;
 lastName: string;
 email: string;
 emailVerifiedAt: string | null;
 jobTitle: string;
 country: string;
 createdAt: string;
 updatedAt: string;
}

export interface AuthResponse {
 accessToken: string;
 user: UserDto;
}

export function useRegister() {
 return useMutation({
  mutationFn: (payload: RegisterPayload) =>
   apiClient
    .post<{ user: UserDto }>('/auth/register', payload)
    .then((r) => r.data),
 });
}

export function useLogin() {
 return useMutation({
  mutationFn: (payload: { email: string; password: string }) =>
   apiClient.post<AuthResponse>('/auth/login', payload).then((r) => {
    authStore.setToken(r.data.accessToken);
    return r.data;
   }),
 });
}

export function useVerifyEmail() {
 return useMutation({
  mutationFn: (token: string) =>
   apiClient
    .get<AuthResponse>(`/auth/verify?token=${encodeURIComponent(token)}`)
    .then((r) => {
     authStore.setToken(r.data.accessToken);
     return r.data;
    }),
 });
}

export function useResendVerification() {
 return useMutation({
  mutationFn: (email: string) =>
   apiClient.post('/auth/verify-email/resend', { email }),
 });
}

export function useLogout() {
 return useMutation({
  mutationFn: () =>
   apiClient.post('/auth/logout').then(() => {
    authStore.clear();
   }),
 });
}

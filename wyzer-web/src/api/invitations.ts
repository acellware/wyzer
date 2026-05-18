import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface OrgMember {
 id: string;
 role: MemberRole;
 joinedAt: string;
 user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
 };
}

export interface PendingInvite {
 id: string;
 email: string;
 role: MemberRole;
 expiresAt: string;
 createdAt: string;
}

export function useAcceptInvite() {
 return useMutation<void, Error, string>({
  mutationFn: (token) =>
   apiClient
    .post(`/invitations/accept`, null, { params: { token } })
    .then(() => undefined),
 });
}

export function useOrgMembers() {
 return useQuery<OrgMember[]>({
  queryKey: ['org', 'members'],
  queryFn: () =>
   apiClient.get<OrgMember[]>('/invitations/members').then((r) => r.data),
 });
}

export function usePendingInvites() {
 return useQuery<PendingInvite[]>({
  queryKey: ['org', 'invites'],
  queryFn: () =>
   apiClient.get<PendingInvite[]>('/invitations').then((r) => r.data),
 });
}

export function useInviteMember() {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (payload: { email: string; role: MemberRole }) =>
   apiClient.post('/invitations', payload).then((r) => r.data),
  onSuccess: () => {
   void qc.invalidateQueries({ queryKey: ['org', 'invites'] });
  },
 });
}

export function useRemoveMember() {
 const qc = useQueryClient();
 return useMutation({
  mutationFn: (userId: string) =>
   apiClient.delete(`/invitations/members/${userId}`).then((r) => r.data),
  onSuccess: () => {
   void qc.invalidateQueries({ queryKey: ['org', 'members'] });
  },
 });
}

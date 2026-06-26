import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { StackTemplate, DataScope } from './stacks';
import type { ComplianceResult } from './reports';
import type { Technology, ConfigQuestion } from './technologies';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GuestSelection {
 technologyId: string;
 deploymentMode: 'MANAGED' | 'SELF_HOSTED' | 'ON_PREM';
 configAnswers?: Record<string, string>;
}

export interface CreateGuestReportPayload {
 companyName: string;
 email: string;
 role?: string;
 stackName?: string;
 dataScopes: string[];
 selections: GuestSelection[];
 utmSource?: string;
 utmMedium?: string;
 utmCampaign?: string;
}

export interface GuestReport {
 shareToken: string;
 companyName?: string;
 stackName: string | null;
 dataScopes?: string[];
 score: number | null;
 result: ComplianceResult;
 createdAt: string;
 expiresAt: string;
}

// ── Catalog (public) ───────────────────────────────────────────────────────

export function usePublicStackTemplates() {
 return useQuery<StackTemplate[]>({
  queryKey: ['public', 'stack-templates'],
  queryFn: () =>
   apiClient
    .get<StackTemplate[]>('/public/stack-templates')
    .then((r) => r.data),
  staleTime: 5 * 60 * 1000,
 });
}

export function usePublicDataScopes() {
 return useQuery<DataScope[]>({
  queryKey: ['public', 'data-scopes'],
  queryFn: () =>
   apiClient.get<DataScope[]>('/public/data-scopes').then((r) => r.data),
  staleTime: 30 * 60 * 1000,
 });
}

export function usePublicTechnologies(params?: {
 category?: string;
 search?: string;
}) {
 const query = new URLSearchParams();
 if (params?.category) query.set('category', params.category);
 if (params?.search) query.set('search', params.search);
 query.set('limit', '100');

 return useQuery<{ data: Technology[]; meta: { total: number } }>({
  queryKey: [
   'public',
   'technologies',
   params?.category ?? '',
   params?.search ?? '',
  ],
  queryFn: () =>
   apiClient
    .get<{
     data: Technology[];
     meta: { total: number };
    }>(`/public/technologies?${query.toString()}`)
    .then((r) => r.data),
  staleTime: 5 * 60 * 1000,
 });
}

export function usePublicConfigQuestions(
 technologyId: string | null,
 deploymentMode: string | null,
) {
 return useQuery<ConfigQuestion[]>({
  queryKey: ['public', 'config-questions', technologyId, deploymentMode],
  queryFn: () =>
   apiClient
    .get<
     ConfigQuestion[]
    >(`/public/technologies/${technologyId}/config-questions?deploymentMode=${deploymentMode}`)
    .then((r) => r.data),
  enabled: !!technologyId && !!deploymentMode,
  staleTime: 5 * 60 * 1000,
 });
}

// ── Mutation: run guest scan ───────────────────────────────────────────────

export function useCreateGuestReport() {
 return useMutation<GuestReport, Error, CreateGuestReportPayload>({
  mutationKey: ['public', 'guest-reports', 'create'],
  // We don't want the global error toast firing for validation issues on
  // the public flow — the wizard handles errors inline.
  meta: { silent: true },
  mutationFn: (payload) =>
   apiClient
    .post<GuestReport>('/public/guest-reports', payload)
    .then((r) => r.data),
 });
}

// ── Query: fetch existing guest report by token (for the result page) ─────

export function useGuestReport(token: string | undefined) {
 return useQuery<GuestReport>({
  queryKey: ['public', 'guest-reports', token],
  queryFn: () =>
   apiClient
    .get<GuestReport>(`/public/guest-reports/${token}`)
    .then((r) => r.data),
  enabled: !!token,
  retry: false,
  meta: { silent: true },
 });
}

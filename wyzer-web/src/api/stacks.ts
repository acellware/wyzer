import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Technology } from './technologies';

export type DeploymentMode = 'MANAGED' | 'SELF_HOSTED' | 'ON_PREM';

export type ConfigAnswers = Record<string, string>;

export interface StackItem {
 id: string;
 stackId: string;
 technologyId: string;
 deploymentMode: DeploymentMode;
 configAnswers: ConfigAnswers;
 technology: Technology;
}

export interface Stack {
 id: string;
 organisationId: string;
 name: string;
 description: string | null;
 dataScopes: string[];
 items: StackItem[];
 createdAt: string;
 updatedAt: string;
}

export interface CreateStackPayload {
 name: string;
 description?: string;
 dataScopes?: string[];
 templateSlug?: string;
}

export interface AddStackItemPayload {
 technologyId: string;
 deploymentMode: DeploymentMode;
 configAnswers?: ConfigAnswers;
}

export interface PatchStackItemPayload {
 configAnswers?: ConfigAnswers;
 deploymentMode?: DeploymentMode;
}

// ── Stack template types ──────────────────────────────────────────────────────

export interface StackTemplateItem {
 technologyId: string;
 deploymentMode: DeploymentMode;
 configAnswers: ConfigAnswers;
}

export interface StackTemplate {
 id: string;
 slug: string;
 name: string;
 description: string;
 useCase: string | null;
 dataScopes: string[];
 previewTechnologies: Technology[];
 templateData: { items: StackTemplateItem[] };
}

// ── Data scope types ──────────────────────────────────────────────────────────

export interface DataScope {
 id: string;
 label: string;
 description: string;
 triggeredFrameworkSlugs: string[];
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useStacks() {
 return useQuery<Stack[]>({
  queryKey: ['stacks'],
  queryFn: () => apiClient.get<Stack[]>('/stacks').then((r) => r.data),
 });
}

export function useStack(id: string) {
 return useQuery<Stack>({
  queryKey: ['stacks', id],
  queryFn: () => apiClient.get<Stack>(`/stacks/${id}`).then((r) => r.data),
  enabled: Boolean(id),
 });
}

export function useStackTemplates(opts: { enabled?: boolean } = {}) {
 return useQuery<StackTemplate[]>({
  queryKey: ['stack-templates'],
  queryFn: () =>
   apiClient.get<StackTemplate[]>('/stack-templates').then((r) => r.data),
  staleTime: 10 * 60 * 1000,
  enabled: opts.enabled ?? true,
 });
}

export function useStackTemplate(slug: string) {
 return useQuery<StackTemplate>({
  queryKey: ['stack-templates', slug],
  queryFn: () =>
   apiClient.get<StackTemplate>(`/stack-templates/${slug}`).then((r) => r.data),
  enabled: Boolean(slug),
  staleTime: 10 * 60 * 1000,
 });
}

export function useDataScopes(opts: { enabled?: boolean } = {}) {
 return useQuery<DataScope[]>({
  queryKey: ['data-scopes'],
  queryFn: () => apiClient.get<DataScope[]>('/data-scopes').then((r) => r.data),
  staleTime: 30 * 60 * 1000,
  enabled: opts.enabled ?? true,
 });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateStack() {
 const qc = useQueryClient();
 return useMutation<Stack, Error, CreateStackPayload>({
  mutationFn: (payload) =>
   apiClient.post<Stack>('/stacks', payload).then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['stacks'] }),
 });
}

export function useAddStackItem(stackId: string) {
 const qc = useQueryClient();
 return useMutation<StackItem, Error, AddStackItemPayload>({
  mutationFn: (payload) =>
   apiClient
    .post<StackItem>(`/stacks/${stackId}/items`, payload)
    .then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['stacks', stackId] }),
 });
}

export function usePatchStackItem(stackId: string) {
 const qc = useQueryClient();
 return useMutation<
  Stack,
  Error,
  { technologyId: string } & PatchStackItemPayload
 >({
  mutationFn: ({ technologyId, ...payload }) =>
   apiClient
    .patch<Stack>(`/stacks/${stackId}/items/${technologyId}`, payload)
    .then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['stacks', stackId] }),
 });
}

export function useRemoveStackItem(stackId: string) {
 const qc = useQueryClient();
 return useMutation<void, Error, string>({
  mutationFn: (technologyId) =>
   apiClient
    .delete(`/stacks/${stackId}/items/${technologyId}`)
    .then(() => undefined),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['stacks', stackId] }),
 });
}

export function useDeleteStack() {
 const qc = useQueryClient();
 return useMutation<void, Error, string>({
  mutationFn: (id) => apiClient.delete(`/stacks/${id}`).then(() => undefined),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['stacks'] }),
 });
}

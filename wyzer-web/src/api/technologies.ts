import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface Technology {
 id: string;
 slug: string;
 name: string;
 category: string;
 vendor: string | null;
 isManaged: boolean;
 logoUrl: string | null;
 createdAt: string;
}

export interface TechnologiesResponse {
 data: Technology[];
 meta: {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
 };
}

export interface ConfigQuestionOption {
 value: string;
 label: string;
}

export type ConfigQuestionInputType = 'TOGGLE' | 'RADIO' | 'CHIP_MULTI';

export interface ConfigQuestion {
 id: string;
 signalKey: string;
 question: string;
 inputType: ConfigQuestionInputType;
 appliesToModes: string[];
 orderIndex: number;
 options: ConfigQuestionOption[] | null;
}

export function useTechnologies(params?: {
 category?: string;
 search?: string;
 page?: number;
 limit?: number;
}) {
 return useQuery<TechnologiesResponse>({
  queryKey: ['technologies', params],
  queryFn: () =>
   apiClient
    .get<TechnologiesResponse>('/technologies', { params })
    .then((r) => r.data),
  staleTime: 5 * 60 * 1000,
 });
}

export function useTechnology(slug: string) {
 return useQuery<Technology>({
  queryKey: ['technologies', slug],
  queryFn: () =>
   apiClient.get<Technology>(`/technologies/${slug}`).then((r) => r.data),
  enabled: Boolean(slug),
 });
}

export function useTechnologyConfigQuestions(
 technologyId: string,
 deploymentMode?: string,
 opts: { enabled?: boolean } = {},
) {
 return useQuery<ConfigQuestion[]>({
  queryKey: ['technologies', technologyId, 'config-questions', deploymentMode],
  queryFn: () =>
   apiClient
    .get<ConfigQuestion[]>(`/technologies/${technologyId}/config-questions`, {
     params: deploymentMode ? { deploymentMode } : undefined,
    })
    .then((r) => r.data),
  enabled: (opts.enabled ?? true) && Boolean(technologyId),
  staleTime: 10 * 60 * 1000,
 });
}

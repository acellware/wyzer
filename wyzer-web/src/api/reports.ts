import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type ReportStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Gap {
 controlRef: string;
 controlTitle: string;
 frameworkSlug: string;
 frameworkName: string;
 severity: Severity;
 technologyName: string;
 failedSignal?: string;
 remediation?: string | null;
 isPartial: boolean;
}

export interface UnverifiedItem {
 controlRef: string;
 controlTitle: string;
 frameworkSlug: string;
 technologyName: string;
 signalKey?: string;
 remediation?: string | null;
}

export interface SatisfiedControl {
 controlRef: string;
 controlTitle: string;
 frameworkSlug: string;
 technologyName: string;
}

export interface ComplianceResult {
 frameworkScores: Record<string, number>;
 gaps: Gap[];
 unverified: UnverifiedItem[];
 satisfiedControls: SatisfiedControl[];
 generatedAt: string;
}

export interface Report {
 id: string;
 stackId: string;
 status: ReportStatus;
 result: ComplianceResult | null;
 error: string | null;
 pdfUrl: string | null;
 shareToken: string | null;
 shareExpiresAt: string | null;
 createdAt: string;
 updatedAt: string;
 stack: { id: string; name: string; organisationId: string };
}

export interface CreateReportPayload {
 stackId: string;
 frameworkIds: string[];
}

export interface ShareTokenResponse {
 shareUrl: string;
 expiresAt: string;
}

export function useReport(id: string) {
 return useQuery<Report>({
  queryKey: ['reports', id],
  queryFn: () => apiClient.get<Report>(`/reports/${id}`).then((r) => r.data),
  enabled: Boolean(id),
  refetchInterval: (query) => {
   const status = query.state.data?.status;
   return status === 'PENDING' || status === 'RUNNING' ? 2000 : false;
  },
 });
}

export function useCreateReport() {
 const qc = useQueryClient();
 return useMutation<Report, Error, CreateReportPayload>({
  mutationFn: (payload) =>
   apiClient.post<Report>('/reports', payload).then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
 });
}

export function useRequestPdf(reportId: string) {
 const qc = useQueryClient();
 return useMutation<{ jobId: string }, Error>({
  mutationFn: () =>
   apiClient
    .post<{ jobId: string }>(`/reports/${reportId}/pdf`)
    .then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', reportId] }),
 });
}

export function useCreateShareToken(reportId: string) {
 const qc = useQueryClient();
 return useMutation<ShareTokenResponse, Error>({
  mutationFn: () =>
   apiClient
    .post<ShareTokenResponse>(`/reports/${reportId}/share`)
    .then((r) => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', reportId] }),
 });
}

export function useSharedReport(token: string) {
 return useQuery<Report>({
  queryKey: ['shared-report', token],
  queryFn: () =>
   apiClient.get<Report>(`/reports/share/${token}`).then((r) => r.data),
  enabled: Boolean(token),
 });
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface Framework {
 id: string;
 slug: string;
 name: string;
 description: string | null;
}

export function useFrameworks() {
 return useQuery<Framework[]>({
  queryKey: ['frameworks'],
  queryFn: () => apiClient.get<Framework[]>('/frameworks').then((r) => r.data),
  staleTime: 1000 * 60 * 60, // 1h — rarely changes
 });
}

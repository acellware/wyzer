import axios from 'axios';
import { authStore } from '../store/auth';

// Re-export for convenience so callers don't need to import store separately
export const setAccessToken = authStore.setToken;
export const getAccessToken = authStore.getToken;

export const apiClient = axios.create({
 baseURL:
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3001/api/v1',
 withCredentials: true, // send HttpOnly refresh_token cookie automatically
 headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach access token ──────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
 const token = authStore.getToken();
 if (token) config.headers.Authorization = `Bearer ${token}`;
 return config;
});

// ── Response: 401 → silent refresh, 403 / 500 passthrough ───────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function notifySubscribers(token: string) {
 refreshSubscribers.forEach((cb) => cb(token));
 refreshSubscribers = [];
}

apiClient.interceptors.response.use(
 (response) => response,
 async (error: unknown) => {
  if (!axios.isAxiosError(error)) return Promise.reject(error);

  const status = error.response?.status;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = error.config as any;

  if (status === 401 && config && !config._retry) {
   config._retry = true;

   if (!isRefreshing) {
    isRefreshing = true;
    try {
     const { data } = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
     );
     authStore.setToken(data.accessToken);
     notifySubscribers(data.accessToken);
    } catch {
     authStore.clear();
     window.location.href = '/login';
     return Promise.reject(error);
    } finally {
     isRefreshing = false;
    }
   }

   return new Promise((resolve) => {
    refreshSubscribers.push((token: string) => {
     config.headers = config.headers ?? {};
     config.headers.Authorization = `Bearer ${token}`;
     resolve(apiClient(config));
    });
   });
  }

  return Promise.reject(error);
 },
);

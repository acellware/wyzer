import axios from 'axios';
import { authStore } from '../store/auth';
import { toApiError } from './errors';

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
  const url: string = config?.url ?? '';
  const isRefreshCall = url.includes('/auth/refresh');

  // Never try to silently refresh the refresh endpoint itself — that would
  // deadlock the interceptor (it would queue waiting for its own completion).
  if (status === 401 && config && !config._retry && !isRefreshCall) {
   config._retry = true;

   // If a refresh is already in flight, queue this request to retry after
   if (isRefreshing) {
    return new Promise((resolve) => {
     refreshSubscribers.push((token: string) => {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      resolve(apiClient(config));
     });
    });
   }

   // First 401 — kick off the refresh
   isRefreshing = true;
   try {
    const { data } = await apiClient.post<{ accessToken: string }>(
     '/auth/refresh',
    );
    authStore.setToken(data.accessToken);
    notifySubscribers(data.accessToken);
    // Retry the original request with the new token
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${data.accessToken}`;
    return apiClient(config);
   } catch {
    authStore.clear();
    // Only force a redirect to /login if the user is currently on a route
    // that requires auth. Public routes (share links, marketing pages,
    // legal pages, auth pages) should NOT be yanked to /login on a
    // background 401.
    const path = window.location.pathname;
    const isPublicRoute =
     path === '/' ||
     path.startsWith('/share/') ||
     path.startsWith('/check') ||
     path.startsWith('/invitations/') ||
     path.startsWith('/auth/') ||
     path === '/login' ||
     path === '/register' ||
     path === '/privacy' ||
     path === '/terms' ||
     path === '/cookies' ||
     path === '/pricing';
    if (!isPublicRoute) {
     window.location.href = '/login';
    }
    return Promise.reject(toApiError(error));
   } finally {
    isRefreshing = false;
   }
  }

  return Promise.reject(toApiError(error));
 },
);

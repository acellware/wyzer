import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
 MutationCache,
 QueryCache,
 QueryClient,
 QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster, toast } from 'sonner';
import App from './App';
import { ConfirmHost } from './components/ui/ConfirmDialog';
import { ApiError, toApiError } from './api/errors';
import './index.css';

/** Centralised handler: turn any unhandled query/mutation error into a toast
 *  using the normalised ApiError.message. Callers that pass an explicit
 *  `onError` to a mutation will short-circuit this (React Query default). */
function handleGlobalError(err: unknown) {
 const apiError = toApiError(err);
 // 401s are handled silently by the axios interceptor (silent refresh + redirect)
 if (apiError.statusCode === 401) return;
 toast.error(apiError.message);
}

const queryClient = new QueryClient({
 defaultOptions: {
  queries: {
   retry: (failureCount, error) => {
    // Don't retry client errors (4xx) — only transient network/5xx
    if (
     error instanceof ApiError &&
     error.statusCode >= 400 &&
     error.statusCode < 500
    ) {
     return false;
    }
    return failureCount < 1;
   },
   staleTime: 1000 * 60 * 2, // 2 minutes
   refetchOnWindowFocus: false,
  },
  mutations: {
   retry: false,
  },
 },
 queryCache: new QueryCache({
  onError: (err, query) => {
   // Opt-out: queries that handle their own error UI can set meta.silent
   if (query.meta?.silent) return;
   // Only auto-toast when the consumer is actively observing this query;
   // background refetches shouldn't spam toasts.
   if (query.state.data !== undefined) return;
   handleGlobalError(err);
  },
 }),
 mutationCache: new MutationCache({
  onError: (err, _vars, _ctx, mutation) => {
   // Opt-out: mutations that handle their own error UI can set meta.silent
   if (mutation.meta?.silent) return;
   // If the mutation defines its own onError, respect it (don't double-toast)
   if (mutation.options.onError) return;
   handleGlobalError(err);
  },
 }),
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
 <StrictMode>
  <QueryClientProvider client={queryClient}>
   <App />
   <Toaster position='top-right' richColors />
   <ConfirmHost />
   {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
 </StrictMode>,
);

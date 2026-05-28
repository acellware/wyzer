import axios, { AxiosError } from 'axios';

/**
 * Canonical error envelope returned by the backend's HttpExceptionFilter.
 * Shape: { statusCode, error, message, details, requestId }
 */
export interface ApiErrorBody {
 statusCode: number;
 error: string;
 message: string;
 details: unknown;
 requestId: string;
}

/**
 * Typed error thrown by the api client when a request fails. Centralises the
 * messy `err.response?.data?.message` extraction so callers can just do
 * `toast.error(err.message)` or check `err.statusCode === 403`.
 */
export class ApiError extends Error {
 readonly statusCode: number;
 readonly code: string;
 readonly details: unknown;
 readonly requestId: string | null;
 readonly isNetworkError: boolean;

 constructor(opts: {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string | null;
  isNetworkError?: boolean;
 }) {
  super(opts.message);
  this.name = 'ApiError';
  this.statusCode = opts.statusCode;
  this.code = opts.code;
  this.details = opts.details ?? null;
  this.requestId = opts.requestId ?? null;
  this.isNetworkError = opts.isNetworkError ?? false;
 }
}

/**
 * Normalise any thrown value (Axios error, ApiError, generic Error, anything)
 * into an ApiError instance with consistent fields.
 */
export function toApiError(err: unknown): ApiError {
 if (err instanceof ApiError) return err;

 if (axios.isAxiosError(err)) {
  const ax = err as AxiosError<Partial<ApiErrorBody>>;

  // Network / CORS / no-response failures
  if (!ax.response) {
   return new ApiError({
    statusCode: 0,
    code: 'NetworkError',
    message:
     ax.code === 'ECONNABORTED'
      ? 'The request timed out. Please try again.'
      : 'Could not reach the server. Check your connection and try again.',
    isNetworkError: true,
   });
  }

  const body = ax.response.data ?? {};
  // The message can occasionally come back as a string[] from class-validator
  const rawMessage = (body as { message?: unknown }).message;
  const message =
   typeof rawMessage === 'string'
    ? rawMessage
    : Array.isArray(rawMessage)
      ? (rawMessage as string[]).join(' · ')
      : ax.response.statusText || 'Request failed';

  return new ApiError({
   statusCode: body.statusCode ?? ax.response.status,
   code: body.error ?? ax.response.statusText ?? 'HttpError',
   message,
   details: body.details ?? null,
   requestId: body.requestId ?? null,
  });
 }

 if (err instanceof Error) {
  return new ApiError({
   statusCode: 0,
   code: err.name || 'Error',
   message: err.message || 'An unexpected error occurred.',
  });
 }

 return new ApiError({
  statusCode: 0,
  code: 'UnknownError',
  message: 'An unexpected error occurred.',
 });
}

/** Convenience for places that only need the message string. */
export function getErrorMessage(
 err: unknown,
 fallback = 'Something went wrong',
): string {
 return toApiError(err).message || fallback;
}

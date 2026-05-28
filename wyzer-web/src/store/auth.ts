/** In-memory access token store — never persisted to localStorage. */
let accessToken: string | null = null;
let _initialized = false;

export const authStore = {
 getToken: (): string | null => accessToken,
 setToken: (token: string | null): void => {
  accessToken = token;
 },
 clear: (): void => {
  accessToken = null;
 },
 isInitialized: (): boolean => _initialized,
 setInitialized: (): void => {
  _initialized = true;
 },
};

/** In-memory access token store — never persisted to localStorage. */
let accessToken: string | null = null;

export const authStore = {
 getToken: (): string | null => accessToken,
 setToken: (token: string | null): void => {
  accessToken = token;
 },
 clear: (): void => {
  accessToken = null;
 },
};

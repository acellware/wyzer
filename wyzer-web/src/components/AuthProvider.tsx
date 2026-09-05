import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { authStore } from '../store/auth';

/**
 * Runs a silent POST /auth/refresh on app mount.
 * - If the HttpOnly refresh cookie is valid → stores the new access token.
 * - If not → clears the token (user is unauthenticated).
 *
 * Only the authenticated app routes block on this check (so a data request
 * never fires before we know the auth state). Marketing, legal, auth, and the
 * public tool render immediately while the refresh completes in the background,
 * so first paint is never gated on an API round-trip.
 */
const APP_ROUTE = /^\/(dashboard|stacks|reports|settings|billing|teams|profile)(\/|$)/;

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [ready, setReady] = useState(false);

 useEffect(() => {
  apiClient
   .post<{ accessToken: string }>('/auth/refresh')
   .then(({ data }) => {
    authStore.setToken(data.accessToken);
   })
   .catch(() => {
    authStore.clear();
   })
   .finally(() => {
    authStore.setInitialized();
    setReady(true);
   });
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const gateThisRoute =
  typeof window !== 'undefined' && APP_ROUTE.test(window.location.pathname);

 if (!ready && gateThisRoute) {
  return (
   <div
    className='min-h-screen flex items-center justify-center'
    style={{ background: 'var(--color-page, #f9fafb)' }}
   >
    <div className='flex flex-col items-center gap-3'>
     <div
      className='w-10 h-10 rounded-xl flex items-center justify-center'
      style={{ background: 'var(--color-accent-soft, #ede9fe)' }}
     >
      <ShieldCheck
       size={20}
       className='animate-pulse'
       style={{ color: 'var(--color-accent, #7c3aed)' }}
      />
     </div>
    </div>
   </div>
  );
 }

 return <>{children}</>;
}

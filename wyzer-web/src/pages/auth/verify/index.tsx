import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../../../api/auth';
import { getErrorMessage } from '../../../api/errors';

/**
 * T-019 — email verification handler.
 * This page is the target of links in verification emails:
 *   {APP_URL}/auth/verify?token=<rawToken>
 *
 * On mount it calls the API, stores the access token, then navigates to /dashboard.
 */
export default function VerifyPage() {
 const [searchParams] = useSearchParams();
 const token = searchParams.get('token');
 const navigate = useNavigate();
 const { mutate, isPending, isError, error } = useVerifyEmail();
 const called = useRef(false);

 useEffect(() => {
  if (!token || called.current) return;
  called.current = true;

  mutate(token, {
   onSuccess: () => navigate('/dashboard', { replace: true }),
  });
 }, [token, mutate, navigate]);

 if (!token) {
  return (
   <StatusScreen
    title='Invalid link'
    body='This verification link is missing its token. Please check your email and try again.'
   />
  );
 }

 if (isPending) {
  return (
   <StatusScreen
    title='Verifying…'
    body='Please wait while we confirm your email address.'
   />
  );
 }

 if (isError) {
  const msg = getErrorMessage(
   error,
   'This link may have expired or already been used.',
  );
  return (
   <StatusScreen
    title='Verification failed'
    body={msg}
    link={{ href: '/auth/verify-email', label: 'Request a new link' }}
   />
  );
 }

 return (
  <StatusScreen
   title='Email verified ✓'
   body='Redirecting you to your dashboard…'
  />
 );
}

function StatusScreen({
 title,
 body,
 link,
}: {
 title: string;
 body: string;
 link?: { href: string; label: string };
}) {
 return (
  <div
   className='min-h-screen flex items-center justify-center px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='w-full max-w-sm text-center'>
    <h1
     className='text-[24px] font-semibold mb-3 tracking-tight'
     style={{ color: 'var(--color-ink)' }}
    >
     {title}
    </h1>
    <p
     className='text-[15px] leading-relaxed mb-6'
     style={{ color: 'var(--color-body)' }}
    >
     {body}
    </p>
    {link && (
     <a
      href={link.href}
      className='text-[14px] font-medium'
      style={{ color: 'var(--color-accent)' }}
     >
      {link.label}
     </a>
    )}
   </div>
  </div>
 );
}

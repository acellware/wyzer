import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useAcceptInvite } from '../../../api/invitations';

/**
 * T-043 — Organisation invite acceptance handler.
 * Target of links in invite emails:
 *   {APP_URL}/invitations/accept?token=<inviteToken>
 *
 * The user must be logged in. On mount it calls the API then redirects to /dashboard.
 * If the user is not authenticated the API returns 401 and we show a prompt to log in.
 */
export default function AcceptInvitePage() {
 const [searchParams] = useSearchParams();
 const token = searchParams.get('token');
 const navigate = useNavigate();
 const { mutate, isPending, isError, isSuccess, error } = useAcceptInvite();
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
    icon={<XCircle size={40} className='text-danger' />}
    title='Invalid invite link'
    body='This link is missing its token. Check your email and try the link again.'
   />
  );
 }

 if (isPending) {
  return (
   <StatusScreen
    icon={<Loader2 size={40} className='text-brand animate-spin' />}
    title='Accepting invite…'
    body='Please wait while we add you to the organisation.'
   />
  );
 }

 if (isError) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const status: number | undefined = err?.response?.status;
  const msg: string =
   err?.response?.data?.message ??
   'This invite may have expired, already been used, or does not match your account.';

  if (status === 401) {
   return (
    <StatusScreen
     icon={<XCircle size={40} className='text-warn' />}
     title='Sign in required'
     body='You need to be logged in to accept this invite.'
    >
     <Link
      to={`/login?next=${encodeURIComponent(`/invitations/accept?token=${token}`)}`}
      className='px-5 py-2.5 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors'
     >
      Sign in and accept
     </Link>
    </StatusScreen>
   );
  }

  return (
   <StatusScreen
    icon={<XCircle size={40} className='text-danger' />}
    title='Could not accept invite'
    body={Array.isArray(msg) ? msg.join(' ') : msg}
   >
    <Link
     to='/dashboard'
     className='px-5 py-2.5 rounded-xl text-sm font-medium bg-surface border border-line text-ink-secondary hover:text-ink-primary transition-colors'
    >
     Go to Dashboard
    </Link>
   </StatusScreen>
  );
 }

 if (isSuccess) {
  return (
   <StatusScreen
    icon={<CheckCircle2 size={40} className='text-ok' />}
    title='Invite accepted!'
    body="You've been added to the organisation. Redirecting to your dashboard…"
   />
  );
 }

 return null;
}

// ── StatusScreen ──────────────────────────────────────────────────────────────

function StatusScreen({
 icon,
 title,
 body,
 children,
}: {
 icon: React.ReactNode;
 title: string;
 body: string;
 children?: React.ReactNode;
}) {
 return (
  <div className='min-h-screen bg-canvas flex items-center justify-center px-6'>
   <div className='max-w-sm w-full text-center'>
    <div className='flex justify-center mb-6'>{icon}</div>
    <h1 className='text-xl font-semibold text-ink-primary mb-2'>{title}</h1>
    <p className='text-sm text-ink-muted leading-relaxed mb-6'>{body}</p>
    {children}
   </div>
  </div>
 );
}

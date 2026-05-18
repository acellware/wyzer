import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResendVerification } from '../../../api/auth';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
 const [searchParams] = useSearchParams();
 const email = searchParams.get('email') ?? '';

 const { mutateAsync, isPending } = useResendVerification();
 const [cooldown, setCooldown] = useState(0);
 const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>(
  'idle',
 );
 const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

 useEffect(() => {
  return () => {
   if (timerRef.current) clearInterval(timerRef.current);
  };
 }, []);

 const startCooldown = () => {
  setCooldown(COOLDOWN_SECONDS);
  timerRef.current = setInterval(() => {
   setCooldown((c) => {
    if (c <= 1) {
     clearInterval(timerRef.current!);
     return 0;
    }
    return c - 1;
   });
  }, 1000);
 };

 const handleResend = async () => {
  if (!email || cooldown > 0) return;
  try {
   await mutateAsync(email);
   setResendStatus('sent');
   startCooldown();
  } catch {
   setResendStatus('error');
  }
 };

 return (
  <div
   className='min-h-screen flex items-center justify-center px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='w-full max-w-sm text-center'>
    {/* Icon */}
    <div
     className='inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6'
     style={{ background: 'var(--color-accent-soft)' }}
    >
     <EnvelopeIcon />
    </div>

    <h1
     className='text-[24px] font-semibold mb-2 tracking-tight'
     style={{ color: 'var(--color-ink)' }}
    >
     Check your inbox
    </h1>
    <p
     className='text-[15px] mb-1 leading-relaxed'
     style={{ color: 'var(--color-body)' }}
    >
     We sent a verification link to
    </p>
    {email && (
     <p
      className='text-[15px] font-medium mb-6'
      style={{ color: 'var(--color-ink)' }}
     >
      {email}
     </p>
    )}
    <p
     className='text-[14px] mb-8 leading-relaxed'
     style={{ color: 'var(--color-muted)' }}
    >
     Click the link in the email to activate your account. The link expires in
     24 hours.
    </p>

    {/* Resend */}
    {resendStatus === 'sent' && (
     <p className='text-[13px] mb-4' style={{ color: 'hsl(143 60% 40%)' }}>
      ✓ Resent! Check your inbox again.
     </p>
    )}
    {resendStatus === 'error' && (
     <p className='text-[13px] mb-4' style={{ color: 'hsl(0 80% 50%)' }}>
      Could not resend. Please try again shortly.
     </p>
    )}

    <button
     onClick={handleResend}
     disabled={isPending || cooldown > 0}
     className='text-[14px] font-medium transition-opacity disabled:opacity-40 mb-6 block mx-auto'
     style={{ color: 'var(--color-accent)' }}
    >
     {cooldown > 0
      ? `Resend in ${cooldown}s`
      : isPending
        ? 'Sending…'
        : "Didn't receive it? Resend"}
    </button>

    <p className='text-[13px]' style={{ color: 'var(--color-muted)' }}>
     Wrong email?{' '}
     <Link
      to='/register'
      className='font-medium'
      style={{ color: 'var(--color-accent)' }}
     >
      Start over
     </Link>
    </p>
   </div>
  </div>
 );
}

function EnvelopeIcon() {
 return (
  <svg
   width='28'
   height='28'
   viewBox='0 0 24 24'
   fill='none'
   stroke='var(--color-accent)'
   strokeWidth='1.75'
   strokeLinecap='round'
   strokeLinejoin='round'
  >
   <rect x='2' y='4' width='20' height='16' rx='2' />
   <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
  </svg>
 );
}

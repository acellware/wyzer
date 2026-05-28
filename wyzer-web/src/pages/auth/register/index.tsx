import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useCheckEmail, useRequestOtp, useVerifyOtp } from '../../../api/auth';
import { authStore } from '../../../store/auth';
import { getErrorMessage } from '../../../api/errors';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const emailSchema = z.object({
 email: z.string().email('Enter a valid email'),
});

const detailsSchema = z.object({
 name: z.string().min(1, 'Required').max(200),
 orgName: z.string().min(1, 'Required').max(200),
 jobTitle: z.string().min(1, 'Required').max(200),
});

const codeSchema = z.object({
 code: z
  .string()
  .length(6, 'Enter the 6-digit code')
  .regex(/^\d{6}$/, 'Digits only'),
});

type EmailForm = z.infer<typeof emailSchema>;
type DetailsForm = z.infer<typeof detailsSchema>;
type CodeForm = z.infer<typeof codeSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const isSignIn = location.pathname === '/login';

 // All hooks must be called before any early return
 const [step, setStep] = useState<'email' | 'details' | 'otp'>('email');
 const [email, setEmail] = useState('');
 const [isNewUser, setIsNewUser] = useState(false);
 const [serverError, setServerError] = useState<string | null>(null);

 const checkEmail = useCheckEmail();
 const requestOtp = useRequestOtp();
 const verifyOtp = useVerifyOtp();

 const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
 const detailsForm = useForm<DetailsForm>({
  resolver: zodResolver(detailsSchema),
 });
 const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });

 // Already authenticated — send straight to the app (after hooks)
 if (authStore.getToken()) {
  return <Navigate to='/dashboard' replace />;
 }

 const extractError = getErrorMessage;

 const onEmailSubmit = async (data: EmailForm) => {
  setServerError(null);
  try {
   const { exists } = await checkEmail.mutateAsync(data.email);
   setEmail(data.email);
   setIsNewUser(!exists);
   if (exists) {
    await requestOtp.mutateAsync({ email: data.email });
    setStep('otp');
   } else {
    setStep('details');
   }
  } catch (err) {
   setServerError(extractError(err, 'Something went wrong. Try again.'));
  }
 };

 const onDetailsSubmit = async (data: DetailsForm) => {
  setServerError(null);
  try {
   await requestOtp.mutateAsync({
    email,
    name: data.name,
    orgName: data.orgName,
    jobTitle: data.jobTitle,
   });
   setStep('otp');
  } catch (err) {
   setServerError(extractError(err, 'Could not send code. Try again.'));
  }
 };

 const onCodeSubmit = async (data: CodeForm) => {
  setServerError(null);
  try {
   await verifyOtp.mutateAsync({ email, code: data.code });
   navigate('/stacks');
  } catch (err) {
   setServerError(extractError(err, 'Invalid or expired code.'));
  }
 };

 const handleResend = async () => {
  setServerError(null);
  try {
   if (isNewUser) {
    const vals = detailsForm.getValues();
    await requestOtp.mutateAsync({
     email,
     name: vals.name,
     orgName: vals.orgName,
     jobTitle: vals.jobTitle,
    });
   } else {
    await requestOtp.mutateAsync({ email });
   }
   codeForm.reset();
  } catch (err) {
   setServerError(extractError(err, 'Could not resend code.'));
  }
 };

 const heading =
  step === 'email'
   ? isSignIn
     ? 'Welcome back'
     : 'Start your free compliance check'
   : step === 'details'
     ? 'Tell us about yourself'
     : 'Check your inbox';

 const subheading =
  step === 'email'
   ? isSignIn
     ? 'Enter your email to continue'
     : 'Map your stack to compliance frameworks — free, no credit card'
   : step === 'details'
     ? 'We need a few details to set up your account'
     : `We sent a 6-digit code to ${email}`;

 return (
  <div
   className='min-h-screen py-12 px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='w-full max-w-sm mx-auto'>
    <div className='text-center mb-8'>
     <Link to='/' className='inline-flex items-center gap-2 mb-6'>
      <WyzerMark />
      <span
       className='text-[18px] font-semibold tracking-[-0.01em]'
       style={{ color: 'var(--color-ink)' }}
      >
       wyzer
      </span>
     </Link>
     <h1
      className='text-[26px] font-semibold mb-1 tracking-tight'
      style={{ color: 'var(--color-ink)' }}
     >
      {heading}
     </h1>
     <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
      {subheading}
     </p>
    </div>

    {/* ── Step 1: Email ─────────────────────────────────────────── */}
    {step === 'email' && (
     <div
      className='rounded-xl border overflow-hidden'
      style={{
       background: 'var(--color-surface)',
       borderColor: 'var(--color-border-subtle)',
      }}
     >
      <form
       onSubmit={emailForm.handleSubmit(onEmailSubmit)}
       className='p-6 space-y-4'
      >
       <Field
        label='Work email'
        error={emailForm.formState.errors.email?.message}
       >
        <input
         {...emailForm.register('email')}
         type='email'
         autoComplete='email'
         autoFocus
         placeholder='you@company.com'
         className={inputCls(!!emailForm.formState.errors.email)}
        />
       </Field>

       {serverError && <ErrorBanner message={serverError} />}

       <button
        type='submit'
        disabled={checkEmail.isPending || requestOtp.isPending}
        className='w-full rounded-lg py-2.5 text-[14px] font-semibold transition-opacity disabled:opacity-50'
        style={{ background: 'var(--color-accent)', color: 'white' }}
       >
        {checkEmail.isPending || requestOtp.isPending
         ? 'Please wait…'
         : 'Continue'}
       </button>
      </form>

      <div
       className='px-6 pb-6 space-y-3 border-t'
       style={{
        borderColor: 'var(--color-border-subtle)',
        paddingTop: '1.25rem',
       }}
      >
       <div className='flex items-center gap-3'>
        <hr
         className='flex-1'
         style={{ borderColor: 'var(--color-border-subtle)' }}
        />
        <span className='text-[12px]' style={{ color: 'var(--color-muted)' }}>
         or continue with
        </span>
        <hr
         className='flex-1'
         style={{ borderColor: 'var(--color-border-subtle)' }}
        />
       </div>

       <button
        type='button'
        disabled
        title='Coming soon'
        className='relative w-full flex items-center justify-center gap-2.5 rounded-lg py-2.5 border text-[14px] font-medium opacity-50 cursor-not-allowed'
        style={{
         background: 'var(--color-page)',
         borderColor: 'var(--color-border)',
         color: 'var(--color-body)',
        }}
       >
        <GoogleIcon />
        Continue with Google
        <ComingSoonBadge />
       </button>

       <button
        type='button'
        disabled
        title='Coming soon'
        className='relative w-full flex items-center justify-center gap-2.5 rounded-lg py-2.5 border text-[14px] font-medium opacity-50 cursor-not-allowed'
        style={{
         background: 'var(--color-page)',
         borderColor: 'var(--color-border)',
         color: 'var(--color-body)',
        }}
       >
        <GitHubIcon />
        Continue with GitHub
        <ComingSoonBadge />
       </button>
      </div>
     </div>
    )}

    {/* ── Step 2: Details (new users only) ──────────────────────── */}
    {step === 'details' && (
     <form
      onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}
      className='rounded-xl p-6 border space-y-4'
      style={{
       background: 'var(--color-surface)',
       borderColor: 'var(--color-border-subtle)',
      }}
     >
      <Field
       label='Your full name'
       error={detailsForm.formState.errors.name?.message}
      >
       <input
        {...detailsForm.register('name')}
        autoComplete='name'
        autoFocus
        placeholder='Jane Doe'
        className={inputCls(!!detailsForm.formState.errors.name)}
       />
      </Field>

      <Field
       label='Company name'
       error={detailsForm.formState.errors.orgName?.message}
      >
       <input
        {...detailsForm.register('orgName')}
        autoComplete='organization'
        placeholder='Acme Corp'
        className={inputCls(!!detailsForm.formState.errors.orgName)}
       />
      </Field>

      <Field
       label='Your role'
       error={detailsForm.formState.errors.jobTitle?.message}
      >
       <input
        {...detailsForm.register('jobTitle')}
        placeholder='e.g. Head of Engineering'
        className={inputCls(!!detailsForm.formState.errors.jobTitle)}
       />
      </Field>

      {serverError && <ErrorBanner message={serverError} />}

      <button
       type='submit'
       disabled={requestOtp.isPending}
       className='w-full rounded-lg py-2.5 text-[14px] font-semibold transition-opacity disabled:opacity-50'
       style={{ background: 'var(--color-accent)', color: 'white' }}
      >
       {requestOtp.isPending ? 'Sending code…' : 'Continue'}
      </button>

      <button
       type='button'
       onClick={() => {
        setStep('email');
        setServerError(null);
       }}
       className='w-full flex items-center justify-center gap-1.5 text-[13px] py-1'
       style={{ color: 'var(--color-muted)' }}
      >
       <ArrowLeft size={13} />
       Back
      </button>
     </form>
    )}

    {/* ── Step 3: OTP ───────────────────────────────────────────── */}
    {step === 'otp' && (
     <form
      onSubmit={codeForm.handleSubmit(onCodeSubmit)}
      className='rounded-xl p-6 border space-y-4'
      style={{
       background: 'var(--color-surface)',
       borderColor: 'var(--color-border-subtle)',
      }}
     >
      <Field
       label='Verification code'
       error={codeForm.formState.errors.code?.message}
      >
       <input
        {...codeForm.register('code')}
        type='text'
        inputMode='numeric'
        autoComplete='one-time-code'
        autoFocus
        maxLength={6}
        placeholder='000000'
        className={inputCls(!!codeForm.formState.errors.code)}
        style={{
         letterSpacing: '0.25em',
         fontSize: '20px',
         textAlign: 'center',
        }}
       />
      </Field>

      {serverError && <ErrorBanner message={serverError} />}

      <button
       type='submit'
       disabled={verifyOtp.isPending}
       className='w-full rounded-lg py-2.5 text-[14px] font-semibold transition-opacity disabled:opacity-50'
       style={{ background: 'var(--color-accent)', color: 'white' }}
      >
       {verifyOtp.isPending ? 'Verifying…' : 'Verify'}
      </button>

      <p
       className='text-center text-[13px]'
       style={{ color: 'var(--color-muted)' }}
      >
       Didn't get it?{' '}
       <button
        type='button'
        onClick={handleResend}
        disabled={requestOtp.isPending}
        className='font-medium transition-opacity disabled:opacity-50'
        style={{ color: 'var(--color-accent)' }}
       >
        {requestOtp.isPending ? 'Sending…' : 'Resend code'}
       </button>
       {' · '}
       <button
        type='button'
        onClick={() => {
         setStep(isNewUser ? 'details' : 'email');
         setServerError(null);
        }}
        className='font-medium'
        style={{ color: 'var(--color-accent)' }}
       >
        {isNewUser ? 'Edit details' : 'Change email'}
       </button>
      </p>
     </form>
    )}

    <p
     className='text-center text-[12px] mt-6'
     style={{ color: 'var(--color-muted)' }}
    >
     By continuing you agree to our{' '}
     <Link
      to='/terms'
      className='underline underline-offset-2'
      style={{ color: 'var(--color-muted)' }}
     >
      Terms
     </Link>{' '}
     and{' '}
     <Link
      to='/privacy'
      className='underline underline-offset-2'
      style={{ color: 'var(--color-muted)' }}
     >
      Privacy Policy
     </Link>
     .
    </p>
   </div>
  </div>
 );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
 return [
  'w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-colors border',
  'focus:ring-2 focus:ring-[var(--color-accent-soft)]',
  hasError
   ? 'border-red-400'
   : 'border-[var(--color-border)] focus:border-[var(--color-accent)]',
  'bg-[var(--color-page)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]',
 ].join(' ');
}

function Field({
 label,
 error,
 children,
}: {
 label: string;
 error?: string;
 children: React.ReactNode;
}) {
 return (
  <div className='space-y-1.5'>
   <label
    className='block text-[13px] font-medium'
    style={{ color: 'var(--color-body)' }}
   >
    {label}
   </label>
   {children}
   {error && (
    <p className='text-[12px]' style={{ color: 'hsl(0 80% 50%)' }}>
     {error}
    </p>
   )}
  </div>
 );
}

function ErrorBanner({ message }: { message: string }) {
 return (
  <p
   className='text-[13px] rounded-lg px-3 py-2'
   style={{ color: 'hsl(0 80% 50%)', background: 'hsl(0 80% 50% / 0.08)' }}
  >
   {message}
  </p>
 );
}

function ComingSoonBadge() {
 return (
  <span
   className='absolute right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded'
   style={{
    background: 'var(--color-accent-soft)',
    color: 'var(--color-accent-ink)',
   }}
  >
   Soon
  </span>
 );
}

function WyzerMark() {
 return (
  <svg width='20' height='20' viewBox='0 0 24 24' aria-hidden fill='none'>
   <rect
    x='0.5'
    y='0.5'
    width='23'
    height='23'
    rx='6'
    fill='var(--color-accent)'
   />
   <path
    d='M6 17L9.5 7H11.5L14 13.2L16.5 7H18.5L22 17H19.8L17.5 10.8L15 17H13L10.5 10.8L8.2 17H6Z'
    fill='white'
   />
  </svg>
 );
}

function GoogleIcon() {
 return (
  <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden>
   <path
    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
    fill='#4285F4'
   />
   <path
    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
    fill='#34A853'
   />
   <path
    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
    fill='#FBBC05'
   />
   <path
    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
    fill='#EA4335'
   />
  </svg>
 );
}

function GitHubIcon() {
 return (
  <svg
   width='16'
   height='16'
   viewBox='0 0 24 24'
   aria-hidden
   fill='currentColor'
   style={{ color: 'var(--color-body)' }}
  >
   <path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' />
  </svg>
 );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../../../api/auth';

const schema = z.object({
 email: z.string().email('Enter a valid email'),
 password: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
 const navigate = useNavigate();
 const { mutateAsync, isPending } = useLogin();
 const [serverError, setServerError] = useState<string | null>(null);

 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormValues>({ resolver: zodResolver(schema) });

 const onSubmit = async (data: FormValues) => {
  setServerError(null);
  try {
   await mutateAsync(data);
   navigate('/dashboard');
  } catch (err: unknown) {
   const msg =
    (err as { response?: { data?: { message?: string } } })?.response?.data
     ?.message ?? 'Invalid email or password.';
   setServerError(Array.isArray(msg) ? msg.join(' · ') : msg);
  }
 };

 return (
  <div
   className='min-h-screen flex items-center justify-center px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='w-full max-w-sm'>
    {/* Logo */}
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
      className='text-[24px] font-semibold mb-2 tracking-tight'
      style={{ color: 'var(--color-ink)' }}
     >
      Welcome back
     </h1>
     <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
      Sign in to your account
     </p>
    </div>

    {/* Card */}
    <form
     onSubmit={handleSubmit(onSubmit)}
     className='rounded-xl p-6 border space-y-4'
     style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <div className='space-y-1'>
      <label
       className='block text-[13px] font-medium'
       style={{ color: 'var(--color-body)' }}
      >
       Email
      </label>
      <input
       {...register('email')}
       type='email'
       autoComplete='email'
       className={inputCls(!!errors.email)}
      />
      {errors.email && (
       <p className='text-[12px]' style={{ color: 'hsl(0 80% 50%)' }}>
        {errors.email.message}
       </p>
      )}
     </div>

     <div className='space-y-1'>
      <label
       className='block text-[13px] font-medium'
       style={{ color: 'var(--color-body)' }}
      >
       Password
      </label>
      <input
       {...register('password')}
       type='password'
       autoComplete='current-password'
       className={inputCls(!!errors.password)}
      />
      {errors.password && (
       <p className='text-[12px]' style={{ color: 'hsl(0 80% 50%)' }}>
        {errors.password.message}
       </p>
      )}
     </div>

     {serverError && (
      <p
       className='text-[13px] rounded-lg px-3 py-2'
       style={{
        color: 'hsl(0 80% 50%)',
        background: 'hsl(0 80% 50% / 0.08)',
       }}
      >
       {serverError}
      </p>
     )}

     <button
      type='submit'
      disabled={isPending}
      className='w-full rounded-lg py-2.5 text-[14px] font-semibold transition-opacity disabled:opacity-50'
      style={{
       background: 'var(--color-accent)',
       color: 'var(--color-accent-ink)',
      }}
     >
      {isPending ? 'Signing in…' : 'Sign in'}
     </button>
    </form>

    <p
     className='text-center text-[13px] mt-6'
     style={{ color: 'var(--color-muted)' }}
    >
     Don't have an account?{' '}
     <Link
      to='/register'
      className='font-medium transition-colors'
      style={{ color: 'var(--color-accent)' }}
     >
      Create one free
     </Link>
    </p>
   </div>
  </div>
 );
}

function inputCls(hasError: boolean) {
 return [
  'w-full rounded-lg px-3 py-2 text-[14px] outline-none transition-colors border focus:ring-2',
  hasError
   ? 'border-red-400 focus:ring-red-200'
   : 'focus:ring-[var(--color-accent-soft)]',
 ].join(' ');
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

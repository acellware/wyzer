import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../../../api/auth';
import type { CompanySize } from '../../../api/types';

const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
 { value: 'SOLO', label: 'Just me' },
 { value: 'MICRO', label: '2–10 people' },
 { value: 'SMALL', label: '11–50 people' },
 { value: 'MEDIUM', label: '51–250 people' },
 { value: 'LARGE', label: '251+ people' },
];

const schema = z.object({
 firstName: z.string().min(1, 'Required').max(100),
 lastName: z.string().min(1, 'Required').max(100),
 email: z.string().email('Enter a valid email'),
 password: z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'At most 72 characters'),
 jobTitle: z.string().min(1, 'Required').max(200),
 country: z.string().length(2, 'Enter a 2-letter country code').toUpperCase(),
 orgName: z.string().min(1, 'Required').max(200),
 companySize: z.enum(['SOLO', 'MICRO', 'SMALL', 'MEDIUM', 'LARGE']),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
 const navigate = useNavigate();
 const { mutateAsync, isPending } = useRegister();
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
   navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
  } catch (err: unknown) {
   const msg =
    (err as { response?: { data?: { message?: string } } })?.response?.data
     ?.message ?? 'Something went wrong. Please try again.';
   setServerError(Array.isArray(msg) ? msg.join(' · ') : msg);
  }
 };

 return (
  <div
   className='min-h-screen py-12 px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='w-full max-w-md mx-auto'>
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
      className='text-[26px] font-semibold mb-1 tracking-tight'
      style={{ color: 'var(--color-ink)' }}
     >
      Create your account
     </h1>
     <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
      Free forever on one stack
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
     {/* Name row */}
     <div className='grid grid-cols-2 gap-3'>
      <Field label='First name' error={errors.firstName?.message}>
       <input
        {...register('firstName')}
        autoComplete='given-name'
        className={inputCls(!!errors.firstName)}
       />
      </Field>
      <Field label='Last name' error={errors.lastName?.message}>
       <input
        {...register('lastName')}
        autoComplete='family-name'
        className={inputCls(!!errors.lastName)}
       />
      </Field>
     </div>

     <Field label='Work email' error={errors.email?.message}>
      <input
       {...register('email')}
       type='email'
       autoComplete='email'
       className={inputCls(!!errors.email)}
      />
     </Field>

     <Field label='Password' error={errors.password?.message}>
      <input
       {...register('password')}
       type='password'
       autoComplete='new-password'
       className={inputCls(!!errors.password)}
      />
     </Field>

     <Field label='Job title' error={errors.jobTitle?.message}>
      <input
       {...register('jobTitle')}
       placeholder='e.g. Head of Engineering'
       className={inputCls(!!errors.jobTitle)}
      />
     </Field>

     <Field
      label='Country code'
      error={errors.country?.message}
      hint='ISO 3166-1 alpha-2, e.g. US, GB, DE'
     >
      <input
       {...register('country')}
       maxLength={2}
       placeholder='US'
       className={inputCls(!!errors.country)}
       style={{ textTransform: 'uppercase', width: '80px' }}
      />
     </Field>

     <Field label='Company name' error={errors.orgName?.message}>
      <input
       {...register('orgName')}
       autoComplete='organization'
       className={inputCls(!!errors.orgName)}
      />
     </Field>

     <Field label='Company size' error={errors.companySize?.message}>
      <select
       {...register('companySize')}
       className={inputCls(!!errors.companySize)}
      >
       <option value=''>Select…</option>
       {COMPANY_SIZES.map((s) => (
        <option key={s.value} value={s.value}>
         {s.label}
        </option>
       ))}
      </select>
     </Field>

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
      {isPending ? 'Creating account…' : 'Create account'}
     </button>
    </form>

    <p
     className='text-center text-[13px] mt-5'
     style={{ color: 'var(--color-muted)' }}
    >
     Already have an account?{' '}
     <Link
      to='/login'
      className='font-medium transition-colors'
      style={{ color: 'var(--color-accent)' }}
     >
      Sign in
     </Link>
    </p>
   </div>
  </div>
 );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
 return [
  'w-full rounded-lg px-3 py-2 text-[14px] outline-none transition-colors',
  'border focus:ring-2',
 ]
  .join(' ')
  .concat(
   hasError
    ? ' border-red-400 focus:ring-red-200'
    : ' focus:ring-[var(--color-accent-soft)]',
  );
}

function Field({
 label,
 error,
 hint,
 children,
}: {
 label: string;
 error?: string;
 hint?: string;
 children: React.ReactNode;
}) {
 return (
  <div className='space-y-1'>
   <label
    className='block text-[13px] font-medium'
    style={{ color: 'var(--color-body)' }}
   >
    {label}
   </label>
   {children}
   {hint && !error && (
    <p className='text-[12px]' style={{ color: 'var(--color-muted)' }}>
     {hint}
    </p>
   )}
   {error && (
    <p className='text-[12px]' style={{ color: 'hsl(0 80% 50%)' }}>
     {error}
    </p>
   )}
  </div>
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

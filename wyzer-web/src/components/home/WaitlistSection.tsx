import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';

const schema = z.object({
 email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export function WaitlistSection() {
 const [submitted, setSubmitted] = useState(false);

 const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
 } = useForm<FormValues>({ resolver: zodResolver(schema) });

 const onSubmit = async (values: FormValues) => {
  try {
   await apiClient.post('/waitlist', { email: values.email });
  } catch {
   // Silently succeed — don't block UX on network errors
  }
  setSubmitted(true);
 };

 return (
  <section
   className='py-[var(--section-gap)] border-b border-line'
   style={{ background: 'var(--color-surface)' }}
  >
   <div className='max-w-[1240px] mx-auto px-6 text-center'>
    <p
     className='font-mono text-[12px] mb-4'
     style={{ color: 'var(--color-muted)' }}
    >
     stay in the loop
    </p>
    <h2
     className='text-display-3 balance mb-3 mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '560px' }}
    >
     Get notified when new frameworks drop.
    </h2>
    <p
     className='text-[16px] leading-[1.6] mb-8 mx-auto'
     style={{ color: 'var(--color-body)', maxWidth: '440px' }}
    >
     HIPAA, PCI-DSS, NDPR and more — coming soon. No spam. Unsubscribe any time.
    </p>

    {submitted ? (
     <div
      className='inline-flex items-center gap-2 px-5 py-3 rounded-xl border'
      style={{
       background: 'var(--color-ok-dim)',
       borderColor: 'var(--color-ok)',
       color: 'var(--color-ok)',
      }}
     >
      <CheckCircle2 size={16} />
      <span className='text-sm font-medium'>You&apos;re on the list!</span>
     </div>
    ) : (
     <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto'
     >
      <div className='flex-1 w-full'>
       <input
        {...register('email')}
        type='email'
        autoComplete='email'
        placeholder='you@company.io'
        className='w-full h-11 px-4 rounded-[10px] border text-sm outline-none transition-colors'
        style={{
         background: 'var(--color-canvas)',
         borderColor: errors.email
          ? 'var(--color-danger)'
          : 'var(--color-border)',
         color: 'var(--color-ink)',
        }}
       />
       {errors.email && (
        <p
         className='mt-1 text-xs text-left'
         style={{ color: 'var(--color-danger)' }}
        >
         {errors.email.message}
        </p>
       )}
      </div>
      <button
       type='submit'
       disabled={isSubmitting}
       className='h-11 px-5 inline-flex items-center gap-2 text-[14px] font-medium rounded-[10px] text-white shrink-0 transition-opacity disabled:opacity-60'
       style={{ background: 'var(--color-accent)' }}
      >
       {isSubmitting ? (
        'Joining…'
       ) : (
        <>
         Notify me <ArrowRight size={14} />
        </>
       )}
      </button>
     </form>
    )}
   </div>
  </section>
 );
}

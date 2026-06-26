import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useJoinWaitlist } from '../../api/waitlist';
import { ApiError } from '../../api/errors';

interface Props {
 size?: 'sm' | 'md';
 variant?: 'on-surface' | 'on-canvas';
}

export function WaitlistForm({ size = 'md', variant = 'on-canvas' }: Props) {
 const [email, setEmail] = useState('');
 const [error, setError] = useState<string | null>(null);
 const join = useJoinWaitlist();

 const inputBg = variant === 'on-surface' ? 'bg-canvas' : 'bg-surface';

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
   setError('Please enter a valid email.');
   return;
  }
  try {
   await join.mutateAsync({ email: email.trim() });
  } catch (err) {
   const msg =
    err instanceof ApiError
     ? err.message
     : 'Something went wrong. Please try again.';
   setError(msg);
  }
 }

 if (join.isSuccess) {
  return (
   <div className='inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-ok/30 bg-ok-dim text-ok'>
    <CheckCircle2 size={16} />
    <span className='text-sm font-medium'>
     You're on the list. Check your inbox.
    </span>
   </div>
  );
 }

 const sizing = size === 'sm' ? 'h-10 px-4 text-sm' : 'h-11 px-5 text-sm';

 return (
  <form
   onSubmit={handleSubmit}
   className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-md mx-auto'
  >
   <input
    type='email'
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder='you@work.com'
    aria-label='Email'
    className={`flex-1 ${sizing} ${inputBg} rounded-lg border border-line text-ink-primary placeholder:text-ink-dim px-3 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all`}
   />
   <button
    type='submit'
    disabled={join.isPending}
    className={`${sizing} inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
   >
    {join.isPending ? 'Joining…' : 'Join waitlist'}
    {!join.isPending && <ArrowRight size={14} />}
   </button>
   {error && (
    <div className='flex items-center gap-1.5 text-xs text-danger sm:basis-full'>
     <AlertCircle size={12} />
     <span>{error}</span>
    </div>
   )}
  </form>
 );
}

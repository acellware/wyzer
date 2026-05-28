import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useCreateBillingPortalSession } from '../../api/billing';

export default function BillingPage() {
 const portal = useCreateBillingPortalSession();

 const handleOpenPortal = async () => {
  try {
   const { url } = await portal.mutateAsync();
   window.open(url, '_blank', 'noopener');
  } catch {
   /* handled by portal.error */
  }
 };

 return (
  <div className='px-6 py-10 max-w-2xl mx-auto'>
   <div className='mb-8'>
    <h1
     className='text-[22px] font-semibold tracking-tight mb-1'
     style={{ color: 'var(--color-ink)' }}
    >
     Billing
    </h1>
    <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
     Manage your subscription and payment details.
    </p>
   </div>

   <div
    className='rounded-xl border p-6'
    style={{
     background: 'var(--color-surface)',
     borderColor: 'var(--color-border-subtle)',
    }}
   >
    <div className='flex items-center gap-3 mb-4'>
     <div
      className='w-10 h-10 rounded-xl flex items-center justify-center'
      style={{ background: 'var(--color-accent-soft)' }}
     >
      <CreditCard size={18} style={{ color: 'var(--color-accent-ink)' }} />
     </div>
     <div>
      <p
       className='text-[14px] font-semibold'
       style={{ color: 'var(--color-ink)' }}
      >
       Free plan
      </p>
      <p className='text-[13px]' style={{ color: 'var(--color-muted)' }}>
       Unlimited stacks · All frameworks
      </p>
     </div>
    </div>

    {portal.error && (
     <p className='text-[13px] mb-3' style={{ color: 'hsl(0 80% 50%)' }}>
      Could not open billing portal. Please try again.
     </p>
    )}

    <button
     type='button'
     onClick={handleOpenPortal}
     disabled={portal.isPending}
     className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors disabled:opacity-50'
     style={{
      borderColor: 'var(--color-border)',
      color: 'var(--color-body)',
     }}
    >
     {portal.isPending ? (
      <Loader2 size={14} className='animate-spin' />
     ) : (
      <ExternalLink size={14} />
     )}
     Open billing portal
    </button>
   </div>
  </div>
 );
}

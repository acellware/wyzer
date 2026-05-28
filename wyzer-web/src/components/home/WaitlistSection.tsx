import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function WaitlistSection() {
 return (
  <section
   className='py-[var(--section-gap)] border-b'
   style={{
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border-subtle)',
   }}
  >
   <div className='max-w-[1240px] mx-auto px-6 text-center'>
    <div
     className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium mb-6'
     style={{
      background: 'var(--color-accent-soft)',
      borderColor: 'var(--color-accent-soft)',
      color: 'var(--color-accent-ink)',
     }}
    >
     <ShieldCheck size={13} />
     Free — no credit card required
    </div>

    <h2
     className='text-display-3 balance mb-4 mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '580px' }}
    >
     Check your compliance status for free.
    </h2>
    <p
     className='text-[16px] leading-[1.6] mb-8 mx-auto'
     style={{ color: 'var(--color-body)', maxWidth: '460px' }}
    >
     Map your full tech stack to SOC 2, ISO 27001, GDPR and more in minutes.
     Free forever for your first workspace.
    </p>

    <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
     <Link
      to='/register'
      className='h-11 px-6 inline-flex items-center gap-2 text-[14px] font-medium rounded-[10px] text-white transition-opacity hover:opacity-90'
      style={{ background: 'var(--color-accent)' }}
     >
      Try for free <ArrowRight size={14} />
     </Link>
     <Link
      to='/login'
      className='h-11 px-6 inline-flex items-center text-[14px] font-medium rounded-[10px] border transition-colors'
      style={{
       borderColor: 'var(--color-border)',
       color: 'var(--color-body)',
      }}
     >
      Sign in
     </Link>
    </div>

    <p className='mt-4 text-[12px]' style={{ color: 'var(--color-muted)' }}>
     HIPAA, PCI-DSS, NDPR and more frameworks coming soon.
    </p>
   </div>
  </section>
 );
}

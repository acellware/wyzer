import { WaitlistForm } from './WaitlistForm';

export function CtaSection() {
 return (
  <section id='waitlist' className='py-20 sm:py-24 bg-dots'>
   <div className='max-w-[1240px] mx-auto px-6 text-center'>
    <h2
     className='text-display-3 balance mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '600px' }}
    >
     Stop auditing once a year. Start auditing continuously.
    </h2>
    <div className='mt-8 flex flex-col items-center gap-4'>
     <WaitlistForm />
     <p
      className='font-mono text-[11px]'
      style={{ color: 'var(--color-muted)' }}
     >
      Limited early-access cohort. Founding pricing locked in for life.
     </p>
    </div>
   </div>
  </section>
 );
}

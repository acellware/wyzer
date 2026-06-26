import { WaitlistForm } from './WaitlistForm';

export function CtaSection() {
 return (
  <section id='waitlist' className='py-[var(--section-gap)] bg-dots'>
   <div className='max-w-[1240px] mx-auto px-6 text-center'>
    <p
     className='font-mono text-[12px] mb-8'
     style={{ color: 'var(--color-muted)' }}
    >
     ready when you are
    </p>
    <h2
     className='text-display-2 balance mb-6 mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '640px' }}
    >
     Stop auditing once a year. Start auditing continuously.
    </h2>
    <p
     className='text-[18px] leading-[1.6] mb-10 mx-auto'
     style={{ color: 'var(--color-body)', maxWidth: '520px' }}
    >
     Join the waitlist for the Wyzer agent and dashboard, or run a free
     60-second preview to see how it works.
    </p>
    <div className='flex flex-col items-center gap-4'>
     <WaitlistForm />
     <a
      href='/check'
      className='text-[14px] transition-colors'
      style={{ color: 'var(--color-muted)' }}
     >
      Or run a free preview →
     </a>
    </div>
    <p
     className='mt-8 font-mono text-[11px]'
     style={{ color: 'var(--color-muted)' }}
    >
     Limited early-access cohort. Founding pricing locked in for life.
    </p>
   </div>
  </section>
 );
}

import { ArrowRight } from 'lucide-react';
import { AgentRunMockup } from './AgentRunMockup';

const FRAMEWORKS = ['SOC 2', 'ISO 27001', 'GDPR', 'PCI-DSS', 'HIPAA', 'NDPR'];

export function HeroSection() {
 return (
  <section
   className='pt-[var(--nav-height)] pb-[var(--section-gap)]'
   style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
  >
   <div className='max-w-[1240px] mx-auto px-6 pt-20 text-center'>
    <p
     className='font-mono text-[12px] mb-8'
     style={{ color: 'var(--color-muted)' }}
    >
     continuous compliance for engineering teams
    </p>
    <h1
     className='text-display-1 balance mb-6 mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '840px' }}
    >
     Your real stack.{' '}
     <span style={{ color: 'var(--color-accent)' }}>Continuously</span>{' '}
     audit-ready.
    </h1>
    <p
     className='text-[18px] leading-[1.65] mb-10 mx-auto'
     style={{ color: 'var(--color-body)', maxWidth: '600px' }}
    >
     The Wyzer agent runs in your CI, on a laptop, or as a scheduled job. It
     inspects your real infrastructure and ships continuous evidence for
     SOC&nbsp;2, ISO&nbsp;27001, GDPR, PCI&#8209;DSS, HIPAA, and NDPR.
    </p>
    <div className='flex flex-wrap gap-3 justify-center mb-10'>
     <a
      href='#waitlist'
      className='h-12 px-5 inline-flex items-center gap-2 text-[15px] font-medium rounded-[10px] text-white transition-colors'
      style={{ background: 'var(--color-accent)' }}
      onMouseEnter={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.background =
        'var(--color-accent-ink)')
      }
      onMouseLeave={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.background =
        'var(--color-accent)')
      }
     >
      Join the waitlist <ArrowRight size={16} />
     </a>
     <a
      href='/navigator'
      className='h-12 px-5 inline-flex items-center text-[15px] rounded-[10px] border transition-colors'
      style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border)' }}
      onMouseEnter={(e) => {
       (e.currentTarget as HTMLAnchorElement).style.background =
        'var(--color-raised)';
       (e.currentTarget as HTMLAnchorElement).style.borderColor =
        'var(--color-ink)';
      }}
      onMouseLeave={(e) => {
       (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
       (e.currentTarget as HTMLAnchorElement).style.borderColor =
        'var(--color-border)';
      }}
     >
      Explore the Navigator
     </a>
    </div>
    <p
     className='font-mono text-[11px] mb-2.5'
     style={{ color: 'var(--color-muted)' }}
    >
     6 frameworks covered
    </p>
    <div className='flex flex-wrap gap-2 justify-center'>
     {FRAMEWORKS.map((f) => (
      <span
       key={f}
       className='font-mono text-[12px] px-2.5 py-1 rounded-md'
       style={{
        color: 'var(--color-muted)',
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
       }}
      >
       {f}
      </span>
     ))}
    </div>

    {/* Agent run, beneath the copy */}
    <div className='mt-16 mx-auto' style={{ maxWidth: '900px' }}>
     <AgentRunMockup />
    </div>
   </div>
  </section>
 );
}

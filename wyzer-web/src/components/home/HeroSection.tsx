import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AgentRunMockup } from './AgentRunMockup';

const FRAMEWORKS = ['SOC 2', 'ISO 27001', 'GDPR', 'PCI-DSS', 'HIPAA', 'NDPR'];

export function HeroSection() {
 return (
  <section
   className='pt-[var(--nav-height)] pb-[var(--section-gap)]'
   style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
  >
   <div className='max-w-[1240px] mx-auto px-6 pt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
    {/* Left */}
    <div>
     <p
      className='font-mono text-[12px] mb-8'
      style={{ color: 'var(--color-muted)' }}
     >
      continuous compliance for engineering teams
     </p>
     <h1
      className='text-display-1 balance mb-6'
      style={{ color: 'var(--color-ink)' }}
     >
      Your real stack.{' '}
      <span style={{ color: 'var(--color-accent)' }}>Continuously</span>{' '}
      audit-ready.
     </h1>
     <p
      className='text-[18px] leading-[1.65] mb-10 max-w-[480px]'
      style={{ color: 'var(--color-body)' }}
     >
      The Wyzer agent runs in your CI, on a laptop, or as a scheduled job.
      It inspects your real infrastructure and ships continuous evidence
      for SOC&nbsp;2, ISO&nbsp;27001, GDPR, PCI&#8209;DSS, HIPAA, and NDPR.
     </p>
     <div className='flex flex-wrap gap-3 mb-12'>
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
      <Link
       to='/check'
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
       Try the free preview
      </Link>
     </div>
     <p
      className='font-mono text-[11px] mb-2.5'
      style={{ color: 'var(--color-muted)' }}
     >
      6 frameworks covered
     </p>
     <div className='flex flex-wrap gap-2'>
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
    </div>

    {/* Right — Agent run */}
    <div>
     <AgentRunMockup />
    </div>
   </div>
  </section>
 );
}

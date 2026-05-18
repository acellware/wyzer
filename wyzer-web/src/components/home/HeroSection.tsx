import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScoreCardMockup } from './ScoreCardMockup';

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
      compliance intelligence
     </p>
     <h1
      className='text-display-1 balance mb-6'
      style={{ color: 'var(--color-ink)' }}
     >
      Your stack. <span style={{ color: 'var(--color-accent)' }}>Scored</span>{' '}
      against every standard.
     </h1>
     <p
      className='text-[18px] leading-[1.65] mb-10 max-w-[480px]'
      style={{ color: 'var(--color-body)' }}
     >
      Describe your infrastructure once. Wyzer maps it to SOC&nbsp;2,
      ISO&nbsp;27001, GDPR, PCI&#8209;DSS, HIPAA, and NDPR — then shows you
      exactly what to fix.
     </p>
     <div className='flex flex-wrap gap-3 mb-12'>
      <Link
       to='/register'
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
       Get your free score <ArrowRight size={16} />
      </Link>
      <a
       href='#how'
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
       See how it works
      </a>
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

    {/* Right — Score card */}
    <div>
     <ScoreCardMockup />
    </div>
   </div>
  </section>
 );
}

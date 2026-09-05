import { ArrowRight } from 'lucide-react';

const FRAMEWORKS = ['NIST', 'SOC 2', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI DSS', 'FDA'];

export function NavigatorCtaSection() {
 return (
  <section className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <div
     className='rounded-2xl border px-8 py-14 sm:px-14'
     style={{
      borderColor: 'var(--color-border-subtle)',
      background: 'var(--color-surface)',
     }}
    >
     <div className='max-w-[680px]'>
      <p
       className='font-mono text-[12px] mb-5'
       style={{ color: 'var(--color-muted)' }}
      >
       the free reference
      </p>
      <h2 className='text-display-2 balance' style={{ color: 'var(--color-ink)' }}>
       See what every framework actually requires.
      </h2>
      <p
       className='mt-5 text-[16px] leading-[1.6] max-w-[560px]'
       style={{ color: 'var(--color-body)' }}
      >
       Browse by cloud service or by industry and read the plain-language
       requirements from every major framework, side by side. No signup, no
       sales call.
      </p>
      <a
       href='/navigator'
       className='mt-8 h-12 px-5 inline-flex items-center gap-2 text-[15px] font-medium rounded-[10px] text-white transition-colors'
       style={{ backgroundColor: 'var(--color-accent)' }}
       onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
         'var(--color-accent-ink)')
       }
       onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
         'var(--color-accent)')
       }
      >
       Explore the Navigator <ArrowRight size={16} />
      </a>
      <div className='mt-8 flex flex-wrap gap-2'>
       {FRAMEWORKS.map((f) => (
        <span
         key={f}
         className='font-mono text-[12px] px-2.5 py-1 rounded-md'
         style={{
          color: 'var(--color-muted)',
          border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-page)',
         }}
        >
         {f}
        </span>
       ))}
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}

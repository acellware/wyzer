import { Link } from 'react-router-dom';

const cols = [
 {
  heading: 'Product',
  links: [
   { label: 'Why Wyzer', href: '#why' },
   { label: 'Frameworks', href: '#frameworks' },
   { label: 'Features', href: '#features' },
   { label: 'Pricing', href: '#pricing' },
  ],
 },
 {
  heading: 'Frameworks',
  links: [
   { label: 'SOC 2 Type II', href: '#' },
   { label: 'ISO 27001', href: '#' },
   { label: 'GDPR', href: '#' },
   { label: 'PCI-DSS 4.0', href: '#' },
   { label: 'HIPAA', href: '#' },
   { label: 'NDPR', href: '#' },
  ],
 },
 {
  heading: 'Open Spec',
  links: [
   { label: 'Overview', href: '#' },
   { label: 'GitHub', href: '#' },
   { label: 'Roadmap', href: '#' },
  ],
 },
 {
  heading: 'Legal',
  links: [
   { label: 'Privacy', href: '/privacy' },
   { label: 'Terms', href: '/terms' },
   { label: 'Cookie policy', href: '/cookies' },
  ],
 },
];

const linkBase = { color: 'var(--color-body)' };
const linkHover = { color: 'var(--color-ink)' };

export function Footer() {
 return (
  <footer
   className='border-t'
   style={{
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border-subtle)',
   }}
  >
   {/* Final CTA */}
   <div className='max-w-[1240px] mx-auto px-6 py-24'>
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-end'>
     <div className='lg:col-span-8'>
      <p
       className='font-mono text-[12px] mb-5'
       style={{ color: 'var(--color-muted)' }}
      >
       ready when you are
      </p>
      <h2
       className='text-display-2 balance'
       style={{ color: 'var(--color-ink)' }}
      >
       Know your compliance score.
       <br />
       Start for free.
      </h2>
     </div>
     <div className='lg:col-span-4 flex flex-wrap gap-3 lg:justify-end'>
      <a
       href='#waitlist'
       className='h-12 px-5 inline-flex items-center text-[15px] font-medium rounded-[10px] text-white transition-colors'
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
       Join waitlist
      </a>
      <Link
       to='/check'
       className='h-12 px-5 inline-flex items-center text-[15px] rounded-[10px] border transition-colors'
       style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border)' }}
       onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
         'var(--color-raised)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
         'var(--color-ink)';
       }}
       onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
         'transparent';
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
         'var(--color-border)';
       }}
      >
       Free check
      </Link>
     </div>
    </div>
   </div>

   {/* Link grid */}
   <div
    className='border-t'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <div className='max-w-[1240px] mx-auto px-6 py-14'>
     <div className='grid grid-cols-2 md:grid-cols-5 gap-10'>
      <div className='col-span-2 md:col-span-1'>
       <Link to='/' className='flex items-center gap-2 mb-3'>
        <WyzerMark />
        <span
         className='text-[15px] font-semibold tracking-[-0.01em]'
         style={{ color: 'var(--color-ink)' }}
        >
         wyzer
        </span>
       </Link>
       <p
        className='text-[13px] leading-[1.55] max-w-[220px]'
        style={{ color: 'var(--color-muted)' }}
       >
        Compliance intelligence for your stack. Free on one stack forever.
       </p>
      </div>
      {cols.map((col) => (
       <div key={col.heading}>
        <p
         className='font-mono text-[11px] mb-4'
         style={{ color: 'var(--color-muted)' }}
        >
         {col.heading}
        </p>
        <ul className='space-y-2.5'>
         {col.links.map((l) => (
          <li key={l.label}>
           {l.href.startsWith('/') ? (
            <Link
             to={l.href}
             className='text-[13.5px] transition-colors'
             style={linkBase}
             onMouseEnter={(e) =>
              Object.assign(
               (e.currentTarget as HTMLAnchorElement).style,
               linkHover,
              )
             }
             onMouseLeave={(e) =>
              Object.assign(
               (e.currentTarget as HTMLAnchorElement).style,
               linkBase,
              )
             }
            >
             {l.label}
            </Link>
           ) : (
            <a
             href={l.href}
             className='text-[13.5px] transition-colors'
             style={linkBase}
             onMouseEnter={(e) =>
              Object.assign(
               (e.currentTarget as HTMLAnchorElement).style,
               linkHover,
              )
             }
             onMouseLeave={(e) =>
              Object.assign(
               (e.currentTarget as HTMLAnchorElement).style,
               linkBase,
              )
             }
            >
             {l.label}
            </a>
           )}
          </li>
         ))}
        </ul>
       </div>
      ))}
     </div>
     <div
      className='mt-14 pt-6 border-t flex flex-col md:flex-row justify-between gap-3'
      style={{ borderColor: 'var(--color-border-subtle)' }}
     >
      <p
       className='font-mono text-[11px]'
       style={{ color: 'var(--color-muted)' }}
      >
       © {new Date().getFullYear()} Wyzer · Wyzer Open Spec is Apache-2.0
      </p>
      <p
       className='font-mono text-[11px]'
       style={{ color: 'var(--color-muted)' }}
      >
       built for engineers
      </p>
     </div>
    </div>
   </div>
  </footer>
 );
}

function WyzerMark() {
 return (
  <svg width='20' height='20' viewBox='0 0 24 24' aria-hidden fill='none'>
   <rect
    x='0.5'
    y='0.5'
    width='23'
    height='23'
    rx='6'
    fill='var(--color-accent)'
   />
   <path
    d='M6 17L9.5 7H11.5L14 13.2L16.5 7H18.5L22 17H19.8L17.5 10.8L15 17H13L10.5 10.8L8.2 17H6Z'
    fill='white'
   />
  </svg>
 );
}

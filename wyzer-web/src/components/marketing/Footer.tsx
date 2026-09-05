import { ArrowUpRight } from 'lucide-react';

type FooterLink = {
 label: string;
 href?: string;
 external?: boolean;
 action?: 'cookie-settings';
};

const cols: { heading: string; links: FooterLink[] }[] = [
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
  heading: 'Learn',
  links: [
   { label: 'Compliance Navigator', href: '/navigator' },
  ],
 },
 {
  heading: 'Legal',
  links: [
   { label: 'Privacy', href: '/privacy' },
   { label: 'Terms', href: '/terms' },
   { label: 'Cookie policy', href: '/cookies' },
   { label: 'Cookie settings', action: 'cookie-settings' },
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
   {/* Link grid */}
   <div
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <div className='max-w-[1240px] mx-auto px-6 py-14'>
     <div className='grid grid-cols-2 md:grid-cols-4 gap-10'>
      <div className='col-span-2 md:col-span-1'>
       <a href='/' className='flex items-center gap-2 mb-3'>
        <WyzerMark />
        <span
         className='text-[15px] font-semibold tracking-[-0.01em]'
         style={{ color: 'var(--color-ink)' }}
        >
         wyzer
        </span>
       </a>
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
         {col.links.map((l) => {
          const cls =
           'text-[13.5px] transition-colors inline-flex items-center gap-1';
          const onEnter = (e: React.MouseEvent<HTMLElement>) =>
           Object.assign(e.currentTarget.style, linkHover);
          const onLeave = (e: React.MouseEvent<HTMLElement>) =>
           Object.assign(e.currentTarget.style, linkBase);
          let node: React.ReactNode;
          if (l.action === 'cookie-settings') {
           node = (
            <button
             type='button'
             onClick={() => (window as unknown as { __wyzerConsent?: { open?: () => void } }).__wyzerConsent?.open?.()}
             className={cls}
             style={{
              ...linkBase,
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              cursor: 'pointer',
             }}
             onMouseEnter={onEnter}
             onMouseLeave={onLeave}
            >
             {l.label}
            </button>
           );
          } else if (l.external && l.href) {
           node = (
            <a
             href={l.href}
             target='_blank'
             rel='noopener noreferrer'
             className={cls}
             style={linkBase}
             onMouseEnter={onEnter}
             onMouseLeave={onLeave}
            >
             {l.label}
             <ArrowUpRight size={12} className='opacity-70' />
            </a>
           );
          } else if (l.href && l.href.startsWith('/')) {
           node = (
            <a
             href={l.href}
             className={cls}
             style={linkBase}
             onMouseEnter={onEnter}
             onMouseLeave={onLeave}
            >
             {l.label}
            </a>
           );
          } else {
           node = (
            <a
             href={l.href}
             className={cls}
             style={linkBase}
             onMouseEnter={onEnter}
             onMouseLeave={onLeave}
            >
             {l.label}
            </a>
           );
          }
          return <li key={l.label}>{node}</li>;
         })}
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
       © {new Date().getFullYear()} Wyzer · All rights reserved
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
     fill='var(--color-brand)'
    />
   <path
    d='M6 17L9.5 7H11.5L14 13.2L16.5 7H18.5L22 17H19.8L17.5 10.8L15 17H13L10.5 10.8L8.2 17H6Z'
    fill='white'
   />
  </svg>
 );
}

import { Link } from 'react-router-dom';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { Seo } from '@components/Seo';

interface LegalLayoutProps {
 kicker: string;
 title: string;
 lastUpdated: string;
 path: string;
 description?: string;
 children: React.ReactNode;
}

export function LegalLayout({
 kicker,
 title,
 lastUpdated,
 path,
 description,
 children,
}: LegalLayoutProps) {
 return (
  <div style={{ background: 'var(--color-page)', minHeight: '100vh' }}>
   <Seo title={title} description={description} path={path} />
   {/* Minimal nav */}
   <header
    className='sticky top-0 z-40 border-b'
    style={{
     background: 'var(--color-page)',
     borderColor: 'var(--color-border-subtle)',
    }}
   >
    <div className='max-w-[1240px] mx-auto px-6 h-14 flex items-center justify-between'>
     <Link to='/' className='flex items-center gap-2'>
      <WyzerMark />
      <span
       className='text-[15px] font-semibold tracking-[-0.01em]'
       style={{ color: 'var(--color-ink)' }}
      >
       wyzer
      </span>
     </Link>
     <ThemeToggle />
    </div>
   </header>

   {/* Hero */}
   <div
    className='border-b'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <div className='max-w-[860px] mx-auto px-6 py-16'>
     <p
      className='font-mono text-[12px] mb-4'
      style={{ color: 'var(--color-muted)' }}
     >
      {kicker}
     </p>
     <h1
      className='text-display-3 balance mb-4'
      style={{ color: 'var(--color-ink)' }}
     >
      {title}
     </h1>
     <p
      className='font-mono text-[12px]'
      style={{ color: 'var(--color-muted)' }}
     >
      Last updated: {lastUpdated}
     </p>
    </div>
   </div>

   {/* Body */}
   <main id='main-content' className='max-w-[860px] mx-auto px-6 py-14'>
    <div className='prose-legal'>{children}</div>
   </main>

   {/* Footer */}
   <footer
    className='border-t mt-16'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <div className='max-w-[1240px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
     <p
      className='font-mono text-[11px]'
      style={{ color: 'var(--color-muted)' }}
     >
      © {new Date().getFullYear()} Wyzer
     </p>
     <div className='flex gap-5'>
      {[
       { label: 'Privacy', href: '/privacy' },
       { label: 'Terms', href: '/terms' },
       { label: 'Cookies', href: '/cookies' },
      ].map((l) => (
       <Link
        key={l.label}
        to={l.href}
        className='font-mono text-[11px] transition-colors'
        style={{ color: 'var(--color-muted)' }}
        onMouseEnter={(e) =>
         ((e.currentTarget as HTMLAnchorElement).style.color =
          'var(--color-ink)')
        }
        onMouseLeave={(e) =>
         ((e.currentTarget as HTMLAnchorElement).style.color =
          'var(--color-muted)')
        }
       >
        {l.label}
       </Link>
      ))}
     </div>
    </div>
   </footer>
  </div>
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

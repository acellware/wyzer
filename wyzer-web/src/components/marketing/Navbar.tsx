import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
 { label: 'Why', href: '#why' },
 { label: 'Frameworks', href: '#frameworks' },
 { label: 'Features', href: '#features' },
 { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);

 useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
 }, []);

  return (
   <>
    <a
     href='#main-content'
     className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[80] focus:rounded-md focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium'
     style={{
      background: 'var(--color-surface)',
      color: 'var(--color-ink)',
      border: '1px solid var(--color-border)',
     }}
    >
     Skip to content
    </a>
    <header
     className={`sticky top-0 z-40 border-b transition-colors ${
      scrolled ? 'border-[var(--color-border-subtle)]' : 'border-transparent'
     }`}
     style={{
      backgroundColor: scrolled
       ? 'color-mix(in srgb, var(--color-page) 88%, transparent)'
       : 'transparent',
      backdropFilter: scrolled ? 'blur(6px)' : 'none',
     }}
    >
   <div className='max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between'>
    {/* Logo */}
    <a href='/' className='flex items-center gap-2 group'>
     <WyzerMark />
     <span
      className='text-[15px] font-semibold tracking-[-0.01em]'
      style={{ color: 'var(--color-ink)' }}
     >
      wyzer
     </span>
     <span
      className='hidden sm:block font-mono text-[11px] px-1.5 py-0.5 rounded border'
      style={{
       color: 'var(--color-accent-ink)',
       borderColor: 'var(--color-accent-soft)',
       backgroundColor: 'var(--color-accent-soft)',
      }}
     >
      beta
     </span>
    </a>

    {/* Desktop nav */}
    <nav className='hidden md:flex items-center gap-1'>
     {navLinks.map((it) => (
      <a
       key={it.href}
       href={it.href}
       className='group relative px-3 h-9 inline-flex items-center text-[14px] rounded-md transition-colors'
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
       <span className='relative'>
        {it.label}
        <span
         aria-hidden
         className='pointer-events-none absolute left-0 right-0 -bottom-1 h-px origin-left scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-200 ease-out'
         style={{ backgroundColor: 'var(--color-accent)' }}
        />
       </span>
      </a>
     ))}
     <a
      href='/navigator'
      className='group relative px-3 h-9 inline-flex items-center gap-1 text-[14px] rounded-md transition-colors'
      style={{ color: 'var(--color-muted)' }}
      onMouseEnter={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-ink)')
      }
      onMouseLeave={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.color =
        'var(--color-muted)')
      }
     >
      Navigator
     </a>
    </nav>

    {/* Right side */}
    <div className='flex items-center gap-1.5'>
     <a
      href='#waitlist'
      className='h-9 px-4 inline-flex items-center text-[13px] font-medium rounded-[8px] transition-colors text-white'
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
     <button
      className='md:hidden h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors'
      style={{ color: 'var(--color-muted)' }}
      onClick={() => setMobileOpen((o) => !o)}
      aria-label='Toggle menu'
     >
      {mobileOpen ? <X size={18} /> : <Menu size={18} />}
     </button>
    </div>
   </div>

   {/* Mobile menu */}
   {mobileOpen && (
    <div
     className='md:hidden border-t px-6 py-4'
     style={{
      backgroundColor: 'var(--color-page)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <nav className='flex flex-col gap-0.5 mb-4'>
      {navLinks.map((l) => (
       <a
        key={l.href}
        href={l.href}
        onClick={() => setMobileOpen(false)}
        className='py-2.5 text-[14px] transition-colors'
        style={{ color: 'var(--color-body)' }}
       >
        {l.label}
       </a>
      ))}
      <a
       href='/navigator'
       onClick={() => setMobileOpen(false)}
       className='py-2.5 text-[14px] inline-flex items-center gap-1 transition-colors'
       style={{ color: 'var(--color-body)' }}
      >
       Compliance Navigator
      </a>
     </nav>
     <div
      className='pt-4 flex flex-col gap-2 border-t'
      style={{ borderColor: 'var(--color-border-subtle)' }}
     >
      <a
       href='#waitlist'
       onClick={() => setMobileOpen(false)}
       className='h-10 px-4 inline-flex items-center justify-center text-[14px] font-medium rounded-lg text-white'
       style={{ backgroundColor: 'var(--color-accent)' }}
      >
       Join waitlist
      </a>
     </div>
     </div>
    )}
   </header>
   </>
  );
}

function WyzerMark() {
 return (
  <svg width='24' height='24' viewBox='0 0 24 24' aria-hidden fill='none'>
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

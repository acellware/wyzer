import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CtaSection() {
 return (
  <section className='py-[var(--section-gap)] bg-dots'>
   <div className='max-w-[1240px] mx-auto px-6 text-center'>
    <p className='font-mono text-[12px] mb-8' style={{ color: 'var(--color-muted)' }}>
     ready when you are
    </p>
    <h2
     className='text-display-2 balance mb-6 mx-auto'
     style={{ color: 'var(--color-ink)', maxWidth: '640px' }}
    >
     Know your compliance score today.
    </h2>
    <p
     className='text-[18px] leading-[1.6] mb-10 mx-auto'
     style={{ color: 'var(--color-body)', maxWidth: '480px' }}
    >
     Free forever on one stack. No credit card required.
    </p>
    <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
     <Link
      to='/register'
      className='h-12 px-6 inline-flex items-center gap-2 text-[15px] font-medium rounded-[10px] text-white transition-colors'
      style={{ background: 'var(--color-accent)' }}
      onMouseEnter={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent-ink)')
      }
      onMouseLeave={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent)')
      }
     >
      Get your free score <ArrowRight size={16} />
     </Link>
     <Link
      to='/login'
      className='text-[14px] transition-colors'
      style={{ color: 'var(--color-muted)' }}
      onMouseEnter={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-ink)')
      }
      onMouseLeave={(e) =>
       ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)')
      }
     >
      Already have an account? Sign in →
     </Link>
    </div>
   </div>
  </section>
 );
}

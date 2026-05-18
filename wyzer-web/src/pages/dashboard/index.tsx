import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
 return (
  <div
   className='min-h-screen flex items-center justify-center px-4'
   style={{ background: 'var(--color-page)' }}
  >
   <div className='text-center max-w-sm'>
    <div
     className='w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5'
     style={{
      background: 'var(--color-accent-soft)',
      border: '1px solid var(--color-border-subtle)',
     }}
    >
     <LayoutDashboard size={20} style={{ color: 'var(--color-accent-ink)' }} />
    </div>
    <h1
     className='text-[22px] font-semibold mb-2 tracking-tight'
     style={{ color: 'var(--color-ink)' }}
    >
     Dashboard
    </h1>
    <p
     className='text-[14px] mb-6 leading-[1.6]'
     style={{ color: 'var(--color-muted)' }}
    >
     Coming soon — compliance scores and stack management (T-010+)
    </p>
    <Link
     to='/'
     className='inline-flex items-center text-[14px] font-medium border rounded-lg px-4 py-2 transition-colors'
     style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border)' }}
     onMouseEnter={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-raised)';
     }}
     onMouseLeave={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
     }}
    >
     ← Back to home
    </Link>
   </div>
  </div>
 );
}

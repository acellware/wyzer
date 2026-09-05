import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import {
 LayoutDashboard,
 Layers,
 FileText,
 Settings,
 Users,
 CreditCard,
 User,
 LogOut,
 Menu,
 X,
 ShieldCheck,
} from 'lucide-react';
import { useLogout } from '../../api/auth';
import { authStore } from '../../store/auth';
import { Seo } from '@components/Seo';

// ── Nav structure ──────────────────────────────────────────────────────────────

const NAV_PRIMARY = [
 { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
 { to: '/stacks', label: 'Stacks', Icon: Layers },
 { to: '/reports', label: 'Reports', Icon: FileText },
];

const NAV_SECONDARY = [
 { to: '/teams', label: 'Teams', Icon: Users },
 { to: '/billing', label: 'Billing', Icon: CreditCard },
 { to: '/settings', label: 'Settings', Icon: Settings },
 { to: '/profile', label: 'Profile', Icon: User },
];

// ── NavItem ────────────────────────────────────────────────────────────────────

function NavItem({
 to,
 label,
 Icon,
 onClick,
}: {
 to: string;
 label: string;
 Icon: React.ElementType;
 onClick?: () => void;
}) {
 return (
  <NavLink
   to={to}
   end={to === '/stacks' ? false : true}
   onClick={onClick}
   className={({ isActive }) =>
    [
     'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors w-full',
     isActive
      ? 'text-[var(--color-accent-ink)] bg-[var(--color-accent-soft)]'
      : 'text-[var(--color-body)] hover:text-[var(--color-ink)] hover:bg-[var(--color-raised)]',
    ].join(' ')
   }
  >
   <Icon size={15} className='shrink-0' />
   {label}
  </NavLink>
 );
}

// ── Sidebar content ────────────────────────────────────────────────────────────

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
 const navigate = useNavigate();
 const logout = useLogout();

 const handleLogout = async () => {
  try {
   await logout.mutateAsync();
  } catch {
   // clear token regardless
  }
  navigate('/login');
 };

 return (
  <div className='flex flex-col h-full'>
   {/* Logo */}
   <div
    className='h-14 px-4 flex items-center border-b shrink-0'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <Link to='/dashboard' className='flex items-center gap-2'>
     <div
      className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
      style={{ background: 'var(--color-accent)' }}
     >
      <ShieldCheck size={14} color='white' />
     </div>
     <span
      className='text-[15px] font-semibold tracking-[-0.01em]'
      style={{ color: 'var(--color-ink)' }}
     >
      wyzer
     </span>
    </Link>
   </div>

   {/* Primary nav */}
   <nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
    <p
     className='px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-1'
     style={{ color: 'var(--color-muted)' }}
    >
     Workspace
    </p>
    {NAV_PRIMARY.map((item) => (
     <NavItem key={item.to} {...item} onClick={onNavClick} />
    ))}
   </nav>

   {/* Secondary nav + logout */}
   <div
    className='p-3 space-y-0.5 border-t'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <p
     className='px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-1'
     style={{ color: 'var(--color-muted)' }}
    >
     Account
    </p>
    {NAV_SECONDARY.map((item) => (
     <NavItem key={item.to} {...item} onClick={onNavClick} />
    ))}

    <button
     type='button'
     onClick={handleLogout}
     disabled={logout.isPending}
     className='flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium w-full transition-colors mt-1 disabled:opacity-50'
     style={{ color: 'var(--color-muted)' }}
     onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.color = 'hsl(0 70% 50%)';
      (e.currentTarget as HTMLButtonElement).style.background =
       'hsl(0 80% 50% / 0.08)';
     }}
     onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
     }}
    >
     <LogOut size={15} className='shrink-0' />
     {logout.isPending ? 'Signing out…' : 'Sign out'}
    </button>
   </div>
  </div>
 );
}

// ── DashboardLayout ────────────────────────────────────────────────────────────

export function DashboardLayout() {
 const [mobileOpen, setMobileOpen] = useState(false);

 // AuthProvider already ran the silent refresh — if no token, user is not logged in
 if (!authStore.getToken()) {
  return <Navigate to='/login' replace />;
 }

 return (
  <div
   className='flex min-h-screen'
   style={{ background: 'var(--color-page)' }}
  >
   <Seo noindex />
   {/* ── Desktop sidebar ────────────────────────────── */}
   <aside
    className='hidden lg:flex flex-col w-[220px] shrink-0 border-r h-screen sticky top-0'
    style={{
     background: 'var(--color-surface)',
     borderColor: 'var(--color-border-subtle)',
    }}
   >
    <SidebarContent />
   </aside>

   {/* ── Mobile overlay ─────────────────────────────── */}
   {mobileOpen && (
    <div
     className='fixed inset-0 z-40 lg:hidden'
     onClick={() => setMobileOpen(false)}
     style={{ background: 'rgba(0,0,0,0.4)' }}
    />
   )}

   {/* ── Mobile drawer ──────────────────────────────── */}
   <aside
    className={[
     'fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col border-r transition-transform duration-200 lg:hidden',
     mobileOpen ? 'translate-x-0' : '-translate-x-full',
    ].join(' ')}
    style={{
     background: 'var(--color-surface)',
     borderColor: 'var(--color-border-subtle)',
    }}
   >
    <SidebarContent onNavClick={() => setMobileOpen(false)} />
   </aside>

   {/* ── Main content ───────────────────────────────── */}
   <div className='flex-1 flex flex-col min-w-0'>
    {/* Mobile top bar */}
    <header
     className='lg:hidden h-14 px-4 flex items-center gap-3 border-b shrink-0'
     style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <button
      type='button'
      onClick={() => setMobileOpen((v) => !v)}
      className='w-8 h-8 flex items-center justify-center rounded-lg transition-colors'
      style={{ color: 'var(--color-body)' }}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={mobileOpen}
     >
      {mobileOpen ? <X size={18} /> : <Menu size={18} />}
     </button>
     <Link to='/dashboard' className='flex items-center gap-2'>
      <div
       className='w-6 h-6 rounded-md flex items-center justify-center'
       style={{ background: 'var(--color-accent)' }}
      >
       <ShieldCheck size={12} color='white' />
      </div>
      <span
       className='text-[14px] font-semibold'
       style={{ color: 'var(--color-ink)' }}
      >
       wyzer
      </span>
     </Link>
    </header>

    {/* Page content */}
    <main id='main-content' className='flex-1 overflow-y-auto'>
     <Outlet />
    </main>
   </div>
  </div>
 );
}

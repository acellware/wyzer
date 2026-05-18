import { useState } from 'react';
import {
 Settings,
 Users,
 CreditCard,
 Mail,
 Trash2,
 Loader2,
 ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
 useOrgMembers,
 usePendingInvites,
 useInviteMember,
 useRemoveMember,
 type MemberRole,
} from '../../api/invitations';
import { useCreateBillingPortalSession } from '../../api/billing';
import { authStore } from '../../store/auth';

const ROLE_LABEL: Record<MemberRole, string> = {
 OWNER: 'Owner',
 ADMIN: 'Admin',
 MEMBER: 'Member',
};

const ROLE_STYLE: Record<MemberRole, React.CSSProperties> = {
 OWNER: {
  color: 'var(--color-accent-ink)',
  background: 'var(--color-accent-soft)',
 },
 ADMIN: {
  color: 'var(--color-positive)',
  background: 'var(--color-positive-soft, #dcfce7)',
 },
 MEMBER: { color: 'var(--color-muted)', background: 'var(--color-raised)' },
};

function getCurrentUserId(): string | null {
 const token = authStore.getToken();
 if (!token) return null;
 try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return (payload.sub as string) ?? null;
 } catch {
  return null;
 }
}

function MembersSection() {
 const { data: members, isLoading } = useOrgMembers();
 const removeMember = useRemoveMember();
 const currentUserId = getCurrentUserId();

 if (isLoading) {
  return (
   <div className='space-y-2'>
    {[1, 2, 3].map((i) => (
     <div key={i} className='h-14 rounded-xl bg-surface animate-pulse' />
    ))}
   </div>
  );
 }

 if (!members || members.length === 0) return null;

 return (
  <div className='space-y-2'>
   {members.map((m) => {
    const canRemove = m.role !== 'OWNER' && m.user.id !== currentUserId;
    return (
     <div
      key={m.id}
      className='flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-line'
     >
      <div className='flex items-center gap-3'>
       <div
        className='w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold uppercase'
        style={{
         background: 'var(--color-raised)',
         color: 'var(--color-muted)',
        }}
       >
        {m.user.firstName[0]}
        {m.user.lastName[0]}
       </div>
       <div>
        <p className='text-[13.5px] font-medium text-ink-primary'>
         {m.user.firstName} {m.user.lastName}
         {m.user.id === currentUserId && (
          <span className='ml-1.5 text-ink-dim text-[11px] font-normal'>
           (you)
          </span>
         )}
        </p>
        <p className='text-[12px] text-ink-muted'>{m.user.email}</p>
       </div>
      </div>
      <div className='flex items-center gap-3'>
       <span
        className='text-[11px] font-mono px-2 py-0.5 rounded-md'
        style={ROLE_STYLE[m.role]}
       >
        {ROLE_LABEL[m.role]}
       </span>
       {canRemove && (
        <button
         onClick={() => {
          if (
           confirm(
            `Remove ${m.user.firstName} ${m.user.lastName} from the organisation?`,
           )
          ) {
           removeMember.mutate(m.user.id);
          }
         }}
         disabled={removeMember.isPending}
         className='p-1.5 rounded-lg text-ink-dim hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50'
         aria-label='Remove member'
        >
         {removeMember.isPending ? (
          <Loader2 size={13} className='animate-spin' />
         ) : (
          <Trash2 size={13} />
         )}
        </button>
       )}
      </div>
     </div>
    );
   })}
  </div>
 );
}

function InviteForm() {
 const [email, setEmail] = useState('');
 const [role, setRole] = useState<MemberRole>('MEMBER');
 const invite = useInviteMember();

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!email.trim()) return;
  invite.mutate(
   { email: email.trim(), role },
   {
    onSuccess: () => {
     setEmail('');
     setRole('MEMBER');
    },
   },
  );
 };

 return (
  <form onSubmit={handleSubmit} className='flex gap-2'>
   <input
    type='email'
    placeholder='colleague@company.com'
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className='flex-1 h-9 px-3 rounded-lg border border-line bg-surface text-[13.5px] text-ink-primary placeholder:text-ink-dim outline-none focus:border-brand transition-colors'
   />
   <select
    value={role}
    onChange={(e) => setRole(e.target.value as MemberRole)}
    className='h-9 px-2.5 rounded-lg border border-line bg-surface text-[13.5px] text-ink-muted outline-none focus:border-brand transition-colors'
   >
    <option value='MEMBER'>Member</option>
    <option value='ADMIN'>Admin</option>
   </select>
   <button
    type='submit'
    disabled={invite.isPending || !email.trim()}
    className='h-9 px-4 rounded-lg text-[13.5px] font-medium border transition-colors disabled:opacity-50'
    style={{
     background: 'var(--color-accent)',
     color: '#fff',
     borderColor: 'var(--color-accent)',
    }}
   >
    {invite.isPending ? (
     <Loader2 size={14} className='animate-spin' />
    ) : (
     'Invite'
    )}
   </button>
  </form>
 );
}

function PendingInvitesSection() {
 const { data: invites } = usePendingInvites();

 if (!invites || invites.length === 0) return null;

 return (
  <div className='mt-4'>
   <p className='text-[12px] font-mono uppercase tracking-widest text-ink-dim mb-2'>
    Pending invites
   </p>
   <div className='space-y-1.5'>
    {invites.map((inv) => (
     <div
      key={inv.id}
      className='flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface border border-line border-dashed'
     >
      <div className='flex items-center gap-2.5'>
       <Mail size={13} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
       <span className='text-[13px] text-ink-muted'>{inv.email}</span>
      </div>
      <span className='text-[11px] font-mono text-ink-dim'>
       {ROLE_LABEL[inv.role]}
      </span>
     </div>
    ))}
   </div>
  </div>
 );
}

export default function SettingsPage() {
 const billingPortal = useCreateBillingPortalSession();

 return (
  <div className='min-h-screen bg-canvas px-6 py-12'>
   <div className='max-w-2xl mx-auto'>
    {/* Header */}
    <div className='flex items-center gap-3 mb-10'>
     <div className='w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center'>
      <Settings size={16} className='text-brand' />
     </div>
     <div>
      <h1 className='text-xl font-semibold text-ink-primary'>Settings</h1>
      <p className='text-sm text-ink-muted'>
       Manage your organisation and billing.
      </p>
     </div>
    </div>

    {/* Members section */}
    <section className='mb-10'>
     <div className='flex items-center gap-2 mb-4'>
      <Users size={15} className='text-ink-dim' />
      <h2 className='text-[15px] font-semibold text-ink-primary'>Members</h2>
     </div>

     <div className='rounded-xl border border-line bg-surface/50 p-5 space-y-4'>
      <MembersSection />
      <div>
       <p className='text-[12px] font-mono uppercase tracking-widest text-ink-dim mb-2'>
        Invite a member
       </p>
       <InviteForm />
      </div>
      <PendingInvitesSection />
     </div>
    </section>

    {/* Billing section */}
    <section className='mb-10'>
     <div className='flex items-center gap-2 mb-4'>
      <CreditCard size={15} className='text-ink-dim' />
      <h2 className='text-[15px] font-semibold text-ink-primary'>Billing</h2>
     </div>

     <div className='rounded-xl border border-line bg-surface/50 p-5'>
      <div className='flex items-start justify-between'>
       <div>
        <p className='text-[13.5px] text-ink-primary font-medium mb-1'>
         Manage subscription
        </p>
        <p className='text-[13px] text-ink-muted leading-relaxed'>
         Update your plan, view invoices, or change payment details via the
         Stripe Customer Portal.
        </p>
       </div>
       <button
        onClick={() => billingPortal.mutate()}
        disabled={billingPortal.isPending}
        className='ml-4 shrink-0 h-9 px-4 rounded-lg text-[13.5px] font-medium border border-line transition-colors hover:border-brand disabled:opacity-50 flex items-center gap-1.5'
        style={{ color: 'var(--color-ink)' }}
       >
        {billingPortal.isPending ? (
         <Loader2 size={13} className='animate-spin' />
        ) : (
         <>
          <ShieldCheck size={13} />
          Manage billing
         </>
        )}
       </button>
      </div>

      <div className='mt-4 border-t border-line pt-4'>
       <p className='text-[13px] text-ink-muted'>
        Need a different plan?{' '}
        <Link to='/pricing' className='text-brand hover:underline'>
         View all plans →
        </Link>
       </p>
      </div>
     </div>
    </section>

    {/* Back link */}
    <Link
     to='/dashboard'
     className='text-[13.5px] transition-colors'
     style={{ color: 'var(--color-muted)' }}
    >
     ← Back to dashboard
    </Link>
   </div>
  </div>
 );
}

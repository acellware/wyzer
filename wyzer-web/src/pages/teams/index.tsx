import { UserPlus, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import {
 useOrgMembers,
 usePendingInvites,
 useInviteMember,
 useRemoveMember,
 type MemberRole,
} from '../../api/invitations';
import { authStore } from '../../store/auth';
import { getErrorMessage } from '../../api/errors';

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
 ADMIN: { color: 'hsl(142 60% 32%)', background: 'hsl(142 60% 95%)' },
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

export default function TeamsPage() {
 const { data: members, isLoading } = useOrgMembers();
 const { data: pending } = usePendingInvites();
 const removeMember = useRemoveMember();
 const inviteMember = useInviteMember();
 const currentUserId = getCurrentUserId();

 const [email, setEmail] = useState('');
 const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
 const [inviteError, setInviteError] = useState<string | null>(null);

 const handleInvite = async (e: React.FormEvent) => {
  e.preventDefault();
  setInviteError(null);
  try {
   await inviteMember.mutateAsync({ email, role });
   setEmail('');
  } catch (err) {
   setInviteError(getErrorMessage(err, 'Failed to send invite.'));
  }
 };

 return (
  <div className='px-6 py-10 max-w-2xl mx-auto'>
   <div className='mb-8'>
    <h1
     className='text-[22px] font-semibold tracking-tight mb-1'
     style={{ color: 'var(--color-ink)' }}
    >
     Teams
    </h1>
    <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
     Invite team members and manage access.
    </p>
   </div>

   {/* Invite form */}
   <div
    className='rounded-xl border p-5 mb-6'
    style={{
     background: 'var(--color-surface)',
     borderColor: 'var(--color-border-subtle)',
    }}
   >
    <h2
     className='text-[14px] font-semibold mb-4'
     style={{ color: 'var(--color-ink)' }}
    >
     Invite member
    </h2>
    <form onSubmit={handleInvite} className='flex flex-col sm:flex-row gap-2'>
     <input
      type='email'
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder='colleague@company.com'
      required
      className='flex-1 h-9 px-3 rounded-lg text-[13px] border outline-none'
      style={{
       background: 'var(--color-page)',
       borderColor: 'var(--color-border)',
       color: 'var(--color-ink)',
      }}
     />
     <select
      value={role}
      onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
      className='h-9 px-3 rounded-lg text-[13px] border outline-none'
      style={{
       background: 'var(--color-page)',
       borderColor: 'var(--color-border)',
       color: 'var(--color-ink)',
      }}
     >
      <option value='MEMBER'>Member</option>
      <option value='ADMIN'>Admin</option>
     </select>
     <button
      type='submit'
      disabled={inviteMember.isPending}
      className='h-9 px-4 rounded-lg text-[13px] font-medium text-white inline-flex items-center gap-2 disabled:opacity-50'
      style={{ background: 'var(--color-accent)' }}
     >
      {inviteMember.isPending ? (
       <Loader2 size={13} className='animate-spin' />
      ) : (
       <UserPlus size={13} />
      )}
      Invite
     </button>
    </form>
    {inviteError && (
     <p className='mt-2 text-[12px]' style={{ color: 'hsl(0 80% 50%)' }}>
      {inviteError}
     </p>
    )}
   </div>

   {/* Members list */}
   <div
    className='rounded-xl border overflow-hidden'
    style={{ borderColor: 'var(--color-border-subtle)' }}
   >
    <div
     className='px-5 py-3 border-b'
     style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <h2
      className='text-[13px] font-semibold'
      style={{ color: 'var(--color-ink)' }}
     >
      Members
     </h2>
    </div>

    {isLoading ? (
     <div className='p-5 space-y-2'>
      {[1, 2].map((i) => (
       <div
        key={i}
        className='h-12 rounded-lg animate-pulse'
        style={{ background: 'var(--color-raised)' }}
       />
      ))}
     </div>
    ) : (
     <ul>
      {(members ?? []).map((m) => (
       <li
        key={m.user.id}
        className='flex items-center justify-between px-5 py-3 border-b last:border-0'
        style={{ borderColor: 'var(--color-border-subtle)' }}
       >
        <div>
         <p
          className='text-[13px] font-medium'
          style={{ color: 'var(--color-ink)' }}
         >
          {m.user.firstName && m.user.lastName
           ? `${m.user.firstName} ${m.user.lastName}`
           : m.user.email}
         </p>
         <p className='text-[12px]' style={{ color: 'var(--color-muted)' }}>
          {m.user.email}
         </p>
        </div>
        <div className='flex items-center gap-2'>
         <span
          className='text-[11px] font-semibold px-2 py-0.5 rounded-full'
          style={ROLE_STYLE[m.role]}
         >
          {ROLE_LABEL[m.role]}
         </span>
         {m.user.id !== currentUserId && m.role !== 'OWNER' && (
          <button
           type='button'
           onClick={() => removeMember.mutate(m.user.id)}
           disabled={removeMember.isPending}
           className='w-6 h-6 flex items-center justify-center rounded-md transition-colors disabled:opacity-40'
           style={{ color: 'var(--color-muted)' }}
          >
           <X size={13} />
          </button>
         )}
        </div>
       </li>
      ))}
     </ul>
    )}
   </div>

   {/* Pending invites */}
   {pending && pending.length > 0 && (
    <div
     className='mt-6 rounded-xl border overflow-hidden'
     style={{ borderColor: 'var(--color-border-subtle)' }}
    >
     <div
      className='px-5 py-3 border-b'
      style={{
       background: 'var(--color-surface)',
       borderColor: 'var(--color-border-subtle)',
      }}
     >
      <h2
       className='text-[13px] font-semibold'
       style={{ color: 'var(--color-ink)' }}
      >
       Pending invitations
      </h2>
     </div>
     <ul>
      {pending.map((inv) => (
       <li
        key={inv.id}
        className='flex items-center justify-between px-5 py-3 border-b last:border-0'
        style={{ borderColor: 'var(--color-border-subtle)' }}
       >
        <div>
         <p
          className='text-[13px] font-medium'
          style={{ color: 'var(--color-ink)' }}
         >
          {inv.email}
         </p>
         <p className='text-[12px]' style={{ color: 'var(--color-muted)' }}>
          Invited · {ROLE_LABEL[inv.role]}
         </p>
        </div>
        <span
         className='text-[11px] font-medium px-2 py-0.5 rounded-full'
         style={{
          color: 'var(--color-muted)',
          background: 'var(--color-raised)',
         }}
        >
         Pending
        </span>
       </li>
      ))}
     </ul>
    </div>
   )}
  </div>
 );
}

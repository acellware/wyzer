import { useState } from 'react';
import { User, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

interface ProfileData {
 id: string;
 firstName: string | null;
 lastName: string | null;
 email: string;
 jobTitle: string | null;
}

function useProfile() {
 return useQuery<ProfileData>({
  queryKey: ['me'],
  queryFn: () => apiClient.get<ProfileData>('/auth/me').then((r) => r.data),
 });
}

function useUpdateProfile() {
 const queryClient = useQueryClient();
 return useMutation({
  mutationFn: (data: Partial<ProfileData>) =>
   apiClient.patch('/auth/me', data).then((r) => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
 });
}

export default function ProfilePage() {
 const { data: profile, isLoading } = useProfile();
 const update = useUpdateProfile();
 const [saved, setSaved] = useState(false);
 const [form, setForm] = useState<{
  firstName: string;
  lastName: string;
  jobTitle: string;
 } | null>(null);

 const current = form ?? {
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  jobTitle: profile?.jobTitle ?? '',
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await update.mutateAsync(current);
  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
  setForm(null);
 };

 return (
  <div className='px-6 py-10 max-w-lg mx-auto'>
   <div className='mb-8'>
    <h1
     className='text-[22px] font-semibold tracking-tight mb-1'
     style={{ color: 'var(--color-ink)' }}
    >
     Profile
    </h1>
    <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
     Update your personal information.
    </p>
   </div>

   {isLoading ? (
    <div className='space-y-3'>
     {[1, 2, 3].map((i) => (
      <div
       key={i}
       className='h-12 rounded-xl animate-pulse'
       style={{ background: 'var(--color-surface)' }}
      />
     ))}
    </div>
   ) : (
    <form
     onSubmit={handleSubmit}
     className='rounded-xl border p-6 space-y-4'
     style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <div className='flex items-center gap-3 mb-2'>
      <div
       className='w-10 h-10 rounded-full flex items-center justify-center'
       style={{ background: 'var(--color-accent-soft)' }}
      >
       <User size={18} style={{ color: 'var(--color-accent-ink)' }} />
      </div>
      <p className='text-[13px]' style={{ color: 'var(--color-muted)' }}>
       {profile?.email}
      </p>
     </div>

     {(
      [
       { key: 'firstName', label: 'First name' },
       { key: 'lastName', label: 'Last name' },
       { key: 'jobTitle', label: 'Job title' },
      ] as const
     ).map(({ key, label }) => (
      <div key={key} className='space-y-1.5'>
       <label
        className='block text-[12px] font-medium'
        style={{ color: 'var(--color-body)' }}
       >
        {label}
       </label>
       <input
        type='text'
        value={current[key]}
        onChange={(e) =>
         setForm((prev) => ({
          ...(prev ?? current),
          [key]: e.target.value,
         }))
        }
        className='w-full h-9 px-3 rounded-lg text-[13px] border outline-none'
        style={{
         background: 'var(--color-page)',
         borderColor: 'var(--color-border)',
         color: 'var(--color-ink)',
        }}
       />
      </div>
     ))}

     <div className='flex items-center gap-3 pt-2'>
      <button
       type='submit'
       disabled={update.isPending || form === null}
       className='h-9 px-4 rounded-lg text-[13px] font-medium text-white inline-flex items-center gap-2 disabled:opacity-50 transition-opacity'
       style={{ background: 'var(--color-accent)' }}
      >
       {update.isPending && <Loader2 size={13} className='animate-spin' />}
       Save changes
      </button>
      {saved && (
       <span
        className='flex items-center gap-1.5 text-[13px]'
        style={{ color: 'hsl(142 60% 32%)' }}
       >
        <CheckCircle2 size={14} />
        Saved
       </span>
      )}
     </div>
    </form>
   )}
  </div>
 );
}

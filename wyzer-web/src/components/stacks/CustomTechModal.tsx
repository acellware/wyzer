import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
 onClose: () => void;
 onAdd: (name: string, category: string) => void;
 isSubmitting?: boolean;
}

const CATEGORIES = [
 { value: 'database', label: 'Database' },
 { value: 'cloud', label: 'Cloud' },
 { value: 'iac', label: 'IaC' },
 { value: 'container', label: 'Container' },
 { value: 'other', label: 'Other' },
];

export default function CustomTechModal({
 onClose,
 onAdd,
 isSubmitting = false,
}: Props) {
 const [name, setName] = useState('');
 const [category, setCategory] = useState('other');

 function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!name.trim()) return;
  onAdd(name.trim(), category);
 }

 return (
  <div
   className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
   onClick={onClose}
  >
   <div
    className='w-full max-w-md rounded-2xl bg-canvas border border-line shadow-2xl'
    onClick={(e) => e.stopPropagation()}
   >
    {/* Header */}
    <div className='flex items-center justify-between px-6 py-4 border-b border-line'>
     <div>
      <h2 className='font-semibold text-ink-primary'>Add custom technology</h2>
      <p className='text-xs text-ink-muted mt-0.5'>
       Don't see your tech? Add it manually.
      </p>
     </div>
     <button
      type='button'
      onClick={onClose}
      className='p-1.5 rounded-md text-ink-dim hover:text-ink-primary hover:bg-surface-raised transition-colors'
     >
      <X size={16} />
     </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className='px-6 py-5 space-y-4'>
     <div>
      <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
       Technology name *
      </label>
      <input
       type='text'
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder='e.g. Supabase, PlanetScale, Fly.io'
       className='w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
       autoFocus
      />
     </div>

     <div>
      <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
       Category
      </label>
      <div className='flex flex-wrap gap-2'>
       {CATEGORIES.map((cat) => (
        <button
         key={cat.value}
         type='button'
         onClick={() => setCategory(cat.value)}
         className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          category === cat.value
           ? 'border-brand bg-brand/10 text-brand'
           : 'border-line text-ink-muted hover:border-ink-secondary'
         }`}
        >
         {cat.label}
        </button>
       ))}
      </div>
     </div>

     <div className='pt-2 flex gap-3'>
      <Button
       type='button'
       variant='ghost'
       size='sm'
       onClick={onClose}
       className='flex-1'
      >
       Cancel
      </Button>
      <Button
       type='submit'
       size='sm'
       disabled={!name.trim() || isSubmitting}
       loading={isSubmitting}
       className='flex-1'
      >
       Add technology
      </Button>
     </div>
    </form>
   </div>
  </div>
 );
}

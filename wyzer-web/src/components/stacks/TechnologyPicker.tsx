import {
 Database,
 Cloud,
 Code2,
 Container,
 Layers,
 Check,
 BadgeCheck,
} from 'lucide-react';
import type { Technology } from '../../api/technologies';

// ── CategoryTabs ──────────────────────────────────────────────────────────────

type Category = 'all' | 'database' | 'cloud' | 'iac' | 'container';

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode }[] =
 [
  { value: 'all', label: 'All', icon: <Layers size={13} /> },
  { value: 'database', label: 'Database', icon: <Database size={13} /> },
  { value: 'cloud', label: 'Cloud', icon: <Cloud size={13} /> },
  { value: 'iac', label: 'IaC', icon: <Code2 size={13} /> },
  { value: 'container', label: 'Containers', icon: <Container size={13} /> },
 ];

interface CategoryTabsProps {
 value: Category;
 onChange: (category: Category) => void;
}

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
 return (
  <div className='flex gap-1 p-1 rounded-lg bg-surface w-fit'>
   {CATEGORIES.map((cat) => (
    <button
     key={cat.value}
     type='button'
     onClick={() => onChange(cat.value)}
     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      value === cat.value
       ? 'bg-canvas shadow-sm text-ink-primary'
       : 'text-ink-muted hover:text-ink-secondary'
     }`}
    >
     {cat.icon}
     {cat.label}
    </button>
   ))}
  </div>
 );
}

// ── TechnologyCard ─────────────────────────────────────────────────────────────

interface TechnologyCardProps {
 technology: Technology;
 selected: boolean;
 onToggle: () => void;
}

export function TechnologyCard({
 technology,
 selected,
 onToggle,
}: TechnologyCardProps) {
 return (
  <button
   type='button'
   onClick={onToggle}
   className={`relative group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
    selected
     ? 'border-brand bg-brand/5 shadow-sm'
     : 'border-line bg-surface hover:border-ink-secondary hover:shadow-sm'
   }`}
  >
   {/* Selected checkmark */}
   <span
    className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
     selected ? 'bg-brand text-white' : 'bg-surface-raised text-ink-dim'
    }`}
   >
    <Check size={11} strokeWidth={3} />
   </span>

   {/* Logo or initial */}
   {technology.logoUrl ? (
    <img
     src={technology.logoUrl}
     alt={technology.name}
     className='w-10 h-10 object-contain rounded-lg bg-canvas p-1'
    />
   ) : (
    <div className='w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center text-base font-bold text-ink-dim uppercase'>
     {technology.name[0]}
    </div>
   )}

   <div className='w-full'>
    <p className='text-xs font-medium text-ink-primary leading-tight truncate'>
     {technology.name}
    </p>
    {technology.vendor && (
     <p className='text-2xs text-ink-dim mt-0.5 truncate'>
      {technology.vendor}
     </p>
    )}
   </div>

   {/* Managed badge */}
   {technology.isManaged && (
    <span className='flex items-center gap-0.5 text-2xs text-ok font-medium'>
     <BadgeCheck size={11} />
     Managed
    </span>
   )}
  </button>
 );
}

export type { Category };

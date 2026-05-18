import { useDataScopes, type DataScope } from '../../api/stacks';

interface Props {
 selected: string[];
 onChange: (scopes: string[]) => void;
}

const SCOPE_STYLES: Record<
 string,
 { bg: string; border: string; text: string; activeBg: string }
> = {
 pii: {
  bg: 'bg-surface',
  border: 'border-line',
  text: 'text-ink-secondary',
  activeBg: 'bg-brand/10 border-brand text-brand',
 },
 phi: {
  bg: 'bg-surface',
  border: 'border-line',
  text: 'text-ink-secondary',
  activeBg: 'bg-ok/10 border-ok text-ok',
 },
 financial: {
  bg: 'bg-surface',
  border: 'border-line',
  text: 'text-ink-secondary',
  activeBg: 'bg-warn/10 border-warn text-warn',
 },
 general: {
  bg: 'bg-surface',
  border: 'border-line',
  text: 'text-ink-secondary',
  activeBg: 'bg-surface-raised border-ink-secondary text-ink-primary',
 },
};

function ScopeChip({
 scope,
 active,
 onToggle,
}: {
 scope: DataScope;
 active: boolean;
 onToggle: () => void;
}) {
 const styles = SCOPE_STYLES[scope.id] ?? SCOPE_STYLES.general;

 return (
  <button
   type='button'
   onClick={onToggle}
   className={`group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
    active
     ? styles.activeBg
     : `${styles.bg} ${styles.border} ${styles.text} hover:border-ink-secondary`
   }`}
  >
   <div className='flex items-center justify-between'>
    <span className='font-semibold text-sm'>{scope.label}</span>
    <span
     className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
      active ? 'border-current bg-current' : 'border-current/30'
     }`}
    >
     {active && (
      <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
       <path
        d='M1 4L3.5 6.5L9 1'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
       />
      </svg>
     )}
    </span>
   </div>
   <p className='text-2xs text-ink-muted line-clamp-2'>{scope.description}</p>
   {scope.triggeredFrameworkSlugs.length > 0 && (
    <div className='flex flex-wrap gap-1 mt-0.5'>
     {scope.triggeredFrameworkSlugs.map((slug) => (
      <span
       key={slug}
       className='text-2xs px-1.5 py-0.5 rounded bg-canvas/50 border border-current/20 uppercase tracking-wide font-medium'
      >
       {slug}
      </span>
     ))}
    </div>
   )}
  </button>
 );
}

export default function DataScopeSelector({ selected, onChange }: Props) {
 const { data: scopes = [], isLoading } = useDataScopes();

 function toggle(scopeId: string) {
  onChange(
   selected.includes(scopeId)
    ? selected.filter((s) => s !== scopeId)
    : [...selected, scopeId],
  );
 }

 return (
  <div>
   <h2 className='text-lg font-semibold text-ink-primary mb-1'>
    What kind of data does this stack handle?
   </h2>
   <p className='text-sm text-ink-muted mb-6'>
    Select all that apply. This determines which compliance frameworks are
    relevant for your stack.
   </p>

   {isLoading ? (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse'>
     {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className='h-28 rounded-xl bg-surface' />
     ))}
    </div>
   ) : (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
     {scopes.map((scope) => (
      <ScopeChip
       key={scope.id}
       scope={scope}
       active={selected.includes(scope.id)}
       onToggle={() => toggle(scope.id)}
      />
     ))}
    </div>
   )}

   {selected.length === 0 && (
    <p className='mt-3 text-2xs text-ink-dim'>
     Select at least one data scope to continue.
    </p>
   )}
  </div>
 );
}

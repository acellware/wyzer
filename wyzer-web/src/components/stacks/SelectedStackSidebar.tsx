import { X, Settings2, ChevronRight } from 'lucide-react';
import type { Technology } from '../../api/technologies';
import type { DeploymentMode, ConfigAnswers } from '../../api/stacks';

export interface SelectedItem {
 technology: Technology;
 deploymentMode: DeploymentMode;
 configAnswers: ConfigAnswers;
}

interface Props {
 items: SelectedItem[];
 activeId: string | null;
 onActivate: (techId: string) => void;
 onRemove: (techId: string) => void;
 totalQuestionCount: (techId: string) => number;
 answeredCount: (item: SelectedItem) => number;
}

const MODE_LABEL: Record<DeploymentMode, string> = {
 MANAGED: 'Managed',
 SELF_HOSTED: 'Self-Hosted',
 ON_PREM: 'On-Prem',
};

export default function SelectedStackSidebar({
 items,
 activeId,
 onActivate,
 onRemove,
 totalQuestionCount,
 answeredCount,
}: Props) {
 if (items.length === 0) {
  return (
   <aside className='rounded-xl border border-dashed border-line p-5 text-center'>
    <p className='text-sm text-ink-dim'>No technologies selected yet.</p>
    <p className='text-2xs text-ink-dim mt-1'>
     Click a technology card to add it.
    </p>
   </aside>
  );
 }

 const allAnswered = items.every((item) => {
  const total = totalQuestionCount(item.technology.id);
  return total === 0 || answeredCount(item) >= total;
 });

 return (
  <aside className='rounded-xl border border-line bg-surface overflow-hidden'>
   <div className='px-4 py-3 border-b border-line flex items-center justify-between'>
    <span className='text-xs font-semibold text-ink-primary uppercase tracking-wider'>
     Selected ({items.length})
    </span>
    {!allAnswered && (
     <span className='text-2xs text-warn px-1.5 py-0.5 rounded bg-warn/10'>
      Incomplete
     </span>
    )}
   </div>

   <ul className='divide-y divide-line'>
    {items.map((item) => {
     const total = totalQuestionCount(item.technology.id);
     const answered = answeredCount(item);
     const isActive = activeId === item.technology.id;
     const pct = total > 0 ? Math.round((answered / total) * 100) : 100;

     return (
      <li key={item.technology.id}>
       <button
        type='button'
        onClick={() => onActivate(item.technology.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
         isActive ? 'bg-brand/5' : 'hover:bg-surface-raised'
        }`}
       >
        {/* Logo */}
        {item.technology.logoUrl ? (
         <img
          src={item.technology.logoUrl}
          alt={item.technology.name}
          className='w-7 h-7 rounded object-contain bg-canvas p-0.5 flex-shrink-0'
         />
        ) : (
         <div className='w-7 h-7 rounded bg-surface-raised flex items-center justify-center text-xs font-bold text-ink-dim uppercase flex-shrink-0'>
          {item.technology.name[0]}
         </div>
        )}

        {/* Name + mode + progress */}
        <div className='flex-1 min-w-0'>
         <p className='text-xs font-medium text-ink-primary truncate'>
          {item.technology.name}
         </p>
         <div className='flex items-center gap-2 mt-0.5'>
          <span className='text-2xs text-ink-dim'>
           {MODE_LABEL[item.deploymentMode]}
          </span>
          {total > 0 && (
           <>
            <span className='text-ink-dim/40'>·</span>
            <span
             className={`text-2xs font-medium ${
              pct === 100 ? 'text-ok' : 'text-warn'
             }`}
            >
             {pct === 100 ? '✓ configured' : `${answered}/${total}`}
            </span>
           </>
          )}
         </div>
        </div>

        <div className='flex items-center gap-1 flex-shrink-0'>
         <Settings2
          size={12}
          className={isActive ? 'text-brand' : 'text-ink-dim'}
         />
         <ChevronRight
          size={12}
          className={`transition-transform ${isActive ? 'text-brand rotate-90' : 'text-ink-dim'}`}
         />
        </div>
       </button>

       {/* Remove button shown on hover — handled via group */}
       <div className='absolute right-10 hidden'>
        <button
         type='button'
         onClick={(e) => {
          e.stopPropagation();
          onRemove(item.technology.id);
         }}
         className='p-1 rounded text-ink-dim hover:text-danger'
        >
         <X size={12} />
        </button>
       </div>
      </li>
     );
    })}
   </ul>

   {/* Progress bar */}
   {items.some((item) => totalQuestionCount(item.technology.id) > 0) && (
    <div className='px-4 py-3 border-t border-line'>
     <div className='flex justify-between text-2xs text-ink-dim mb-1'>
      <span>Configuration progress</span>
      <span>
       {items.reduce((acc, item) => acc + answeredCount(item), 0)} /{' '}
       {items.reduce(
        (acc, item) => acc + totalQuestionCount(item.technology.id),
        0,
       )}
      </span>
     </div>
     <div className='h-1.5 rounded-full bg-surface-raised overflow-hidden'>
      <div
       className='h-full rounded-full bg-brand transition-all duration-300'
       style={{
        width: `${Math.round(
         (items.reduce((acc, item) => acc + answeredCount(item), 0) /
          Math.max(
           items.reduce(
            (acc, item) => acc + totalQuestionCount(item.technology.id),
            0,
           ),
           1,
          )) *
          100,
        )}%`,
       }}
      />
     </div>
    </div>
   )}
  </aside>
 );
}

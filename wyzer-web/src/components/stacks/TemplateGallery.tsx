import { Layers, ArrowRight } from 'lucide-react';
import { useStackTemplates, type StackTemplate } from '../../api/stacks';

interface Props {
 onSelect: (template: StackTemplate | null) => void;
 /** Optional injected templates (e.g. from the public /check flow). */
 templates?: StackTemplate[];
 /** Optional injected loading flag (when data is provided externally). */
 isLoading?: boolean;
}

const SCOPE_COLOR: Record<string, string> = {
 pii: 'bg-brand/10 text-brand',
 phi: 'bg-ok/10 text-ok',
 financial: 'bg-warn/10 text-warn',
 general: 'bg-surface-raised text-ink-secondary',
};

export default function TemplateGallery({
 onSelect,
 templates: templatesProp,
 isLoading: isLoadingProp,
}: Props) {
 const hook = useStackTemplates({ enabled: templatesProp === undefined });
 const templates = templatesProp ?? hook.data ?? [];
 const isLoading = isLoadingProp ?? hook.isLoading;

 return (
  <div>
   <h2 className='text-lg font-semibold text-ink-primary mb-1'>
    Start from a template
   </h2>
   <p className='text-sm text-ink-muted mb-6'>
    Pick a pre-configured stack or build from scratch.
   </p>

   {isLoading ? (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse'>
     {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className='h-40 rounded-xl bg-surface' />
     ))}
    </div>
   ) : (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
     {/* Build from scratch card */}
     <button
      onClick={() => onSelect(null)}
      className='group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-brand hover:bg-brand/5 transition-all min-h-[160px]'
     >
      <div className='w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center group-hover:bg-brand/10 transition-colors'>
       <Layers size={20} className='text-ink-muted group-hover:text-brand' />
      </div>
      <div>
       <p className='font-medium text-ink-primary text-sm'>
        Build from scratch
       </p>
       <p className='text-2xs text-ink-dim mt-0.5'>
        Choose your own technologies
       </p>
      </div>
     </button>

     {templates.map((tmpl) => (
      <button
       key={tmpl.slug}
       onClick={() => onSelect(tmpl)}
       className='group flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 text-left hover:border-brand hover:shadow-md transition-all'
      >
       {/* Tech logos row */}
       <div className='flex gap-1.5'>
        {tmpl.previewTechnologies.slice(0, 5).map((tech) =>
         tech.logoUrl ? (
          <img
           key={tech.id}
           src={tech.logoUrl}
           alt={tech.name}
           className='w-7 h-7 rounded object-contain bg-canvas p-0.5'
          />
         ) : (
          <div
           key={tech.id}
           className='w-7 h-7 rounded bg-surface-raised flex items-center justify-center text-2xs font-bold text-ink-dim uppercase'
          >
           {tech.name[0]}
          </div>
         ),
        )}
        {tmpl.previewTechnologies.length > 5 && (
         <div className='w-7 h-7 rounded bg-surface-raised flex items-center justify-center text-2xs text-ink-dim'>
          +{tmpl.previewTechnologies.length - 5}
         </div>
        )}
       </div>

       <div className='flex-1'>
        <p className='font-medium text-ink-primary text-sm leading-snug'>
         {tmpl.name}
        </p>
        <p className='text-2xs text-ink-muted mt-0.5 line-clamp-2'>
         {tmpl.description}
        </p>
       </div>

       {/* Data scope badges */}
       {tmpl.dataScopes.length > 0 && (
        <div className='flex flex-wrap gap-1'>
         {tmpl.dataScopes.map((scope) => (
          <span
           key={scope}
           className={`text-2xs px-1.5 py-0.5 rounded font-medium ${SCOPE_COLOR[scope] ?? 'bg-surface-raised text-ink-secondary'}`}
          >
           {scope}
          </span>
         ))}
        </div>
       )}

       <div className='flex items-center gap-1 text-2xs text-brand opacity-0 group-hover:opacity-100 transition-opacity'>
        Use this template <ArrowRight size={12} />
       </div>
      </button>
     ))}
    </div>
   )}
  </div>
 );
}

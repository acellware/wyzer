import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Trash2 } from 'lucide-react';
import {
 useStack,
 useDeleteStack,
 useRemoveStackItem,
 type StackItem,
} from '../../../api/stacks';
import { useCreateReport } from '../../../api/reports';
import { Button } from '../../../components/ui/Button';
import { useState } from 'react';

const DEPLOYMENT_MODE_LABEL: Record<string, string> = {
 MANAGED: 'Managed',
 SELF_HOSTED: 'Self-Hosted',
 ON_PREM: 'On-Prem',
};

export default function StackDetailPage() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { data: stack, isLoading } = useStack(id!);
 const deleteStack = useDeleteStack();
 const removeItem = useRemoveStackItem(id!);
 const createReport = useCreateReport();
 const [runningReport, setRunningReport] = useState(false);

 if (isLoading) {
  return (
   <div className='min-h-screen bg-canvas flex items-center justify-center'>
    <div className='w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin' />
   </div>
  );
 }

 if (!stack) {
  return (
   <div className='min-h-screen bg-canvas flex items-center justify-center text-ink-muted text-sm'>
    Stack not found.
   </div>
  );
 }

 async function handleRunReport() {
  if (!stack) return;
  setRunningReport(true);
  try {
   // Use all frameworks known — fetch them or hardcode for now
   // We'll trigger against all frameworks by looking them up via frameworks endpoint
   const report = await createReport.mutateAsync({
    stackId: stack.id,
    frameworkIds: [], // user selects in Report UI — placeholder for now
   });
   navigate(`/reports/${report.id}`);
  } finally {
   setRunningReport(false);
  }
 }

 return (
  <div className='min-h-screen bg-canvas px-6 py-8'>
   <div className='max-w-3xl mx-auto'>
    {/* Header */}
    <div className='flex items-center gap-3 mb-6'>
     <button
      onClick={() => navigate('/stacks')}
      className='p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors'
     >
      <ArrowLeft size={16} />
     </button>
     <div className='flex-1'>
      <h1 className='text-xl font-semibold text-ink-primary'>{stack.name}</h1>
      {stack.description && (
       <p className='text-sm text-ink-muted mt-0.5'>{stack.description}</p>
      )}
     </div>
     <div className='flex items-center gap-2'>
      <Button
       variant='outline'
       size='sm'
       onClick={() => {
        if (confirm(`Delete "${stack.name}"?`)) {
         deleteStack.mutate(stack.id, {
          onSuccess: () => navigate('/stacks'),
         });
        }
       }}
       leftIcon={<Trash2 size={14} />}
      >
       Delete
      </Button>
      <Button
       size='sm'
       onClick={handleRunReport}
       loading={runningReport}
       leftIcon={<FileText size={14} />}
      >
       Run Report
      </Button>
     </div>
    </div>

    {/* Items */}
    <section>
     <div className='flex items-center justify-between mb-4'>
      <h2 className='text-sm font-semibold text-ink-secondary'>
       Technologies ({stack.items.length})
      </h2>
      <Button
       as='link'
       to={`/stacks/${stack.id}/edit`}
       variant='ghost'
       size='sm'
       leftIcon={<Plus size={14} />}
      >
       Add
      </Button>
     </div>

     {stack.items.length === 0 ? (
      <div className='text-center py-12 border border-line border-dashed rounded-xl text-sm text-ink-muted'>
       No technologies in this stack.
      </div>
     ) : (
      <div className='space-y-2'>
       {stack.items.map((item: StackItem) => (
        <div
         key={item.id}
         className='group flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-line'
        >
         <div className='flex items-center gap-3'>
          <div className='w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center text-xs font-bold text-ink-secondary uppercase'>
           {item.technology.name.slice(0, 2)}
          </div>
          <div>
           <p className='text-sm font-medium text-ink-primary'>
            {item.technology.name}
           </p>
           <p className='text-xs text-ink-muted capitalize'>
            {item.technology.category}
           </p>
          </div>
         </div>
         <div className='flex items-center gap-3'>
          <span className='px-2.5 py-1 rounded-lg text-2xs font-medium bg-brand/10 text-brand border border-brand/20'>
           {DEPLOYMENT_MODE_LABEL[item.deploymentMode] ?? item.deploymentMode}
          </span>
          <button
           onClick={() => removeItem.mutate(item.technologyId)}
           className='opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-dim hover:text-danger hover:bg-danger-dim transition-all'
           aria-label='Remove technology'
          >
           <Trash2 size={13} />
          </button>
         </div>
        </div>
       ))}
      </div>
     )}
    </section>
   </div>
  </div>
 );
}

import { Link } from 'react-router-dom';
import { Layers, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { useStacks, useDeleteStack } from '../../api/stacks';
import { Button } from '../../components/ui/Button';

export default function StacksPage() {
 const { data: stacks, isLoading } = useStacks();
 const deleteStack = useDeleteStack();

 return (
  <div className='min-h-screen bg-canvas px-6 py-12'>
   <div className='max-w-4xl mx-auto'>
    {/* Header */}
    <div className='flex items-center justify-between mb-8'>
     <div>
      <div className='flex items-center gap-3 mb-1'>
       <div className='w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center'>
        <Layers size={16} className='text-brand' />
       </div>
       <h1 className='text-xl font-semibold text-ink-primary'>Stacks</h1>
      </div>
      <p className='text-sm text-ink-muted'>
       Define your technology stack to generate compliance reports.
      </p>
     </div>
     <Button as='link' to='/stacks/new' leftIcon={<Plus size={15} />} size='sm'>
      New Stack
     </Button>
    </div>

    {/* Content */}
    {isLoading ? (
     <div className='space-y-3'>
      {[1, 2, 3].map((i) => (
       <div key={i} className='h-16 rounded-xl bg-surface animate-pulse' />
      ))}
     </div>
    ) : !stacks || stacks.length === 0 ? (
     <EmptyState />
    ) : (
     <div className='space-y-3'>
      {stacks.map((stack) => (
       <div
        key={stack.id}
        className='group flex items-center justify-between px-5 py-4 rounded-xl bg-surface border border-line hover:border-line-hover transition-colors'
       >
        <div className='flex-1 min-w-0'>
         <Link
          to={`/stacks/${stack.id}`}
          className='flex items-center gap-2 text-ink-primary font-medium hover:text-brand transition-colors'
         >
          {stack.name}
          <ChevronRight
           size={14}
           className='text-ink-dim group-hover:text-brand transition-colors'
          />
         </Link>
         {stack.description && (
          <p className='text-xs text-ink-muted mt-0.5 truncate'>
           {stack.description}
          </p>
         )}
        </div>
        <div className='flex items-center gap-4 ml-4'>
         <span className='text-xs text-ink-dim tabular-nums'>
          {stack.items.length} tech{stack.items.length !== 1 ? 's' : ''}
         </span>
         <button
          onClick={() => {
           if (confirm(`Delete "${stack.name}"?`)) {
            deleteStack.mutate(stack.id);
           }
          }}
          className='opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-dim hover:text-danger hover:bg-danger-dim transition-all'
          aria-label='Delete stack'
         >
          <Trash2 size={14} />
         </button>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}

function EmptyState() {
 return (
  <div className='text-center py-20 border border-line border-dashed rounded-2xl'>
   <Layers size={32} className='text-ink-dim mx-auto mb-4' />
   <p className='text-sm font-medium text-ink-secondary mb-1'>No stacks yet</p>
   <p className='text-xs text-ink-muted mb-6'>
    Create your first stack to start a compliance assessment.
   </p>
   <Button as='link' to='/stacks/new' leftIcon={<Plus size={15} />} size='sm'>
    New Stack
   </Button>
  </div>
 );
}

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStack, useDeleteStack, type StackItem } from '../../../api/stacks';
import {
 useTechnologyConfigQuestions,
 type ConfigQuestion,
} from '../../../api/technologies';
import { useCreateReport } from '../../../api/reports';
import { Button } from '../../../components/ui/Button';
import { confirm } from '../../../components/ui/ConfirmDialog';
import { getErrorMessage } from '../../../api/errors';
import { useState } from 'react';

const DEPLOYMENT_MODE_LABEL: Record<string, string> = {
 MANAGED: 'Managed',
 SELF_HOSTED: 'Self-Hosted',
 ON_PREM: 'On-Prem',
};

/** Render a single saved answer in a human-friendly way given its question. */
function formatAnswer(
 question: ConfigQuestion,
 raw: string | undefined,
): string {
 if (raw === undefined || raw === '') return '—';
 if (raw === 'not_sure') return 'Not sure';
 if (question.inputType === 'TOGGLE') {
  if (raw === 'true') return 'Yes';
  if (raw === 'false') return 'No';
  return raw;
 }
 if (question.inputType === 'RADIO') {
  return question.options?.find((o) => o.value === raw)?.label ?? raw;
 }
 if (question.inputType === 'CHIP_MULTI') {
  const values = raw
   .split(',')
   .map((v) => v.trim())
   .filter(Boolean);
  const labels = values.map(
   (v) => question.options?.find((o) => o.value === v)?.label ?? v,
  );
  return labels.length ? labels.join(', ') : '—';
 }
 return raw;
}

/** Collapsible row showing a stack item's deployment mode + read-only answers. */
function StackItemRow({ item }: { item: StackItem }) {
 const [open, setOpen] = useState(false);
 const { data: questions = [], isLoading } = useTechnologyConfigQuestions(
  open ? item.technologyId : '',
  item.deploymentMode,
 );

 const answeredKeys = Object.keys(item.configAnswers).filter(
  (k) => item.configAnswers[k] !== '',
 );
 const hasAnswers = answeredKeys.length > 0;

 return (
  <div className='rounded-xl bg-surface border border-line overflow-hidden'>
   <button
    type='button'
    onClick={() => setOpen((v) => !v)}
    className='w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-raised/40 transition-colors'
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
     <ChevronDown
      size={14}
      className={`text-ink-dim transition-transform ${open ? 'rotate-180' : ''}`}
     />
    </div>
   </button>

   {open && (
    <div className='px-4 py-3 border-t border-line bg-surface-raised/30'>
     {isLoading ? (
      <p className='text-xs text-ink-muted'>Loading configuration…</p>
     ) : !hasAnswers ? (
      <p className='text-xs text-ink-muted'>
       No configuration answers recorded for this item.
      </p>
     ) : (
      <dl className='space-y-2'>
       {questions
        .filter((q) => answeredKeys.includes(q.signalKey))
        .map((q) => (
         <div
          key={q.id}
          className='flex items-start justify-between gap-4 text-xs'
         >
          <dt className='text-ink-secondary flex-1'>{q.question}</dt>
          <dd className='text-ink-primary font-medium text-right max-w-[55%]'>
           {formatAnswer(q, item.configAnswers[q.signalKey])}
          </dd>
         </div>
        ))}
       {/* Fallback: keys present in answers but not in questions list */}
       {answeredKeys
        .filter((k) => !questions.some((q) => q.signalKey === k))
        .map((k) => (
         <div
          key={k}
          className='flex items-start justify-between gap-4 text-xs'
         >
          <dt className='text-ink-secondary flex-1'>{k}</dt>
          <dd className='text-ink-primary font-medium text-right max-w-[55%]'>
           {item.configAnswers[k]}
          </dd>
         </div>
        ))}
      </dl>
     )}
    </div>
   )}
  </div>
 );
}

export default function StackDetailPage() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { data: stack, isLoading } = useStack(id!);
 const deleteStack = useDeleteStack();
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
       onClick={async () => {
        if (!stack) return;
        const ok = await confirm({
         title: `Delete "${stack.name}"?`,
         message:
          'This permanently removes the stack and its compliance history. This action cannot be undone.',
         confirmLabel: 'Delete',
         variant: 'danger',
        });
        if (!ok) return;
        deleteStack.mutate(stack.id, {
         onSuccess: () => {
          toast.success(`Deleted "${stack.name}"`);
          navigate('/stacks');
         },
         onError: (err) =>
          toast.error(getErrorMessage(err, 'Failed to delete stack')),
        });
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
       Check compliance
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
       to={`/stacks/new?cloneFrom=${stack.id}`}
       variant='ghost'
       size='sm'
       leftIcon={<Plus size={14} />}
      >
       Clone & modify
      </Button>
     </div>

     {stack.items.length === 0 ? (
      <div className='text-center py-12 border border-line border-dashed rounded-xl text-sm text-ink-muted'>
       No technologies in this stack.
      </div>
     ) : (
      <div className='space-y-2'>
       {stack.items.map((item: StackItem) => (
        <StackItemRow key={item.id} item={item} />
       ))}
      </div>
     )}
    </section>
   </div>
  </div>
 );
}

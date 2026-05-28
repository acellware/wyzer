import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTechnologies } from '../../../api/technologies';
import {
 useCreateStack,
 useStacks,
 useStack,
 type DeploymentMode,
 type StackTemplate,
} from '../../../api/stacks';
import { apiClient } from '../../../api/client';
import {
 stackFingerprint,
 fingerprintStackItems,
} from '../../../helpers/stack-fingerprint';
import { confirm } from '../../../components/ui/ConfirmDialog';
import { getErrorMessage } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import TemplateGallery from '../../../components/stacks/TemplateGallery';
import DataScopeSelector from '../../../components/stacks/DataScopeSelector';
import {
 CategoryTabs,
 TechnologyCard,
 type Category,
} from '../../../components/stacks/TechnologyPicker';
import ConfigPanel from '../../../components/stacks/ConfigPanel';
import SelectedStackSidebar, {
 type SelectedItem,
} from '../../../components/stacks/SelectedStackSidebar';
import CustomTechModal from '../../../components/stacks/CustomTechModal';

const STEPS = ['Template', 'Data Scopes', 'Technologies'] as const;
type Step = 0 | 1 | 2;

// Track question counts per tech for progress display
const questionCountCache: Record<string, number> = {};

export default function NewStackPage() {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const cloneFromId = searchParams.get('cloneFrom');
 const createStack = useCreateStack();
 const { data: existingStacks = [] } = useStacks();
 const { data: cloneSource } = useStack(cloneFromId ?? '');

 // ── Multi-step state ────────────────────────────────────────────────────────
 const [step, setStep] = useState<Step>(0);
 const [selectedTemplate, setSelectedTemplate] = useState<
  StackTemplate | null | undefined
 >(
  undefined, // undefined = not chosen yet; null = scratch
 );
 const [dataScopes, setDataScopes] = useState<string[]>([]);
 const [stackName, setStackName] = useState('');
 const [stackDescription, setStackDescription] = useState('');

 // ── Step 2 state ────────────────────────────────────────────────────────────
 const [category, setCategory] = useState<Category>('all');
 const [search, setSearch] = useState('');
 const [selected, setSelected] = useState<SelectedItem[]>([]);
 const [activeTechId, setActiveTechId] = useState<string | null>(null);
 const [showCustomModal, setShowCustomModal] = useState(false);
 const [addingCustom, setAddingCustom] = useState(false);
 const [submitting, setSubmitting] = useState(false);

 const { data: techData, isLoading } = useTechnologies({
  category: category === 'all' ? undefined : category,
  search: search || undefined,
  limit: 100,
 });

 const technologies = techData?.data ?? [];
 const selectedIds = useMemo(
  () => new Set(selected.map((s) => s.technology.id)),
  [selected],
 );
 const activeTech = useMemo(
  () => selected.find((s) => s.technology.id === activeTechId) ?? null,
  [selected, activeTechId],
 );

 // ── Clone prefill ───────────────────────────────────────────────────────────
 // If ?cloneFrom=<stackId> is present and loaded, prefill name, scopes, and items
 // then jump to step 2 (technologies). This is the "edit" UX — edits always
 // create a new stack so historical reports stay tied to their original config.
 useEffect(() => {
  if (!cloneSource) return;
  setStackName(`${cloneSource.name} (copy)`);
  setStackDescription(cloneSource.description ?? '');
  setDataScopes(cloneSource.dataScopes);
  setSelected(
   cloneSource.items.map((it) => ({
    technology: it.technology,
    deploymentMode: it.deploymentMode,
    configAnswers: it.configAnswers,
   })),
  );
  setSelectedTemplate(null);
  setStep(2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cloneSource?.id]);

 // ── Template selection (step 0) ─────────────────────────────────────────────
 function handleTemplateSelect(template: StackTemplate | null) {
  setSelectedTemplate(template);
  if (template) {
   setDataScopes(template.dataScopes);
   setStackName(template.name);
   // Pre-select technologies from the template
   const preselected: SelectedItem[] = template.templateData.items.flatMap(
    (item) => {
     const tech = template.previewTechnologies.find(
      (t) => t.id === item.technologyId,
     );
     if (!tech) return [];
     return [
      {
       technology: tech,
       deploymentMode: item.deploymentMode,
       configAnswers: item.configAnswers,
      },
     ];
    },
   );
   setSelected(preselected);
  } else {
   setSelected([]);
  }
  setStep(1);
 }

 // ── Technology selection helpers ────────────────────────────────────────────
 function toggleTechnology(tech: (typeof technologies)[0]) {
  setSelected((prev) => {
   if (prev.find((s) => s.technology.id === tech.id)) {
    if (activeTechId === tech.id) setActiveTechId(null);
    return prev.filter((s) => s.technology.id !== tech.id);
   }
   return [
    ...prev,
    { technology: tech, deploymentMode: 'MANAGED', configAnswers: {} },
   ];
  });
 }

 function setDeploymentMode(techId: string, mode: DeploymentMode) {
  setSelected((prev) =>
   prev.map((s) =>
    s.technology.id === techId ? { ...s, deploymentMode: mode } : s,
   ),
  );
 }

 function setAnswer(techId: string, signal: string, value: string) {
  setSelected((prev) =>
   prev.map((s) =>
    s.technology.id === techId
     ? { ...s, configAnswers: { ...s.configAnswers, [signal]: value } }
     : s,
   ),
  );
 }

 // ── Question count tracking (injected from ConfigPanel via cache) ───────────
 const totalQuestionCount = useCallback(
  (techId: string) => questionCountCache[techId] ?? 0,
  [],
 );
 const answeredCount = useCallback((item: SelectedItem) => {
  return Object.keys(item.configAnswers).filter(
   (k) => item.configAnswers[k] && item.configAnswers[k] !== '',
  ).length;
 }, []);

 // ── Custom tech add ─────────────────────────────────────────────────────────
 async function handleAddCustomTech(name: string, cat: string) {
  setAddingCustom(true);
  try {
   const res = await apiClient.post<{
    id: string;
    slug: string;
    name: string;
    category: string;
    logoUrl: null;
    vendor: null;
    isManaged: boolean;
   }>('/technologies', {
    name,
    category: cat,
    isCustom: true,
   });
   const tech = res.data;
   setSelected((prev) => [
    ...prev,
    {
     technology: { ...tech, createdAt: new Date().toISOString() },
     deploymentMode: 'MANAGED',
     configAnswers: {},
    },
   ]);
   setShowCustomModal(false);
  } catch (err) {
   toast.error(getErrorMessage(err, 'Failed to add custom technology'));
  } finally {
   setAddingCustom(false);
  }
 }

 // ── Final submit ────────────────────────────────────────────────────────────
 async function handleSubmit() {
  if (!stackName.trim() || selected.length === 0) return;

  // Dedupe: if an existing stack has the exact same tech set + config, offer to use it
  const newFp = stackFingerprint(
   selected.map((s) => ({
    technologyId: s.technology.id,
    deploymentMode: s.deploymentMode,
    configAnswers: s.configAnswers,
   })),
  );
  const duplicate = existingStacks.find(
   (s) => s.id !== cloneFromId && fingerprintStackItems(s.items) === newFp,
  );
  if (duplicate) {
   const useExisting = await confirm({
    title: 'You already have a matching stack',
    message: `"${duplicate.name}" has the exact same technologies and configuration.\n\nOpen the existing stack instead of creating a duplicate?`,
    confirmLabel: 'Open existing',
    cancelLabel: 'Create anyway',
    variant: 'warn',
   });
   if (useExisting) {
    navigate(`/stacks/${duplicate.id}`);
    return;
   }
  }

  setSubmitting(true);
  try {
   const stack = await createStack.mutateAsync({
    name: stackName.trim(),
    description: stackDescription.trim() || undefined,
    dataScopes,
    templateSlug: selectedTemplate?.slug,
   });

   // POST items individually with configAnswers
   for (const item of selected) {
    await apiClient.post(`/stacks/${stack.id}/items`, {
     technologyId: item.technology.id,
     deploymentMode: item.deploymentMode,
     configAnswers: item.configAnswers,
    });
   }

   toast.success('Stack created successfully');
   navigate(`/stacks/${stack.id}`);
  } catch (err) {
   toast.error(getErrorMessage(err, 'Failed to create stack'));
  } finally {
   setSubmitting(false);
  }
 }

 const canProceedStep1 = dataScopes.length > 0;
 const canSubmit = stackName.trim().length > 0 && selected.length > 0;

 return (
  <div className='min-h-screen bg-canvas'>
   {/* Top bar */}
   <header className='sticky top-0 z-20 bg-canvas/90 backdrop-blur-md border-b border-line px-6 py-3 flex items-center justify-between'>
    <div className='flex items-center gap-3'>
     <button
      onClick={() =>
       step === 0 ? navigate('/stacks') : setStep((s) => (s - 1) as Step)
      }
      className='p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors'
     >
      <ArrowLeft size={16} />
     </button>
     <span className='text-sm font-medium text-ink-primary'>New Stack</span>
    </div>

    {/* Step indicator */}
    <div className='flex items-center gap-2'>
     {STEPS.map((label, i) => (
      <div key={label} className='flex items-center gap-2'>
       <div
        className={`flex items-center gap-1.5 text-xs ${
         i === step
          ? 'text-ink-primary font-semibold'
          : i < step
            ? 'text-brand'
            : 'text-ink-dim'
        }`}
       >
        <span
         className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold ${
          i < step
           ? 'bg-brand text-white'
           : i === step
             ? 'bg-ink-primary text-canvas'
             : 'bg-surface-raised text-ink-dim'
         }`}
        >
         {i < step ? '✓' : i + 1}
        </span>
        <span className='hidden sm:inline'>{label}</span>
       </div>
       {i < STEPS.length - 1 && (
        <div className={`w-6 h-px ${i < step ? 'bg-brand' : 'bg-line'}`} />
       )}
      </div>
     ))}
    </div>

    <div className='w-28 flex justify-end'>
     {step === 2 ? (
      <Button
       onClick={handleSubmit}
       loading={submitting}
       disabled={!canSubmit || submitting}
       size='sm'
      >
       Create Stack
      </Button>
     ) : step === 1 ? (
      <Button
       onClick={() => setStep(2)}
       disabled={!canProceedStep1}
       size='sm'
       rightIcon={<ArrowRight size={14} />}
      >
       Continue
      </Button>
     ) : (
      <div />
     )}
    </div>
   </header>

   <div className='max-w-6xl mx-auto px-6 py-8'>
    {/* ─── Step 0: Template Gallery ─── */}
    {step === 0 && <TemplateGallery onSelect={handleTemplateSelect} />}

    {/* ─── Step 1: Data Scopes ─── */}
    {step === 1 && (
     <DataScopeSelector selected={dataScopes} onChange={setDataScopes} />
    )}

    {/* ─── Step 2: Technology Picker ─── */}
    {step === 2 && (
     <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      {/* Main picker column */}
      <div className='lg:col-span-3 space-y-4'>
       {/* Stack name */}
       <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div>
         <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
          Stack name *
         </label>
         <input
          type='text'
          value={stackName}
          onChange={(e) => setStackName(e.target.value)}
          placeholder='My Production Stack'
          className='w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
         />
        </div>
        <div>
         <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
          Description
         </label>
         <input
          type='text'
          value={stackDescription}
          onChange={(e) => setStackDescription(e.target.value)}
          placeholder='Optional description…'
          className='w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
         />
        </div>
       </div>

       {/* Category tabs + search */}
       <div className='flex items-center gap-3 flex-wrap'>
        <CategoryTabs value={category} onChange={setCategory} />
        <div className='relative flex-1 min-w-[180px]'>
         <Search
          size={14}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none'
         />
         <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search technologies…'
          className='w-full rounded-lg border border-line bg-surface pl-8 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
         />
        </div>
        <button
         type='button'
         onClick={() => setShowCustomModal(true)}
         className='flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-line text-xs text-ink-muted hover:border-brand hover:text-brand transition-all'
        >
         <Plus size={12} />
         Not listed?
        </button>
       </div>

       {/* Technology grid */}
       {isLoading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse'>
         {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='h-28 rounded-xl bg-surface' />
         ))}
        </div>
       ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
         {technologies.map((tech) => (
          <TechnologyCard
           key={tech.id}
           technology={tech}
           selected={selectedIds.has(tech.id)}
           onToggle={() => {
            toggleTechnology(tech);
            if (!selectedIds.has(tech.id)) {
             setActiveTechId(tech.id);
            }
           }}
          />
         ))}
         {technologies.length === 0 && (
          <p className='col-span-4 py-12 text-center text-sm text-ink-muted'>
           No technologies found.
          </p>
         )}
        </div>
       )}
      </div>

      {/* Right sidebar */}
      <div className='lg:col-span-1 space-y-4'>
       <SelectedStackSidebar
        items={selected}
        activeId={activeTechId}
        onActivate={(id) =>
         setActiveTechId((prev) => (prev === id ? null : id))
        }
        onRemove={(id) => {
         if (activeTechId === id) setActiveTechId(null);
         setSelected((prev) => prev.filter((s) => s.technology.id !== id));
        }}
        totalQuestionCount={totalQuestionCount}
        answeredCount={answeredCount}
       />
      </div>
     </div>
    )}
   </div>

   {/* Config panel slide-in (only in step 2) */}
   {step === 2 && activeTech && (
    <div className='fixed inset-y-0 right-0 z-30 w-80 bg-canvas border-l border-line shadow-2xl flex flex-col'>
     <ConfigPanel
      technology={activeTech.technology}
      deploymentMode={activeTech.deploymentMode}
      answers={activeTech.configAnswers}
      onClose={() => setActiveTechId(null)}
      onDeploymentModeChange={(mode) =>
       setDeploymentMode(activeTech.technology.id, mode)
      }
      onAnswerChange={(signal, value) =>
       setAnswer(activeTech.technology.id, signal, value)
      }
     />
    </div>
   )}

   {/* Custom tech modal */}
   {showCustomModal && (
    <CustomTechModal
     onClose={() => setShowCustomModal(false)}
     onAdd={handleAddCustomTech}
     isSubmitting={addingCustom}
    />
   )}
  </div>
 );
}

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 ArrowRight,
 ArrowLeft,
 Loader2,
 ShieldCheck,
 AlertCircle,
 Search,
 Sparkles,
} from 'lucide-react';
import {
 useCreateGuestReport,
 usePublicDataScopes,
 usePublicStackTemplates,
 usePublicTechnologies,
 usePublicConfigQuestions,
 type GuestSelection,
} from '../../api/public';
import type { StackTemplate, DeploymentMode } from '../../api/stacks';
import type { Technology } from '../../api/technologies';
import { ApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import TemplateGallery from '../../components/stacks/TemplateGallery';
import DataScopeSelector from '../../components/stacks/DataScopeSelector';
import {
 CategoryTabs,
 TechnologyCard,
 type Category,
} from '../../components/stacks/TechnologyPicker';
import ConfigPanel from '../../components/stacks/ConfigPanel';
import SelectedStackSidebar, {
 type SelectedItem,
} from '../../components/stacks/SelectedStackSidebar';

// ── Types & helpers ───────────────────────────────────────────────────────────

type Step = 0 | 1 | 2;

const STEPS = ['Your details', 'Build your stack', 'Scoring'] as const;

interface LeadForm {
 companyName: string;
 email: string;
 role: string;
}

function readUtm() {
 if (typeof window === 'undefined') return {};
 const sp = new URLSearchParams(window.location.search);
 return {
  utmSource: sp.get('utm_source') ?? undefined,
  utmMedium: sp.get('utm_medium') ?? undefined,
  utmCampaign: sp.get('utm_campaign') ?? undefined,
 };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicCheckPage() {
 const navigate = useNavigate();

 // Wizard state ----------------------------------------------------------------
 const [step, setStep] = useState<Step>(0);
 const [lead, setLead] = useState<LeadForm>({
  companyName: '',
  email: '',
  role: '',
 });
 const [leadError, setLeadError] = useState<string | null>(null);

 const [selectedTemplate, setSelectedTemplate] = useState<
  StackTemplate | null | undefined
 >(undefined); // undefined = not chosen
 const [stackName, setStackName] = useState('');
 const [dataScopes, setDataScopes] = useState<string[]>([]);

 const [category, setCategory] = useState<Category>('all');
 const [search, setSearch] = useState('');
 const [selected, setSelected] = useState<SelectedItem[]>([]);
 const [activeTechId, setActiveTechId] = useState<string | null>(null);

 const [submitError, setSubmitError] = useState<string | null>(null);

 // Data ------------------------------------------------------------------------
 const templates = usePublicStackTemplates();
 const scopes = usePublicDataScopes();
 const techs = usePublicTechnologies({
  category: category === 'all' ? undefined : category,
  search: search || undefined,
 });
 const technologies = techs.data?.data ?? [];

 const activeTech = useMemo(
  () => selected.find((s) => s.technology.id === activeTechId) ?? null,
  [selected, activeTechId],
 );

 const activeQuestions = usePublicConfigQuestions(
  activeTech?.technology.id ?? null,
  activeTech?.deploymentMode ?? null,
 );

 const selectedIds = useMemo(
  () => new Set(selected.map((s) => s.technology.id)),
  [selected],
 );

 const createReport = useCreateGuestReport();

 // Question count tracking (for sidebar progress) -----------------------------
 const questionCountCache = useMemo<Record<string, number>>(() => ({}), []);
 if (activeTech && activeQuestions.data) {
  questionCountCache[activeTech.technology.id] = activeQuestions.data.length;
 }
 const totalQuestionCount = useCallback(
  (techId: string) => questionCountCache[techId] ?? 0,
  [questionCountCache],
 );
 const answeredCount = useCallback((item: SelectedItem) => {
  return Object.keys(item.configAnswers).filter(
   (k) => item.configAnswers[k] && item.configAnswers[k] !== '',
  ).length;
 }, []);

 // Handlers --------------------------------------------------------------------
 function submitLead(e: React.FormEvent) {
  e.preventDefault();
  setLeadError(null);
  if (!lead.companyName.trim()) {
   setLeadError('Company name is required.');
   return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
   setLeadError('Please enter a valid work email.');
   return;
  }
  setStep(1);
 }

 function handleTemplateSelect(template: StackTemplate | null) {
  setSelectedTemplate(template);
  if (template) {
   setDataScopes(template.dataScopes);
   setStackName(template.name);
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
   if (!stackName) setStackName(`${lead.companyName} stack`);
  }
 }

 function toggleTechnology(tech: Technology) {
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

 async function handleSubmit() {
  setSubmitError(null);
  if (dataScopes.length === 0) {
   setSubmitError('Please select at least one data scope.');
   return;
  }
  if (selected.length === 0) {
   setSubmitError('Please add at least one technology to your stack.');
   return;
  }

  const utm = readUtm();
  setStep(2);

  try {
   const selections: GuestSelection[] = selected.map((s) => ({
    technologyId: s.technology.id,
    deploymentMode: s.deploymentMode,
    configAnswers: s.configAnswers,
   }));
   const result = await createReport.mutateAsync({
    companyName: lead.companyName.trim(),
    email: lead.email.trim(),
    role: lead.role.trim() || undefined,
    stackName: stackName.trim() || undefined,
    dataScopes,
    selections,
    ...utm,
   });
   navigate(`/check/${result.shareToken}`, { replace: true });
  } catch (err) {
   const message =
    err instanceof ApiError
     ? err.message
     : 'Something went wrong. Please try again.';
   setSubmitError(message);
   setStep(1);
  }
 }

 // ── Render ──────────────────────────────────────────────────────────────────

 return (
  <div className='min-h-screen bg-canvas text-ink-primary'>
   {/* Top bar */}
   <header className='sticky top-0 z-20 bg-canvas/90 backdrop-blur-md border-b border-line px-6 py-3 flex items-center justify-between'>
    <div className='flex items-center gap-3'>
     <button
      onClick={() =>
       step === 0 ? navigate('/') : setStep((s) => Math.max(0, s - 1) as Step)
      }
      className='p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors'
      aria-label='Back'
     >
      <ArrowLeft size={16} />
     </button>
     <div className='flex items-center gap-2'>
      <ShieldCheck size={16} className='text-brand' />
      <span className='text-sm font-semibold text-ink-primary'>
       Free compliance check
      </span>
     </div>
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

    <div className='w-28' />
   </header>

   {/* Body */}
   <div className='max-w-6xl mx-auto px-6 py-8'>
    {/* ─── Step 0: Lead capture ─── */}
    {step === 0 && (
     <div className='max-w-md mx-auto'>
      <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-2xs font-medium mb-5'>
       <Sparkles size={12} />
       100% free · No credit card
      </div>
      <h1 className='text-3xl font-semibold text-ink-primary mb-2 tracking-tight'>
       See how your stack scores.
      </h1>
      <p className='text-sm text-ink-muted mb-8 leading-relaxed'>
       Tell us about your company and we'll map your tech stack to SOC 2, ISO
       27001, GDPR and HIPAA. Results in under 60 seconds.
      </p>

      <form onSubmit={submitLead} className='space-y-4'>
       <div>
        <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
         Company name *
        </label>
        <input
         autoFocus
         type='text'
         value={lead.companyName}
         onChange={(e) =>
          setLead((p) => ({ ...p, companyName: e.target.value }))
         }
         placeholder='Acme Inc.'
         className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
        />
       </div>
       <div>
        <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
         Work email *
        </label>
        <input
         type='email'
         value={lead.email}
         onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
         placeholder='you@acme.com'
         className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
        />
        <p className='mt-1.5 text-2xs text-ink-dim'>
         We'll send your report here. No spam.
        </p>
       </div>
       <div>
        <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
         Your role <span className='text-ink-dim'>(optional)</span>
        </label>
        <input
         type='text'
         value={lead.role}
         onChange={(e) => setLead((p) => ({ ...p, role: e.target.value }))}
         placeholder='CTO, Head of Security…'
         className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
        />
       </div>

       {leadError && (
        <div className='flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-dim p-3 text-xs text-danger'>
         <AlertCircle size={14} className='shrink-0 mt-0.5' />
         <span>{leadError}</span>
        </div>
       )}

       <Button
        type='submit'
        size='md'
        rightIcon={<ArrowRight size={14} />}
        className='w-full'
       >
        Continue
       </Button>
      </form>
     </div>
    )}

    {/* ─── Step 1: Build your stack ─── */}
    {step === 1 && (
     <div className='space-y-10'>
      {/* Template gallery */}
      {selectedTemplate === undefined ? (
       <TemplateGallery
        onSelect={handleTemplateSelect}
        templates={templates.data ?? []}
        isLoading={templates.isLoading}
       />
      ) : (
       <div className='flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3'>
        <div className='text-sm text-ink-secondary'>
         {selectedTemplate ? (
          <>
           Starting from{' '}
           <strong className='text-ink-primary'>{selectedTemplate.name}</strong>
          </>
         ) : (
          <>Building from scratch</>
         )}
        </div>
        <button
         type='button'
         onClick={() => {
          setSelectedTemplate(undefined);
          setSelected([]);
         }}
         className='text-xs text-brand hover:underline'
        >
         Change
        </button>
       </div>
      )}

      {selectedTemplate !== undefined && (
       <>
        {/* Stack name */}
        <div className='max-w-md'>
         <label className='block text-xs font-medium text-ink-secondary mb-1.5'>
          Stack name
         </label>
         <input
          type='text'
          value={stackName}
          onChange={(e) => setStackName(e.target.value)}
          placeholder='Production stack'
          className='w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all'
         />
        </div>

        {/* Data scopes */}
        <DataScopeSelector
         selected={dataScopes}
         onChange={setDataScopes}
         scopes={scopes.data ?? []}
         isLoading={scopes.isLoading}
        />

        {/* Technology picker + sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
         <div className='lg:col-span-3 space-y-4'>
          <div>
           <h2 className='text-lg font-semibold text-ink-primary mb-1'>
            Pick your technologies
           </h2>
           <p className='text-sm text-ink-muted'>
            Click a tile to add it. Click it again in the sidebar to answer its
            configuration questions.
           </p>
          </div>

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
          </div>

          {techs.isLoading ? (
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
               if (!selectedIds.has(tech.id)) setActiveTechId(tech.id);
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

          {submitError && (
           <div className='flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-dim p-3 text-xs text-danger'>
            <AlertCircle size={14} className='shrink-0 mt-0.5' />
            <span>{submitError}</span>
           </div>
          )}

          <Button
           onClick={handleSubmit}
           disabled={
            dataScopes.length === 0 ||
            selected.length === 0 ||
            createReport.isPending
           }
           loading={createReport.isPending}
           size='md'
           rightIcon={<ArrowRight size={14} />}
           className='w-full'
          >
           Run my free check
          </Button>
          <p className='text-2xs text-ink-dim text-center'>
           Your report is private — only you can view it via a unique link.
          </p>
         </div>
        </div>
       </>
      )}
     </div>
    )}

    {/* ─── Step 2: Scoring loader ─── */}
    {step === 2 && (
     <div className='flex flex-col items-center justify-center text-center py-24'>
      <Loader2
       size={32}
       className='animate-spin text-brand mb-6'
       strokeWidth={2.5}
      />
      <h2 className='text-xl font-semibold text-ink-primary mb-2'>
       Scoring your stack…
      </h2>
      <p className='text-sm text-ink-muted max-w-sm'>
       We're mapping your technologies against SOC 2, ISO 27001, GDPR and HIPAA
       controls. This usually takes under 30 seconds.
      </p>
     </div>
    )}
   </div>

   {/* Config panel slide-in (only in step 1) */}
   {step === 1 && activeTech && (
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
      questions={activeQuestions.data ?? []}
      isLoading={activeQuestions.isLoading}
     />
    </div>
   )}
  </div>
 );
}

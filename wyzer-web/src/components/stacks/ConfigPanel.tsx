import { X, HelpCircle } from 'lucide-react';
import {
 useTechnologyConfigQuestions,
 type Technology,
 type ConfigQuestion,
} from '../../api/technologies';
import type { DeploymentMode, ConfigAnswers } from '../../api/stacks';

interface Props {
 technology: Technology;
 deploymentMode: DeploymentMode;
 answers: ConfigAnswers;
 onClose: () => void;
 onDeploymentModeChange: (mode: DeploymentMode) => void;
 onAnswerChange: (signal: string, value: string) => void;
 /** Optional injected questions (e.g. from the public /check flow). */
 questions?: ConfigQuestion[];
 /** Optional injected loading flag (when data is provided externally). */
 isLoading?: boolean;
}

const DEPLOYMENT_MODES: { value: DeploymentMode; label: string }[] = [
 { value: 'MANAGED', label: 'Managed' },
 { value: 'SELF_HOSTED', label: 'Self-Hosted' },
 { value: 'ON_PREM', label: 'On-Prem' },
];

// ── Toggle question ────────────────────────────────────────────────────────────

function ToggleQuestion({
 question,
 value,
 onChange,
}: {
 question: ConfigQuestion;
 value: string;
 onChange: (v: string) => void;
}) {
 const isOn = value === 'true';
 return (
  <div className='flex items-start justify-between gap-3'>
   <div className='flex-1'>
    <p className='text-sm text-ink-primary'>{question.question}</p>
   </div>
   <div className='flex items-center gap-2 flex-shrink-0'>
    <span className='text-2xs text-ink-dim'>
     {value === 'not_sure' ? 'Not sure' : isOn ? 'Yes' : 'No'}
    </span>
    <div className='flex flex-col gap-1'>
     <button
      type='button'
      onClick={() => onChange(isOn ? 'false' : 'true')}
      className={`relative w-9 h-5 rounded-full transition-colors ${
       value === 'not_sure'
        ? 'bg-line'
        : isOn
          ? 'bg-brand'
          : 'bg-surface-raised'
      }`}
     >
      <span
       className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
        isOn ? 'left-4' : 'left-0.5'
       }`}
      />
     </button>
     <button
      type='button'
      onClick={() => onChange('not_sure')}
      className={`flex items-center gap-0.5 text-2xs ${
       value === 'not_sure' ? 'text-warn' : 'text-ink-dim hover:text-ink-muted'
      } transition-colors`}
     >
      <HelpCircle size={9} />
      not sure
     </button>
    </div>
   </div>
  </div>
 );
}

// ── Radio question ─────────────────────────────────────────────────────────────

function RadioQuestion({
 question,
 value,
 onChange,
}: {
 question: ConfigQuestion;
 value: string;
 onChange: (v: string) => void;
}) {
 const options = question.options ?? [];
 return (
  <div>
   <p className='text-sm text-ink-primary mb-2'>{question.question}</p>
   <div className='flex flex-wrap gap-2'>
    {options.map((opt) => (
     <button
      key={opt.value}
      type='button'
      onClick={() => onChange(opt.value)}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
       value === opt.value
        ? opt.value === 'not_sure'
          ? 'border-warn bg-warn/10 text-warn'
          : 'border-brand bg-brand/10 text-brand'
        : 'border-line text-ink-muted hover:border-ink-secondary'
      }`}
     >
      {opt.label}
     </button>
    ))}
   </div>
  </div>
 );
}

// ── ChipMulti question ────────────────────────────────────────────────────────

function ChipMultiQuestion({
 question,
 value,
 onChange,
}: {
 question: ConfigQuestion;
 value: string;
 onChange: (v: string) => void;
}) {
 const options = question.options ?? [];
 const selected = value ? value.split(',').filter(Boolean) : [];

 function toggle(optValue: string) {
  if (optValue === 'not_sure') {
   onChange('not_sure');
   return;
  }
  const next = selected.includes(optValue)
   ? selected.filter((v) => v !== optValue)
   : [...selected.filter((v) => v !== 'not_sure'), optValue];
  onChange(next.join(','));
 }

 return (
  <div>
   <p className='text-sm text-ink-primary mb-2'>{question.question}</p>
   <div className='flex flex-wrap gap-2'>
    {options.map((opt) => {
     const isActive =
      opt.value === 'not_sure'
       ? value === 'not_sure'
       : selected.includes(opt.value);
     return (
      <button
       key={opt.value}
       type='button'
       onClick={() => toggle(opt.value)}
       className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        isActive
         ? opt.value === 'not_sure'
           ? 'border-warn bg-warn/10 text-warn'
           : 'border-brand bg-brand/10 text-brand'
         : 'border-line text-ink-muted hover:border-ink-secondary'
       }`}
      >
       {opt.label}
      </button>
     );
    })}
   </div>
  </div>
 );
}

// ── ConfigPanel ────────────────────────────────────────────────────────────────

export default function ConfigPanel({
 technology,
 deploymentMode,
 answers,
 onClose,
 onDeploymentModeChange,
 onAnswerChange,
 questions: questionsProp,
 isLoading: isLoadingProp,
}: Props) {
 const hook = useTechnologyConfigQuestions(technology.id, deploymentMode, {
  enabled: questionsProp === undefined,
 });
 const questions = questionsProp ?? hook.data ?? [];
 const isLoading = isLoadingProp ?? hook.isLoading;

 const unanswered = questions.filter((q) => !answers[q.signalKey]);

 return (
  <div className='flex flex-col h-full'>
   {/* Header */}
   <div className='flex items-center justify-between px-5 py-4 border-b border-line'>
    <div className='flex items-center gap-2'>
     {technology.logoUrl ? (
      <img
       src={technology.logoUrl}
       alt={technology.name}
       className='w-7 h-7 rounded object-contain bg-canvas p-0.5'
      />
     ) : (
      <div className='w-7 h-7 rounded bg-surface-raised flex items-center justify-center text-xs font-bold text-ink-dim uppercase'>
       {technology.name[0]}
      </div>
     )}
     <span className='font-semibold text-sm text-ink-primary'>
      {technology.name}
     </span>
    </div>
    <button
     type='button'
     onClick={onClose}
     className='p-1.5 rounded-md text-ink-dim hover:text-ink-primary hover:bg-surface-raised transition-colors'
    >
     <X size={16} />
    </button>
   </div>

   {/* Deployment mode selector */}
   <div className='px-5 py-3 border-b border-line'>
    <p className='text-2xs font-medium text-ink-dim uppercase tracking-wider mb-2'>
     Deployment mode
    </p>
    <div className='flex gap-2'>
     {DEPLOYMENT_MODES.map((mode) => (
      <button
       key={mode.value}
       type='button'
       onClick={() => onDeploymentModeChange(mode.value)}
       className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        deploymentMode === mode.value
         ? 'border-brand bg-brand/10 text-brand'
         : 'border-line text-ink-muted hover:border-ink-secondary'
       }`}
      >
       {mode.label}
      </button>
     ))}
    </div>
   </div>

   {/* Questions */}
   <div className='flex-1 overflow-y-auto px-5 py-4 space-y-5'>
    {isLoading ? (
     <div className='space-y-4 animate-pulse'>
      {Array.from({ length: 4 }).map((_, i) => (
       <div key={i} className='h-10 rounded-lg bg-surface' />
      ))}
     </div>
    ) : questions.length === 0 ? (
     <p className='text-sm text-ink-muted text-center py-8'>
      No configuration questions for this mode.
     </p>
    ) : (
     questions.map((q) => {
      const value = answers[q.signalKey] ?? '';
      const handleChange = (v: string) => onAnswerChange(q.signalKey, v);

      return (
       <div key={q.id}>
        {q.inputType === 'TOGGLE' && (
         <ToggleQuestion question={q} value={value} onChange={handleChange} />
        )}
        {q.inputType === 'RADIO' && (
         <RadioQuestion question={q} value={value} onChange={handleChange} />
        )}
        {q.inputType === 'CHIP_MULTI' && (
         <ChipMultiQuestion
          question={q}
          value={value}
          onChange={handleChange}
         />
        )}
       </div>
      );
     })
    )}
   </div>

   {/* Footer hint */}
   {unanswered.length > 0 && (
    <div className='px-5 py-3 border-t border-line'>
     <p className='text-2xs text-warn'>
      {unanswered.length} question{unanswered.length > 1 ? 's' : ''} unanswered
      — compliance score will be lower.
     </p>
    </div>
   )}
  </div>
 );
}
